"use server";

import db from "@/db";
import { poster } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

export async function getPosters() {
    return await db.select().from(poster).orderBy(poster.priority, poster.createdAt);
}

export async function updatePosterPriorities(updates: { id: number; priority: number }[]) {
    await db.transaction(async (tx) => {
        for (const update of updates) {
            await tx
                .update(poster)
                .set({ priority: update.priority })
                .where(eq(poster.id, update.id));
        }
    });
    revalidatePath("/admin/poster");
    revalidateTag("poster-data", "max");
}

export async function getPoster(id: number) {
    const data = await db.select().from(poster).where(eq(poster.id, id));
    return data[0] || null;
}

export async function createPoster(data: {
    posterName: string;
    posterImage: string;
    posterUrl: string;
}) {
    await db.insert(poster).values(data);
    revalidatePath("/admin/poster");
    revalidateTag("poster-data", "max");
}

export async function updatePoster(id: number, data: {
    posterName: string;
    posterImage: string;
    posterUrl: string;
}) {
    await db.update(poster).set(data).where(eq(poster.id, id));
    revalidatePath("/admin/poster");
    revalidateTag("poster-data", "max");
}

export async function deletePoster(id: number) {
    await db.delete(poster).where(eq(poster.id, id));
    revalidatePath("/admin/poster");
    revalidateTag("poster-data", "max");
}
