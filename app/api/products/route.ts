import { NextResponse } from "next/server";
import db from "@/db";
import { dish } from "@/db/schema";

export async function GET() {
    try {
        const products = await db.select({
            id: dish.id,
            name: dish.name,
            price: dish.price
        }).from(dish).orderBy(dish.createdAt);

        return NextResponse.json({
            success: true,
            message: "Products fetched successfully",
            data: products
        });
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch products" },
            { status: 500 }
        );
    }
}
