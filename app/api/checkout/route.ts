import { after, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import db from "@/db";
import { POST as createRazorpayOrder } from "@/app/api/create-order/route";
import { RAZORPAY_CHECKOUT_ENABLED } from "@/lib/checkout-config";
import { createDirectOrder } from "@/lib/direct-order";
import { PaymentError } from "@/lib/payment-validation";
import { sendOrderPush } from "@/lib/order-notifications";

export const runtime = "nodejs";

export async function POST(request: Request) {
    if (RAZORPAY_CHECKOUT_ENABLED) return createRazorpayOrder(request);
    try {
        const { alert, ...result } = await createDirectOrder(db, await request.json());
        after(() => sendOrderPush(alert));
        revalidatePath("/admin/orders");
        revalidatePath("/admin/tables");
        revalidatePath("/orders");
        revalidateTag("today-top-ordered-dishes", "max");
        return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        if (error instanceof PaymentError) return NextResponse.json({ success: false, error: error.message }, { status: error.status });
        if (error instanceof SyntaxError) return NextResponse.json({ success: false, error: "Invalid JSON request." }, { status: 400 });
        console.error("Direct order creation failed");
        return NextResponse.json({ success: false, error: "Unable to place order. Please try again." }, { status: 500 });
    }
}
