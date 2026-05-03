"use server";
// lib/getCachedMenu.ts
import { unstable_cache } from "next/cache";
import db from "@/db";
import { addons, category, dish, dishCategory } from "@/db/schema";
import { eq } from "drizzle-orm";
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
            maxSelectOptions: dish.maxSelectOptions,
            minSelectOptions: dish.minSelectOptions,

            addonId: addonDish.id,
            addonName: addonDish.name,
            addonPrice: addonDish.price,
        })
        .from(category)
        .leftJoin(dishCategory, eq(category.id, dishCategory.categoryId))
        .leftJoin(dish, eq(dishCategory.dishId, dish.id))
        .leftJoin(addons, eq(dish.id, addons.dishId))
        .leftJoin(addonDish, eq(addons.addOnId, addonDish.id));

    const grouped = Object.values(
        data.reduce((acc, row) => {
            if (!acc[row.categoryId]) {
                acc[row.categoryId] = {
                    id: row.categoryId,
                    name: row.categoryName,
                    dishes: {},
                };
            }

            if (row.dishId) {
                if (!acc[row.categoryId].dishes[row.dishId]) {
                    acc[row.categoryId].dishes[row.dishId] = {
                        id: row.dishId,
                        name: row.dishName,
                        price: row.dishPrice,
                        description: row.dishDescription,
                        imageUrl: row.dishImageUrl,
                        dishOptions: row.dishOptions,
                        maxSelectOptions: row.maxSelectOptions,
                        minSelectOptions: row.minSelectOptions,
                        addons: [],
                    };
                }

                if (row.addonId) {
                    acc[row.categoryId].dishes[row.dishId].addons.push({
                        id: row.addonId,
                        name: row.addonName,
                        price: row.addonPrice,
                    });
                }
            }

            return acc;
        }, {} as any)
    ).map((cat: any) => ({
        ...cat,
        dishes: Object.values(cat.dishes),
    }));

    return grouped;
}

// ✅ cached function
export const getCachedMenu = unstable_cache(getMenu, ["menu-data"], {
    revalidate: 3600, // 1 hour
});