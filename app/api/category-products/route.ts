import { getCachedMenu } from "@/app/actions/home";
import { NextResponse } from "next/server";

export async function GET() {
    const data = await getCachedMenu();
    return NextResponse.json({ data, status: 200 });
}
