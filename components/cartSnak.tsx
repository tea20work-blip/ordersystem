"use client"
import { useCartStore } from "@/store/cart";
import { Button } from "./ui/button";
import { ChevronRight, ShoppingCart } from "lucide-react";
import Link from "next/link";

export const CartSnak = () => {
    const cartItems = useCartStore((state) => state.items);
    console.log(cartItems)
    if (cartItems && cartItems.length <= 0) {
        return <></>
    }
    return (
        <Link href={"/cart"}>
            <div className=" fixed z-999 bottom-2 ring-2  ring-taupe-300 flex justify-between items-center rounded-xl w-[calc(100%-16px)] left-1/2 -translate-x-1/2 shadow bg-muted py-3 px-4">
                <div className=" flex gap-1 text-sm font-semibold">
                    <p>  {cartItems[0].dish.name}</p>
                    {cartItems.length > 1 && <p> + {cartItems.length}</p>}
                </div>
                <Button size={"sm"} variant={"ghost"}>
                    <p>View Cart</p>
                    <ChevronRight />
                </Button>
            </div>
        </Link>
    )
}