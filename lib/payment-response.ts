import "server-only";
import { after, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { PaymentError } from "@/lib/payment-validation";
import { sendOrderPush, type orderAlert } from "@/lib/order-notifications";

export function checkoutToken(request: Request) { return request.headers.get("X-Checkout-Token") || ""; }

export function paymentErrorResponse(error: unknown) {
    if (error instanceof PaymentError) return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    if (error instanceof SyntaxError) return NextResponse.json({ success: false, error: "Invalid JSON request." }, { status: 400 });
    const status = error && typeof error === "object" && "statusCode" in error ? error.statusCode : undefined;
    // SDK errors may contain authentication headers or customer data.
    console.error("Payment operation failed", { status: typeof status === "number" ? status : "internal" });
    return NextResponse.json({ success: false, error: status === 401 ? "Payment provider authentication failed." : "Unable to process payment. Please try again." },
        { status: status === 401 ? 401 : 500 });
}

export function paymentResponse<T extends { alert: ReturnType<typeof orderAlert> | null }>(result: T) {
    const { alert, ...body } = result;
    if (alert) {
        after(() => sendOrderPush(alert));
        revalidatePath("/admin/orders");
        revalidatePath("/admin/tables");
        revalidatePath("/orders");
        revalidateTag("today-top-ordered-dishes", "max");
    }
    const pending = "paymentStatus" in body && body.paymentStatus === "pending";
    return NextResponse.json(body, { status: pending ? 202 : 200, headers: { "Cache-Control": "no-store" } });
}
