"use client";

import { Dish, useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { getImageUrl } from "@/lib/s3";

export function DishCard({ dish }: { dish: Dish }) {
    const cartItems = useCartStore((state) => state.items);
    const addItem = useCartStore((state) => state.addItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeItem = useCartStore((state) => state.removeItem);

    const cartItem = cartItems.find((item) => item.dish.id === dish.id);
    const quantity = cartItem?.quantity || 0;

    const handleAdd = () => addItem(dish);

    const handleIncrement = () => updateQuantity(dish.id, quantity + 1);

    const handleDecrement = () => {
        if (quantity === 1) {
            removeItem(dish.id);
        } else {
            updateQuantity(dish.id, quantity - 1);
        }
    };

    return (
        <div className=" border-b border-dashed py-8 w-full bg-card  shadow-sm overflow-hidden flex group hover:shadow-md px-4 transition-all duration-300">


            <div className=" flex flex-col grow">
                <h3 className="font-semibold text-lg leading-tight tracking-tight mb-1">{dish.name}</h3>
                {dish.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 grow">
                        {dish.description}
                    </p>
                )}

                <div className="flex items-center justify-between mt-auto pt-4">
                    <span className="font-bold text-lg">Rs. {dish.price}</span>
                </div>
            </div>


            <div className="relative w-32 aspect-square shrink-0 overflow-hidden">
                {dish.imageUrl ? (
                    <img
                        src={getImageUrl(dish.imageUrl)}
                        alt={dish.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <></>
                )}


                <div className=" absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
                    {quantity === 0 ? (
                        <Button onClick={handleAdd} size="sm" className="rounded-full shadow-sm hover:shadow active:scale-95 transition-all">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add
                        </Button>
                    ) : (
                        <div className="flex items-center bg-secondary rounded-full overflow-hidden shadow-sm border border-border/50">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none hover:bg-neutral-200 dark:hover:bg-neutral-800"
                                onClick={handleDecrement}
                            >
                                <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium text-sm select-none">
                                {quantity}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none hover:bg-neutral-200 dark:hover:bg-neutral-800"
                                onClick={handleIncrement}
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
                </div>


            </div>
        </div>
    );
}
