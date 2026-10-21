"use server";

import db from "@/db";
import { category } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

export async function getCategories() {
    return await db.select().from(category).orderBy(asc(category.priority), asc(category.createdAt));
}

export async function getCategory(id: number) {
    const result = await db.select().from(category).where(eq(category.id, id));
    return result[0];
}

export async function createCategory(data: { name: string, priority: number }) {
    await db.insert(category).values({
        name: data.name,
        priority: data.priority,
    });
    revalidatePath("/admin/categories");
    revalidateTag("menu-data", "max");
}

export async function updateCategory(id: number, data: { name: string, priority: number }) {
    await db.update(category).set({
        name: data.name,
        priority: data.priority,
        updatedAt: new Date(),
    }).where(eq(category.id, id));
    revalidatePath("/admin/categories");
    revalidateTag("menu-data", "max");
}

export async function deleteCategory(id: number) {
    await db.delete(category).where(eq(category.id, id));
    revalidatePath("/admin/categories");
    revalidateTag("menu-data", "max");
}

export async function updateCategoryPriorities(updates: { id: number, priority: number }[]) {
    // In Drizzle we can't easily do a bulk update with different values per row without a transaction or loop.
    // Given the likely small number of categories, looping in a transaction is fine.
    await db.transaction(async (tx) => {
        for (const update of updates) {
            await tx.update(category)
                .set({ priority: update.priority, updatedAt: new Date() })
                .where(eq(category.id, update.id));
        }
    });
    revalidatePath("/admin/categories");
    revalidateTag("menu-data", "max");

}
