import db from "@/db";
import { category, dishCategory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const id = parseInt(params.id);
        
        await db.delete(dishCategory).where(eq(dishCategory.categoryId, id));
        await db.delete(category).where(eq(category.id, id));
        revalidateTag("menu-data", "max");
        
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to delete category" }, { status: 500 });
    }
}
