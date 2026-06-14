"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { getRunningOrdersByTable } from "../actions/order";
import { deleteTable } from "../actions/table";
import { OrderDialogClient } from "../orders/OrderDialogClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PenBoxIcon, Trash2, X } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TableOrdersDialogClient({ table }: { table: any }) {
    const [open, setOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const refreshOrders = async () => {
        try {
            const data = await getRunningOrdersByTable(table.id);
            setOrders(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteTable(table.id);
            setDeleteConfirmOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div
                className="w-full h-full relative flex flex-col items-center justify-center group"
            >
                <div className=" flex gap-2 absolute top-2 z-10 left-2">
                    <Button 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteConfirmOpen(true);
                        }}
                        className=" h-8! group-hover:block hidden p-2!">
                        <Trash2 size={18} />
                    </Button>
                    <Link href={`/admin/tables/form?id=${table.id}`}>
                        <Button className=" h-8! group-hover:block hidden p-2!">
                            <PenBoxIcon size={18} />
                        </Button>
                    </Link>
                </div>
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
                        <DialogTitle> Table: {table.name}</DialogTitle>
                        <p className=" font-medium">Total: ₹ {orders.reduce((acc, order) => acc + order.totalPricing, 0)}</p>
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
                                        <TableHead>Items</TableHead>
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
                                                {o.items && o.items.length > 0 ? (
                                                    <ul className="text-xs space-y-1">
                                                        {o.items.map((item: { id: number, quantity: number, dishName: string }) => (
                                                            <li key={item.id}>
                                                                {item.quantity}x {item.dishName}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">No items</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{o.status}</Badge>
                                            </TableCell>
                                            <TableCell>₹ {o.totalPricing}</TableCell>
                                            <TableCell>{new Date(o.createdAt).toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                <OrderDialogClient order={o} onUpdate={refreshOrders} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Table</DialogTitle>
                        <div className="text-sm text-muted-foreground mt-2">
                            Are you sure you want to delete table {table.name}? This action cannot be undone.
                        </div>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
