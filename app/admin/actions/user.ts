"use server";

import db from "@/db";
import { user, order, orderItem, dish, table } from "@/db/schema";
import { asc, desc, eq, or } from "drizzle-orm";

export async function getUsers() {
    return await db.select({
        id: user.id,
        name: user.name,
        number: user.number,
        lendingAmount: user.lendingAmount,
    }).from(user).orderBy(asc(user.name));
}

export async function getUserById(id: number) {
    const result = await db.select().from(user).where(eq(user.id, id)).limit(1);
    return result[0] || null;
}

export async function getUserOrders(userId: number) {
    const orders = await db.select({
        id: order.id,
        status: order.status,
        totalPricing: order.totalPricing,
        createdAt: order.createdAt,
        tableName: table.name,
    })
        .from(order)
        .leftJoin(table, eq(order.tableId, table.id))
        .where(or(eq(order.userId, userId), eq(order.lendingUserId, userId)))
        .orderBy(desc(order.createdAt));

    return orders;
}
