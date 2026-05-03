"use client";

import { useState } from "react";
import { DishCard } from "@/components/dish-card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Search } from "lucide-react";

type Dish = {
    id: number;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};

export function ClientMenu({ initialDishes }: { initialDishes: any }) {
    // const [searchQuery, setSearchQuery] = useState("");

    // const filteredDishes = initialDishes.filter(dish =>
    //     dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //     (dish.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    // );
    const filteredDishes = initialDishes;

    return (
        <>
            <div className="px-4 sticky w-full bg-white z-999 border-b py-4 top-0">
                {/* <InputGroup className="max-w-none w-full">
                    <InputGroupInput
                        placeholder="Search dishes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <InputGroupAddon>
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </InputGroupAddon>
                </InputGroup> */}
            </div>

            <main className="flex-1 container mx-auto md:px-4 py-8 max-w-7xl">
                <div className="mb-8 px-4">
                    <h1 className=" text-2xl md:text-4xl font-extrabold tracking-tight mb-2">Our Menu</h1>
                    <p className="text-muted-foreground text-lg">Discover our delicious offerings and order right away.</p>
                </div>

                {filteredDishes.length === 0 ? (
                    <div className="text-center py-24 bg-muted/30 rounded-2xl border border-dashed">
                        <h2 className="text-xl font-semibold mb-2">No dishes found</h2>
                        <p className="text-muted-foreground">Try adjusting your search criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1">
                        {filteredDishes.map((category: any) => (
                            <div>
                                <h1 className=" bg-gray-200 text-gray-800 py-2 px-4 font-semibold text-sm">{category.name}</h1>

                                {category.dishes.map((dish: any) => (
                                    <DishCard key={dish.id} dish={dish} />
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <div className=" h-12"></div>
        </>
    );
}
