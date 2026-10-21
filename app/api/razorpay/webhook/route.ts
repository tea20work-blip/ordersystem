import { payments } from "@/lib/razorpay";
import { PaymentError } from "@/lib/payment-validation";
import { paymentErrorResponse, paymentResponse } from "@/lib/payment-response";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!secret) throw new PaymentError("Webhook is not configured.", 500);
        return paymentResponse(await payments().processWebhook(await request.text(), request.headers.get("X-Razorpay-Signature") || "", secret));
    } catch (error) { return paymentErrorResponse(error); }
}
