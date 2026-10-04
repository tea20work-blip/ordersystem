import { NextResponse } from "next/server";
import db from "@/db";
import { adminPushToken } from "@/db/schema";
import { isAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
    if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    const { token } = await request.json();
    if (typeof token !== "string" || token.length < 20 || token.length > 4096) return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    await db.insert(adminPushToken).values({ token }).onConflictDoUpdate({ target: adminPushToken.token, set: { updatedAt: new Date() } });
    return NextResponse.json({ success: true });
}
