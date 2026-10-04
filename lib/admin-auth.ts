import "server-only";
import { cookies } from "next/headers";
import { ADMIN_PASSWORD } from "@/env";

export async function isAdmin() {
    return (await cookies()).get("admin_password")?.value === ADMIN_PASSWORD;
}
