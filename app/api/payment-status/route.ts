import { NextResponse } from "next/server";
import { payments } from "@/lib/razorpay";
import { checkoutToken, paymentErrorResponse } from "@/lib/payment-response";

export const runtime = "nodejs";

export async function GET(request: Request) {
    try {
        return NextResponse.json(await payments().getStatus(checkoutToken(request)), { headers: { "Cache-Control": "no-store" } });
    } catch (error) { return paymentErrorResponse(error); }
}
