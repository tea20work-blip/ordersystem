"use client";

import { useState } from "react";
import { updateOrderStatus, type OrderPaymentStatus } from "../actions/order";

const paymentStatuses: { label: string; value: OrderPaymentStatus }[] = [
    { label: "Pending", value: "pending" },
    { label: "Mix", value: "completed" },
    { label: "Paid Online", value: "paid_online" },
    { label: "Paid Cash", value: "paid_cash" },
    { label: "Paid User", value: "paid_user" },
    { label: "Cancelled", value: "cancelled" },
];

export function PaymentStatusSelect({
    orderId,
    initialStatus,
    onUpdated,
    gatewayStatus,
}: {
    orderId: number;
    initialStatus: OrderPaymentStatus;
    onUpdated?: () => void;
    gatewayStatus?: 'pending' | 'paid' | null;
}) {
    const [status, setStatus] = useState<OrderPaymentStatus>(initialStatus || "pending");
    const [loading, setLoading] = useState(false);

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as OrderPaymentStatus;
        setStatus(newStatus);
        setLoading(true);
        try {
            await updateOrderStatus(orderId, newStatus);
            onUpdated?.();
        } catch (error) {
            console.error(error);
            setStatus(initialStatus || "pending");
        } finally {
            setLoading(false);
        }
    };

    let colorClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (["paid_online", "paid_cash", "paid_user", "completed"].includes(status)) {
        colorClass = "bg-green-100 text-green-800 border-green-200";
    } else if (status === "cancelled") {
        colorClass = "bg-red-100 text-red-800 border-red-200";
    }

    if (gatewayStatus) return <span className={`px-2 py-1 rounded-full text-xs font-medium ${gatewayStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{gatewayStatus === 'paid' ? 'Paid Online' : 'Payment Pending'}</span>;

    return (
        <select
            value={status}
            onChange={handleChange}
            disabled={loading}
            className={`px-2 py-1 rounded-full text-xs font-medium border outline-none appearance-none cursor-pointer ${colorClass} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            style={{ WebkitAppearance: "none", MozAppearance: "none" }}
        >
            {paymentStatuses.map((item) => (
                <option key={item.value} value={item.value} className="bg-background text-foreground">
                    {item.label}
                </option>
            ))}
        </select>
    );
}
