"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCartStore, type CartItem, type CheckoutAttempt } from "@/store/cart";
import type { UserDetailsFormData } from "@/zod/userDetailsSchema";
import { loadRazorpay, type RazorpayInstance, type RazorpaySuccess } from "@/lib/razorpay-checkout";

type PaymentResponse = {
    success: boolean; error?: string; orderId: number; order_id: string | null;
    amount: number; currency: string; paymentStatus: 'pending' | 'paid';
};

export function cartFingerprint(items: CartItem[], tableCode?: string) {
    return JSON.stringify({
        tableCode: tableCode ?? null,
        items: items.map(item => ({ id: item.cartItemId, quantity: item.quantity })).sort((a, b) => a.id.localeCompare(b.id)),
    });
}

async function requestPayment(url: string, token: string, body?: unknown): Promise<PaymentResponse> {
    const response = await fetch(url, {
        method: body === undefined ? "GET" : "POST", cache: "no-store",
        headers: { "Content-Type": "application/json", "X-Checkout-Token": token },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || "Unable to confirm payment. Please try again.");
    return result;
}

export function useRazorpayCheckout() {
    const checkouts = useCartStore(state => state.checkouts);
    const [phase, setPhase] = useState<'idle' | 'initializing' | 'paying' | 'verifying'>('idle');
    const [error, setError] = useState("");
    const busy = useRef(false);
    const mounted = useRef(true);
    const modal = useRef<RazorpayInstance | null>(null);
    const activeToken = useRef<string | null>(null);

    const applyStatus = useCallback((token: string, result: PaymentResponse) => {
        const state = useCartStore.getState();
        const checkout = state.checkouts.find(item => item.token === token);
        if (!checkout) return;
        if (result.paymentStatus === 'paid') {
            if (checkout.paymentStatus !== 'paid') {
                state.completeCheckout(token, result.orderId, result.amount);
                toast.success(`Payment successful for order #${result.orderId}`);
            }
            if (mounted.current) setError("");
            if (activeToken.current === token) {
                busy.current = false;
                if (mounted.current) setPhase('idle');
                modal.current?.close();
            }
        } else if (checkout.orderId !== result.orderId || checkout.amount !== result.amount) {
            state.saveCheckout({ ...checkout, orderId: result.orderId, amount: result.amount });
        }
    }, []);

    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; modal.current?.close(); };
    }, []);

    const pendingTokens = checkouts.filter(checkout => checkout.paymentStatus === 'pending').map(checkout => checkout.token).join(',');
    useEffect(() => {
        if (!pendingTokens) return;
        let active = true;
        let polling = false;
        const poll = async () => {
            if (polling) return;
            polling = true;
            await Promise.all(pendingTokens.split(',').map(async token => {
                try {
                    const result = await requestPayment('/api/payment-status', token);
                    if (active) applyStatus(token, result);
                } catch { /* Keep pending through temporary outages or an uncreated local attempt. */ }
            }));
            polling = false;
        };
        void poll();
        const timer = window.setInterval(poll, 5000);
        window.addEventListener('focus', poll);
        return () => { active = false; window.clearInterval(timer); window.removeEventListener('focus', poll); };
    }, [pendingTokens, applyStatus]);

    const pay = async (data: UserDetailsFormData | undefined, retryToken?: string) => {
        if (busy.current) return;
        busy.current = true;
        setPhase('initializing');
        setError('');
        let opened = false;
        try {
            const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
            if (!key) throw new Error('Payments are not configured. Please contact the cafe.');
            await loadRazorpay();
            const state = useCartStore.getState();
            const fingerprint = cartFingerprint(state.items, state.tableCode);
            const existing = retryToken ? state.checkouts.find(item => item.token === retryToken)
                : [...state.checkouts].reverse().find(item => item.paymentStatus === 'pending' && item.fingerprint === fingerprint);
            const checkout: CheckoutAttempt = existing ?? {
                token: crypto.randomUUID(), fingerprint, paymentStatus: 'pending',
                items: state.items.map(item => ({ cartItemId: item.cartItemId, quantity: item.quantity })),
            };
            state.saveCheckout(checkout);
            activeToken.current = checkout.token;
            const result = await requestPayment('/api/create-order', checkout.token, data ? {
                ...data, cartItems: state.items, tableCode: state.tableCode,
            } : {});
            applyStatus(checkout.token, result);
            if (result.paymentStatus === 'paid') return;
            if (!result.order_id || !window.Razorpay) throw new Error('Unable to open payment checkout.');
            let callbackReceived = false;
            const instance = new window.Razorpay({
                key, order_id: result.order_id, amount: result.amount, currency: result.currency,
                name: 'Tea 20 Cafe', description: `Order #${result.orderId}`,
                prefill: { name: data?.name, email: data?.email || undefined, contact: data?.mobile },
                theme: { color: '#774936' },
                handler: (response: RazorpaySuccess) => {
                    callbackReceived = true;
                    if (mounted.current && activeToken.current === checkout.token) setPhase('verifying');
                    void requestPayment('/api/verify-payment', checkout.token, response).then(verified => {
                        applyStatus(checkout.token, verified);
                        if (verified.paymentStatus === 'pending') toast.info('Payment received; waiting for confirmation.');
                    }).catch(reason => {
                        if (useCartStore.getState().checkouts.find(item => item.token === checkout.token)?.paymentStatus === 'paid') return;
                        const message = reason instanceof Error ? reason.message : 'Payment confirmation is pending.';
                        if (mounted.current && activeToken.current === checkout.token) setError(message);
                        toast.error(message);
                    }).finally(() => {
                        if (activeToken.current === checkout.token) {
                            busy.current = false;
                            if (mounted.current) setPhase('idle');
                        }
                    });
                },
                modal: { ondismiss: () => {
                    if (callbackReceived || useCartStore.getState().checkouts.find(item => item.token === checkout.token)?.paymentStatus === 'paid') return;
                    busy.current = false;
                    if (mounted.current) { setPhase('idle'); setError('Payment cancelled. Your order is pending and you can retry.'); }
                    toast.info('Payment cancelled. Your order is still pending.');
                } },
            });
            instance.on('payment.failed', response => {
                const message = response.error?.description || 'Payment failed. Please retry in checkout.';
                if (mounted.current) setError(message);
                toast.error(message);
            });
            modal.current = instance;
            setPhase('paying');
            instance.open();
            opened = true;
        } catch (reason) {
            const message = reason instanceof Error ? reason.message : 'Unable to start payment. Please retry.';
            if (mounted.current) setError(message);
            toast.error(message);
        } finally {
            if (!opened) { busy.current = false; if (mounted.current) setPhase('idle'); }
        }
    };

    return { pay, phase, error, checkouts, busy: phase !== 'idle' };
}
