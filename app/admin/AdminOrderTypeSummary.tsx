import db from "@/db";
import { order } from "@/db/schema";
import { and, gte, lt, ne, sql } from "drizzle-orm";
import Link from "next/link";
import React from "react";

export const AdminOrderTypeSummary = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const orderData = await db
    .select({
      type: order.orderType,
      totalAmount: sql<number>`COALESCE(SUM(${order.totalPricing}), 0)`,
    })
    .from(order)
    .where(
      and(
        gte(order.createdAt, startOfDay),
        lt(order.createdAt, endOfDay),
        ne(order.status, "cancelled"),
      ),
    )
    .groupBy(order.orderType);

  const dineIn = Number(
    orderData.find((o) => o.type === "dine_in")?.totalAmount || 0,
  );
  const takeaway =
    Number(orderData.find((o) => o.type === "take_away")?.totalAmount || 0);
  const delivery =
    Number(orderData.find((o) => o.type === "delivery")?.totalAmount || 0);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
      <Link
        prefetch={false}
        href={"/admin?filter=dine_in"}
        className="bg-white cursor-pointer p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center"
      >
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Dine In
        </p>
        <p className="text-3xl font-bold mt-2 text-purple-600">{dineIn}</p>
      </Link>
      <Link
        prefetch={false}
        href={"/admin?filter=take_away"}
        className="bg-white cursor-pointer p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center"
      >
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Takeaway
        </p>
        <p className="text-3xl font-bold mt-2 text-blue-600">{takeaway}</p>
      </Link>
      <Link
        prefetch={false}
        href={"/admin?filter=delivery"}
        className="bg-white cursor-pointer p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center"
      >
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Delivery
        </p>
        <p className="text-3xl font-bold mt-2 text-orange-600">{delivery}</p>
      </Link>
    </div>
  );
};
