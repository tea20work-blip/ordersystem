import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { test } from "node:test";
import type { dish } from "@/db/schema";
import { assertPaymentMatches, checkoutSchema, checkoutTokenSchema, priceCart, validSignature, verificationSchema } from "@/lib/payment-validation";

const tea: typeof dish.$inferSelect = {
    dishType: "beverage",
    id: 1, name: 'Tea', price: 20, description: null, priority: 0, imageUrl: null, createdAt: null, updatedAt: null,
    dishOptions: [{ id: 'milk', name: 'Milk', price: 5 }], styleOptions: [{ id: 'iced', name: 'Iced', price: 10 }],
    dishVarients: [{ id: 'large', name: 'Large', price: 30 }], minStyleOptions: 0, maxStyleOptions: 1,
    minSelectVarient: 0, maxSelectVarient: 1, maxSelectOptions: 1, isOutOfStock: false, isHidden: false, isDeleted: false,
};

test('database prices override forged totals and variant prices, with add-ons charged separately', () => {
    const input = checkoutSchema.parse({
        name: 'Customer', mobile: '9876543210', totalPricing: 1,
        cartItems: [
            { dish: { id: 1, price: 1, name: 'Forged' }, quantity: 2, selectedOptions: [{ id: 'large', price: 1 }, { id: 'milk', price: -5 }, { id: 'iced', price: 0 }] },
            { dish: { id: 2, price: 0 }, quantity: 1 },
        ],
    });
    const priced = priceCart(input.cartItems, [tea, { ...tea, id: 2, name: 'Biscuit', price: 15, dishOptions: [], styleOptions: [], dishVarients: [] }]);
    assert.equal(priced.totalPricing, 105);
    assert.equal(priced.amount, 10500);
    assert.equal(priced.rows[0].pricing, 45);
    assert.equal(priced.rows[0].dishName, 'Tea');
    assert.equal(priced.rows[0].options[0].price, 0);
});

test('unavailable dishes and unknown, repeated, or excessive selections are rejected', () => {
    for (const unavailable of ['isHidden', 'isDeleted', 'isOutOfStock']) {
        assert.throws(() => priceCart([{ dish: { id: 1 }, quantity: 1 }], [{ ...tea, [unavailable]: true }]));
    }
    assert.throws(() => priceCart([{ dish: { id: 999 }, quantity: 1 }], [tea]));
    assert.throws(() => priceCart([{ dish: { id: 1 }, quantity: 1, selectedOptions: [{ id: 'unknown' }] }], [tea]));
    assert.throws(() => priceCart([{ dish: { id: 1 }, quantity: 1, selectedOptions: [{ id: 'milk' }, { id: 'milk' }] }], [tea]));
    assert.throws(() => priceCart([{ dish: { id: 1 }, quantity: 1, selectedOptions: [{ id: 'milk' }] }], [{ ...tea, maxSelectOptions: 0 }]));
    assert.throws(() => priceCart([{ dish: { id: 1 }, quantity: 1 }], [{ ...tea, minSelectVarient: 1 }]));
});

test('checkout validates quantities, customer details, and integer paise boundaries', () => {
    for (const quantity of [0, -1, 1.5, 1001]) {
        assert.equal(checkoutSchema.safeParse({ name: 'Customer', mobile: '9876543210', cartItems: [{ dish: { id: 1 }, quantity }] }).success, false);
    }
    assert.equal(checkoutSchema.safeParse({ name: '', mobile: 'invalid', cartItems: [] }).success, false);
    assert.throws(() => priceCart([{ dish: { id: 1 }, quantity: 1 }], [{ ...tea, price: 0 }]));
    assert.equal(priceCart([{ dish: { id: 1 }, quantity: 1 }], [{ ...tea, price: 1 }]).amount, 100);
    assert.throws(() => priceCart([{ dish: { id: 1 }, quantity: 1000 }], [{ ...tea, price: 2147483647 }]));
});

test('payment and raw webhook signatures require the correct message and secret', () => {
    const secret = 'unit-test-secret';
    const message = 'order_123|pay_456';
    const signature = createHmac('sha256', secret).update(message).digest('hex');
    assert.equal(validSignature(message, signature, secret), true);
    assert.equal(validSignature('order_other|pay_456', signature, secret), false);
    assert.equal(validSignature(message, signature, 'wrong'), false);
    for (const invalid of ['', '0'.repeat(63), 'z'.repeat(64), '0'.repeat(66)]) assert.equal(validSignature(message, invalid, secret), false);
    const raw = '{ "event": "payment.captured" }';
    const webhookSignature = createHmac('sha256', secret).update(raw).digest('hex');
    assert.equal(validSignature(raw, webhookSignature, secret), true);
    assert.equal(validSignature(JSON.stringify(JSON.parse(raw)), webhookSignature, secret), false);
    assert.equal(checkoutTokenSchema.safeParse(randomUUID()).success, true);
    assert.equal(verificationSchema.safeParse({ razorpay_payment_id: 'pay_456' }).success, false);
});

test('payment association, amount, and currency must match the saved checkout', () => {
    const payment = { id: 'pay_1', order_id: 'order_1', amount: 100, currency: 'INR', status: 'captured' };
    const expected = { razorpayOrderId: 'order_1', paymentAmount: 100, paymentCurrency: 'INR' };
    assert.doesNotThrow(() => assertPaymentMatches(payment, expected));
    for (const mismatch of [{ order_id: 'order_2' }, { amount: 1 }, { currency: 'USD' }]) {
        assert.throws(() => assertPaymentMatches({ ...payment, ...mismatch }, expected));
    }
});
