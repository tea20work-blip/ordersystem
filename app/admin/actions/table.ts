"use server";

import db from "@/db";
import { order, table } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTables() {
    return await db
        .select({
            id: table.id,
            name: table.name,
            isRunning: order.isRunning,
            createdAt: table.createdAt
        })
        .from(table)
        .leftJoin(
            order,
            and(
                eq(order.tableId, table.id),
                eq(order.isRunning, true)
            )
        )
        .groupBy(
            table.id,
            table.name,
            order.isRunning
        )
        .orderBy(table.createdAt);
}

export async function getTable(id: number) {
    const result = await db.select().from(table).where(eq(table.id, id));
    return result[0];
}

export async function createTable(data: { name: string, tableCode: string }) {
    await db.insert(table).values({
        name: data.name,
        tableCode: data.tableCode
    });
    revalidatePath("/admin/tables");
}

export async function updateTable(id: number, data: { name: string }) {
    await db.update(table).set({
        name: data.name,
        updatedAt: new Date(),
    }).where(eq(table.id, id));
    revalidatePath("/admin/tables");
}

export async function deleteTable(id: number) {
    await db.delete(table).where(eq(table.id, id));
    revalidatePath("/admin/tables");
}
