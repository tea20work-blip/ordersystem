import db from "@/db";
import { dish, dishCategory, orderItem } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const id = parseInt(params.id);


        await db.update(dish).set({ isDeleted: true }).where(eq(dish.id, id));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to delete dish" }, { status: 500 });
    }
}
