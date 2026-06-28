"use server";

import db from "@/db";
import { order, user, table, orderItem, dish } from "@/db/schema";
import { eq, desc, sql, inArray } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

export async function getOrders(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const orders = await db
        .select({
            id: order.id,
            totalPricing: order.totalPricing,
            status: order.status,
            deliveryStatus: order.deliveryStatus,
            orderType: order.orderType,
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
        .orderBy(desc(order.createdAt))
        .limit(limit)
        .offset(offset);

    const totalResult = await db.select({ count: sql<number>`count(*)` }).from(order);
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

export async function updateOrderStatus(orderId: number, status: 'pending' | 'completed' | 'cancelled') {
    await db.update(order)
        .set({ status })
        .where(eq(order.id, orderId));
    revalidatePath("/admin/orders");
}

export async function updateDeliveryStatus(orderId: number, deliveryStatus: 'ordered' | 'ready' | 'delivered') {
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

export async function createAdminOrder(data: { tableId?: number | null, userId?: number | null, lendingUserId?: number | null, totalPricing: number, items: { dishId?: number, cegrateId?: number, quantity: number, pricing: number, name?: string, imageUrl?: string, options?: any[] }[] }) {
    const [newOrder] = await db.insert(order).values({
        tableId: data.tableId || null,
        userId: data.userId || null,
        lendingUserId: data.lendingUserId || null,
        totalPricing: data.totalPricing,
        status: "pending",
        orderType: data.tableId ? "dine_in" : "take_away",
    }).returning({ id: order.id });

    if (data.items.length > 0) {
        await db.insert(orderItem).values(
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

    revalidatePath("/admin/orders");
    revalidatePath("/admin/tables");
}

export async function getRunningOrdersByTable(tableId: number) {
    const orders = await db
        .select({
            id: order.id,
            totalPricing: order.totalPricing,
            status: order.status,
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

export async function updateOrderItemsList(orderId: number, items: { id?: number, dishId?: number, cegrateId?: number, quantity: number, pricing: number, dishName: string, imageUrl?: string, options?: any[] }[]) {
    await db.transaction(async (tx) => {
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
