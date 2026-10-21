import { NextResponse } from "next/server";
import { payments } from "@/lib/razorpay";
import { checkoutToken, paymentErrorResponse } from "@/lib/payment-response";
import { RAZORPAY_CHECKOUT_ENABLED } from "@/lib/checkout-config";

export const runtime = "nodejs";

export async function POST(request: Request) {
    if (!RAZORPAY_CHECKOUT_ENABLED) {
        return NextResponse.json({ success: false, error: "Online payments are temporarily disabled. Please place your order from the cart." }, { status: 503 });
    }
    try {
        const result = await payments().createOrder(checkoutToken(request), await request.json());
        return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
    } catch (error) { return paymentErrorResponse(error); }
}
