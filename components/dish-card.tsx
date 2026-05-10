"use client";

import { useState } from "react";
import { Dish, SelectedOption, useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { getImageUrl } from "@/lib/s3";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { ButtonGroup } from "./ui/button-group";

export function DishCard({ dish }: { dish: any }) {
    const cartItems = useCartStore((state) => state.items);
    const addItem = useCartStore((state) => state.addItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeItem = useCartStore((state) => state.removeItem);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);

    const dishCartItems = cartItems.filter((item) => item.dish.id === dish.id);
    const quantity = dishCartItems.reduce((sum, item) => sum + item.quantity, 0);
    const hasOptions = Array.isArray(dish.dishOptions) && dish.dishOptions.length > 0;
    const hasAddons = Array.isArray(dish.addons) && dish.addons.length > 0;
    const handleAdd = () => {
        if (hasOptions || hasAddons) {
            setSelectedOptions([]);
            setIsDrawerOpen(true);
        } else {
            addItem(dish);
        }
    };

    const handleIncrement = () => {
        if (hasOptions) {
            setSelectedOptions([]);
            setIsDrawerOpen(true);
        } else {
            const defaultItem = dishCartItems.find(item => item.cartItemId === String(dish.id));
            if (defaultItem) {
                updateQuantity(defaultItem.cartItemId, defaultItem.quantity + 1);
            } else {
                addItem(dish);
            }
        }
    };

    const handleDecrement = () => {
        if (hasOptions) {
            const lastItem = dishCartItems[dishCartItems.length - 1];
            if (lastItem) {
                updateQuantity(lastItem.cartItemId, lastItem.quantity - 1);
            }
        } else {
            const defaultItem = dishCartItems.find(item => item.cartItemId === String(dish.id));
            if (defaultItem) {
                updateQuantity(defaultItem.cartItemId, defaultItem.quantity - 1);
            }
        }
    };

    const confirmAddOptions = () => {
        addItem(dish, selectedOptions);
        setIsDrawerOpen(false);
    };

    const toggleOption = (option: any) => {
        setSelectedOptions(prev => {
            const exists = prev.find(o => o.id === option.id);
            if (exists) return prev.filter(o => o.id !== option.id);
            return [...prev, option];
        });
    };

    return (
        <>
            <div className=" border-b py-4 w-full items-center flex group hover:shadow-md px-4 transition-all duration-300">
                <div className=" flex flex-col grow">
                    <h3 className="font-medium leading-tight tracking-tight mb-1">{dish.name}</h3>
                    <div className="flex items-center justify-between ">
                        <span className=" text-sm font-medium">Rs. {dish.price}</span>
                    </div>
                    {dish.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 mb-4 grow">
                            {dish.description}
                        </p>
                    )}

                </div>

                <div className="relative h-24 w-28 shrink-0 overflow-hidden">
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
                            <Button variant={"outline"} onClick={handleAdd} size="sm" className="rounded-full shadow-sm hover:shadow active:scale-95 transition-all whitespace-nowrap px-4">
                                {/* <ShoppingCart className="h-4 w-4 mr-2" /> */}
                                {(hasOptions || hasAddons) ? "Add +" : "Add"}
                            </Button>
                        ) : (
                            <div className="flex items-center bg-secondary rounded-full overflow-hidden shadow-sm border border-border/50">
                                <ButtonGroup>
                                    <Button
                                        size="icon"
                                        onClick={handleDecrement}
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>

                                    <Button
                                        className="pointer-events-none min-w-10"
                                    >
                                        {quantity}
                                    </Button>

                                    <Button
                                        size="icon"
                                        onClick={handleIncrement}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </ButtonGroup>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent className=" data-[vaul-drawer-direction=bottom]:max-h-[80vh] max-w-lg w-full mx-auto">

                    <DrawerHeader>
                        <DrawerTitle>Customize {dish.name}</DrawerTitle>
                        <DrawerDescription>Select additional options for your dish.</DrawerDescription>
                    </DrawerHeader>
                    <div className="no-scrollbar overflow-y-auto  px-3">
                        <div className=" overflow-hidden pb-0 border rounded-lg border-dashed">
                            <div className=" bg-gray-50 px-4 py-3 border-b border-dashed">

                                <p className=" font-medium "> Addons  </p>
                            </div>
                            <div className="">
                                {Array.isArray(dish.dishOptions) && dish.dishOptions.map((option: any) => {
                                    const isSelected = selectedOptions.some(o => o.id === option.id);
                                    return (
                                        <div
                                            key={option.id}
                                            className="flex items-center justify-between p-3  cursor-pointer hover:bg-muted/50"
                                            onClick={() => toggleOption(option)}
                                        >
                                            <span className=" text-sm  font-medium">{option.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-muted-foreground">Rs. {option.price}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    readOnly
                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className=" mt-6 overflow-hidden pb-0 border rounded-lg border-dashed">

                            <div className=" bg-gray-50 px-4 py-3 border-b border-dashed">
                                <p className="font-medium">
                                    Must Try
                                </p>
                            </div>

                            <div>
                                {Array.isArray(dish.addons) && dish.addons.map((option: any) => {
                                    const isSelected = selectedOptions.some(o => o.id === option.id);

                                    return (
                                        <div
                                            key={option.id}
                                            className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                                            onClick={() => toggleOption(option)}
                                        >
                                            <span className="text-sm font-medium">
                                                {option.name}
                                            </span>

                                            <div className="flex items-center gap-3">
                                                <span className="text-muted-foreground">
                                                    Rs. {option.price}
                                                </span>

                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    readOnly
                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <DrawerFooter>
                        <Button className=" h-10" onClick={confirmAddOptions}>Add to Cart - Rs. {dish.price + selectedOptions.reduce((sum, opt) => sum + opt.price, 0)}</Button>
                        {/* <DrawerClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DrawerClose> */}
                    </DrawerFooter>

                </DrawerContent>
            </Drawer>
        </>
    );
}
