import { eq, inArray, sql } from "drizzle-orm";
import type db from "@/db";
import { adminNotification, dish, order, orderItem, table, user } from "@/db/schema";
import {
    assertPaymentMatches, checkoutSchema, checkoutTokenSchema, PaymentError, priceCart,
    tokenHash, validSignature, verificationSchema, type GatewayPayment,
} from "@/lib/payment-validation";

export interface PaymentGateway {
    createOrder(input: { amount: number; currency: string; receipt: string; notes: { local_order_id: string } }): Promise<{
        id: string; amount: number | string; currency: string;
    }>;
    fetchPayment(id: string): Promise<GatewayPayment>;
}

type Database = typeof db;
type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
export type SavedOrder = typeof order.$inferSelect;

function checkoutResponse(record: SavedOrder) {
    return {
        success: true, orderId: record.id, order_id: record.razorpayOrderId,
        amount: record.paymentAmount, currency: record.paymentCurrency, paymentStatus: record.paymentStatus,
    };
}

export function createPaymentService(database: Database, gateway: PaymentGateway, keySecret: string) {
    async function getCheckout(token: string) {
        if (!checkoutTokenSchema.safeParse(token).success) throw new PaymentError("Invalid checkout token.", 401);
        const [record] = await database.select().from(order).where(eq(order.checkoutTokenHash, tokenHash(token))).limit(1);
        if (!record) throw new PaymentError("Checkout not found.", 404);
        return record;
    }

    async function createOrder(token: string, body: unknown) {
        if (!checkoutTokenSchema.safeParse(token).success) throw new PaymentError("Invalid checkout token.", 401);
        const hash = tokenHash(token);
        // Commit the pending order first; gateway downtime must not lose it.
        const record = await database.transaction(async tx => {
            await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${hash}, 0))`);
            const [existing] = await tx.select().from(order).where(eq(order.checkoutTokenHash, hash)).limit(1);
            if (existing) return existing;
            const parsed = checkoutSchema.safeParse(body);
            if (!parsed.success) throw new PaymentError(parsed.error.issues[0]?.message || "Invalid checkout details.");
            const data = parsed.data;
            const catalog = await tx.select().from(dish).where(inArray(dish.id, data.cartItems.map(item => item.dish.id)));
            const { rows, totalPricing, amount } = priceCart(data.cartItems, catalog);
            let tableId: number | null = null;
            if (data.tableCode) {
                const [currentTable] = await tx.select().from(table).where(eq(table.name, data.tableCode)).limit(1);
                if (!currentTable) throw new PaymentError("Selected table no longer exists.");
                tableId = currentTable.id;
            }
            // Phone numbers are not unique in the legacy schema.
            await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`customer:${data.mobile}`}, 0))`);
            const [existingUser] = await tx.select().from(user).where(eq(user.number, data.mobile)).limit(1);
            let userId: number;
            if (existingUser) {
                userId = existingUser.id;
                await tx.update(user).set({ name: data.name, email: data.email || null }).where(eq(user.id, userId));
            } else {
                const [newUser] = await tx.insert(user).values({ name: data.name, email: data.email || null, number: data.mobile }).returning();
                userId = newUser.id;
            }
            const [created] = await tx.insert(order).values({
                userId, tableId, totalPricing, message: data.message,
                status: "pending", paymentStatus: "pending", checkoutTokenHash: hash,
                paymentAmount: amount, paymentCurrency: "INR", orderType: data.tableCode ? "dine_in" : "delivery",
            }).returning();
            await tx.insert(orderItem).values(rows.map(item => ({ ...item, orderId: created.id })));
            return created;
        });

        return database.transaction(async tx => {
            // Only one initializer may link a Razorpay order to this saved checkout.
            const [current] = await tx.select().from(order).where(eq(order.id, record.id)).for("update");
            if (current.razorpayOrderId) return checkoutResponse(current);
            const remote = await gateway.createOrder({
                amount: current.paymentAmount!, currency: current.paymentCurrency!,
                receipt: `tea20_${current.id}`, notes: { local_order_id: String(current.id) },
            });
            if (!/^order_[a-zA-Z0-9]+$/.test(remote.id) || Number(remote.amount) !== current.paymentAmount
                || remote.currency !== current.paymentCurrency) throw new PaymentError("Payment provider returned an invalid order.", 500);
            const [linked] = await tx.update(order).set({ razorpayOrderId: remote.id, updatedAt: new Date() })
                .where(eq(order.id, current.id)).returning();
            return checkoutResponse(linked);
        });
    }

    async function confirmInTransaction(tx: Transaction, payment: GatewayPayment, signature?: string) {
        const [record] = await tx.select().from(order).where(eq(order.razorpayOrderId, payment.order_id!)).for("update");
        if (!record) throw new PaymentError("Checkout is not linked yet.", 503);
        assertPaymentMatches(payment, record);
        if (record.paymentStatus === "paid") {
            if (record.razorpayPaymentId !== payment.id) throw new PaymentError("Order already has a different payment.");
            if (signature && !record.razorpaySignature) {
                await tx.update(order).set({ razorpaySignature: signature }).where(eq(order.id, record.id));
            }
            return { ...checkoutResponse(record), alert: null };
        }
        if (payment.status !== "captured") throw new PaymentError("Payment has not been captured.");
        const [paid] = await tx.update(order).set({
            paymentStatus: "paid", status: "paid_online", paidOnline: record.totalPricing,
            razorpayPaymentId: payment.id, razorpaySignature: signature || null,
            paymentConfirmedAt: new Date(), updatedAt: new Date(),
        }).where(eq(order.id, record.id)).returning();
        const [currentTable] = record.tableId ? await tx.select({ name: table.name }).from(table).where(eq(table.id, record.tableId)) : [];
        const location = currentTable ? `Table ${currentTable.name}` : "Delivery";
        const alert = { orderId: record.id, title: `New order #${record.id}`, body: `${location} · ₹${record.totalPricing}` };
        await tx.insert(adminNotification).values(alert);
        return { ...checkoutResponse(paid), alert };
    }

    async function verifyPayment(token: string, body: unknown) {
        const parsed = verificationSchema.safeParse(body);
        if (!parsed.success) throw new PaymentError("Missing or invalid payment details.");
        const record = await getCheckout(token);
        const details = parsed.data;
        if (!record.razorpayOrderId || details.razorpay_order_id !== record.razorpayOrderId
            || !validSignature(`${record.razorpayOrderId}|${details.razorpay_payment_id}`, details.razorpay_signature, keySecret)) {
            throw new PaymentError("Payment signature verification failed.");
        }
        const payment = await gateway.fetchPayment(details.razorpay_payment_id);
        if (payment.id !== details.razorpay_payment_id) throw new PaymentError("Invalid payment response.");
        assertPaymentMatches(payment, record);
        if (payment.status === "authorized") return { ...checkoutResponse(record), alert: null };
        if (payment.status !== "captured") throw new PaymentError("Payment has not completed.");
        return database.transaction(tx => confirmInTransaction(tx, payment, details.razorpay_signature));
    }

    async function processWebhook(raw: string, signature: string, webhookSecret: string) {
        if (!validSignature(raw, signature, webhookSecret)) throw new PaymentError("Invalid webhook signature.");
        let event: { event?: string; payload?: { payment?: { entity?: GatewayPayment & { notes?: { local_order_id?: string } } } } };
        try { event = JSON.parse(raw); } catch { throw new PaymentError("Invalid webhook payload."); }
        if (!event || !["payment.captured", "order.paid"].includes(event.event || "")) return { success: true, alert: null };
        const payment = event.payload?.payment?.entity;
        if (!payment || !/^pay_[a-zA-Z0-9]+$/.test(payment.id) || !payment.order_id
            || payment.status !== "captured") throw new PaymentError("Invalid captured payment payload.");
        // This account may have payments from outside this app.
        const [known] = await database.select({ id: order.id }).from(order).where(eq(order.razorpayOrderId, payment.order_id)).limit(1);
        if (!known) {
            const localId = Number(payment.notes?.local_order_id);
            if (Number.isSafeInteger(localId) && localId > 0) {
                const [pending] = await database.select({ id: order.id }).from(order).where(eq(order.id, localId)).limit(1);
                if (pending) throw new PaymentError("Checkout is not linked yet.", 503);
            }
            return { success: true, alert: null };
        }
        return database.transaction(tx => confirmInTransaction(tx, payment));
    }

    async function getStatus(token: string) { return checkoutResponse(await getCheckout(token)); }
    return { createOrder, verifyPayment, processWebhook, getStatus };
}
