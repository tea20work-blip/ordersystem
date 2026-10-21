import assert from "node:assert/strict";
import { test } from "node:test";
import type db from "@/db";
import { adminNotification, dish, order, orderItem, table, user } from "@/db/schema";
import { createDirectOrder } from "@/lib/direct-order";

const catalogDish: typeof dish.$inferSelect = {
    id: 1, name: "Tea", dishType: "beverage", price: 25, description: null,
    priority: 0, imageUrl: null, createdAt: null, updatedAt: null,
    dishOptions: [], styleOptions: [], dishVarients: [],
    minStyleOptions: 0, maxStyleOptions: 1, minSelectVarient: 0,
    maxSelectVarient: 1, maxSelectOptions: 1,
    isHidden: false, isDeleted: false, isOutOfStock: false,
};
const body = { name: "Customer", mobile: "9876543210", cartItems: [{ dish: { id: 1, price: 1 }, quantity: 2 }], totalPricing: 1 };

// Capture writes at the database boundary; no database, migrations, gateway, or push calls.
function databaseStub(options: { tableExists?: boolean; unavailable?: boolean; failItems?: boolean } = {}) {
    const writes = new Map<unknown, Record<string, unknown>[]>();
    let transactions = 0;
    const tx = {
        execute: async () => {},
        select: () => ({ from: (target: unknown) => ({ where: () => {
            const rows = target === dish ? [{ ...catalogDish, isOutOfStock: options.unavailable ?? false }]
                : target === table && options.tableExists ? [{ id: 9 }]
                : target === user ? [{ id: 7 }] : [];
            const result = Promise.resolve(rows);
            return Object.assign(result, { limit: () => result });
        } }) }),
        update: () => ({ set: () => ({ where: async () => {} }) }),
        insert: (target: unknown) => ({ values: (input: Record<string, unknown> | Record<string, unknown>[]) => {
            if (target === orderItem && options.failItems) throw new Error("Item write failed");
            writes.set(target, Array.isArray(input) ? input : [input]);
            return Object.assign(Promise.resolve(), { returning: async () => [{ id: 42 }] });
        } }),
    };
    const database = { transaction: async (run: (value: typeof tx) => Promise<unknown>) => {
        transactions++;
        return run(tx);
    } } as unknown as typeof db;
    return { database, writes, transactions: () => transactions };
}

test("direct order uses catalog prices, remains admin-manageable, and creates an immediate admin alert", async () => {
    const stub = databaseStub();
    const result = await createDirectOrder(stub.database, body);
    assert.equal(stub.transactions(), 1);
    assert.equal(result.orderId, 42);
    const saved = stub.writes.get(order)![0];
    assert.equal(saved.totalPricing, 50);
    assert.equal(saved.status, "pending");
    assert.equal(saved.paymentStatus, null);
    assert.equal(saved.orderType, "delivery");
    assert.equal(saved.tableId, null);
    assert.equal(saved.razorpayOrderId, undefined);
    assert.equal(saved.paidOnline, undefined);
    assert.equal(stub.writes.get(orderItem)![0].pricing, 25);
    assert.equal(stub.writes.get(orderItem)![0].dishName, "Tea");
    assert.deepEqual(stub.writes.get(adminNotification), [result.alert]);
});

test("direct dine-in requests link the table and include it in the admin alert", async () => {
    const stub = databaseStub({ tableExists: true });
    const result = await createDirectOrder(stub.database, { ...body, tableCode: "Table One" });
    assert.equal(stub.writes.get(order)![0].tableId, 9);
    assert.equal(stub.writes.get(order)![0].orderType, "dine_in");
    assert.match(result.alert.body, /Table One/);
});

test("invalid requests, unavailable dishes, and missing tables do not create orders", async () => {
    const stub = databaseStub();
    await assert.rejects(createDirectOrder(stub.database, {}));
    assert.equal(stub.transactions(), 0);
    await assert.rejects(createDirectOrder(stub.database, { ...body, tableCode: "Deleted table" }), /table no longer exists/);
    assert.equal(stub.writes.has(order), false);
    const unavailable = databaseStub({ unavailable: true });
    await assert.rejects(createDirectOrder(unavailable.database, body), /no longer available/);
    assert.equal(unavailable.writes.has(order), false);
});

test("an item write failure rejects the order transaction without creating a notification", async () => {
    const stub = databaseStub({ failItems: true });
    await assert.rejects(createDirectOrder(stub.database, body), /Item write failed/);
    assert.equal(stub.transactions(), 1);
    assert.equal(stub.writes.has(adminNotification), false);
});
