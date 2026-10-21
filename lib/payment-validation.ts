import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { dish } from "@/db/schema";
import { userDetailsSchema } from "@/zod/userDetailsSchema";

export class PaymentError extends Error {
    constructor(message: string, public status = 400) {
        super(message);
    }
}

export const checkoutTokenSchema = z.string().uuid();
export const checkoutSchema = userDetailsSchema.extend({
    name: userDetailsSchema.shape.name.max(255),
    email: userDetailsSchema.shape.email.refine(value => !value || value.length <= 255),
    message: z.string().max(255).optional(),
    tableCode: z.string().min(1).max(255).optional(),
    cartItems: z.array(z.object({
        dish: z.object({ id: z.coerce.number().int().positive() }),
        quantity: z.number().int().positive().max(1000),
        selectedOptions: z.array(z.object({ id: z.string().min(1).max(255) })).max(100).optional(),
    })).min(1).max(100),
});

export const verificationSchema = z.object({
    razorpay_order_id: z.string().regex(/^order_[a-zA-Z0-9]+$/),
    razorpay_payment_id: z.string().regex(/^pay_[a-zA-Z0-9]+$/),
    razorpay_signature: z.string().regex(/^[a-fA-F0-9]{64}$/),
});

export function tokenHash(token: string) {
    return createHash("sha256").update(token).digest("hex");
}

export function validSignature(message: string, signature: string, secret: string) {
    if (!/^[a-fA-F0-9]{64}$/.test(signature)) return false;
    const expected = createHmac("sha256", secret).update(message).digest();
    return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}

type CatalogDish = typeof dish.$inferSelect;
type Selection = { id: string; name: string; price: number };
const selectionSchema = z.object({ id: z.string(), name: z.string(), price: z.number().int().nonnegative() });

function catalogSelections(raw: unknown): Selection[] {
    const parsed = z.array(selectionSchema).safeParse(raw ?? []);
    if (!parsed.success) throw new PaymentError("This dish has invalid pricing configuration.");
    return parsed.data;
}

// Browser prices, names, and images are deliberately absent from the parsed input.
export function priceCart(items: z.infer<typeof checkoutSchema>["cartItems"], catalog: CatalogDish[]) {
    const dishes = new Map(catalog.map(record => [record.id, record]));
    const rows = items.map(item => {
        const record = dishes.get(item.dish.id);
        if (!record || record.isDeleted || record.isHidden || record.isOutOfStock) {
            throw new PaymentError("A dish is no longer available. Please update your cart.");
        }
        const options = catalogSelections(record.dishOptions);
        const styles = catalogSelections(record.styleOptions);
        const variants = catalogSelections(record.dishVarients);
        const selectedIds = item.selectedOptions?.map(option => option.id) ?? [];
        if (new Set(selectedIds).size !== selectedIds.length) throw new PaymentError("Duplicate dish selections.");
        const ids = new Set(selectedIds);
        const all = [...variants, ...options, ...styles];
        if (new Set(all.map(option => option.id)).size !== all.length) throw new PaymentError("This dish has ambiguous selections.");
        if (selectedIds.some(id => !all.some(option => option.id === id))) throw new PaymentError("A dish selection is no longer available.");
        const selectedVariants = variants.filter(option => ids.has(option.id));
        const selectedOptions = options.filter(option => ids.has(option.id));
        const selectedStyles = styles.filter(option => ids.has(option.id));
        if (selectedVariants.length > (record.maxSelectVarient ?? 1)
            || selectedVariants.length < (record.minSelectVarient ?? 0)
            || selectedOptions.length > (record.maxSelectOptions ?? 1)
            || selectedStyles.length > (record.maxStyleOptions ?? 1)
            || selectedStyles.length < (record.minStyleOptions ?? 0)) throw new PaymentError("Invalid number of dish selections.");
        const pricing = (selectedVariants.length ? selectedVariants.reduce((sum, option) => sum + option.price, 0) : record.price)
            + [...selectedOptions, ...selectedStyles].reduce((sum, option) => sum + option.price, 0);
        if (!Number.isSafeInteger(pricing) || pricing < 0) throw new PaymentError("Invalid dish price.");
        return {
            dishId: record.id, dishName: record.name, dishImageUrl: record.imageUrl, pricing, quantity: item.quantity,
            // Variants are included in the base price, as in the existing cart.
            options: [...selectedVariants.map(option => ({ ...option, price: 0 })), ...selectedOptions, ...selectedStyles],
        };
    });
    const totalPricing = rows.reduce((sum, item) => sum + item.pricing * item.quantity, 0);
    const amount = totalPricing * 100;
    // Both rupee and paise columns are PostgreSQL integers.
    if (!Number.isSafeInteger(amount) || amount < 100 || amount > 2147483647) {
        throw new PaymentError("Order amount must be at least ₹1 and within the supported limit.");
    }
    return { rows, totalPricing, amount };
}

export interface GatewayPayment {
    id: string;
    order_id: string | null;
    amount: number | string;
    currency: string;
    status: string;
}

export function assertPaymentMatches(payment: GatewayPayment, expected: {
    razorpayOrderId: string | null; paymentAmount: number | null; paymentCurrency: string | null;
}) {
    if (payment.order_id !== expected.razorpayOrderId || Number(payment.amount) !== expected.paymentAmount
        || payment.currency !== expected.paymentCurrency) throw new PaymentError("Payment does not match this order.");
}
