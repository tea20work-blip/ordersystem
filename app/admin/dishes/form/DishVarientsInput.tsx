"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

export type DishVarient = {
    id: string;
    name: string;
    price: number;
};

interface DishVarientsInputProps {
    defaultValue?: DishVarient[] | null;
}

export function DishVarientsInput({ defaultValue }: DishVarientsInputProps) {
    const [varients, setVarients] = useState<DishVarient[]>(defaultValue || []);

    const addVarient = () => {
        setVarients([
            ...varients,
            { id: crypto.randomUUID(), name: "", price: 0 }
        ]);
    };

    const removeVarient = (id: string) => {
        setVarients(varients.filter(opt => opt.id !== id));
    };

    const updateVarient = (id: string, field: keyof DishVarient, value: string | number) => {
        setVarients(varients.map(opt => {
            if (opt.id === id) {
                return { ...opt, [field]: value };
            }
            return opt;
        }));
    };

    return (
        <div className="space-y-4">
            <input type="hidden" name="dishVarientsJson" value={JSON.stringify(varients)} />
            
            <div className="flex items-center justify-between">
                <Label>Dish Variants</Label>
                <Button type="button" variant="outline" size="sm" onClick={addVarient}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variant
                </Button>
            </div>

            {varients.length === 0 ? (
                <div className="text-sm text-muted-foreground border rounded-md p-4 bg-muted/20 text-center">
                    No variants added. Click "Add Variant" to create variants.
                </div>
            ) : (
                <div className="space-y-3">
                    {varients.map((varient, index) => (
                        <div key={varient.id} className="flex items-start gap-3 border rounded-md p-3 bg-muted/10 relative group">
                            <div className="grid gap-3 md:grid-cols-2 flex-1">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground" htmlFor={`var-name-${varient.id}`}>Variant Name</Label>
                                    <Input 
                                        id={`var-name-${varient.id}`}
                                        value={varient.name} 
                                        onChange={(e) => updateVarient(varient.id, "name", e.target.value)}
                                        placeholder="e.g. Medium Size"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground" htmlFor={`var-price-${varient.id}`}>Price</Label>
                                    <Input 
                                        id={`var-price-${varient.id}`}
                                        type="number"
                                        min="0"
                                        value={varient.price} 
                                        onChange={(e) => updateVarient(varient.id, "price", parseInt(e.target.value || "0", 10))}
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </div>
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:bg-destructive/10 mt-6"
                                onClick={() => removeVarient(varient.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
