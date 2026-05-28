import { NextResponse } from "next/server";
import db from "@/db";
import { user, order, orderItem, table } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, mobile, email, tableCode, message, cartItems, totalPricing } = body;

        // 1. Check or insert table
        let tableId = null;
        if (!!tableCode) {
            const [tableRecord] = await db.select({ id: table.id }).from(table).where(eq(table.tableCode, tableCode)).limit(1);
            console.log({ tableRecord })
            if (tableRecord) {
                tableId = tableRecord.id;
            }
        }

        // 2. Insert user
        const newUser = await db.insert(user).values({
            name,
            email: email || null,
            number: mobile,
        }).returning();
        const userId = newUser[0].id;

        // 3. Insert order
        const newOrder = await db.insert(order).values({
            tableId,
            userId,
            totalPricing,
            status: "pending",
        }).returning();
        const orderId = newOrder[0].id;

        // 4. Insert order items
        if (cartItems && cartItems.length > 0) {
            const itemsToInsert = cartItems.map((item: any) => ({
                orderId,
                dishId: item.dish.id,
                dishName: item.dish.name,
                dishImageUrl: item.dish.imageUrl,
                pricing: item.dish.price,
                quantity: item.quantity,
                options: item.selectedOptions || [],
            }));
            console.log(itemsToInsert)
            await db.insert(orderItem).values(itemsToInsert);
        }

        return NextResponse.json({ success: true, orderId });
    } catch (error: any) {
        console.error("Order creation error:", error);
        return NextResponse.json({ success: false, error: error.message || "Failed to place order" }, { status: 500 });
    }
}
