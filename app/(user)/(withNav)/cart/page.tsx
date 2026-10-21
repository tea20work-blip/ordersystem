"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { useCartStore, type CartItem } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ArrowRight, ShoppingBag, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { DialogUserDetails } from "@/components/DialogUserDetails";
import { useRazorpayCheckout } from "@/hooks/use-razorpay-checkout";
import type { UserDetailsFormData } from "@/zod/userDetailsSchema";
import { RAZORPAY_CHECKOUT_ENABLED } from "@/lib/checkout-config";
import { toast } from "sonner";

const subscribe = () => () => {};

export default function CartPage() {
    const mounted = useSyncExternalStore(subscribe, () => true, () => false);
    return mounted ? <CartContents /> : null;
}

function CartContents() {
    // Preserve the complete online payment UI and hook for re-enabling later.
    return RAZORPAY_CHECKOUT_ENABLED ? <RazorpayCartContents /> : <DirectOrderCartContents />;
}

function DirectOrderCartContents() {
    const cartItems = useCartStore(state => state.items);
    const totalAmount = useCartStore(state => state.getTotalPrice());
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const submitting = useRef(false);
    const [error, setError] = useState("");
    const [orderId, setOrderId] = useState<number | null>(null);

    const handleSubmit = async (data: UserDetailsFormData) => {
        if (submitting.current) return;
        submitting.current = true;
        setBusy(true);
        setError("");
        try {
            const state = useCartStore.getState();
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, cartItems: state.items, tableCode: state.tableCode }),
            });
            const result = await response.json();
            if (!response.ok || !result.success || !Number.isInteger(result.orderId)) {
                throw new Error(result.error || "Unable to place order. Please try again.");
            }
            setOrderId(result.orderId);
            state.clearCart();
            setOpen(false);
            toast.success("Order sent to admin successfully!");
        } catch (reason) {
            const message = reason instanceof Error ? reason.message : "Unable to place order. Please try again.";
            setError(message);
            toast.error(message);
        } finally {
            submitting.current = false;
            setBusy(false);
        }
    };

    return (
        <div className="min-h-[50vh] flex flex-col bg-slate-50/50 dark:bg-background">
            <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
                <h1 className="text-xl md:text-3xl font-extrabold tracking-tight mb-8">Your Cart</h1>
                {error && <p role="alert" className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}
                {cartItems.length === 0 ? (
                    <div className="text-center py-16 bg-card rounded-2xl border shadow-sm" aria-live="polite">
                        <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-2xl font-bold mb-2">{orderId ? "Order placed successfully" : "Your cart is empty"}</h2>
                        <p className="text-muted-foreground mb-6">{orderId ? `Your order #${orderId} has been sent to admin.` : "Add dishes to start your order."}</p>
                        {orderId && <Link className="block text-primary mb-4 hover:underline" href={`/orders?orderId=${orderId}`}>View order</Link>}
                        <Button asChild><Link href="/">Place New Order</Link></Button>
                    </div>
                ) : (
                    <div className="grid gap-8">
                        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
                            <div className="p-4 border-b bg-muted/30 font-semibold">{cartItems.length} Items</div>
                            <div className="divide-y">
                                {cartItems.map(item => <CartItemRow key={item.cartItemId} item={item} disabled={busy} />)}
                            </div>
                        </div>
                        <div className="bg-card border rounded-2xl shadow-sm p-6">
                            <h3 className="font-bold text-xl mb-4">Order Summary</h3>
                            <div className="flex justify-between mb-3 text-sm"><span>Subtotal</span><span>₹ {totalAmount}</span></div>
                            <div className="pt-3 border-t flex justify-between items-center mb-6">
                                <span className="font-bold">Total Amount</span><span className="font-extrabold text-2xl text-primary">₹ {totalAmount}</span>
                            </div>
                            <Button onClick={() => setOpen(true)} disabled={busy} className="w-full text-lg h-12 rounded-xl" size="lg">
                                {busy ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Placing order...</> : <>Place Order<ArrowRight className="h-5 w-5 ml-2" /></>}
                            </Button>
                        </div>
                    </div>
                )}
                <DialogUserDetails open={open} onOpenChange={value => { if (!busy) setOpen(value); }} onSubmit={handleSubmit} disabled={busy} submitLabel="Place Order" />
            </main>
        </div>
    );
}

function RazorpayCartContents() {
    const cartItems = useCartStore(state => state.items);
    const totalAmount = useCartStore(state => state.getTotalPrice());
    const [open, setOpen] = useState(false);
    const checkout = useRazorpayCheckout();
    const latestPaid = [...checkout.checkouts].reverse().find(item => item.paymentStatus === 'paid');
    const savedCheckouts = [...checkout.checkouts].reverse().filter(item => item.orderId);

    const handleSubmit = async (data: UserDetailsFormData) => {
        await checkout.pay(data);
        setOpen(false);
    };

    return (
        <div className="min-h-[50vh] flex flex-col bg-slate-50/50 dark:bg-background">
            <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
                <h1 className="text-xl md:text-3xl font-extrabold tracking-tight mb-8">Your Cart</h1>
                {checkout.error && <p role="alert" className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{checkout.error}</p>}
                {savedCheckouts.length > 0 && (
                    <div className="space-y-3 mb-6" aria-live="polite">
                        {savedCheckouts.map(attempt => (
                            <div key={attempt.token} className="rounded-xl border bg-card p-4 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="font-semibold">Order #{attempt.orderId}{attempt.amount !== undefined && ` · ₹${attempt.amount / 100}`}</p>
                                    <p className={attempt.paymentStatus === 'paid' ? 'text-green-600 flex items-center gap-2 text-sm' : 'text-amber-600 text-sm'}>
                                        {attempt.paymentStatus === 'paid' ? <><CheckCircle2 className="h-4 w-4" />Payment successful</> : checkout.phase === 'verifying' ? 'Confirming payment' : 'Payment pending'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link className="text-primary text-sm hover:underline" href={`/orders?orderId=${attempt.orderId}`}>View order</Link>
                                    {attempt.paymentStatus === 'pending' && <Button variant="outline" disabled={checkout.busy} onClick={() => checkout.pay(undefined, attempt.token)}>Retry payment</Button>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {cartItems.length === 0 ? (
                    <div className="text-center py-16 bg-card rounded-2xl border shadow-sm">
                        <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-2xl font-bold mb-2">{latestPaid ? 'Payment successful' : 'Your cart is empty'}</h2>
                        <p className="text-muted-foreground mb-6">{latestPaid ? `Your order #${latestPaid.orderId} has been paid.` : 'Add dishes to start your order.'}</p>
                        <Button asChild><Link href="/">Place New Order</Link></Button>
                    </div>
                ) : (
                    <div className="grid gap-8">
                        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
                            <div className="p-4 border-b bg-muted/30 font-semibold">{cartItems.length} Items</div>
                            <div className="divide-y">
                                {cartItems.map(item => <CartItemRow key={item.cartItemId} item={item} disabled={checkout.busy} />)}
                            </div>
                        </div>
                        <div className="bg-card border rounded-2xl shadow-sm p-6">
                            <h3 className="font-bold text-xl mb-4">Order Summary</h3>
                            <div className="flex justify-between mb-3 text-sm"><span>Subtotal</span><span>₹ {totalAmount}</span></div>
                            <div className="pt-3 border-t flex justify-between items-center mb-6">
                                <span className="font-bold">Total Amount</span><span className="font-extrabold text-2xl text-primary">₹ {totalAmount}</span>
                            </div>
                            <Button onClick={() => setOpen(true)} disabled={checkout.busy} className="w-full text-lg h-12 rounded-xl" size="lg">
                                {checkout.busy ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />{checkout.phase === 'verifying' ? 'Confirming payment...' : checkout.phase === 'paying' ? 'Payment in progress...' : 'Starting payment...'}</> : <>Pay & Place Order<ArrowRight className="h-5 w-5 ml-2" /></>}
                            </Button>
                        </div>
                    </div>
                )}
                <DialogUserDetails open={open} onOpenChange={value => { if (!checkout.busy) setOpen(value); }} onSubmit={handleSubmit} disabled={checkout.busy} submitLabel="Continue to payment" />
            </main>
        </div>
    );
}

function CartItemRow({ item, disabled }: { item: CartItem; disabled: boolean }) {
    const updateQuantity = useCartStore(state => state.updateQuantity);
    const optionsPrice = item.selectedOptions?.reduce((sum, option) => sum + option.price, 0) || 0;
    return (
        <div className="p-4 sm:p-6 flex gap-4 justify-between items-center">
            <div className="min-w-0">
                <h4 className="font-semibold text-lg truncate">{item.dish.name}</h4>
                {!!item.selectedOptions?.length && <p className="text-sm text-muted-foreground">+ {item.selectedOptions.map(option => option.name).join(', ')}</p>}
            </div>
            <div className="flex flex-col items-center gap-3">
                <div className="flex items-center bg-secondary rounded-full overflow-hidden border">
                    <Button variant="ghost" size="icon" disabled={disabled} aria-label={`Remove one ${item.dish.name}`} onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button variant="ghost" size="icon" disabled={disabled} aria-label={`Add one ${item.dish.name}`} onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                </div>
                <span className="font-bold">₹ {(item.dish.price + optionsPrice) * item.quantity}</span>
            </div>
        </div>
    );
}
