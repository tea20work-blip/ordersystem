import { getImageUrl } from "@/lib/s3";
import { getTodayTopOrderedDishes } from "../actions/dashboard";
import AdminSummary from "./AdminSummary";
import { order } from "@/db/schema";
import db from "@/db";
import { and, eq, gte, lt, ne, sum } from "drizzle-orm";
import { AdminOrderTypeSummary } from "./AdminOrderTypeSummary";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { filter?: string; duration?: "day" | "week" | "month" };
}) {
  const { filter, duration = "day" } = await searchParams;
  let isFilter = false;
  const whereCaluse = [];

  if (filter) {
    isFilter = true;
    switch (filter) {
      case "dine_in":
        whereCaluse.push(eq(order.orderType, "dine_in"));
        break;
      case "take_away":
        whereCaluse.push(eq(order.orderType, "take_away"));
        break;
      case "delivery":
        whereCaluse.push(eq(order.orderType, "delivery"));
        break;
      case "paid_online":
        whereCaluse.push(eq(order.status, "paid_online"));
        break;
      case "paid_cash":
        whereCaluse.push(eq(order.status, "paid_cash"));
        break;
      case "paid_user":
        whereCaluse.push(eq(order.status, "paid_user"));
        break;
    }
  }
  const data = await getTodayTopOrderedDishes(whereCaluse, duration);
  const dishData = data.filter((item) => item.cegrateId === null);
  const cegrateData = data.filter((item) => item.cegrateId !== null);
  const totalDishRevenue = dishData.reduce(
    (acc, item) => acc + item.totalPrice,
    0,
  );
  const totalCegrateRevenue = cegrateData.reduce(
    (acc, item) => acc + item.totalPrice,
    0,
  );

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6">
        <Link href={`/admin?duration=day${filter ? `&filter=${filter}` : ""}`}>
          <Button variant={duration === "day" ? "default" : "outline"}>
            Daily
          </Button>
        </Link>
        <Link href={`/admin?duration=week${filter ? `&filter=${filter}` : ""}`}>
          <Button variant={duration === "week" ? "default" : "outline"}>
            Weekly
          </Button>
        </Link>
        <Link
          href={`/admin?duration=month${filter ? `&filter=${filter}` : ""}`}
        >
          <Button variant={duration === "month" ? "default" : "outline"}>
            Monthly
          </Button>
        </Link>
      </div>
      <AdminSummary />
      <Suspense
        fallback={<div className="text-center text-gray-500">Loading...</div>}
      >
        <AdminOrderTypeSummary />
      </Suspense>

      <div className=" flex gap-4 justify-between">
        <h1 className="text-2xl font-bold mb-4">Today's Ordered Dishes</h1>
        <p className="text-lg">₹ {totalDishRevenue} / - </p>
      </div>
      {filter && (
        <p className=" mb-6">
          Applied filter: {filter}
          <br />
          <Link href={"/admin"}>
            <Button className="mt-3">Remove all filters</Button>
          </Link>
        </p>
      )}
      <div className="overflow-x-auto bg-white border border-gray-200 shadow-sm rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Orders
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Price
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dishData.map((dish) => (
              <tr key={dish.dishId}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {dish.imageUrl ? (
                    <Image
                      width={48}
                      height={48}
                      src={getImageUrl(dish.imageUrl)}
                      alt={dish.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                      N/A
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {dish.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {dish.totalOrders}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {dish.totalPrice}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  No dishes ordered today.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className=" flex gap-4 mt-10 justify-between">
        <h1 className="text-2xl font-bold mb-6">Today's Ordered Cigrates</h1>
        <p className="text-lg">₹ {totalCegrateRevenue} / -</p>
      </div>
      <div className="overflow-x-auto bg-white border border-gray-200 shadow-sm rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Orders
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Price
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cegrateData.map((dish) => (
              <tr key={dish.dishId}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {dish.imageUrl ? (
                    <Image
                      width={48}
                      height={48}
                      src={getImageUrl(dish.imageUrl)}
                      alt={dish.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                      N/A
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {dish.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {dish.totalOrders}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {dish.totalPrice}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  No dishes ordered today.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
