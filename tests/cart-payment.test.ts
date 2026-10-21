import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";

test('payment completion removes purchased quantities once and preserves additional items', async () => {
    const memory = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
        getItem: (key: string) => memory.get(key) ?? null,
        setItem: (key: string, value: string) => memory.set(key, value),
        removeItem: (key: string) => memory.delete(key),
    } });
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: globalThis.localStorage } });
    const { useCartStore } = await import('@/store/cart');
    const store = useCartStore;
    store.setState({ items: [], checkouts: [] });
    store.getState().addItem({ id: 1, name: 'Tea', price: 20 });
    const token = randomUUID();
    store.getState().saveCheckout({ token, fingerprint: 'fixture', items: [{ cartItemId: '1', quantity: 1 }], paymentStatus: 'pending', orderId: 1 });
    store.getState().addItem({ id: 1, name: 'Tea', price: 20 });
    store.getState().addItem({ id: 2, name: 'Toast', price: 30 });
    store.getState().completeCheckout(token, 1, 2000);
    assert.deepEqual(store.getState().items.map(item => [item.dish.id, item.quantity]), [[1, 1], [2, 1]]);
    store.getState().completeCheckout(token, 1, 2000);
    assert.equal(store.getState().items.length, 2);
    assert.equal(store.getState().checkouts[0].paymentStatus, 'paid');
    assert.equal(JSON.parse(memory.get('t20-cart-storage')!).state.checkouts[0].token, token);
    const savedStorage = memory.get('t20-cart-storage')!;
    store.setState({ items: [], checkouts: [] });
    memory.set('t20-cart-storage', savedStorage);
    await store.persist.rehydrate();
    assert.equal(store.getState().checkouts[0].token, token);
    assert.equal(store.getState().checkouts[0].paymentStatus, 'paid');
    assert.equal(store.getState().items.length, 2);
    store.getState().setTableCode('Table 1');
    store.getState().setOrderType('dineout');
    assert.equal(store.getState().tableCode, undefined);
});
