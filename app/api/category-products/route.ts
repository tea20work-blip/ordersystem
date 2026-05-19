import db from "@/db";
import { addons, category, dish, dishCategory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextResponse } from "next/server";

const addonDish = alias(dish, "addonDish");


export async function GET() {
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

            addonId: addonDish.id,
            addonName: addonDish.name,
            addonPrice: addonDish.price,
        })
        .from(category)
        .leftJoin(dishCategory, eq(category.id, dishCategory.categoryId))
        .leftJoin(dish, eq(dishCategory.dishId, dish.id))
        .leftJoin(addons, eq(dish.id, addons.dishId))
        .leftJoin(addonDish, eq(addons.addOnId, addonDish.id));
    // console.log(data);


    const grouped = Object.values(
        data.reduce((acc, row) => {
            // category
            if (!acc[row.categoryId]) {
                acc[row.categoryId] = {
                    id: row.categoryId,
                    name: row.categoryName,
                    dishes: {},
                };
            }

            // dish
            if (row.dishId) {
                if (!acc[row.categoryId].dishes[row.dishId]) {
                    acc[row.categoryId].dishes[row.dishId] = {
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
                        addons: [],
                    };
                }

                // addon
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

    // console.log("groupud")
    // console.log("groupud")
    // console.log("groupud")
    // // console.log(JSON.stringify(grouped))


    return NextResponse.json({ data: grouped, status: 200 });
}