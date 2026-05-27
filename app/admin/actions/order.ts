"use server";

import db from "@/db";
import { order, user, table, orderItem, dish } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getOrders(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const orders = await db
        .select({
            id: order.id,
            totalPricing: order.totalPricing,
            status: order.status,
            createdAt: order.createdAt,
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
            quantity: orderItem.quantity,
            pricing: orderItem.pricing,
            dishName: dish.name,
            imageUrl: dish.imageUrl,
            options: orderItem.options,
        })
        .from(orderItem)
        .leftJoin(dish, eq(orderItem.dishId, dish.id))
        .where(eq(orderItem.orderId, orderId));

    return items;
}

export async function updateOrderStatus(orderId: number, status: 'pending' | 'completed' | 'cancelled') {
    await db.update(order)
        .set({ status })
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
    lendingAmount?: number
}) {
    let finalIsRunning = data.isRunning;
    if (['paid_online', 'paid_cash', 'paid_user'].includes(data.status)) {
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
                    lendingAmount: data.totalPricing, // For backwards compatibility
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
                paidOnline: data.paidOnline || 0,
                paidCash: data.paidCash || 0,
                lendingAmount: data.lendingAmount || 0,
            })
            .where(eq(order.id, orderId));
    }

    revalidatePath("/admin/orders");
}

export async function createAdminOrder(data: { tableId?: number | null, totalPricing: number, items: { dishId?: number, cegrateId?: number, quantity: number, pricing: number, dishName?: string, dishImageUrl?: string, options?: any[] }[] }) {
    const [newOrder] = await db.insert(order).values({
        tableId: data.tableId || null,
        totalPricing: data.totalPricing,
        status: "pending",
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
                dishName: item.dishName || "",
                dishImageUrl: item.dishImageUrl || "",
            }))
        );
    }

    revalidatePath("/admin/orders");
}

export async function getRunningOrdersByTable(tableId: number) {
    return await db
        .select({
            id: order.id,
            totalPricing: order.totalPricing,
            status: order.status,
            createdAt: order.createdAt,
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
}
