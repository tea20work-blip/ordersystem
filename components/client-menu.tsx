"use client";

import { useEffect, useState } from "react";
import { DishCard } from "@/components/dish-card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Search, X } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";

export function ClientMenu({ initialDishes, currentTable }: { initialDishes: any, currentTable?: { id: number, name: string, tableCode: string } }) {
    const [searchQuery, setSearchQuery] = useState("");
    const { orderType, setOrderType, setTableCode, tableCode } = useCartStore();
    const router = useRouter();

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const filteredDishes = initialDishes.map((category: any) => {
        if (!searchQuery.trim()) return category;
        const searchWords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);

        const dishesWithScore = category.dishes.map((dish: any) => {
            const targetText = `${dish.name || ''} ${dish.description || ''}`.toLowerCase();
            const matchCount = searchWords.reduce((count, word) => count + (targetText.includes(word) ? 1 : 0), 0);
            return { dish, matchCount };
        }).filter((item: any) => item.matchCount > 0);

        dishesWithScore.sort((a: any, b: any) => b.matchCount - a.matchCount);

        return {
            ...category,
            dishes: dishesWithScore.map((item: any) => item.dish)
        };
    });

    let dishCount = filteredDishes.reduce((acc: number, category: any) => acc + category.dishes.length, 0);

    useEffect(() => {
        async function validateTable() {

            if (currentTable) {
                setTableCode(currentTable?.name)
                setOrderType("dinein");
            } else {
                setOrderType("dineout")
            }
        }
        validateTable();
    }, []);

    return (
        <>
            <div className="sticky px-4 w-full bg-background z-20 border-b py-4 top-16">
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

                <ToggleGroup
                    className="mt-4 flex gap-2"
                    variant="outline"
                    type="single"
                    value={orderType}
                    onValueChange={(value) => {
                        if (value === "dinein") {
                            router.push("/qr")
                        } else {
                            router.push("/takeaway")
                        }
                    }}
                >
                    <ToggleGroupItem
                        className="rounded-full! text-sm font-semibold data-[state=on]:bg-primary data-[state=on]:text-white"
                        value="dinein"
                        aria-label="Toggle dinein"
                    >
                        Dine-in
                    </ToggleGroupItem>

                    <ToggleGroupItem
                        className="rounded-full! text-sm font-semibold data-[state=on]:bg-primary data-[state=on]:text-white"
                        value="dineout"
                        aria-label="Toggle dineout"
                    >
                        Takeaway
                    </ToggleGroupItem>
                </ToggleGroup>
                {tableCode && orderType === "dinein" && <p className=" mt-4 text-sm">Your selected table is : <span className=" font-bold">{tableCode}</span> </p>}
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
                                <div key={category.id} id={category.id} className=" mb-3 shadow">
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
