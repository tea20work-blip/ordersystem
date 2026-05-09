"use server";

import db from "@/db";
import { dish, dishCategory, addons } from "@/db/schema";
import { eq, inArray, ilike, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getDishes(searchQuery?: string) {
    if (searchQuery && searchQuery.trim() !== "") {
        return await db.select().from(dish).where(and(ilike(dish.name, `%${searchQuery}%`), eq(dish.isDeleted, false))).orderBy(dish.createdAt);
    }
    return await db.select().from(dish).where(eq(dish.isDeleted, false)).orderBy(dish.createdAt);
}

export async function getDish(id: number) {
    const result = await db.select().from(dish).where(eq(dish.id, id));
    const dishData = result[0];

    if (!dishData) return null;

    const categories = await db
        .select({ categoryId: dishCategory.categoryId })
        .from(dishCategory)
        .where(eq(dishCategory.dishId, id));

    const addonsData = await db
        .select({ addOnId: addons.addOnId })
        .from(addons)
        .where(eq(addons.dishId, id));

    return {
        ...dishData,
        categoryIds: categories.map(c => c.categoryId),
        addonIds: addonsData.map(a => a.addOnId)
    };
}

export async function createDish(data: { name: string; price: number; description: string; imageUrl: string; categoryIds: number[], addonIds?: number[], dishOptions?: any[], isOutOfStock?: boolean, isHidden?: boolean }) {
    const [newDish] = await db.insert(dish).values({
        name: data.name,
        price: data.price,
        description: data.description,
        imageUrl: data.imageUrl,
        dishOptions: data.dishOptions || [],
        isOutOfStock: data.isOutOfStock || false,
        isHidden: data.isHidden || false,
    }).returning({ id: dish.id });

    if (data.categoryIds.length > 0) {
        await db.insert(dishCategory).values(
            data.categoryIds.map(cid => ({
                dishId: newDish.id,
                categoryId: cid
            }))
        );
    }

    if (data.addonIds && data.addonIds.length > 0) {
        await db.insert(addons).values(
            data.addonIds.map(aid => ({
                dishId: newDish.id,
                addOnId: aid
            }))
        );
    }

    revalidatePath("/admin/dishes");
}

export async function updateDish(id: number, data: { name: string; price: number; description: string; imageUrl: string; categoryIds: number[], addonIds?: number[], dishOptions?: any[], isOutOfStock?: boolean, isHidden?: boolean }) {
    await db.update(dish).set({
        name: data.name,
        price: data.price,
        description: data.description,
        imageUrl: data.imageUrl,
        dishOptions: data.dishOptions || [],
        isOutOfStock: data.isOutOfStock || false,
        isHidden: data.isHidden || false,
        updatedAt: new Date(),
    }).where(eq(dish.id, id));

    await db.delete(dishCategory).where(eq(dishCategory.dishId, id));
    await db.delete(addons).where(eq(addons.dishId, id));

    if (data.categoryIds.length > 0) {
        await db.insert(dishCategory).values(
            data.categoryIds.map(cid => ({
                dishId: id,
                categoryId: cid
            }))
        );
    }

    if (data.addonIds && data.addonIds.length > 0) {
        await db.insert(addons).values(
            data.addonIds.map(aid => ({
                dishId: id,
                addOnId: aid
            }))
        );
    }

    revalidatePath("/admin/dishes");
}

export async function deleteDish(id: number) {
    await db.delete(addons).where(eq(addons.dishId, id));
    await db.delete(dishCategory).where(eq(dishCategory.dishId, id));
    await db.delete(dish).where(eq(dish.id, id));
    revalidatePath("/admin/dishes");
}
