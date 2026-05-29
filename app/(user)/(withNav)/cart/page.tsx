"use client";

import { useCartStore } from "@/store/cart";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/s3";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DialogUserDetails } from "@/components/DialogUserDetails";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CartPage() {
    const [mounted, setMounted] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         setOrderId(null);
    //     }, 5000);
    //     return () => clearTimeout(timer);
    // }, [orderId])

    const cartItems = useCartStore((state) => state.items);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeItem = useCartStore((state) => state.removeItem);
    const clearCart = useCartStore((state) => state.clearCart);
    const totalAmount = useCartStore((state) => state.getTotalPrice());
    const tableCode = useCartStore((state) => state.tableCode);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null; // Prevent hydration mismatch

    console.log(cartItems)

    return (
        <div className="min-h-[50vh] flex flex-col bg-slate-50/50 dark:bg-background">

            <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
                <h1 className=" text-xl md:text-3xl font-extrabold tracking-tight mb-8">Your Cart</h1>

                {cartItems.length === 0 ? (
                    <EmptyCart orderId={orderId} />
                ) : (
                    <div className="grid  gap-8">
                        <div className=" space-y-4">
                            <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
                                <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
                                    <h3 className="font-semibold">{cartItems.length} Items</h3>
                                    {/* Clear All Button */}
                                    {/* <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Clear All
                                    </Button> */}
                                </div>

                                <div className="divide-y">
                                    {cartItems.map((item) => (
                                        <CartItem key={item.cartItemId} item={item} updateQuantity={updateQuantity} removeItem={removeItem} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <OrderSummary setOrderId={setOrderId} totalAmount={totalAmount} cartItems={cartItems} clearCart={clearCart} tableCode={tableCode} />

                    </div>
                )}
            </main>
        </div>
    );
}


function OrderSummary({ totalAmount, cartItems, clearCart, setOrderId, tableCode }: { totalAmount: number, cartItems: any[], clearCart: () => void, setOrderId: (value: string) => void, tableCode?: string }) {
    // const GSTAmount = Number(totalAmount * 0.18).toFixed();
    const GSTAmount = 0;
    const totalAmountWithGST = Number(totalAmount) + Number(GSTAmount);
    const [open, setOpen] = useState(false);

    const handleSubmit = async (data: any) => {
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    cartItems,
                    tableCode,
                    totalPricing: totalAmountWithGST
                })
            });
            const result = await res.json();
            if (result.success) {
                setOrderId(result.orderId);
                toast.success("Order placed successfully!");
                clearCart();
                setOpen(false);
            } else {
                toast.error("Failed to place order: " + result.error);
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while placing order.");
        }
    };

    return (
        <div className="w-full">
            <div className="bg-card border rounded-2xl shadow-sm p-6 sticky top-24">
                <h3 className="font-bold text-xl mb-4">Order Summary</h3>

                <div className="space-y-3 text-sm mb-6">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">Rs. {totalAmount}</span>
                    </div>
                    {/* <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxes & Fees</span>
                        <span className="font-medium text-muted-foreground">Rs. {GSTAmount}</span>
                    </div> */}
                    <div className="pt-3 border-t flex justify-between items-center mt-3">
                        <span className="font-bold text-base">Total Amount</span>
                        <span className="font-extrabold text-2xl text-primary">Rs. {totalAmountWithGST}</span>
                    </div>
                </div>

                <Button onClick={() => setOpen(true)} className="w-full text-lg h-12 rounded-xl group" size="lg">
                    Place Order
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
            <DialogUserDetails
                open={open}
                onOpenChange={setOpen}
                onSubmit={handleSubmit}
            />
        </div>
    )
}

function EmptyCart({ orderId }: { orderId: string | null }) {
    return (
        <div className="text-center py-20 bg-card rounded-2xl border shadow-sm">
            <div className={cn("mx-auto w-24 h-24  rounded-full flex items-center justify-center mb-6", orderId ? " bg-primary/10" : "bg-muted")}>
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{orderId ? "Ordered placed successfully" : "Your cart is empty"}</h2>
            {!orderId ? <>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                    Looks like you haven't added any delicious dishes to your cart yet.
                </p>
                <Button size="lg" asChild className="rounded-full">
                    <Link href="/">Place New Order</Link>
                </Button>
            </> : <div className="flex flex-col items-center mt-4">
                <p className="text-muted-foreground">To know about your order, you can contact the counter person.</p>
                <Link href={`/orders?orderId=${orderId}`} className="text-primary font-semibold hover:underline">Click here to view your order</Link>
            </div>}
        </div>
    )
}

function CartItem({ item, updateQuantity, removeItem }: any) {
    const optionsPrice = item.selectedOptions?.reduce((sum: number, opt: any) => sum + opt.price, 0) || 0;
    return (
        <div key={item.cartItemId} className="p-4 sm:p-6 flex flex-row gap-4 sm:gap-6 justify-between sm:items-center transition-colors hover:bg-muted/10">
            {/* <div className="w-24 h-24 rounded-lg bg-muted shrink-0 overflow-hidden">
                {item.dish.imageUrl ? (
                    <img
                        src={getImageUrl(item.dish.imageUrl)}
                        alt={item.dish.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground text-center p-2">
                        No Image
                    </div>
                )}
            </div> */}

            <div className=" w-full">
                <h4 className="font-semibold text-lg truncate">{item.dish.name}</h4>
                {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <div className="text-sm text-muted-foreground mt-1">
                        + {item.selectedOptions.map((o: any) => o.name).join(', ')}
                    </div>
                )}
            </div>

            <div className="flex flex-col items-center gap-4 mt-2 sm:mt-0 justify-between sm:justify-end w-fit">
                <div className="flex items-center bg-secondary rounded-full overflow-hidden border border-border/50">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-none"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    >
                        <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-10 text-center font-medium text-sm">
                        {item.quantity}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-none"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>

                <div className="text-right sm:w-24 font-bold">
                    Rs. {(item.dish.price + optionsPrice) * item.quantity}
                </div>

                {/* <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.dish.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button> */}
            </div>
        </div>
    )
}