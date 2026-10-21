export const DISH_TYPES = ["food", "beverage", "combo"] as const;

export type DishType = (typeof DISH_TYPES)[number];

export const DISH_TYPE_LABELS: Record<DishType, string> = {
    food: "Food",
    beverage: "Beverage",
    combo: "Combo",
};

export function isDishType(value: unknown): value is DishType {
    return DISH_TYPES.some(type => type === value);
}
