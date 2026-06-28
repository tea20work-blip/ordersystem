"use client";

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
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const limit = 10;

  const { data, error, isLoading } = useSWR(
    `/api/orders?page=${page}&limit=${limit}`,
    fetcher,
    {
      refreshInterval: 15 * 1000, // 15 sec
      refreshWhenHidden: false,
      revalidateOnFocus: true,
    },
  );

  const orders = data?.orders || [];
  const totalPages = data?.totalPages || 0;

  if (error) {
    return <div className="p-4 text-red-500">Failed to load orders.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Total (₹)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Delivery Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-6 text-muted-foreground"
                >
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-6 text-muted-foreground"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order: any) => (
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
                  <TableCell>{order.tableName || "N/A"}</TableCell>
                  <TableCell className="font-semibold">
                    ₹ {order.totalPricing}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        [
                          "paid_online",
                          "paid_cash",
                          "paid_user",
                          "completed",
                        ].includes(order.status!)
                          ? "bg-green-100 text-green-800"
                          : order.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DeliveryStatusSelect
                      orderId={order.id}
                      initialStatus={order.deliveryStatus || "ordered"}
                    />
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
                  <Link href={`/admin/orders?page=${page - 1}`}>
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
                  <Link href={`/admin/orders?page=${page + 1}`}>
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
