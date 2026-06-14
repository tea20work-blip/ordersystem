"use client";

import { useState } from "react";
import { updateDeliveryStatus } from "../actions/order";

export function DeliveryStatusSelect({ orderId, initialStatus }: { orderId: number, initialStatus: string }) {
    const [status, setStatus] = useState(initialStatus || 'ordered');
    const [loading, setLoading] = useState(false);

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        setLoading(true);
        try {
            await updateDeliveryStatus(orderId, newStatus as any);
        } catch (error) {
            console.error(error);
            setStatus(initialStatus || 'ordered'); // Revert on error
        } finally {
            setLoading(false);
        }
    };

    let colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (status === 'delivered') colorClass = 'bg-green-100 text-green-800 border-green-200';
    else if (status === 'ready') colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
    else if (status === 'ordered') colorClass = 'bg-blue-100 text-blue-800 border-blue-200';

    return (
        <select
            value={status}
            onChange={handleChange}
            disabled={loading}
            className={`px-2 py-1 rounded-full text-xs font-medium border outline-none appearance-none cursor-pointer ${colorClass} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
        >
            <option value="ordered" className="bg-background text-foreground">ordered</option>
            <option value="ready" className="bg-background text-foreground">ready</option>
            <option value="delivered" className="bg-background text-foreground">delivered</option>
        </select>
    );
}
