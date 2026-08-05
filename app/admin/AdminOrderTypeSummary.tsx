import db from "@/db";
import { order } from "@/db/schema";
import { DashboardDuration, getDashboardDateRange } from "../actions/dashboard";
import { and, gte, lt, ne, sql } from "drizzle-orm";
import React from "react";

export const AdminOrderTypeSummary = async ({
  duration,
}: {
  duration: DashboardDuration;
}) => {
  const { startDate, endDate } = getDashboardDateRange(duration);

  const orderData = await db
    .select({
      type: order.orderType,
      totalAmount: sql<number>`COALESCE(SUM(${order.totalPricing}), 0)`,
    })
    .from(order)
    .where(
      and(
        gte(order.createdAt, startDate),
        lt(order.createdAt, endDate),
        ne(order.status, "cancelled"),
        gte(order.totalPricing, 0),
      ),
    )
    .groupBy(order.orderType);

  const dineIn = Number(
    orderData.find((o) => o.type === "dine_in")?.totalAmount || 0,
  );
  const takeaway = Number(
    orderData.find((o) => o.type === "take_away")?.totalAmount || 0,
  );
  const delivery = Number(
    orderData.find((o) => o.type === "delivery")?.totalAmount || 0,
  );
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Dine In
        </p>
        <p className="text-3xl font-bold mt-2 text-purple-600">{dineIn}</p>
      </div>
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Takeaway
        </p>
        <p className="text-3xl font-bold mt-2 text-blue-600">{takeaway}</p>
      </div>
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Delivery
        </p>
        <p className="text-3xl font-bold mt-2 text-orange-600">{delivery}</p>
      </div>
    </div>
  );
};
