"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  fetchOrdersByMobileAction,
  fetchOrdersByOrderIdAction,
} from "./actions";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/header";
import { useRouter, useSearchParams } from "next/navigation";

export function OrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  var orderId = searchParams.get("orderId");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const downloadBill = (order: any) => {
    import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [160, 200],
      });

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Tea 20 cafe", 80, 10, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Gyan Vihar Marg, Jaipur, Raj.", 80, 15, { align: "center" });

      doc.text(
        "--------------------------------------------------------------------------------------------------------------------------------",
        80,
        20,
        { align: "center" },
      );
      doc.text("RECEIPT", 80, 25, { align: "center" });
      doc.text(
        "--------------------------------------------------------------------------------------------------------------------------------",
        80,
        30,
        { align: "center" },
      );

      doc.text(`Name: ${order.customerName || "Customer"}`, 5, 35);
      doc.text(`Invoice No: ${order.id}`, 155, 35, { align: "right" });

      doc.text(`Table: ${order.tableNumber || "N/A"}`, 5, 40);
      const date = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString()
        : new Date().toLocaleDateString();
      doc.text(`Date: ${date}`, 155, 40, { align: "right" });

      doc.text(
        "--------------------------------------------------------------------------------------------------------------------------------",
        80,
        45,
        { align: "center" },
      );

      doc.setFont("helvetica", "bold");
      doc.text("Item", 5, 50);
      doc.text("Price", 115, 50, { align: "right" });
      doc.text("Qty", 125, 50, { align: "center" });
      doc.text("Total", 155, 50, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.text(
        "--------------------------------------------------------------------------------------------------------------------------------",
        80,
        55,
        { align: "center" },
      );

      let y = 60;
      order.items?.forEach((item: any) => {
        let itemName = item.dishName;
        if (item.options && item.options.length > 0) {
          itemName += ` (${item.options.map((o: any) => o.name).join(", ")})`;
        }

        const splitTitle = doc.splitTextToSize(itemName, 35);
        for (let i = 0; i < splitTitle.length; i++) {
          doc.text(splitTitle[i], 5, y);
          if (i === 0) {
            doc.text(`Rs. ${item.pricing}`, 115, y, { align: "right" });
            doc.text(`${item.quantity}`, 125, y, { align: "center" });
            doc.text(`Rs. ${item.pricing * item.quantity}`, 155, y, {
              align: "right",
            });
          }
          y += 5;
        }
      });

      doc.text(
        "--------------------------------------------------------------------------------------------------------------------------------",
        80,
        y,
        { align: "center" },
      );
      y += 5;

      doc.text("Sub-Total:", 115, y, { align: "right" });
      doc.text(`Rs. ${order.totalPricing}`, 155, y, { align: "right" });
      y += 5;

      doc.text("CGST:", 115, y, { align: "right" });
      doc.text("0% Rs. 0", 155, y, { align: "right" });
      y += 5;

      doc.text("SGST:", 115, y, { align: "right" });
      doc.text("0% Rs. 0", 155, y, { align: "right" });
      y += 5;

      doc.text("---------------------------", 155, y, { align: "right" });
      y += 5;

      doc.text(`Mode: ${order.paymentMethod || "Cash"}`, 5, y);
      doc.setFont("helvetica", "bold");
      doc.text(`Total: Rs. ${order.totalPricing}`, 155, y, { align: "right" });
      doc.setFont("helvetica", "normal");

      y += 10;
      doc.text(
        "--------------------------------------------------------------------------------------------------------------------------------",
        80,
        y,
        { align: "center" },
      );
      y += 5;
      doc.text("**SAVE PAPER SAVE NATURE !!**", 80, y, { align: "center" });
      y += 5;

      doc.save(`bill-${order.id}.pdf`);
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    orderId = null;
    e.preventDefault();
    if (!mobile) return;
    setLoading(true);
    setError("");

    const res = orderId
      ? await fetchOrdersByOrderIdAction(Number(orderId))
      : await fetchOrdersByMobileAction(mobile);
    if (res?.success) {
      setOrders(res.data || []);
      setSearched(true);
    } else {
      setError(res?.message || "Something went wrong.");
      setOrders([]);
      setSearched(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    async function getOrders() {
      if (orderId) {
        setLoading(true);
        setError("");
        const res = await fetchOrdersByOrderIdAction(Number(orderId));
        if (res?.success) {
          setOrders(res.data || []);
          setSearched(true);
        } else {
          setError(res?.message || "Something went wrong.");
          setOrders([]);
          setSearched(true);
        }
        setLoading(false);
      }
    }
    getOrders();
  }, [orderId]);

  return (
    <div className=" px-4 pb-12">
      <h1 className="text-2xl font-bold mb-6 mt-6">Find Your Orders</h1>
      <form onSubmit={handleSearch} className="flex gap-4 mb-8">
        <Input
          type="tel"
          placeholder="Enter your mobile number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="max-w-xs"
          required
        />
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Search
        </Button>
      </form>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {searched && orders.length === 0 && !error && (
        <div className="text-gray-500">
          No orders found for this mobile number.
        </div>
      )}

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Order #{order.id}</CardTitle>
                <div className="text-sm text-gray-500">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : ""}
                </div>
              </div>
              <CardDescription className="flex justify-between items-center mt-2">
                <div>
                  Status:{" "}
                  <span className="font-semibold uppercase">
                    {order.deliveryStatus}
                  </span>
                  {order.tableCode && ` • Table: ${order.tableCode}`}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadBill(order)}
                >
                  Download Bill
                </Button>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Items</h4>
                  {order.items && order.items.length > 0 ? (
                    <ul className="space-y-2">
                      {order.items.map(
                        (item: {
                          id: number;
                          quantity: number;
                          dishName: string;
                          pricing: number;
                          options: { name: string; price: number }[];
                        }) => (
                          <li
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.quantity}x {item.dishName}{" "}
                              {item?.options
                                ?.map((option: any) => `(${option.name})`)
                                .join(", ")}{" "}
                            </span>
                            <span>₹{item.pricing}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No items found.</p>
                  )}
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{order.totalPricing}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
