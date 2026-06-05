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

export async function payUserLending(userId: number, amount: number, paymentMethod: "paid_online" | "paid_cash") {
    return await db.transaction(async (tx) => {
        // Create an order with negative amount
        await tx.insert(order).values({
            userId: userId,
            totalPricing: -amount,
            status: paymentMethod,
            isRunning: false,
            ...(paymentMethod === "paid_online" ? { paidOnline: amount } : { paidCash: amount }),
        });

        // Deduct from user lendingAmount
        const currentUser = await tx.select().from(user).where(eq(user.id, userId)).limit(1);
        if (!currentUser || currentUser.length === 0) throw new Error("User not found");

        const newLendingAmount = (currentUser[0].lendingAmount || 0) - amount;

        await tx.update(user).set({
            lendingAmount: newLendingAmount,
        }).where(eq(user.id, userId));

        return { success: true };
    });
}

export async function createUser(data: { name: string; number: string }) {
    const newUser = await db.insert(user).values({
        name: data.name,
        number: data.number,
        lendingAmount: 0,
    }).returning();
    return newUser[0];
}
