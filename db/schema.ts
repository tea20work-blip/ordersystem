import { pgTable, serial, varchar, integer, text, timestamp, pgEnum, jsonb, primaryKey, boolean } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }),
    password: varchar("password", { length: 255 }),
    number: varchar("number", { length: 15 }),
    isEmailVerified: boolean("is_email_verified").default(false),
    isNumberVerified: boolean("is_number_verified").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    lendingAmount: integer("lending_amount").default(0),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderStatus = pgEnum("order_status", ["pending", "completed", "cancelled", "paid_online", "paid_cash", "paid_user"]);


export const cigarette = pgTable("cigarette", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    price: integer("price").notNull(),
});

export const cigaretteOrders = pgTable("cigarette_orders", {
    id: serial("id").primaryKey(),
    cigaretteId: integer("cigarette_id").notNull().references(() => cigarette.id),
    quantity: integer("quantity").notNull(),
    price: integer("price").notNull(),
    tableId: integer("table_id").references(() => table.id),
    status: orderStatus("status").default("pending"),
    userId: integer("user_id").references(() => user.id),
    createdAt: timestamp("created_at").defaultNow(),
});

export const dish = pgTable("dish", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    price: integer("price").notNull(),
    description: text("description"),
    priority: integer("priority").notNull().default(0),
    imageUrl: varchar("image_url", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    dishOptions: jsonb("dish_options").array(),
    isOutOfStock: boolean("is_out_of_stock").default(false),
    isHidden: boolean("is_hidden").default(false),
    isDeleted: boolean("is_deleted").default(false),
    maxSelectOptions: integer("max_select_options").default(1),
    minSelectOptions: integer("min_select_options").default(0),
});

export const table = pgTable("table", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const category = pgTable("category", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    priority: integer("priority").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const dishCategory = pgTable("dish_category", {
    id: serial("id").primaryKey(),
    dishId: integer("dish_id").notNull().references(() => dish.id),
    categoryId: integer("category_id").notNull().references(() => category.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});


export const order = pgTable("order", {
    id: serial("id").primaryKey(),
    tableId: integer("table_id").notNull().references(() => table.id),
    isRunning: boolean("is_running").default(true),
    userId: integer("user_id").references(() => user.id),
    totalPricing: integer("total_pricing").notNull(),
    status: orderStatus("status").default("pending"),
    lendingUserId: integer("lending_user_id").references(() => user.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItem = pgTable("order_item", {
    id: serial("id").primaryKey(),
    orderId: integer("order_id").notNull().references(() => order.id),
    dishId: integer("dish_id").notNull().references(() => dish.id),
    pricing: integer("pricing").notNull(),
    quantity: integer("quantity").notNull(),
    options: jsonb("options").array(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const addons = pgTable("addons", {
    dishId: integer("dish_id").notNull().references(() => dish.id),
    addOnId: integer("add_on_id").notNull().references(() => dish.id),
}, (table) => [
    primaryKey({ columns: [table.dishId, table.addOnId] })
]);

export const recommendedDishes = pgTable("recommended_dishes", {
    id: serial("id").primaryKey(),
    dishId: integer("dish_id").notNull().references(() => dish.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});