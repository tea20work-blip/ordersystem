"use server";

import db from "@/db";
import { order, user, table, orderItem, adminNotification } from "@/db/schema";
import { and, desc, eq, inArray, sql, type SQL } from "drizzle-orm";
import { after } from "next/server";
import { orderAlert, sendOrderPush } from "@/lib/order-notifications";
import { revalidatePath, revalidateTag } from "next/cache";

export type OrderPaymentStatus = 'pending' | 'completed' | 'cancelled' | 'paid_online' | 'paid_cash' | 'paid_user';
export type OrderDeliveryStatus = 'ordered' | 'ready' | 'dispatched' | 'delivered';
export type AdminOrderType = 'dine_in' | 'take_away' | 'delivery';

export type OrderFilters = {
    startDate?: string;
    endDate?: string;
    orderType?: AdminOrderType;
    payment?: OrderPaymentStatus;
};

type OrderItemOptions = Record<string, unknown>[];

export async function getOrders(page: number = 1, limit: number = 10, filters: OrderFilters = {}) {
    const offset = (page - 1) * limit;
    const whereClause: SQL[] = [];

    if (filters.startDate) {
        whereClause.push(sql`DATE(${order.createdAt}) >= ${filters.startDate}::date`);
    }

    if (filters.endDate) {
        whereClause.push(sql`DATE(${order.createdAt}) <= ${filters.endDate}::date`);
    }

    if (filters.orderType) {
        whereClause.push(eq(order.orderType, filters.orderType));
    }

    if (filters.payment) {
        whereClause.push(eq(order.status, filters.payment));
    }

    const where = whereClause.length > 0 ? and(...whereClause) : undefined;

    const orders = await db
        .select({
            id: order.id,
            totalPricing: order.totalPricing,
            paidOnline: order.paidOnline,
            paidCash: order.paidCash,
            lendingAmount: order.lendingAmount,
            status: order.status,
            paymentStatus: order.paymentStatus,
            deliveryStatus: order.deliveryStatus,
            orderType: order.orderType,
            createdAt: order.createdAt,
            tableId: order.tableId,
            tableName: table.name,
            userName: user.name,
            userNumber: user.number,
            isRunning: order.isRunning,
            lendingUserId: order.lendingUserId,
            message: order.message,
        })
        .from(order)
        .leftJoin(table, eq(order.tableId, table.id))
        .leftJoin(user, eq(order.userId, user.id))
        .where(where)
        .orderBy(desc(order.createdAt))
        .limit(limit)
        .offset(offset);

    const totalResult = await db.select({ count: sql<number>`count(*)` }).from(order).where(where);
    const total = Number(totalResult[0]?.count || 0);

    return {
        orders,
        total,
        totalPages: Math.ceil(total / limit),
    };
}

export async function getOrderDetails(orderId: number) {
    const items = await db
        .select({
            id: orderItem.id,
            dishId: orderItem.dishId,
            cegrateId: orderItem.cegrateId,
            quantity: orderItem.quantity,
            pricing: orderItem.pricing,
            dishName: orderItem.dishName,
            imageUrl: orderItem.dishImageUrl,
            options: orderItem.options,
        })
        .from(orderItem)
        .where(eq(orderItem.orderId, orderId));

    return items;
}

export async function updateOrderStatus(orderId: number, status: OrderPaymentStatus) {
    const [currentOrder] = await db
        .select({
            totalPricing: order.totalPricing,
            paidOnline: order.paidOnline,
            paidCash: order.paidCash,
            lendingAmount: order.lendingAmount,
            paymentStatus: order.paymentStatus,
        })
        .from(order)
        .where(eq(order.id, orderId))
        .limit(1);

    if (!currentOrder) {
        throw new Error("Order not found");
    }
    if (currentOrder.paymentStatus) {
        throw new Error("Razorpay payment status is managed automatically. Use fulfillment controls instead.");
    }

    await db.update(order)
        .set({
            status,
            isRunning: status === "pending",
            paidOnline: status === "paid_online" ? currentOrder.totalPricing : status === "completed" ? currentOrder.paidOnline : 0,
            paidCash: status === "paid_cash" ? currentOrder.totalPricing : status === "completed" ? currentOrder.paidCash : 0,
            lendingAmount: status === "paid_user" ? currentOrder.totalPricing : status === "completed" ? currentOrder.lendingAmount : 0,
        })
        .where(eq(order.id, orderId));
    revalidatePath("/admin/orders");
    revalidatePath("/admin/tables");
    revalidatePath("/admin/user");
    revalidateTag("today-top-ordered-dishes", "max");
}

export async function updateDeliveryStatus(orderId: number, deliveryStatus: OrderDeliveryStatus) {
    await db.update(order)
        .set({ deliveryStatus })
        .where(eq(order.id, orderId));
    revalidatePath("/admin/orders");
}

export async function updateOrderAdvanced(orderId: number, data: {
    status: 'pending' | 'completed' | 'cancelled' | 'paid_online' | 'paid_cash' | 'paid_user',
    isRunning: boolean,
    lendingUserId?: number | null,
    totalPricing: number,
    paidOnline?: number,
    paidCash?: number,
    lendingAmount?: number,
    tableId?: number | null
}) {
    const [current] = await db.select().from(order).where(eq(order.id, orderId)).limit(1);
    if (!current) throw new Error("Order not found");
    if (current.paymentStatus) {
        if (data.status !== current.status || data.totalPricing !== current.totalPricing
            || (data.paidOnline !== undefined && data.paidOnline !== current.paidOnline)
            || (data.paidCash !== undefined && data.paidCash !== current.paidCash)
            || (data.lendingAmount !== undefined && data.lendingAmount !== current.lendingAmount)
            || (data.lendingUserId != null && data.lendingUserId !== current.lendingUserId)) {
            throw new Error("Razorpay order totals and payment accounting cannot be edited.");
        }
        await db.update(order).set({
            isRunning: data.isRunning,
            ...(data.tableId !== undefined && { tableId: data.tableId }),
            updatedAt: new Date(),
        }).where(eq(order.id, orderId));
        revalidatePath("/admin/orders");
        revalidatePath("/admin/tables");
        return;
    }
    let finalIsRunning = data.isRunning;
    if (['paid_online', 'paid_cash', 'paid_user', 'cancelled'].includes(data.status)) {
        finalIsRunning = false;
    }
    // Also if it's completed, it shouldn't be running anymore? The original code didn't force this, so I will leave it up to the user selection.


    if (data.status === 'paid_user' && data.lendingUserId) {
        await db.transaction(async (tx) => {
            await tx.update(order)
                .set({
                    status: data.status,
                    isRunning: finalIsRunning,
                    lendingUserId: data.lendingUserId,
                    lendingAmount: data.totalPricing,
                    paidOnline: data.paidOnline || 0,
                    paidCash: data.paidCash || 0,
                    ...(data.tableId !== undefined && { tableId: data.tableId }),
                })
                .where(eq(order.id, orderId));

            const currentUser = await tx.select({ lendingAmount: user.lendingAmount }).from(user).where(eq(user.id, data.lendingUserId!)).limit(1);
            if (currentUser.length > 0) {
                const currentAmount = currentUser[0].lendingAmount || 0;
                await tx.update(user)
                    .set({ lendingAmount: currentAmount + data.totalPricing })
                    .where(eq(user.id, data.lendingUserId!));
            }
        });
    } else if (data.status === 'completed') {
        const lendingAmt = data.lendingAmount || 0;
        await db.transaction(async (tx) => {
            await tx.update(order)
                .set({
                    status: data.status,
                    isRunning: finalIsRunning,
                    lendingUserId: data.lendingUserId || null,
                    paidOnline: data.paidOnline || 0,
                    paidCash: data.paidCash || 0,
                    lendingAmount: lendingAmt,
                    ...(data.tableId !== undefined && { tableId: data.tableId }),
                })
                .where(eq(order.id, orderId));

            if (lendingAmt > 0 && data.lendingUserId) {
                const currentUser = await tx.select({ lendingAmount: user.lendingAmount }).from(user).where(eq(user.id, data.lendingUserId!)).limit(1);
                if (currentUser.length > 0) {
                    const currentAmount = currentUser[0].lendingAmount || 0;
                    await tx.update(user)
                        .set({ lendingAmount: currentAmount + lendingAmt })
                        .where(eq(user.id, data.lendingUserId!));
                }
            }
        });
    } else {
        await db.update(order)
            .set({
                status: data.status,
                isRunning: finalIsRunning,
                lendingUserId: data.lendingUserId || null,
                paidOnline: data.status === "paid_online" ? data.totalPricing : 0,
                paidCash: data.status === "paid_cash" ? data.totalPricing : 0,
                lendingAmount: 0,
                ...(data.tableId !== undefined && { tableId: data.tableId }),
            })
            .where(eq(order.id, orderId));
    }

    revalidatePath("/admin/orders");
    revalidatePath("/admin/tables");
    revalidatePath("/admin/user");
    revalidateTag("today-top-ordered-dishes", "max");
}

export async function createAdminOrder(data: { tableId?: number | null, userId?: number | null, lendingUserId?: number | null, totalPricing: number, items: { dishId?: number, cegrateId?: number, quantity: number, pricing: number, name?: string, imageUrl?: string, options?: OrderItemOptions }[] }) {
    const alert = await db.transaction(async (tx) => {
        const [newOrder] = await tx.insert(order).values({
            tableId: data.tableId || null,
            userId: data.userId || null,
            lendingUserId: data.lendingUserId || null,
            totalPricing: data.totalPricing,
            status: "pending",
            orderType: data.tableId ? "dine_in" : "take_away",
        }).returning({ id: order.id });

        if (data.items.length > 0) {
            await tx.insert(orderItem).values(
                data.items.map(item => ({
                    orderId: newOrder.id,
                    dishId: item.dishId,
                    cegrateId: item.cegrateId,
                    quantity: item.quantity,
                    pricing: item.pricing,
                    options: item.options || [],
                    dishName: item.name || "",
                    dishImageUrl: item.imageUrl || "",
                }))
            );
        }

        let location = "Takeaway";
        if (data.tableId) {
            const [record] = await tx.select({ name: table.name }).from(table).where(eq(table.id, data.tableId));
            location = `Table ${record?.name ?? data.tableId}`;
        }
        const alert = orderAlert(newOrder.id, data.totalPricing, location);
        await tx.insert(adminNotification).values(alert);
        return alert;
    });
    after(() => sendOrderPush(alert));

    revalidatePath("/admin/orders");
    revalidatePath("/admin/tables");
}

export async function getRunningOrdersByTable(tableId: number) {
    const orders = await db
        .select({
            id: order.id,
            totalPricing: order.totalPricing,
            status: order.status,
            paymentStatus: order.paymentStatus,
            paidOnline: order.paidOnline,
            paidCash: order.paidCash,
            lendingAmount: order.lendingAmount,
            createdAt: order.createdAt,
            tableId: order.tableId,
            tableName: table.name,
            userName: user.name,
            userNumber: user.number,
            isRunning: order.isRunning,
            lendingUserId: order.lendingUserId,
        })
        .from(order)
        .leftJoin(table, eq(order.tableId, table.id))
        .leftJoin(user, eq(order.userId, user.id))
        .where(
            sql`${order.tableId} = ${tableId} AND ${order.isRunning} = true`
        )
        .orderBy(desc(order.createdAt));

    const orderIds = orders.map(o => o.id);
    let items: (typeof orderItem.$inferSelect)[] = [];
    if (orderIds.length > 0) {
        items = await db.select().from(orderItem).where(inArray(orderItem.orderId, orderIds));
    }

    return orders.map(o => ({
        ...o,
        items: items.filter(i => i.orderId === o.id)
    }));
}

export async function updateOrderItemsList(orderId: number, items: { id?: number, dishId?: number, cegrateId?: number, quantity: number, pricing: number, dishName: string, imageUrl?: string, options?: OrderItemOptions }[]) {
    await db.transaction(async (tx) => {
        const [current] = await tx.select({ paymentStatus: order.paymentStatus }).from(order).where(eq(order.id, orderId)).for("update");
        if (!current) throw new Error("Order not found");
        if (current.paymentStatus) throw new Error("Razorpay order items and totals cannot be edited. Place a new order for additional items.");
        // First delete all existing items
        await tx.delete(orderItem).where(eq(orderItem.orderId, orderId));

        let totalPricing = 0;

        // Insert new items
        if (items.length > 0) {
            await tx.insert(orderItem).values(
                items.map(item => {
                    totalPricing += item.pricing * item.quantity;
                    return {
                        orderId,
                        dishId: item.dishId,
                        cegrateId: item.cegrateId,
                        quantity: item.quantity,
                        pricing: item.pricing,
                        options: item.options || [],
                        dishName: item.dishName,
                        dishImageUrl: item.imageUrl || "",
                    };
                })
            );
        }

        // Update total pricing of the order
        await tx.update(order)
            .set({ totalPricing })
            .where(eq(order.id, orderId));
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin/tables");
}
