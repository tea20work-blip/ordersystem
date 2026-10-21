# Menu dish types

Each dish has a `dishType`: `food`, `beverage`, or `combo`. The database enum
is `dish_type`, and `dish.dish_type` is required with a default of `food`.
Existing menu categories (Tea, Snacks, etc.) remain separate.

Admins choose **Dish Type** at `/admin/dishes/form` (or
`/admin/dishes/form?id=<id>` when editing). The dishes table also shows the type.

Both `/takeaway` and `/t/<tableCode>` show Food, Beverage, and Combo tabs,
starting on Food. A nonempty search matches dish names and descriptions across
all three types. Clearing the search restores the selected tab. Category links
and counts follow the filtered results.

The menu pages and `/api/category-products` share `getCachedMenu`.
`/api/products` uses `getCachedProducts`. Both caches last two hours and share
the `menu-data` tag. Dish and category changes revalidate that tag using the
existing stale-while-revalidate policy.

## Database rollout

Only the TypeScript schema has been updated for this feature. No migration was
generated or run. Apply the enum and required defaulted column through your
normal database migration process before running this version against the
database. Existing dishes should receive `food` when the column is added.

Run the focused tests with:

```sh
npx tsx --test tests/menu-filter.test.ts
```
