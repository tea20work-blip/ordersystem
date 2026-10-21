import { NextResponse } from "next/server";
import { getCachedProducts } from "@/app/actions/home";

export async function GET() {
    try {
        const products = await getCachedProducts();

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
