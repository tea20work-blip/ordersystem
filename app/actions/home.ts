"use server";
// lib/getCachedMenu.ts
import { unstable_cache } from "next/cache";
import db from "@/db";
import { addons, category, dish, dishCategory } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

const addonDish = alias(dish, "addonDish");

async function getMenu() {
    const data = await db
        .select({
            categoryId: category.id,
            categoryName: category.name,

            dishId: dish.id,
            dishName: dish.name,
            dishPrice: dish.price,
            dishDescription: dish.description,
            dishImageUrl: dish.imageUrl,
            dishOptions: dish.dishOptions,
            dishVarients: dish.dishVarients,
            maxSelectOptions: dish.maxSelectOptions,
            maxSelectVarient: dish.maxSelectVarient,
            minSelectVarient: dish.minSelectVarient,
            isOutOfStock: dish.isOutOfStock,
            styleOptions: dish.styleOptions,
            minStyleOptions: dish.minStyleOptions,
            maxStyleOptions: dish.maxStyleOptions,

            dishPriority: dish.priority,
            categoryPriority: category.priority,

            addonId: addonDish.id,
            addonName: addonDish.name,
            addonPrice: addonDish.price,
        })
        .from(category)
        .leftJoin(dishCategory, eq(category.id, dishCategory.categoryId))
        .leftJoin(dish, eq(dishCategory.dishId, dish.id))
        .where(and(eq(dish.isHidden, false), eq(dish.isDeleted, false)))
        .leftJoin(addons, eq(dish.id, addons.dishId))
        .leftJoin(addonDish, eq(addons.addOnId, addonDish.id))

    data.sort((a, b) => (a.dishPriority || 0) - (b.dishPriority || 0));

    const grouped = Object.values(
        data.reduce((acc, row) => {
            if (!acc[row.categoryId]) {
                acc[row.categoryId] = {
                    id: row.categoryId,
                    name: row.categoryName,
                    categoryPriority: row.categoryPriority,
                    dishes: [],
                };
            }

            if (row.dishId) {
                if (!acc[row.categoryId].dishes.some((dish: any) => dish.id === row.dishId)) {
                    acc[row.categoryId].dishes.push({
                        id: row.dishId,
                        name: row.dishName,
                        price: row.dishPrice,
                        description: row.dishDescription,
                        imageUrl: row.dishImageUrl,
                        dishOptions: row.dishOptions,
                        dishVarients: row.dishVarients,
                        maxSelectOptions: row.maxSelectOptions,
                        maxSelectVarient: row.maxSelectVarient,
                        minSelectVarient: row.minSelectVarient,
                        styleOptions: row.styleOptions,
                        minStyleOptions: row.minStyleOptions,
                        maxStyleOptions: row.maxStyleOptions,
                        category: row.categoryName,
                        addons: [],
                    });
                }

                if (row.addonId) {
                    acc[row.categoryId].dishes.find((dish: any) => dish.id === row.dishId)?.addons.push({
                        id: row.addonId,
                        name: row.addonName,
                        price: row.addonPrice,
                    });
                }
            }

            return acc;
        }, {} as any)
    )



    return grouped.sort((a: any, b: any) => (a.categoryPriority || 0) - (b.categoryPriority || 0));
}

// ✅ cached function
export const getCachedMenu = unstable_cache(getMenu, ["menu-data"], {
    tags: ["menu-data"],
    revalidate: 7200, // 2 hour
});