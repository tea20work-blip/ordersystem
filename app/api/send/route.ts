import webpush from "web-push"
import { subscriptions } from "@/const/global"

webpush.setVapidDetails(
    "mailto:bishnoi11011@gmail.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY!
)

export async function GET() {

    const payload = JSON.stringify({
        title: "New Order",
        body: "A new order has been placed"
    })

    for (const sub of subscriptions) {
        await webpush.sendNotification(sub, payload, {
            TTL: 60
        })
    }

    return Response.json({ success: true })
}