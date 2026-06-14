"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Trash2, Search } from "lucide-react";
import { createAdminOrder } from "../../actions/order";
import { useRouter } from "next/navigation";
import { AdminDishItem } from "./AdminDishItem";

export function OrderFormClient({ initialDishes, initialTables, initialCegrates = [], defaultTableId = "" }: { initialDishes: any[], initialTables: any[], initialCegrates?: any[], defaultTableId?: string }) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTable, setSelectedTable] = useState<string>(defaultTableId);
    const [cart, setCart] = useState<{ id: string, dishId?: number, cegrateId?: number, name: string, price: number, quantity: number, imageUrl?: string, options?: any[] }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredDishes = initialDishes.filter(dish =>
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dish.description && dish.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredCegrates = initialCegrates.filter(cegrate =>
        cegrate.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addToCart = (item: any, type: 'dish' | 'cegrate', options: any[] = []) => {
        setCart(prev => {
            const sortedOptionIds = [...options].map(o => o.id).sort().join(',');
            const id = type === 'dish' ? `dish-${item.id}${sortedOptionIds ? '-' + sortedOptionIds : ''}` : `cegrate-${item.id}`;
            const existing = prev.find(c => c.id === id);
            if (existing) {
                return prev.map(c => c.id === id ? { ...c, quantity: c.quantity + 1 } : c);
            }
            return [...prev, {
                id,
                dishId: type === 'dish' ? item.id : undefined,
                cegrateId: type === 'cegrate' ? item.id : undefined,
                name: item.name,
                price: type === 'cegrate' ? item.amount : item.price,
                quantity: 1,
                imageUrl: item.imageUrl,
                options
            }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const totalPricing = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleSubmit = async () => {
        if (cart.length === 0) return;
        setIsSubmitting(true);
        try {
            await createAdminOrder({
                tableId: selectedTable ? parseInt(selectedTable, 10) : null,
                totalPricing,
                items: cart.map(item => ({
                    dishId: item.dishId,
                    cegrateId: item.cegrateId,
                    name: item.name,
                    imageUrl: item.imageUrl,
                    quantity: item.quantity,
                    pricing: item.price,
                    options: item.options
                }))
            });
            router.push("/admin/tables");
        } catch (error) {
            console.error(error);
            alert("Failed to create order");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4 border rounded-md p-4 bg-card shadow-sm">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search dishes..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="grid sm:grid-cols-2 gap-4  pr-2">
                    {filteredDishes.length === 0 && filteredCegrates.length === 0 && (
                        <p className="text-sm text-muted-foreground col-span-2 py-4">No items found.</p>
                    )}

                    <div className=" h-screen overflow-y-auto">

                        {filteredDishes.length > 0 && <div className="col-span-2 font-bold text-lg mt-2">Dishes</div>}
                        {filteredDishes.sort(function (a, b) {
                            return a.name.localeCompare(b.name);
                        }
                        ).map(dish => (
                            <AdminDishItem key={`dish-${dish.id}`} dish={dish} onAddToCart={(item, options) => addToCart(item, 'dish', options)} />
                        ))}
                    </div>

                    <div className=" h-screen overflow-y-auto">


                        {filteredCegrates.length > 0 && <div className="col-span-2 font-bold text-lg mt-2">Cigarettes</div>}
                        {filteredCegrates.map(cegrate => (
                            <div key={`cegrate-${cegrate.id}`} className="flex border-b p-1 justify-between  overflow-y-auto">
                                <div>
                                    <h3 className="font-semibold text-sm">{cegrate.name}</h3>
                                    <p className="mt-2 font-medium text-xs">₹ {cegrate.amount}</p>
                                </div>
                                <Button
                                    className=" cursor-pointer"
                                    variant="secondary"
                                    size="xs"
                                    onClick={() => addToCart(cegrate, 'cegrate')}
                                >
                                    Add to Order
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="border rounded-md p-4 bg-card shadow-sm space-y-4">
                    <h2 className="font-semibold text-lg border-b pb-2">Order Details</h2>

                    <div className="space-y-2">
                        <Label htmlFor="table">Select Table (Optional)</Label>
                        <select
                            id="table"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedTable}
                            onChange={(e) => setSelectedTable(e.target.value)}
                        >
                            <option value="">-- No Table / Takeaway --</option>
                            {initialTables.map(table => (
                                <option key={table.id} value={table.id}>{table.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-4 pt-4">
                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Cart Items</h3>
                        {cart.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">Cart is empty</p>
                        ) : (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                {cart.map(item => (
                                    <div key={item.id} className="flex flex-col gap-2 p-2 border rounded bg-background">
                                        <div className="flex justify-between items-start">
                                            <span className="font-medium text-sm">
                                                {item.name} {item.cegrateId && <span className="text-[10px] text-muted-foreground">(Cigarette)</span>}
                                                {item.options && item.options.length > 0 && (
                                                    <div className="text-xs text-muted-foreground font-normal mt-1 flex flex-col gap-0.5">
                                                        {item.options.map(opt => (
                                                            <span key={opt.id}>+ {opt.name}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </span>
                                            <span className="font-semibold text-sm">₹ {item.price * item.quantity}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, -1)}>
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, 1)}>
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeFromCart(item.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-4 space-y-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total</span>
                            <span>₹ {totalPricing}</span>
                        </div>
                        <Button
                            className="w-full"
                            size="lg"
                            disabled={cart.length === 0 || isSubmitting}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? "Creating..." : "Create Order"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
