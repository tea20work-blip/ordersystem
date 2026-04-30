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
