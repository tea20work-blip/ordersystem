"use client";

import { useEffect, useState } from "react";
import { DishCard } from "@/components/dish-card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search, X } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { getImageUrl } from "@/lib/s3";
import Image from "next/image";
import { Tabs } from "radix-ui";
import { DISH_TYPES, DISH_TYPE_LABELS, isDishType, type DishType } from "@/lib/dish-types";
import { filterMenu } from "@/lib/menu-filter";
import CategoryMenuSnack from "./CategoryMenuSnack";

export function ClientMenu({
  initialDishes,
  currentTable,
  posters,
}: {
  initialDishes: any;
  currentTable?: { id: number; name: string; tableCode: string };
  posters?: any[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDishType, setActiveDishType] = useState<DishType>("food");
  const { orderType, setOrderType, setTableCode, tableCode } = useCartStore();
  const router = useRouter();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const isSearching = searchQuery.trim().length > 0;
  const filteredDishes = filterMenu(initialDishes, activeDishType, searchQuery);

  const dishCount = filteredDishes.reduce(
    (acc: number, category: any) => acc + category.dishes.length,
    0,
  );

  useEffect(() => {
    async function validateTable() {
      if (currentTable) {
        setTableCode(currentTable?.name);
        setOrderType("dinein");
      } else {
        setOrderType("dineout");
      }
    }
    validateTable();
  }, []);

  return (
    <Tabs.Root
      value={activeDishType}
      onValueChange={(value) => { if (isDishType(value)) setActiveDishType(value); }}
    >
      <div className="sticky px-4 w-full bg-background z-20 border-b py-4 top-16">
        <InputGroup className="max-w-none w-full border-2 border-[#774936]">
          <InputGroupInput
            placeholder="Search all dishes..."
            aria-label="Search all dishes"
            value={searchQuery}
            onChange={handleSearch}
            onClick={(e) => e.currentTarget.select()}
          />
          <InputGroupAddon>
            <Search className="h-4 w-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            {dishCount} results
          </InputGroupAddon>
          {isSearching && (
            <InputGroupAddon className=" cursor-pointer" align="inline-end">
              <button
                type="button"
                aria-label="Clear search"
                className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </InputGroupAddon>
          )}
        </InputGroup>

        <Tabs.List aria-label="Dish type" className="mt-4 grid grid-cols-3 gap-1 rounded-full bg-muted p-1">
          {DISH_TYPES.map(type => (
            <Tabs.Trigger
              key={type}
              value={type}
              className="rounded-full px-4 py-2 text-sm font-semibold transition-colors data-[state=active]:bg-[#774936] data-[state=active]:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {DISH_TYPE_LABELS[type]}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {isSearching && (
          <p className="mt-2 text-xs text-muted-foreground" role="status">
            Searching all dishes across Food, Beverage and Combo
          </p>
        )}

        <ToggleGroup
          className="mt-4 flex gap-2"
          variant="outline"
          type="single"
          value={orderType}
          onValueChange={(value) => {
            if (value === "dinein") {
              router.push("/qr");
            } else {
              router.push("/takeaway");
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
        {tableCode && orderType === "dinein" && (
          <p className=" mt-4 text-sm">
            Your selected table is :{" "}
            <span className=" font-bold">{tableCode}</span>{" "}
          </p>
        )}
      </div>

      <Tabs.Content value={activeDishType} className="outline-none">
        <main className="w-full mx-auto py-8">
          {posters && posters.length > 0 ? (
            <div className="mb-8 px-4">
              <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 no-scrollbar">
                {posters.map((poster) => (
                  <a
                    key={poster.id}
                    href={poster.posterUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="snap-center shrink-0 w-[85%] md:w-[60%] block group"
                  >
                    <div className="rounded-xl overflow-hidden shadow-sm mb-2 border">
                      <Image
                        width={1200}
                        height={675}
                        src={getImageUrl(poster.posterImage)}
                        alt={poster.posterName}
                        className="w-full h-auto aspect-[16/9] object-cover"
                      />
                    </div>
                    {/* <h3 className="font-semibold text-lg truncate px-2">
                      {poster.posterName}
                    </h3> */}
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-8 px-4">
              <h1 className=" text-2xl md:text-4xl font-extrabold tracking-tight mb-2">
                Our Menu
              </h1>
              <p className="text-muted-foreground text-lg">
                Discover our delicious offerings and order right away.
              </p>
            </div>
          )}
          {filteredDishes.length === 0 ? (
            <div className="text-center py-24 bg-muted/30 rounded-2xl border border-dashed">
              <h2 className="text-xl font-semibold mb-2">No dishes found</h2>
              <p className="text-muted-foreground">
                {isSearching ? "Try another search." : `No ${DISH_TYPE_LABELS[activeDishType].toLowerCase()} dishes available yet.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1">
              {filteredDishes.map((category: any) => {
                if (category.dishes?.length <= 0) return null;
                return (
                  <div
                    key={category.id}
                    id={category.id}
                    className=" mb-3 shadow scroll-mt-96"
                  >
                    <h1 className=" bg-[#774936] text-white py-2 px-4 font-semibold">
                      {category.name}
                    </h1>

                    {category.dishes.map((dish: any) => (
                      <DishCard key={dish.id} dish={dish} />
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </Tabs.Content>
      {filteredDishes.length > 0 && <CategoryMenuSnack data={filteredDishes} />}
      <div className=" h-12"></div>
    </Tabs.Root>
  );
}
