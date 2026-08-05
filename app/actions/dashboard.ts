import db from "@/db";
import { order, orderItem } from "@/db/schema";
import { and, desc, eq, gte, lt, ne, sql, type SQL } from "drizzle-orm";

export type TopOrderedDish = {
  dishId: number | null;
  name: string;
  imageUrl: string | null;
  cegrateId: number | null;
  totalOrders: number;
  totalPrice: number;
};

export type DashboardDuration = "day" | "week" | "month";

export function getDashboardDateRange(durationType: DashboardDuration = "day") {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  if (durationType === "week") {
    startDate.setDate(startDate.getDate() - startDate.getDay());
  } else if (durationType === "month") {
    startDate.setDate(1);
  }

  return { startDate, endDate };
}

export async function getRevenue(durationType: DashboardDuration = "day") {
  const { startDate, endDate } = getDashboardDateRange(durationType);

  const [results] = await db
    .select({
      paidOnline: sql<number>`COALESCE(SUM(${order.paidOnline}), 0)`,
      paidCash: sql<number>`COALESCE(SUM(${order.paidCash}), 0)`,
      lendingAmount: sql<number>`COALESCE(SUM(${order.lendingAmount}), 0)`,
    })
    .from(order)
    .where(
      and(
        gte(order.createdAt, startDate),
        lt(order.createdAt, endDate),
        ne(order.status, "cancelled"),
      ),
    );

  return {
    paidOnline: Number(results?.paidOnline || 0),
    paidCash: Number(results?.paidCash || 0),
    lendingAmount: Number(results?.lendingAmount || 0),
  };
}

export async function getTodayTopOrderedDishes(
  whereClause: SQL[],
  durationType: DashboardDuration = "day",
): Promise<TopOrderedDish[]> {
  const { startDate, endDate } = getDashboardDateRange(durationType);

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
        gte(orderItem.createdAt, startDate),
        lt(orderItem.createdAt, endDate),
        ne(order.status, "cancelled"),
        ...whereClause
      ),
    )
    .groupBy(
      orderItem.dishId,
      orderItem.dishName,
      orderItem.dishImageUrl,
      orderItem.cegrateId,
    )
    .orderBy(desc(sql`COALESCE(SUM(${orderItem.quantity}), 0)`));

  return results.map((row) => ({
    ...row,
    totalOrders: Number(row.totalOrders),
    totalPrice: Number(row.totalPrice),
  }));
}
