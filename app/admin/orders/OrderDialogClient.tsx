"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { getOrderDetails, updateOrderStatus } from "../actions/order";
import { Eye } from "lucide-react";
import { getImageUrl } from "@/lib/s3";

export function OrderDialogClient({ order }: { order: any }) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        setIsUpdating(true);
        try {
            await updateOrderStatus(order.id, e.target.value as any);
        } catch (err) {
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleOpen = async () => {
        setOpen(true);
        if (items.length === 0) {
            setLoading(true);
            try {
                const details = await getOrderDetails(order.id);
                setItems(details);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <>
            <Button variant="outline" size="sm" onClick={handleOpen}>
                <Eye className="h-4 w-4 mr-2" /> View
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Order Details #{order.id}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                            <span className="font-semibold text-muted-foreground">Customer Name:</span> {order.userName || "N/A"}
                        </div>
                        <div>
                            <span className="font-semibold text-muted-foreground">Phone:</span> {order.userNumber || "N/A"}
                        </div>
                        <div>
                            <span className="font-semibold text-muted-foreground">Table:</span> {order.tableName || "N/A"}
                        </div>
                        <div>
                            <span className="font-semibold text-muted-foreground">Total:</span> Rs. {order.totalPricing}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-muted-foreground">Status:</span> 
                            <select 
                                defaultValue={order.status} 
                                onChange={handleStatusChange}
                                disabled={isUpdating}
                                className="border rounded px-2 py-1 text-sm bg-background"
                            >
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            {isUpdating && <span className="text-xs text-muted-foreground">Updating...</span>}
                        </div>
                        <div>
                            <span className="font-semibold text-muted-foreground">Date:</span> {new Date(order.createdAt).toLocaleString()}
                        </div>
                    </div>

                    <div className="border rounded-md overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground">
                                <tr>
                                    <th className="p-3 font-medium">Image</th>
                                    <th className="p-3 font-medium">Item</th>
                                    <th className="p-3 font-medium">Price</th>
                                    <th className="p-3 font-medium">Qty</th>
                                    <th className="p-3 font-medium text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-6 text-center text-muted-foreground">Loading items...</td>
                                    </tr>
                                ) : items.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-6 text-center text-muted-foreground">No items found for this order.</td>
                                    </tr>
                                ) : (
                                    items.map((item) => (
                                        <tr key={item.id} className="bg-card">
                                            <td className="p-3">
                                                {item.imageUrl ? (
                                                    <img src={getImageUrl(item.imageUrl)} alt={item.dishName} className="w-10 h-10 rounded object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-[10px]">No Img</div>
                                                )}
                                            </td>
                                            <td className="p-3 font-medium">{item.dishName}</td>
                                            <td className="p-3">Rs. {item.pricing}</td>
                                            <td className="p-3">{item.quantity}</td>
                                            <td className="p-3 text-right font-semibold">Rs. {item.pricing * item.quantity}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
