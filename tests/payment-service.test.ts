import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { test } from "node:test";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { adminNotification, dish, order, orderItem } from "@/db/schema";
import { createPaymentService, type PaymentGateway } from "@/lib/payment-service";
import type { GatewayPayment } from "@/lib/payment-validation";

test('PostgreSQL checkout integration', { skip: !process.env.TEST_DATABASE_URL }, async suite => {
    // Never fall back to the application's DATABASE_URL. Use a dedicated empty test database.
    const url = new URL(process.env.TEST_DATABASE_URL!);
    assert.match(url.pathname, /^\/razorpay_test(?:_[a-zA-Z0-9]+)?$/);
    const controlPool = new Pool({ connectionString: url.toString() });
    const databaseName = `razorpay_test_${randomUUID().replaceAll('-', '')}`;
    await controlPool.query(`CREATE DATABASE "${databaseName}"`);
    url.pathname = `/${databaseName}`;
    const pool = new Pool({ connectionString: url.toString() });
    const database = drizzle(pool);
    const keySecret = 'integration-test-key-secret';
    const webhookSecret = 'integration-test-webhook-secret';
    let createdCount = 0;
    let failCreate = false;
    const payments = new Map<string, GatewayPayment>();
    const gateway: PaymentGateway = {
        async createOrder(input) {
            if (failCreate) throw { statusCode: 401 };
            createdCount++;
            await new Promise(resolve => setTimeout(resolve, 15));
            return { id: `order_test${createdCount}`, amount: input.amount, currency: input.currency };
        },
        async fetchPayment(id) {
            const payment = payments.get(id);
            if (!payment) throw { statusCode: 500 };
            return payment;
        },
    };
    const service = createPaymentService(database, gateway, keySecret);
    const signed = (payment: GatewayPayment) => ({
        razorpay_order_id: payment.order_id, razorpay_payment_id: payment.id,
        razorpay_signature: createHmac('sha256', keySecret).update(`${payment.order_id}|${payment.id}`).digest('hex'),
    });
    const webhook = (payment: GatewayPayment, event = 'payment.captured') => {
        const raw = JSON.stringify({ event, payload: { payment: { entity: payment } } });
        return service.processWebhook(raw, createHmac('sha256', webhookSecret).update(raw).digest('hex'), webhookSecret);
    };

    try {
        await migrate(database, { migrationsFolder: './drizzle' });
        const [menuDish] = await database.insert(dish).values({ name: 'Test tea', price: 25 }).returning();
        const body = { name: 'Payment Test', mobile: '9876543210', cartItems: [{ dish: { id: menuDish.id, price: 1 }, quantity: 2 }], totalPricing: 1 };
        const token = randomUUID();
        let checkout: Awaited<ReturnType<typeof service.createOrder>>;

        await suite.test('concurrent initializers create one pending order with one gateway order and no alert', async () => {
            const results = await Promise.all(Array.from({ length: 6 }, () => service.createOrder(token, body)));
            checkout = results[0];
            assert.equal(new Set(results.map(item => item.orderId)).size, 1);
            assert.equal(createdCount, 1);
            assert.equal(checkout.amount, 5000);
            assert.equal(checkout.paymentStatus, 'pending');
            assert.equal((await database.select().from(adminNotification)).length, 0);
            assert.equal((await database.select().from(orderItem)).length, 1);
            assert.equal((await service.createOrder(token, {})).order_id, checkout.order_id);
        });

        const payment: GatewayPayment = { id: 'pay_test1', order_id: checkout!.order_id, amount: 5000, currency: 'INR', status: 'captured' };
        payments.set(payment.id, payment);

        await suite.test('invalid callbacks, absent fields, and wrong tokens cannot mark the order paid', async () => {
            await assert.rejects(service.verifyPayment(token, {}));
            await assert.rejects(service.verifyPayment(token, { ...signed(payment), razorpay_signature: '0'.repeat(64) }));
            await assert.rejects(service.verifyPayment(randomUUID(), signed(payment)));
            await assert.rejects(service.getStatus('not-a-token'));
            assert.equal((await service.getStatus(token)).paymentStatus, 'pending');
        });

        await suite.test('valid signatures cannot authorize a mismatched payment', async () => {
            payments.set(payment.id, { ...payment, amount: 1 });
            await assert.rejects(service.verifyPayment(token, signed(payment)));
            payments.set(payment.id, { ...payment, currency: 'USD' });
            await assert.rejects(service.verifyPayment(token, signed(payment)));
            payments.set(payment.id, { ...payment, order_id: 'order_wrong' });
            await assert.rejects(service.verifyPayment(token, signed(payment)));
            payments.set(payment.id, payment);
        });

        await suite.test('authorized but uncaptured payments remain pending', async () => {
            payments.set(payment.id, { ...payment, status: 'authorized' });
            assert.equal((await service.verifyPayment(token, signed(payment))).paymentStatus, 'pending');
            assert.equal((await database.select().from(adminNotification)).length, 0);
            payments.set(payment.id, payment);
        });

        await suite.test('concurrent browser callbacks and duplicate webhooks credit once and alert once', async () => {
            const results = await Promise.all([
                service.verifyPayment(token, signed(payment)), webhook(payment), webhook(payment, 'order.paid'),
                service.verifyPayment(token, signed(payment)), webhook(payment),
            ]);
            assert.equal(results.filter(result => result.alert).length, 1);
            const [saved] = await database.select().from(order).where(eq(order.id, checkout!.orderId));
            assert.equal(saved.status, 'paid_online');
            assert.equal(saved.paidOnline, 50);
            assert.equal(saved.isRunning, true);
            assert.equal(saved.deliveryStatus, 'ordered');
            assert.equal(saved.razorpayPaymentId, payment.id);
            assert.equal(saved.razorpaySignature, signed(payment).razorpay_signature);
            assert.ok(saved.paymentConfirmedAt);
            assert.equal((await database.select().from(adminNotification)).length, 1);
            assert.equal((await service.getStatus(token)).paymentStatus, 'paid');
        });

        await suite.test('late failure events and another payment cannot overwrite a paid order', async () => {
            await webhook({ ...payment, status: 'failed' }, 'payment.failed');
            await assert.rejects(webhook({ ...payment, id: 'pay_other' }));
            await assert.rejects(service.processWebhook('{}', '0'.repeat(64), webhookSecret));
            assert.equal((await service.getStatus(token)).paymentStatus, 'paid');
            assert.equal((await database.select().from(adminNotification)).length, 1);
        });

        await suite.test('a lost browser callback is recovered entirely by the webhook', async () => {
            const token2 = randomUUID();
            const pending = await service.createOrder(token2, body);
            const recovered = { ...payment, id: 'pay_recovered', order_id: pending.order_id };
            await webhook(recovered);
            assert.equal((await service.getStatus(token2)).paymentStatus, 'paid');
            assert.equal((await webhook(recovered)).alert, null);
            assert.equal((await database.select().from(adminNotification)).length, 2);
        });

        await suite.test('gateway failures preserve the pending order for token-only retry', async () => {
            const token3 = randomUUID();
            failCreate = true;
            await assert.rejects(service.createOrder(token3, body));
            const pending = await service.getStatus(token3);
            assert.equal(pending.paymentStatus, 'pending');
            assert.equal(pending.order_id, null);
            failCreate = false;
            const retried = await service.createOrder(token3, {});
            assert.equal(retried.orderId, pending.orderId);
            assert.ok(retried.order_id);
        });

        await suite.test('notification insertion failure rolls back payment and a retry succeeds', async () => {
            const token4 = randomUUID();
            const pending = await service.createOrder(token4, body);
            const captured = { ...payment, id: 'pay_rollback', order_id: pending.order_id };
            await database.insert(adminNotification).values({ orderId: pending.orderId, title: 'Collision fixture', body: 'Fixture' });
            await assert.rejects(webhook(captured));
            assert.equal((await service.getStatus(token4)).paymentStatus, 'pending');
            await database.delete(adminNotification).where(eq(adminNotification.orderId, pending.orderId));
            await webhook(captured);
            assert.equal((await service.getStatus(token4)).paymentStatus, 'paid');
        });

        await suite.test('legacy orders retain nullable gateway metadata', async () => {
            const [legacy] = await database.insert(order).values({ totalPricing: 25, status: 'pending' }).returning();
            assert.equal(legacy.paymentStatus, null);
            assert.equal(legacy.checkoutTokenHash, null);
        });
    } finally {
        await pool.end();
        await controlPool.query(`DROP DATABASE "${databaseName}"`);
        await controlPool.end();
    }
});
