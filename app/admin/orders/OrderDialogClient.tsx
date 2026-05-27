"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { getOrderDetails, updateOrderAdvanced } from "../actions/order";
import { getUsers } from "../actions/user";
import { Eye } from "lucide-react";
import { getImageUrl } from "@/lib/s3";

export function OrderDialogClient({ order, onUpdate }: { order: any, onUpdate?: () => void }) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const [status, setStatus] = useState<string>(order.status);
    const [isRunning, setIsRunning] = useState<boolean>(order.isRunning);
    const [lendingUserId, setLendingUserId] = useState<string>(order.lendingUserId ? order.lendingUserId.toString() : "");
    const [paidOnline, setPaidOnline] = useState<number>(order.paidOnline || 0);
    const [paidCash, setPaidCash] = useState<number>(order.paidCash || 0);
    const [users, setUsers] = useState<any[]>([]);

    const calculatedLendingAmount = Math.max(0, order.totalPricing - (paidOnline || 0) - (paidCash || 0));

    const isAlreadyPaid = ['paid_online', 'paid_cash', 'paid_user', 'completed'].includes(order.status);

    const handleSave = async () => {
        setIsUpdating(true);
        try {
            await updateOrderAdvanced(order.id, {
                status: status as any,
                isRunning,
                lendingUserId: lendingUserId ? parseInt(lendingUserId) : null,
                totalPricing: order.totalPricing,
                paidOnline,
                paidCash,
                lendingAmount: status === 'completed' ? calculatedLendingAmount : undefined,
            });
            setOpen(false);
            if (onUpdate) onUpdate();
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
        if (users.length === 0) {
            getUsers().then(setUsers).catch(console.error);
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
                        <div className="flex flex-col gap-3 col-span-2 border p-3 rounded bg-muted/30">
                            {isAlreadyPaid ? (
                                <div className="text-sm text-green-600 font-medium py-2">
                                    This order has been marked as paid ({order.status}) and cannot be modified further.
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4">
                                        <span className="font-semibold text-muted-foreground w-20">Status:</span>
                                        <select
                                            value={status}
                                            onChange={(e) => {
                                                setStatus(e.target.value);
                                                if (['paid_online', 'paid_cash', 'paid_user', 'completed'].includes(e.target.value)) {
                                                    setIsRunning(false);
                                                }
                                            }}
                                            className="border rounded px-2 py-1 text-sm bg-background flex-1"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="completed">Mix</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="paid_online">Paid Online</option>
                                            <option value="paid_cash">Paid Cash</option>
                                            <option value="paid_user">Paid User (Lending)</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="font-semibold text-muted-foreground w-20">Running:</span>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={isRunning}
                                                onChange={(e) => setIsRunning(e.target.checked)}
                                                disabled={['paid_online', 'paid_cash', 'paid_user'].includes(status)}
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
                                            />
                                            <span className="text-xs text-muted-foreground ml-2">Is the order currently active?</span>
                                        </div>
                                    </div>

                                    {status === 'paid_user' && (
                                        <div className="flex items-center gap-4">
                                            <span className="font-semibold text-muted-foreground w-20">Select User:</span>
                                            <select
                                                value={lendingUserId}
                                                onChange={(e) => setLendingUserId(e.target.value)}
                                                className="border rounded px-2 py-1 text-sm bg-background flex-1"
                                            >
                                                <option value="">-- Select a User --</option>
                                                {users.map(u => (
                                                    <option key={u.id} value={u.id}>{u.name || 'Unknown'} ({u.number})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {status === 'completed' && (
                                        <div className="flex flex-col gap-3 mt-2 border-t pt-3">
                                            <div className="flex items-center gap-4">
                                                <span className="font-semibold text-muted-foreground w-32">Paid Online:</span>
                                                <input
                                                    type="number"
                                                    value={paidOnline}
                                                    onChange={(e) => setPaidOnline(Number(e.target.value))}
                                                    className="border rounded px-2 py-1 text-sm bg-background flex-1"
                                                />
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-semibold text-muted-foreground w-32">Paid Cash:</span>
                                                <input
                                                    type="number"
                                                    value={paidCash}
                                                    onChange={(e) => setPaidCash(Number(e.target.value))}
                                                    className="border rounded px-2 py-1 text-sm bg-background flex-1"
                                                />
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-semibold text-muted-foreground w-32">Lending Amount:</span>
                                                <span className="font-semibold">Rs. {calculatedLendingAmount}</span>
                                            </div>

                                            {calculatedLendingAmount > 0 && (
                                                <div className="flex items-center gap-4">
                                                    <span className="font-semibold text-muted-foreground w-32 text-red-500">Select User (Req):</span>
                                                    <select
                                                        value={lendingUserId}
                                                        onChange={(e) => setLendingUserId(e.target.value)}
                                                        className="border rounded px-2 py-1 text-sm bg-background flex-1 border-red-300"
                                                    >
                                                        <option value="">-- Select a User --</option>
                                                        {users.map(u => (
                                                            <option key={u.id} value={u.id}>{u.name || 'Unknown'} ({u.number})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-2 flex justify-end">
                                        <Button onClick={handleSave} disabled={isUpdating || (status === 'paid_user' && !lendingUserId) || (status === 'completed' && calculatedLendingAmount > 0 && !lendingUserId)} size="sm">
                                            {isUpdating ? "Saving..." : "Save Order Settings"}
                                        </Button>
                                    </div>
                                </>
                            )}
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
                                            <td className="p-3 font-medium">{item.dishName} {item?.options?.map((option: any) => `(${option.name})`).join(", ")}</td>
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
