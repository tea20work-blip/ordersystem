import { payments } from "@/lib/razorpay";
import { checkoutToken, paymentErrorResponse, paymentResponse } from "@/lib/payment-response";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        return paymentResponse(await payments().verifyPayment(checkoutToken(request), await request.json()));
    } catch (error) { return paymentErrorResponse(error); }
}
