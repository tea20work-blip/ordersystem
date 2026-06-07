"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";

export function AdminDishItem({ dish, onAddToCart }: { dish: any, onAddToCart: (item: any, options: any[]) => void }) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
    const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
    const [selectedStyles, setSelectedStyles] = useState<any[]>([]);
    const [selectedVariants, setSelectedVariants] = useState<any[]>(
        Array.isArray(dish.dishVarients) && dish.dishVarients.length > 0 ? [dish.dishVarients[0]] : []
    );

    const hasOptions = Array.isArray(dish.dishOptions) && dish.dishOptions.length > 0;
    const hasStyles = Array.isArray(dish.styleOptions) && dish.styleOptions.length > 0;
    const hasAddons = Array.isArray(dish.addons) && dish.addons.length > 0;
    const hasVariants = Array.isArray(dish.dishVarients) && dish.dishVarients.length > 0;
    const isCustomizable = hasOptions || hasVariants || hasStyles;

    const handleAddClick = () => {
        if (isCustomizable || hasAddons) {
            setSelectedOptions([]);
            setSelectedStyles([]);
            setSelectedAddons([]);
            setSelectedVariants(hasVariants ? [dish.dishVarients[0]] : []);
            setIsDrawerOpen(true);
        } else {
            onAddToCart(dish, []);
        }
    };

    const confirmAddOptions = () => {
        const optionsToPass = [...selectedVariants, ...selectedOptions, ...selectedStyles];
        let price = dish.price;
        if (selectedVariants && selectedVariants.length > 0) {
            price = selectedVariants.reduce((acc: any, item: any) => acc + item.price, 0);
        }
        
        const finalDish = { ...dish, price };
        onAddToCart(finalDish, optionsToPass);
        
        selectedAddons.forEach(option => {
            onAddToCart({ ...option, id: `addon-${option.id}` }, []);
        });
        
        setIsDrawerOpen(false);
    };

    const toggleOption = (option: any) => {
        setSelectedOptions(prev => {
            const maxSelect = dish.maxSelectOptions || 1;
            const exists = prev.find(o => o.id === option.id);
            if (exists) return prev.filter(o => o.id !== option.id);
            if (prev.length >= maxSelect) return prev;
            return [...prev, option];
        });
    };

    const toggleStyle = (style: any) => {
        setSelectedStyles(prev => {
            const maxSelect = dish.maxStyleOptions || 1;
            const exists = prev.find(s => s.id === style.id);
            if (exists) return prev.filter(s => s.id !== style.id);
            if (prev.length >= maxSelect) return prev;
            return [...prev, style];
        });
    };

    const toggleAddons = (option: any) => {
        setSelectedAddons(prev => {
            const exists = prev.find(o => o.id === option.id);
            if (exists) return prev.filter(o => o.id !== option.id);
            return [...prev, option];
        });
    };

    const toggleVariant = (variant: any) => {
        setSelectedVariants(prev => {
            const maxSelect = dish.maxSelectVarient || 1;
            if (maxSelect === 1) return [variant];
            const exists = prev.find(v => v.id === variant.id);
            if (exists) return prev.filter(v => v.id !== variant.id);
            if (prev.length >= maxSelect) return prev;
            return [...prev, variant];
        });
    };

    return (
        <>
            <div className="flex border-b p-1 justify-between overflow-y-auto">
                <div>
                    <h3 className="font-semibold text-sm">{dish.name}</h3>
                    <p className="mt-2 font-medium text-xs">Rs. {hasVariants ? dish.dishVarients
                        .slice(0, dish.minSelectVarient | 1)
                        .reduce((acc: number, item: any) => acc + item.price, 0) : dish.price}</p>
                </div>
                <div className="flex items-center">
                    <Button
                        className="cursor-pointer"
                        variant="secondary"
                        size="sm"
                        onClick={handleAddClick}
                    >
                        Add to Order
                    </Button>
                </div>
            </div>

            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[80vh] z-[999] max-w-lg w-full mx-auto">
                    <DrawerHeader>
                        <DrawerTitle>Customize {dish.name}</DrawerTitle>
                        <DrawerDescription>Select additional options for your dish.</DrawerDescription>
                    </DrawerHeader>
                    <div className="no-scrollbar overflow-y-auto px-3">
                        {hasVariants && (
                            <div className="mb-6 overflow-hidden pb-0 border rounded-lg border-dashed">
                                <div className="bg-gray-50 px-4 py-3 border-b border-dashed flex justify-between items-center">
                                    <p className="font-medium"> Variants </p>
                                    <span className="text-xs text-muted-foreground">
                                        Select {dish.minSelectVarient > 0 ? `at least ${dish.minSelectVarient}` : "up to"} {dish.maxSelectVarient || 1}
                                    </span>
                                </div>
                                <div>
                                    {dish.dishVarients.map((variant: any) => {
                                        const isSelected = selectedVariants.some(v => v.id === variant.id);
                                        return (
                                            <div
                                                key={variant.id}
                                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                                                onClick={() => toggleVariant(variant)}
                                            >
                                                <span className="text-sm font-medium">{variant.name}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-muted-foreground">Rs. {variant.price}</span>
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
                            <div className="mb-6 overflow-hidden pb-0 border rounded-lg border-dashed">
                                <div className="bg-gray-50 px-4 py-3 border-b border-dashed flex justify-between items-center">
                                    <p className="font-medium"> Style Options </p>
                                    <span className="text-xs text-muted-foreground">
                                        Select {dish.minStyleOptions > 0 ? `at least ${dish.minStyleOptions}` : "up to"} {dish.maxStyleOptions || 1}
                                    </span>
                                </div>
                                <div>
                                    {dish.styleOptions.map((style: any) => {
                                        const isSelected = selectedStyles.some(s => s.id === style.id);
                                        return (
                                            <div
                                                key={style.id}
                                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                                                onClick={() => toggleStyle(style)}
                                            >
                                                <span className="text-sm font-medium">{style.name}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-muted-foreground">Rs. {style.price}</span>
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
                            <div className="mb-6 overflow-hidden pb-0 border rounded-lg border-dashed">
                                <div className="bg-gray-50 px-4 py-3 border-b border-dashed">
                                    <p className="font-medium"> Addons </p>
                                </div>
                                <div>
                                    {dish.dishOptions.map((option: any) => {
                                        const isSelected = selectedOptions.some(o => o.id === option.id);
                                        return (
                                            <div
                                                key={option.id}
                                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                                                onClick={() => toggleOption(option)}
                                            >
                                                <span className="text-sm font-medium">{option.name}</span>
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
                        )}
                        {hasAddons && (
                            <div className="mb-6 overflow-hidden pb-0 border rounded-lg border-dashed">
                                <div className="bg-gray-50 px-4 py-3 border-b border-dashed">
                                    <p className="font-medium"> Must try </p>
                                </div>
                                <div>
                                    {Array.isArray(dish.addons) && dish.addons.map((option: any) => {
                                        const isSelected = selectedAddons.some(o => o.id === option.id);
                                        return (
                                            <div
                                                key={option.id}
                                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                                                onClick={() => toggleAddons(option)}
                                            >
                                                <span className="text-sm font-medium">{option.name}</span>
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
                        )}
                    </div>
                    <DrawerFooter>
                        <Button
                            className="h-10"
                            onClick={confirmAddOptions}
                            disabled={selectedVariants.length < (dish.minSelectVarient || 0) || selectedStyles.length < (dish.minStyleOptions || 0)}
                        >
                            Add to Cart - Rs. {(!selectedVariants.length ? dish.price : selectedVariants.reduce((sum: number, opt: any) => sum + opt.price, 0)) + selectedOptions.reduce((sum: number, opt: any) => sum + opt.price, 0) + selectedStyles.reduce((sum: number, opt: any) => sum + opt.price, 0) + selectedAddons.reduce((sum: number, opt: any) => sum + opt.price, 0)}
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}
