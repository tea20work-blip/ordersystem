import { eq, inArray, sql } from "drizzle-orm";
import type db from "@/db";
import { adminNotification, dish, order, orderItem, table, user } from "@/db/schema";
import { checkoutSchema, PaymentError, priceCart } from "@/lib/payment-validation";

// Direct requests retain database pricing and reach admin without a gateway payment.
export async function createDirectOrder(database: typeof db, body: unknown) {
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) throw new PaymentError(parsed.error.issues[0]?.message || "Invalid order details.");
    const data = parsed.data;

    return database.transaction(async tx => {
        const catalog = await tx.select().from(dish).where(inArray(dish.id, data.cartItems.map(item => item.dish.id)));
        const { rows, totalPricing } = priceCart(data.cartItems, catalog);
        let tableId: number | null = null;
        if (data.tableCode) {
            const [currentTable] = await tx.select({ id: table.id }).from(table).where(eq(table.name, data.tableCode)).limit(1);
            if (!currentTable) throw new PaymentError("Selected table no longer exists.");
            tableId = currentTable.id;
        }

        await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`customer:${data.mobile}`}, 0))`);
        const [existingUser] = await tx.select({ id: user.id }).from(user).where(eq(user.number, data.mobile)).limit(1);
        let userId: number;
        if (existingUser) {
            userId = existingUser.id;
            await tx.update(user).set({ name: data.name, email: data.email || null }).where(eq(user.id, userId));
        } else {
            const [createdUser] = await tx.insert(user).values({ name: data.name, email: data.email || null, number: data.mobile }).returning({ id: user.id });
            userId = createdUser.id;
        }

        const [created] = await tx.insert(order).values({
            userId, tableId, totalPricing, message: data.message,
            status: "pending", paymentStatus: null,
            orderType: data.tableCode ? "dine_in" : "delivery",
        }).returning({ id: order.id });
        await tx.insert(orderItem).values(rows.map(item => ({ ...item, orderId: created.id })));

        const location = data.tableCode ? `Table ${data.tableCode}` : "Delivery";
        const alert = { orderId: created.id, title: `New order #${created.id}`, body: `${location} · ₹${totalPricing}` };
        await tx.insert(adminNotification).values(alert);
        return { success: true, orderId: created.id, alert };
    });
}
