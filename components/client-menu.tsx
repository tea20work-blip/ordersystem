"use client";

import { useState } from "react";
import { DishCard } from "@/components/dish-card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Search, X } from "lucide-react";

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
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const filteredDishes = initialDishes.map((category: any) => {
        return { ...category, dishes: category.dishes.filter((dish: any) => dish.name.toLowerCase().includes(searchQuery.toLowerCase()) || dish.category.toLowerCase().includes(searchQuery.toLowerCase()) || dish.description.toLowerCase().includes(searchQuery.toLowerCase())) }
    })

    let dishCount = filteredDishes.reduce((acc: number, category: any) => acc + category.dishes.length, 0);

    return (
        <>
            <div className="sticky px-4 w-full bg-white z-20 border-b py-4 top-16">
                <InputGroup className="max-w-none w-full border-2 border-[#774936]">
                    <InputGroupInput
                        placeholder="Search dishes..."
                        value={searchQuery}
                        onChange={handleSearch}
                        onClick={(e) => e.currentTarget.select()}
                    />
                    <InputGroupAddon>
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">{dishCount} results</InputGroupAddon>
                    {searchQuery.trim() !== "" && <InputGroupAddon align="inline-end"><X onClick={() => setSearchQuery("")} className="h-4 w-4 text-muted-foreground" /></InputGroupAddon>}

                </InputGroup>
            </div>

            <main className=" w-full mx-auto py-8">
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
                        {filteredDishes.map((category: any) => {
                            if (category.dishes?.length <= 0) return null;
                            return (
                                <div className=" mb-3 shadow">
                                    <h1 className=" bg-[#774936] text-white py-2 px-4 font-semibold">{category.name}</h1>

                                    {category.dishes.map((dish: any) => (
                                        <DishCard key={dish.id} dish={dish} />
                                    ))}
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>
            <div className=" h-12"></div>
        </>
    );
}
