import type { DishType } from "./dish-types";

type MenuDish = {
    name: string;
    description?: string | null;
    dishType?: DishType | null;
};

// A nonempty search always uses the complete menu, irrespective of the active tab.
export function filterMenu<D extends MenuDish, C extends { dishes: D[] }>(
    categories: C[],
    activeType: DishType,
    query: string,
): C[] {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

    return categories.map(category => {
        const dishes = words.length === 0
            ? category.dishes.filter(dish => (dish.dishType ?? "food") === activeType)
            : category.dishes
                .map(dish => {
                    const text = `${dish.name} ${dish.description ?? ""}`.toLowerCase();
                    const score = words.filter(word => text.includes(word)).length;
                    return { dish, score };
                })
                .filter(result => result.score > 0)
                .sort((a, b) => b.score - a.score)
                .map(result => result.dish);

        return { ...category, dishes };
    }).filter(category => category.dishes.length > 0);
}
