"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

export type DishOption = {
    id: string;
    name: string;
    price: number;
};

interface DishOptionsInputProps {
    defaultValue?: DishOption[] | null;
}

export function DishOptionsInput({ defaultValue }: DishOptionsInputProps) {
    const [options, setOptions] = useState<DishOption[]>(defaultValue || []);

    const addOption = () => {
        setOptions([
            ...options,
            { id: crypto.randomUUID(), name: "", price: 0 }
        ]);
    };

    const removeOption = (id: string) => {
        setOptions(options.filter(opt => opt.id !== id));
    };

    const updateOption = (id: string, field: keyof DishOption, value: string | number) => {
        setOptions(options.map(opt => {
            if (opt.id === id) {
                return { ...opt, [field]: value };
            }
            return opt;
        }));
    };

    return (
        <div className="space-y-4">
            <input type="hidden" name="dishOptionsJson" value={JSON.stringify(options)} />
            
            <div className="flex items-center justify-between">
                <Label>Dish Options (Add-ons)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                </Button>
            </div>

            {options.length === 0 ? (
                <div className="text-sm text-muted-foreground border rounded-md p-4 bg-muted/20 text-center">
                    No options added. Click "Add Option" to create variations or add-ons.
                </div>
            ) : (
                <div className="space-y-3">
                    {options.map((option, index) => (
                        <div key={option.id} className="flex items-start gap-3 border rounded-md p-3 bg-muted/10 relative group">
                            <div className="grid gap-3 md:grid-cols-2 flex-1">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground" htmlFor={`opt-name-${option.id}`}>Option Name</Label>
                                    <Input 
                                        id={`opt-name-${option.id}`}
                                        value={option.name} 
                                        onChange={(e) => updateOption(option.id, "name", e.target.value)}
                                        placeholder="e.g. Extra Cheese"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground" htmlFor={`opt-price-${option.id}`}>Price</Label>
                                    <Input 
                                        id={`opt-price-${option.id}`}
                                        type="number"
                                        min="0"
                                        value={option.price} 
                                        onChange={(e) => updateOption(option.id, "price", parseInt(e.target.value || "0", 10))}
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
                                onClick={() => removeOption(option.id)}
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
