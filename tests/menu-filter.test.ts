import assert from "node:assert/strict";
import { test } from "node:test";
import { filterMenu } from "../lib/menu-filter";
import { DISH_TYPES, isDishType, type DishType } from "../lib/dish-types";

const menu = [
    { id: 1, name: "Cafe", dishes: [
        { id: 1, name: "Toast", description: "Fresh cheese", dishType: "food" as DishType },
        { id: 2, name: "Masala Tea", description: "Fresh ginger", dishType: "beverage" as DishType },
        { id: 3, name: "Tea Combo", description: "Tea with toast", dishType: "combo" as DishType },
    ] },
    { id: 2, name: "Cold drinks", dishes: [
        { id: 4, name: "Iced Tea", description: null, dishType: "beverage" as DishType },
    ] },
];

function ids(result: { dishes: { id: number }[] }[]) {
    return result.flatMap(category => category.dishes.map(dish => dish.id));
}

test("tabs filter by type and omit categories with no matching dishes", () => {
    assert.deepEqual(ids(filterMenu(menu, "food", "")), [1]);
    assert.deepEqual(ids(filterMenu(menu, "beverage", "")), [2, 4]);
    assert.deepEqual(ids(filterMenu(menu, "combo", "")), [3]);
    assert.equal(filterMenu(menu, "food", "").length, 1);
});

test("search ignores the selected tab and matches names across types", () => {
    for (const type of DISH_TYPES) {
        assert.deepEqual(ids(filterMenu(menu, type, "  TEA  ")), [2, 3, 4]);
    }
});

test("search matches descriptions and keeps stronger matches first", () => {
    assert.deepEqual(ids(filterMenu(menu, "combo", "ginger")), [2]);
    assert.deepEqual(ids(filterMenu(menu, "beverage", "toast tea")), [3, 1, 2, 4]);
});

test("clearing search restores the selected tab, including whitespace-only search", () => {
    filterMenu(menu, "combo", "ginger");
    assert.deepEqual(ids(filterMenu(menu, "combo", "")), [3]);
    assert.deepEqual(ids(filterMenu(menu, "combo", "  \t  ")), [3]);
});

test("unmatched search returns an empty menu without changing the source", () => {
    const original = structuredClone(menu);
    assert.deepEqual(filterMenu(menu, "food", "unavailable"), []);
    filterMenu(menu, "beverage", "tea toast");
    assert.deepEqual(menu, original);
});

test("older menu records without a type default to Food", () => {
    const oldMenu = [{ dishes: [{ name: "Toast" }] }];
    assert.equal(filterMenu(oldMenu, "food", "")[0].dishes.length, 1);
    assert.deepEqual(filterMenu(oldMenu, "beverage", ""), []);
});

test("dish type validation accepts only the supported enum values", () => {
    for (const type of DISH_TYPES) assert.equal(isDishType(type), true);
    for (const value of [null, undefined, "Food", "dessert", "", 1]) {
        assert.equal(isDishType(value), false);
    }
});
