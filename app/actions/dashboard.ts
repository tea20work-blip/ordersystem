import db from "@/db";
import { dish, order, orderItem } from "@/db/schema";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";

export type TopOrderedDish = {
    id: number;
    name: string;
    imageUrl: string | null;
    totalOrders: number;
};

export async function getTodayTopOrderedDishes(): Promise<TopOrderedDish[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const results = await db
        .select({
            id: dish.id,
            name: dish.name,
            imageUrl: dish.imageUrl,
            totalOrders: sql<number>`COALESCE(SUM(${orderItem.quantity}), 0)`,
        })
        .from(orderItem)
        .innerJoin(dish, eq(orderItem.dishId, dish.id))
        .where(
            and(
                gte(orderItem.createdAt, startOfDay),
                lt(orderItem.createdAt, endOfDay)
            )
        )
        .groupBy(dish.id)
        .orderBy(desc(sql`COALESCE(SUM(${orderItem.quantity}), 0)`));

    return results.map(row => ({
        ...row,
        totalOrders: Number(row.totalOrders)
    }));
}