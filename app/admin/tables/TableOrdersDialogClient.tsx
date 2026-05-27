"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { getRunningOrdersByTable } from "../actions/order";
import { OrderDialogClient } from "../orders/OrderDialogClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function TableOrdersDialogClient({ table }: { table: any }) {
    const [open, setOpen] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleOpen = async () => {
        setOpen(true);
        setLoading(true);
        try {
            const data = await getRunningOrdersByTable(table.id);
            setOrders(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div
                className="w-full h-full relative flex flex-col items-center justify-center group"
            >
                {table.isRunning && <Badge className="absolute top-1 bg-green-700 text-white font-semibold right-1 text-xs z-10 pointer-events-none">Running</Badge>}
                
                <Link href={`/admin/orders/form?tableId=${table.id}`} className="flex-1 flex items-center justify-center w-full hover:underline text-primary font-bold text-2xl z-0">
                    {table.name}
                </Link>

                <div className="pb-2 z-10">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleOpen();
                        }}
                        className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full shadow-md hover:bg-primary/90 transition-colors"
                    >
                        View Orders
                    </button>
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className=" sm:max-w-5xl w-full">
                    <DialogHeader>
                        <DialogTitle>Running Orders for Table: {table.name}</DialogTitle>
                    </DialogHeader>

                    <div className="mt-4">
                        {loading ? (
                            <div className="text-center text-muted-foreground py-8">Loading orders...</div>
                        ) : orders.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">No running orders found for this table.</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((o) => (
                                        <TableRow key={o.id}>
                                            <TableCell className="font-medium">#{o.id}</TableCell>
                                            <TableCell>{o.userName || 'Guest'}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{o.status}</Badge>
                                            </TableCell>
                                            <TableCell>Rs. {o.totalPricing}</TableCell>
                                            <TableCell>{new Date(o.createdAt).toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                <OrderDialogClient order={o} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
