"use client";

import Link from "next/link";
import { ReceiptIndianRupeeIcon, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Image from "next/image";

export function Header() {
    const [mounted, setMounted] = useState(false);
    const totalItems = useCartStore((state) => state.getTotalItems());

    // Prevent hydration mismatch for zustand persist
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="z-50 h-16 sticky top-0 w-full border-b bg-background">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
                <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
                    <Image src="/t20-logo.jpg" alt="Logo" width={50} height={50} className="rounded-full" />
                </Link>

                <nav className="flex items-center gap-4">
                    {/* <Button variant="ghost" asChild>
                        <Link href="/admin">Admin</Link>
                    </Button> */}

                    <Button variant="outline" size="icon" className="relative rounded-full" asChild>
                        <Link href="/orders">
                            <ReceiptIndianRupeeIcon className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="outline" size="icon" className="relative rounded-full" asChild>
                        <Link href="/cart">
                            <ShoppingCart className="h-4 w-4" />
                            <span className="sr-only">Cart</span>
                            {mounted && totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                    </Button>
                </nav>
            </div>
        </header>
    );
}
