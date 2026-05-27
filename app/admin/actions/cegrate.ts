"use server";

import db from "@/db";
import { cegrates } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCegrates() {
    return await db.select().from(cegrates).orderBy(desc(cegrates.createdAt));
}

export async function getCegrate(id: number) {
    const result = await db.select().from(cegrates).where(eq(cegrates.id, id));
    return result[0];
}

export async function createCegrate(data: { name: string, amount: number }) {
    await db.insert(cegrates).values({
        name: data.name,
        amount: data.amount,
    });
    revalidatePath("/admin/cegrates");
}

export async function updateCegrate(id: number, data: { name: string, amount: number }) {
    await db.update(cegrates).set({
        name: data.name,
        amount: data.amount,
    }).where(eq(cegrates.id, id));
    revalidatePath("/admin/cegrates");
}

export async function deleteCegrate(id: number) {
    await db.delete(cegrates).where(eq(cegrates.id, id));
    revalidatePath("/admin/cegrates");
}
