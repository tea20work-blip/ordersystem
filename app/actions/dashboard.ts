import db from "@/db";
import { dish, order, orderItem } from "@/db/schema";
import { and, desc, eq, gte, lt, ne, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export type TopOrderedDish = {
    dishId: number | null;
    name: string;
    imageUrl: string | null;
    cegrateId: number | null;
    totalOrders: number;
    totalPrice: number;
};

export async function getTodayRevenue() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const results = await db
        .select({
            totalPricing: order.totalPricing,
            paidOnline: order.paidOnline,
            paidCash: order.paidCash,
            lendingAmount: order.lendingAmount,
        })
        .from(order)
        .where(
            and(
                gte(order.createdAt, startOfDay),
                lt(order.createdAt, endOfDay)
            )
        );
    return results;
}


export async function getTodayTopOrderedDishes(): Promise<TopOrderedDish[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const results = await db
        .select({
            dishId: orderItem.dishId,
            cegrateId: orderItem.cegrateId,
            name: orderItem.dishName,
            imageUrl: orderItem.dishImageUrl,
            totalOrders: sql<number>`COALESCE(SUM(${orderItem.quantity}), 0)`,
            totalPrice: sql<number>`COALESCE(SUM(${orderItem.quantity} * ${orderItem.pricing}), 0)`,
        })
        .from(orderItem)
        .innerJoin(order, eq(orderItem.orderId, order.id))
        .where(
            and(
                gte(orderItem.createdAt, startOfDay),
                lt(orderItem.createdAt, endOfDay),
                ne(order.status, "cancelled")
            )
        )
        .groupBy(
            orderItem.dishId,
            orderItem.dishName,
            orderItem.dishImageUrl,
            orderItem.cegrateId
        )
        .orderBy(desc(sql`COALESCE(SUM(${orderItem.quantity}), 0)`));

    return results.map(row => ({
        ...row,
        totalOrders: Number(row.totalOrders),
        totalPrice: Number(row.totalPrice),
    }));
}

export const getTodayTopOrderedDishesCashed = unstable_cache(getTodayTopOrderedDishes, ["today-top-ordered-dishes"], { revalidate: 20, tags: ["today-top-ordered-dishes"] });