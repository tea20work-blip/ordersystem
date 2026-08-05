import { getImageUrl } from "@/lib/s3";
import {
  DashboardDuration,
  getTodayTopOrderedDishes,
} from "../actions/dashboard";
import AdminSummary from "./AdminSummary";
import { order } from "@/db/schema";
import { eq, gt, type SQL } from "drizzle-orm";
import { AdminOrderTypeSummary } from "./AdminOrderTypeSummary";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const orderTypeFilters = [
  { label: "Dine In", value: "dine_in" },
  { label: "Takeaway", value: "take_away" },
  { label: "Delivery", value: "delivery" },
] as const;

const paymentFilters = [
  { label: "Online", value: "paid_online" },
  { label: "Cash", value: "paid_cash" },
  { label: "Lending", value: "paid_user" },
] as const;

type OrderTypeFilter = (typeof orderTypeFilters)[number]["value"];
type PaymentFilter = (typeof paymentFilters)[number]["value"];

function isOrderTypeFilter(value?: string): value is OrderTypeFilter {
  return orderTypeFilters.some((item) => item.value === value);
}

function isPaymentFilter(value?: string): value is PaymentFilter {
  return paymentFilters.some((item) => item.value === value);
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    filter?: string;
    orderType?: string;
    payment?: string;
    duration?: DashboardDuration;
  }>;
}) {
  const {
    filter,
    orderType,
    payment,
    duration: durationParam = "day",
  } = await searchParams;
  const duration: DashboardDuration = ["day", "week", "month"].includes(
    durationParam,
  )
    ? durationParam
    : "day";
  const activeOrderType = isOrderTypeFilter(orderType)
    ? orderType
    : isOrderTypeFilter(filter)
      ? filter
      : undefined;
  const activePayment = isPaymentFilter(payment)
    ? payment
    : isPaymentFilter(filter)
      ? filter
      : undefined;
  const whereClause: SQL[] = [];

  if (activeOrderType) {
    whereClause.push(eq(order.orderType, activeOrderType));
  }

  if (activePayment) {
    switch (activePayment) {
      case "paid_online":
        whereClause.push(gt(order.paidOnline, 0));
        break;
      case "paid_cash":
        whereClause.push(gt(order.paidCash, 0));
        break;
      case "paid_user":
        whereClause.push(gt(order.lendingAmount, 0));
        break;
    }
  }
  const getAdminHref = ({
    nextDuration,
    nextOrderType,
    nextPayment,
  }: {
    nextDuration?: DashboardDuration;
    nextOrderType?: OrderTypeFilter | null;
    nextPayment?: PaymentFilter | null;
  } = {}) => {
    const params = new URLSearchParams({
      duration: nextDuration ?? duration,
    });
    const orderTypeValue =
      nextOrderType === undefined ? activeOrderType : nextOrderType;
    const paymentValue =
      nextPayment === undefined ? activePayment : nextPayment;

    if (orderTypeValue) {
      params.set("orderType", orderTypeValue);
    }

    if (paymentValue) {
      params.set("payment", paymentValue);
    }

    return `/admin?${params.toString()}`;
  };
  const data = await getTodayTopOrderedDishes(whereClause, duration);
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
  const periodLabel: Record<DashboardDuration, string> = {
    day: "Today's",
    week: "This Week's",
    month: "This Month's",
  };

  return (
    <div className="p-6">
      <div className="mb-6 space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2">
          <p className=" text-sm mb-2 font-medium text-gray-600">
            Filter by period
          </p>
          <div className="flex gap-4 mb-2">
            <Link href={getAdminHref({ nextDuration: "day" })}>
              <Button variant={duration === "day" ? "default" : "outline"}>
                Daily
              </Button>
            </Link>
            <Link href={getAdminHref({ nextDuration: "week" })}>
              <Button variant={duration === "week" ? "default" : "outline"}>
                Weekly
              </Button>
            </Link>
            <Link href={getAdminHref({ nextDuration: "month" })}>
              <Button variant={duration === "month" ? "default" : "outline"}>
                Monthly
              </Button>
            </Link>
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-gray-600">
            Filter by order type
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={getAdminHref({ nextOrderType: null })}>
              <Button variant={!activeOrderType ? "default" : "outline"}>
                All
              </Button>
            </Link>
            {orderTypeFilters.map((item) => (
              <Link
                key={item.value}
                href={getAdminHref({ nextOrderType: item.value })}
              >
                <Button
                  variant={
                    activeOrderType === item.value ? "default" : "outline"
                  }
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-gray-600">
            Filter by payment
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={getAdminHref({ nextPayment: null })}>
              <Button variant={!activePayment ? "default" : "outline"}>
                All
              </Button>
            </Link>
            {paymentFilters.map((item) => (
              <Link
                key={item.value}
                href={getAdminHref({ nextPayment: item.value })}
              >
                <Button
                  variant={activePayment === item.value ? "default" : "outline"}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <AdminSummary duration={duration} />
      <Suspense
        fallback={<div className="text-center text-gray-500">Loading...</div>}
      >
        <AdminOrderTypeSummary duration={duration} />
      </Suspense>

      <div className=" flex gap-4 justify-between">
        <h1 className="text-2xl font-bold mb-4">
          {periodLabel[duration]} Ordered Dishes
        </h1>
        <p className="text-lg">₹ {totalDishRevenue} / - </p>
      </div>
      {(activeOrderType || activePayment) && (
        <p className=" mb-6">
          Applied filter:{" "}
          {[activeOrderType, activePayment].filter(Boolean).join(", ")}
          <br />
          <Link href={`/admin?duration=${duration}`}>
            <Button className="mt-3">Remove applied filters</Button>
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
                  No dishes ordered for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className=" flex gap-4 mt-10 justify-between">
        <h1 className="text-2xl font-bold mb-6">
          {periodLabel[duration]} Ordered Cigrates
        </h1>
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
