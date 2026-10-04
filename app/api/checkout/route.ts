import { after, NextResponse } from "next/server";
import db from "@/db";
import { user, order, orderItem, table, adminNotification } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { orderAlert, sendOrderPush } from "@/lib/order-notifications";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, mobile, email, tableCode, message, cartItems, totalPricing } = body;
        const alert = await db.transaction(async (tx) => {
            // 1. Check or insert table
            let tableId = null;
            if (!!tableCode) {
                const [tableRecord] = await tx.select({ id: table.id }).from(table).where(eq(table.name, tableCode)).limit(1);
                if (tableRecord) {
                    tableId = tableRecord.id;
                }
            }

            // 2. Insert user

            const [existingUser] = await tx.select({ id: user.id }).from(user).where(eq(user.number, mobile)).limit(1);
            let userId = null;
            if (existingUser) {
                await tx.update(user).set({
                    name,
                    email: email || null,
                }).where(eq(user.id, existingUser.id));
                userId = existingUser.id;
            } else {
                const [newUser] = await tx.insert(user).values({
                    name,
                    email: email || null,
                    number: mobile,
                }).returning();
                userId = newUser.id;
            }

            // 3. Insert order
            const newOrder = await tx.insert(order).values({
                tableId,
                userId,
                totalPricing,
                status: "pending",
                message,
                orderType: tableCode ? "dine_in" : "delivery",
            }).returning();
            const orderId = newOrder[0].id;

            // 4. Insert order items
            if (cartItems && cartItems.length > 0) {
                const itemsToInsert = cartItems.map((item: { dish: { id: number; name: string; imageUrl?: string; price: number }; quantity: number; selectedOptions?: { price: number | string }[] }) => ({
                    orderId,
                    dishId: item.dish.id,
                    dishName: item.dish.name,
                    dishImageUrl: item.dish.imageUrl,

                    pricing: item.dish.price + (item.selectedOptions?.reduce((acc, option) => acc + Number(option.price), 0) ?? 0),

                    quantity: item.quantity,
                    options: item.selectedOptions || [],
                }));
                await tx.insert(orderItem).values(itemsToInsert);
            }

            const alert = orderAlert(orderId, totalPricing, tableCode ? `Table ${tableCode}` : "Delivery");
            await tx.insert(adminNotification).values(alert);
            return alert;
        });
        const orderId = alert.orderId;
        after(() => sendOrderPush(alert));

        // 5. revalidate the cache
        revalidatePath("/admin/tables");
        revalidatePath("/admin/orders");

        return NextResponse.json({ success: true, orderId });
    } catch (error) {
        console.error("Order creation error:", error);
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Failed to place order" }, { status: 500 });
    }
}
