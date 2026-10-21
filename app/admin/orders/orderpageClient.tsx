"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderDialogClient } from "./OrderDialogClient";
import { DeliveryStatusSelect } from "./DeliveryStatusSelect";
import { PaymentStatusSelect } from "./PaymentStatusSelect";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type {
  getOrders,
  AdminOrderType,
  OrderDeliveryStatus,
  OrderPaymentStatus,
} from "../actions/order";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type AdminOrderRow = Omit<Awaited<ReturnType<typeof getOrders>>['orders'][number], 'createdAt'> & { createdAt: string | Date | null };

type OrdersResponse = {
  orders: AdminOrderRow[];
  totalPages: number;
  total: number;
};

const orderTypeOptions: { label: string; value: AdminOrderType }[] = [
  { label: "Dine In", value: "dine_in" },
  { label: "Takeaway", value: "take_away" },
  { label: "Delivery", value: "delivery" },
];

const paymentOptions: { label: string; value: OrderPaymentStatus }[] = [
  { label: "Pending", value: "pending" },
  { label: "Mix", value: "completed" },
  { label: "Paid Online", value: "paid_online" },
  { label: "Paid Cash", value: "paid_cash" },
  { label: "Paid User", value: "paid_user" },
  { label: "Cancelled", value: "cancelled" },
];

const getOrderTypeLabel = (value?: string | null) =>
  value ? orderTypeOptions.find((item) => item.value === value)?.label : "";

const getPaymentLabel = (value?: string | null) =>
  value ? paymentOptions.find((item) => item.value === value)?.label : "";

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const orderType = searchParams.get("orderType") || "";
  const payment = searchParams.get("payment") || "";
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: startDate ? new Date(startDate) : undefined,
    to: endDate ? new Date(endDate) : undefined,
  });
  const limit = 10;
  const apiParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (startDate) apiParams.set("startDate", startDate);
  if (endDate) apiParams.set("endDate", endDate);
  if (orderType) apiParams.set("orderType", orderType);
  if (payment) apiParams.set("payment", payment);

  const { data, error, isLoading, mutate } = useSWR<OrdersResponse>(
    `/api/orders?${apiParams.toString()}`,
    fetcher,
    {
      refreshInterval: 30 * 1000, // 30 sec
      refreshWhenHidden: false,
      revalidateOnFocus: true,
    },
  );

  const orders = data?.orders || [];
  const totalPages = data?.totalPages || 0;
  const total = data?.total || 0;
  const hasDateFilter = Boolean(startDate || endDate);
  const hasFilters = Boolean(hasDateFilter || orderType || payment);

  const pushFilters = ({
    nextOrderType = orderType,
    nextPayment = payment,
    clearDate = false,
  }: {
    nextOrderType?: string;
    nextPayment?: string;
    clearDate?: boolean;
  } = {}) => {
    const params = new URLSearchParams();
    params.set("page", "1");

    if (!clearDate && dateRange?.from) {
      params.set("startDate", format(dateRange.from, "yyyy-MM-dd"));
    }

    if (!clearDate && dateRange?.to) {
      params.set("endDate", format(dateRange.to, "yyyy-MM-dd"));
    }

    if (nextOrderType) params.set("orderType", nextOrderType);
    if (nextPayment) params.set("payment", nextPayment);

    router.push(`/admin/orders?${params.toString()}`);
  };

  const clearFilters = () => {
    setDateRange(undefined);
    router.push("/admin/orders");
  };

  const getPageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (orderType) params.set("orderType", orderType);
    if (payment) params.set("payment", payment);

    return `/admin/orders?${params.toString()}`;
  };

  if (error) {
    return <div className="p-4 text-red-500">Failed to load orders.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border bg-card p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto_auto] md:items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "h-9 w-full justify-start text-left font-normal",
                    !dateRange?.from && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <label htmlFor="orderType" className="text-sm font-medium">
              Order Type
            </label>
            <select
              id="orderType"
              value={orderType}
              onChange={(event) =>
                pushFilters({ nextOrderType: event.target.value })
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">All order types</option>
              {orderTypeOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="payment" className="text-sm font-medium">
              Payment
            </label>
            <select
              id="payment"
              value={payment}
              onChange={(event) =>
                pushFilters({ nextPayment: event.target.value })
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">All payments</option>
              {paymentOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" onClick={() => pushFilters()}>
            Filter
          </Button>
          {hasFilters ? (
            <Button type="button" variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          ) : (
            <Button type="button" variant="outline" disabled>
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>
      </div>
      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{total}</span>{" "}
            orders
          </p>
          {hasFilters && (
            <p className="text-sm text-muted-foreground">
              Filtered by{" "}
              {[
                hasDateFilter
                  ? [startDate, endDate].filter(Boolean).join(" - ")
                  : "",
                getOrderTypeLabel(orderType),
                getPaymentLabel(payment),
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Total (₹)</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Delivery Status</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-6 text-muted-foreground"
                >
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-6 text-muted-foreground"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt!).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{order.userName || "N/A"}</span>
                      <span className="text-xs text-muted-foreground">
                        {order.userNumber}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        order.orderType === "dine_in"
                          ? "bg-purple-100 text-purple-800"
                          : order.orderType === "take_away"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {order.orderType === "dine_in"
                        ? "Dine In"
                        : order.orderType === "take_away"
                          ? "Takeaway"
                          : "Delivery"}
                    </span>
                  </TableCell>
                  <TableCell>{order.tableName || "N/A"}</TableCell>
                  <TableCell className="font-semibold">
                    ₹ {order.totalPricing}
                  </TableCell>
                  <TableCell>
                    <PaymentStatusSelect
                      orderId={order.id}
                      gatewayStatus={order.paymentStatus}
                      initialStatus={
                        (order.status || "pending") as OrderPaymentStatus
                      }
                      onUpdated={mutate}
                    />
                  </TableCell>
                  <TableCell>
                    <DeliveryStatusSelect
                      orderId={order.id}
                      initialStatus={
                        (order.deliveryStatus ||
                          "ordered") as OrderDeliveryStatus
                      }
                      onUpdated={mutate}
                    />
                  </TableCell>
                  <TableCell
                    className="w-[252px] whitespace-break-spaces"
                    title={order.message || ""}
                  >
                    {order.message || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <OrderDialogClient order={order} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Page <span className="font-medium">{page}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                asChild={page > 1}
              >
                {page > 1 ? (
                  <Link href={getPageHref(page - 1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Link>
                ) : (
                  <>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                asChild={page < totalPages}
              >
                {page < totalPages ? (
                  <Link href={getPageHref(page + 1)}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                ) : (
                  <>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
