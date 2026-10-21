"use client";

export interface RazorpaySuccess {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

export interface RazorpayOptions {
    key: string;
    order_id: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    prefill: { name?: string; email?: string; contact?: string };
    handler: (response: RazorpaySuccess) => void;
    modal: { ondismiss: () => void };
    theme: { color: string };
}

export interface RazorpayInstance {
    open: () => void;
    close: () => void;
    on: (event: "payment.failed", handler: (response: { error?: { description?: string } }) => void) => void;
}

declare global {
    interface Window { Razorpay?: new (options: RazorpayOptions) => RazorpayInstance; }
}

let scriptPromise: Promise<void> | undefined;

export function loadRazorpay(): Promise<void> {
    if (window.Razorpay) return Promise.resolve();
    if (scriptPromise) return scriptPromise;
    scriptPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        const timeout = window.setTimeout(() => fail(), 15000);
        const fail = () => {
            window.clearTimeout(timeout);
            script.remove();
            scriptPromise = undefined;
            reject(new Error("Unable to load payment checkout. Check your connection and try again."));
        };
        script.onload = () => {
            window.clearTimeout(timeout);
            if (window.Razorpay) resolve(); else fail();
        };
        script.onerror = fail;
        document.head.appendChild(script);
    });
    return scriptPromise;
}
