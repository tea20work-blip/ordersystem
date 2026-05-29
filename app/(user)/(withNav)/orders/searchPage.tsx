"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { fetchOrdersByMobileAction, fetchOrdersByOrderIdAction } from "./actions";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/header";
import { useSearchParams } from "next/navigation";

export function OrdersPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const [mobile, setMobile] = useState("");
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [orders, setOrders] = useState<any[]>([]);
    const [error, setError] = useState("");
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mobile) return;
        setLoading(true);
        setError("");

        const res = orderId ? await fetchOrdersByOrderIdAction(Number(orderId)) : await fetchOrdersByMobileAction(mobile);
        if (res?.success) {
            setOrders(res.data || []);
            setSearched(true);
        } else {
            setError(res?.message || "Something went wrong.");
            setOrders([]);
            setSearched(true);
        }
        setLoading(false);
    };

    useEffect(() => {
        async function getOrders() {
            if (orderId) {
                setLoading(true);
                setError("");
                const res = await fetchOrdersByOrderIdAction(Number(orderId));
                if (res?.success) {
                    setOrders(res.data || []);
                    setSearched(true);
                } else {
                    setError(res?.message || "Something went wrong.");
                    setOrders([]);
                    setSearched(true);
                }
                setLoading(false);
            }
        }
        getOrders();
    }, [orderId])

    return (
        <div className=" px-4">
            <h1 className="text-2xl font-bold mb-6 mt-6">Find Your Orders</h1>
            <form onSubmit={handleSearch} className="flex gap-4 mb-8">
                <Input
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="max-w-xs"
                    required
                />
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Search
                </Button>
            </form>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {searched && orders.length === 0 && !error && (
                <div className="text-gray-500">No orders found for this mobile number.</div>
            )}

            <div className="space-y-6">
                {orders.map(order => (
                    <Card key={order.id}>
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-center">
                                <CardTitle>Order #{order.id}</CardTitle>
                                <div className="text-sm text-gray-500">
                                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}
                                </div>
                            </div>
                            <CardDescription>
                                Status: <span className="font-semibold uppercase">{order.status}</span>
                                {order.tableCode && ` • Table: ${order.tableCode}`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold mb-2">Items</h4>
                                    {order.items && order.items.length > 0 ? (
                                        <ul className="space-y-2">
                                            {order.items.map((item: { id: number, quantity: number, dishName: string, pricing: number, options: { name: string, price: number }[] }) => (
                                                <li key={item.id} className="flex justify-between text-sm">
                                                    <span>{item.quantity}x {item.dishName} {item?.options?.map((option: any) => `(${option.name})`).join(", ")} </span>
                                                    <span>₹{item.pricing}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">No items found.</p>
                                    )}
                                </div>
                                <div className="border-t pt-2 flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>₹{order.totalPricing}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
