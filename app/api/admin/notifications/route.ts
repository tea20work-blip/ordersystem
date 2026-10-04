import { NextResponse } from "next/server";
import { asc, eq, isNull } from "drizzle-orm";
import db from "@/db";
import { adminNotification } from "@/db/schema";
import { isAdmin } from "@/lib/admin-auth";

export async function GET() {
    if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const notifications = await db.select().from(adminNotification)
        .where(isNull(adminNotification.dismissedAt)).orderBy(asc(adminNotification.id));
    return NextResponse.json({ notifications }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
    if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    const { id } = await request.json();
    if (!Number.isSafeInteger(id) || id <= 0) return NextResponse.json({ error: "Invalid notification" }, { status: 400 });
    await db.update(adminNotification).set({ dismissedAt: new Date() }).where(eq(adminNotification.id, id));
    return NextResponse.json({ success: true });
}
