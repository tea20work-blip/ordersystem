"use client";

import { useEffect, useState } from "react";
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
import { cn } from "@/lib/utils";
import Image from "next/image";

export function DishCard({ dish }: { dish: any }) {
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<SelectedOption[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<SelectedOption[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<SelectedOption[]>(
    Array.isArray(dish.dishVarients) && dish.dishVarients.length > 0
      ? [dish.dishVarients[0]]
      : [],
  );

  const dishCartItems = cartItems.filter((item) => item.dish.id === dish.id);
  const quantity = dishCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const hasOptions =
    Array.isArray(dish.dishOptions) && dish.dishOptions.length > 0;
  const hasStyles =
    Array.isArray(dish.styleOptions) && dish.styleOptions.length > 0;
  const hasAddons = Array.isArray(dish.addons) && dish.addons.length > 0;
  const hasVariants =
    Array.isArray(dish.dishVarients) && dish.dishVarients.length > 0;
  const isCustomizable = hasOptions || hasVariants || hasStyles;

  const handleAdd = () => {
    if (isCustomizable || hasAddons) {
      setSelectedOptions([]);
      setSelectedStyles([]);
      setSelectedVariants(hasVariants ? [dish.dishVarients[0]] : []);
      setIsDrawerOpen(true);
    } else {
      addItem(dish);
    }
  };

  const handleIncrement = () => {
    if (isCustomizable || hasAddons) {
      setSelectedOptions([]);
      setSelectedStyles([]);
      setSelectedVariants(hasVariants ? [dish.dishVarients[0]] : []);
      setIsDrawerOpen(true);
    } else {
      const defaultItem = dishCartItems.find(
        (item) => item.cartItemId === String(dish.id),
      );
      if (defaultItem) {
        updateQuantity(defaultItem.cartItemId, defaultItem.quantity + 1);
      } else {
        addItem(dish);
      }
    }
  };

  const handleDecrement = () => {
    if (isCustomizable || hasAddons) {
      const lastItem = dishCartItems[dishCartItems.length - 1];
      if (lastItem) {
        updateQuantity(lastItem.cartItemId, lastItem.quantity - 1);
      }
    } else {
      const defaultItem = dishCartItems.find(
        (item) => item.cartItemId === String(dish.id),
      );
      if (defaultItem) {
        updateQuantity(defaultItem.cartItemId, defaultItem.quantity - 1);
      }
    }
  };

  const confirmAddOptions = () => {
    if (selectedVariants && selectedVariants?.length > 0) {
      addItem(
        {
          ...dish,
          price: selectedVariants.reduce(
            (acc: any, item: any) => acc + item.price,
            0,
          ),
        },
        [
          ...selectedVariants.map((v: any) => ({ ...v, price: 0 })),
          ...selectedOptions,
          ...selectedStyles,
        ],
      );
    } else {
      addItem(dish, [
        ...selectedVariants,
        ...selectedOptions,
        ...selectedStyles,
      ]);
    }
    selectedAddons.forEach((option) => addItem({ ...option }));
    setIsDrawerOpen(false);
  };

  const toggleOption = (option: any) => {
    setSelectedOptions((prev) => {
      const maxSelect = dish.maxSelectOptions || 1;

      const exists = prev.find((o) => o.id === option.id);
      if (exists) return prev.filter((o) => o.id !== option.id);

      if (prev.length >= maxSelect) return prev;
      return [...prev, option];
    });
  };

  const toggleStyle = (style: any) => {
    setSelectedStyles((prev) => {
      const maxSelect = dish.maxStyleOptions || 1;

      const exists = prev.find((s) => s.id === style.id);
      if (exists) return prev.filter((s) => s.id !== style.id);

      if (prev.length >= maxSelect) return prev;
      return [...prev, style];
    });
  };
  const toggleAddons = (option: any) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((o) => o.id === option.id);
      if (exists) return prev.filter((o) => o.id !== option.id);
      return [...prev, option];
    });
  };

  const toggleVariant = (variant: any) => {
    setSelectedVariants((prev) => {
      const maxSelect = dish.maxSelectVarient || 1;

      if (maxSelect === 1) {
        return [variant];
      }

      const exists = prev.find((v) => v.id === variant.id);
      if (exists) return prev.filter((v) => v.id !== variant.id);

      if (prev.length >= maxSelect) {
        return prev;
      }
      return [...prev, variant];
    });
  };

  return (
    <>
      {dish.isOutOfStock && (
        <div className=" relative">
          <div className="absolute flex top-3 right-7 z-10">
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: " 12px solid transparent",
                borderRight: "6px solid #483839",
                borderBottom: "0px solid transparent",
              }}
              className=" w-0 h-0 border-primary"
            ></div>

            <div className=" rounded-b-xl py-2 text-xs font-semibold shadow px-1 bg-[#e85d04] text-white ">
              Out of stock
            </div>
          </div>
        </div>
      )}
      <div
        className={cn(
          "border-b py-6 w-full items-center flex group hover:shadow-md px-4 transition-all duration-300",
          dish.isOutOfStock && "grayscale cursor-not-allowed",
        )}
      >
        <div className=" flex flex-col grow">
          <h3 className=" tracking-tight mb-1 font-semibold">{dish.name}</h3>
          <div className="flex items-center justify-between ">
            <span className=" text-sm font-semibold">
              ₹{" "}
              {hasVariants
                ? dish.dishVarients
                    .slice(0, dish.minSelectVarient | 1)
                    .reduce((acc: number, item: any) => acc + item.price, 0)
                : dish.price}
            </span>
          </div>
          {dish.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2 mb-4 grow">
              {dish.description}
            </p>
          )}
        </div>

        <div className="relative h-24 w-28 shrink-0">
          {dish.imageUrl ? (
            <Image
              height={200}
              width={200}
              src={getImageUrl(dish.imageUrl)}
              alt={dish.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <></>
          )}

          <div
            className={cn(" absolute -bottom-1 left-1/2 -translate-x-1/2 z-10")}
          >
            {quantity === 0 ? (
              <div className=" flex gap-1 flex-col">
                <Button
                  variant={"outline"}
                  onClick={handleAdd}
                  disabled={dish.isOutOfStock}
                  size="sm"
                  className="rounded-full shadow-sm hover:shadow active:scale-95 transition-all whitespace-nowrap px-4"
                >
                  Add
                </Button>
                {isCustomizable && (
                  <p className=" absolute -left-4 -bottom-4.5 font-semibold text-xs">
                    CUSTOMIZABLE
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center bg-secondary rounded-full overflow-hidden shadow-sm border border-border/50">
                <ButtonGroup>
                  <Button size="sm" onClick={handleDecrement}>
                    <Minus className=" size-2" />
                  </Button>
                  <Button size={"sm"} className="pointer-events-none min-w-10">
                    {quantity}
                  </Button>

                  <Button size="sm" onClick={handleIncrement}>
                    <Plus className=" size-2" />
                  </Button>
                </ButtonGroup>
              </div>
            )}
          </div>
        </div>
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className=" data-[vaul-drawer-direction=bottom]:max-h-[80vh] z-999 max-w-lg w-full mx-auto">
          <DrawerHeader>
            <DrawerTitle>Customize {dish.name}</DrawerTitle>
            <DrawerDescription>
              Select additional options for your dish.
            </DrawerDescription>
          </DrawerHeader>
          <div className="no-scrollbar overflow-y-auto  px-3">
            {hasVariants && (
              <div className=" mb-6 overflow-hidden pb-0 border rounded-lg border-dashed">
                <div className=" bg-gray-50 px-4 py-3 border-b border-dashed flex justify-between items-center">
                  <p className=" font-medium "> Variants </p>
                  <span className="text-xs text-muted-foreground">
                    Select{" "}
                    {dish.minSelectVarient > 0
                      ? `at least ${dish.minSelectVarient}`
                      : "up to"}{" "}
                    {dish.maxSelectVarient || 1}
                  </span>
                </div>
                <div className="">
                  {dish.dishVarients.map((variant: any) => {
                    const isSelected = selectedVariants.some(
                      (v) => v.id === variant.id,
                    );
                    return (
                      <div
                        key={variant.id}
                        className="flex items-center justify-between p-3  cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleVariant(variant)}
                      >
                        <span className=" text-sm  font-medium">
                          {variant.name}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">
                            ₹ {variant.price}
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
            )}
            {hasOptions && (
              <div className=" overflow-hidden pb-0 border rounded-lg border-dashed mb-6">
                <div className=" bg-gray-50 px-4 py-3 border-b border-dashed">
                  <p className=" font-medium "> Addons </p>
                </div>
                <div className="">
                  {dish.dishOptions.map((option: any) => {
                    const isSelected = selectedOptions.some(
                      (o) => o.id === option.id,
                    );
                    return (
                      <div
                        key={option.id}
                        className="flex items-center justify-between p-3  cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleOption(option)}
                      >
                        <span className=" text-sm  font-medium">
                          {option.name}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">
                            ₹ {option.price}
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
            )}
            {hasStyles && (
              <div className=" overflow-hidden pb-0 border rounded-lg border-dashed mb-6">
                <div className=" bg-gray-50 px-4 py-3 border-b border-dashed flex justify-between items-center">
                  <p className=" font-medium "> Style Options </p>
                  <span className="text-xs text-muted-foreground">
                    Select{" "}
                    {dish.minStyleOptions > 0
                      ? `at least ${dish.minStyleOptions}`
                      : "up to"}{" "}
                    {dish.maxStyleOptions || 1}
                  </span>
                </div>
                <div className="">
                  {dish.styleOptions.map((style: any) => {
                    const isSelected = selectedStyles.some(
                      (s) => s.id === style.id,
                    );
                    return (
                      <div
                        key={style.id}
                        className="flex items-center justify-between p-3  cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleStyle(style)}
                      >
                        <span className=" text-sm  font-medium">
                          {style.name}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">
                            ₹ {style.price}
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
            )}
            {hasAddons && (
              <div className=" overflow-hidden pb-0 border rounded-lg border-dashed mb-6">
                <div className=" bg-gray-50 px-4 py-3 border-b border-dashed">
                  <p className=" font-medium "> Must try </p>
                </div>
                <div className="">
                  {Array.isArray(dish.addons) &&
                    dish.addons.map((option: any) => {
                      const isSelected = selectedAddons.some(
                        (o) => o.id === option.id,
                      );
                      return (
                        <div
                          key={option.id}
                          className="flex items-center justify-between p-3  cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleAddons(option)}
                        >
                          <span className=" text-sm  font-medium">
                            {option.name}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground">
                              ₹ {option.price}
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
            )}
          </div>
          <DrawerFooter>
            <Button
              className=" h-10 font-semibold"
              onClick={confirmAddOptions}
              disabled={
                selectedVariants.length < (dish.minSelectVarient || 0) ||
                selectedStyles.length < (dish.minStyleOptions || 0)
              }
            >
              Add to Cart - ₹{" "}
              {(!selectedVariants.length
                ? dish.price
                : selectedVariants.reduce((sum, opt) => sum + opt.price, 0)) +
                selectedOptions.reduce((sum, opt) => sum + opt.price, 0) +
                selectedStyles.reduce((sum, opt) => sum + opt.price, 0) +
                selectedAddons.reduce((sum, opt) => sum + opt.price, 0)}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
