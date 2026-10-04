import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { eq } from "drizzle-orm";
import db from "@/db";
import { adminPushToken } from "@/db/schema";

export function orderAlert(orderId: number, total: number, location: string) {
    return { orderId, title: `New order #${orderId}`, body: `${location} · ₹${total}` };
}

// Delivery failures must never turn a committed order into a failed checkout.
export async function sendOrderPush(alert: ReturnType<typeof orderAlert>) {
    try {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
        if (!projectId || !clientEmail || !privateKey) return;
        const app = getApps().find(app => app.name === "order-notifications") ?? initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }),
        }, "order-notifications");
        const rows = await db.select().from(adminPushToken);
        for (let offset = 0; offset < rows.length; offset += 500) {
            const tokens = rows.slice(offset, offset + 500).map(row => row.token);
            const result = await getMessaging(app).sendEachForMulticast({
                tokens,
                notification: { title: alert.title, body: alert.body },
                data: { orderId: String(alert.orderId) },
                webpush: { notification: { tag: `order-${alert.orderId}`, requireInteraction: true },
                    fcmOptions: { link: `${process.env.APP_URL || "https://tea20cafe.com"}/admin/orders` } },
            });
            for (const [index, response] of result.responses.entries()) {
                if (["messaging/registration-token-not-registered", "messaging/invalid-registration-token"].includes(response.error?.code ?? "")) {
                    await db.delete(adminPushToken).where(eq(adminPushToken.token, tokens[index]));
                }
            }
            if (result.failureCount) console.error("Order push delivery failures:", result.failureCount);
        }
    } catch (error) {
        console.error("Order push delivery failed:", error);
    }
}
