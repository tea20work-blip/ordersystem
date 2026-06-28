import { pgTable, serial, varchar, integer, text, timestamp, pgEnum, jsonb, primaryKey, boolean, date } from "drizzle-orm/pg-core";

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
    cigaretteId: integer("cigarette_id").notNull().references(() => cigarette.id, {
        onDelete: "set null"
    }),
    quantity: integer("quantity").notNull(),
    price: integer("price").notNull(),
    tableId: integer("table_id").references(() => table.id, {
        onDelete: "set null"
    }),
    status: orderStatus("status").default("pending"),
    userId: integer("user_id").references(() => user.id, {
        onDelete: "set null"
    }),
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
    styleOptions: jsonb("style_options").array(),
    minStyleOptions: integer("min_style_options").default(0),
    maxStyleOptions: integer("max_style_options").default(1),
    dishVarients: jsonb("dish_varients").array(),
    isOutOfStock: boolean("is_out_of_stock").default(false),
    isHidden: boolean("is_hidden").default(false),
    isDeleted: boolean("is_deleted").default(false),
    maxSelectOptions: integer("max_select_options").default(1),
    maxSelectVarient: integer("max_select_varient").default(1),
    minSelectVarient: integer("min_select_varient").default(0),
});

export const table = pgTable("table", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    tableCode: varchar("table_code", { length: 255 }).unique().notNull(),
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
    dishId: integer("dish_id").notNull().references(() => dish.id, {
        onDelete: "cascade"
    }),
    categoryId: integer("category_id").notNull().references(() => category.id, {
        onDelete: "cascade"
    }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderDeliveryStatus = pgEnum("order_delivery_status", ["ordered", "ready", "dispatched", "delivered"]);
export const orderType = pgEnum("order_type", ["dine_in", "take_away", "delivery"]);

export const order = pgTable("order", {
    id: serial("id").primaryKey(),
    tableId: integer("table_id").references(() => table.id, {
        onDelete: "set null"
    }),
    isRunning: boolean("is_running").default(true),
    userId: integer("user_id").references(() => user.id),
    totalPricing: integer("total_pricing").notNull(),
    paidOnline: integer("paid_online").default(0),
    paidCash: integer("paid_cash").default(0),
    lendingAmount: integer("lending_amount").default(0),
    status: orderStatus("status").default("pending"),
    deliveryStatus: orderDeliveryStatus("delivery_status").default("ordered"),
    lendingUserId: integer("lending_user_id").references(() => user.id, {
        onDelete: "set null"
    }),
    orderType: orderType("order_type").default("dine_in"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    message: varchar("message", { length: 255 }),
});

export const orderItem = pgTable("order_item", {
    id: serial("id").primaryKey(),
    orderId: integer("order_id").notNull().references(() => order.id, {
        onDelete: "cascade"
    }),
    dishId: integer("dish_id").references(() => dish.id, {
        onDelete: "set null",
    }),
    cegrateId: integer("cegrate_id").references(() => cegrates.id, {
        onDelete: "set null",
    }),
    dishName: varchar("dish_name", { length: 255 }).notNull(),
    dishImageUrl: varchar("dish_image_url", { length: 255 }),
    pricing: integer("pricing").notNull(),
    quantity: integer("quantity").notNull(),
    options: jsonb("options").array(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const addons = pgTable("addons", {
    dishId: integer("dish_id").notNull().references(() => dish.id, {
        onDelete: "cascade"
    }),
    addOnId: integer("add_on_id").notNull().references(() => dish.id, {
        onDelete: "cascade"
    }),
}, (table) => [
    primaryKey({ columns: [table.dishId, table.addOnId] })
]);

export const recommendedDishes = pgTable("recommended_dishes", {
    id: serial("id").primaryKey(),
    dishId: integer("dish_id").notNull().references(() => dish.id, {
        onDelete: "cascade"
    }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const cegrates = pgTable("cegrates", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    amount: integer("amount").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
})

export const dailySalesSummary = pgTable("daily_sales_summary", {
    id: serial("id").primaryKey(),
    date: date("date").notNull().unique(),
    totalOrders: integer("total_orders").default(0),
    completedOrders: integer("completed_orders").default(0),
    cancelledOrders: integer("cancelled_orders").default(0),
    grossRevenue: integer("gross_revenue").default(0),
    cashRevenue: integer("cash_revenue").default(0),
    onlineRevenue: integer("online_revenue").default(0),
    lendingTotal: integer("lending_total").default(0),
    createdAt: timestamp("created_at").defaultNow(),
});

export const poster = pgTable("poster", {
    id: serial("id").primaryKey(),
    posterName: varchar("poster_name", { length: 255 }).notNull(),
    posterImage: varchar("poster_image", { length: 255 }).notNull(),
    posterUrl: varchar("poster_url", { length: 255 }).notNull(),
    priority: integer("priority").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
})