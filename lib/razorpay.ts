import "server-only";
import Razorpay from "razorpay";
import db from "@/db";
import { createPaymentService } from "@/lib/payment-service";
import { PaymentError } from "@/lib/payment-validation";

export function payments() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !secret) throw new PaymentError("Payments are not configured.", 500);
    const client = new Razorpay({ key_id: keyId, key_secret: secret });
    // SDK 2.x exposes its Axios instance at runtime but omits it from its types.
    (client.api as unknown as { rq: { defaults: { timeout: number } } }).rq.defaults.timeout = 15000;
    return createPaymentService(db, {
        createOrder: input => client.orders.create(input),
        fetchPayment: id => client.payments.fetch(id),
    }, secret);
}
