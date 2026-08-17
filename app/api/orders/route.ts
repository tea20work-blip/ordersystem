import { NextRequest, NextResponse } from "next/server";
import {
    getOrders,
    type AdminOrderType,
    type OrderPaymentStatus,
} from "@/app/admin/actions/order";

const orderTypes: AdminOrderType[] = ["dine_in", "take_away", "delivery"];
const paymentStatuses: OrderPaymentStatus[] = [
    "pending",
    "completed",
    "cancelled",
    "paid_online",
    "paid_cash",
    "paid_user",
];

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const orderType = searchParams.get("orderType");
    const payment = searchParams.get("payment");

    try {
        const { orders, totalPages, total } = await getOrders(page, limit, {
            startDate,
            endDate,
            orderType: orderTypes.includes(orderType as AdminOrderType)
                ? (orderType as AdminOrderType)
                : undefined,
            payment: paymentStatuses.includes(payment as OrderPaymentStatus)
                ? (payment as OrderPaymentStatus)
                : undefined,
        });
        return NextResponse.json({ orders, totalPages, total });
    } catch {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}
