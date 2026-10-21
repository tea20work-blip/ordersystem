"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { getOrderDetails, updateOrderAdvanced, updateOrderItemsList, type getOrders, type OrderPaymentStatus } from "../actions/order";
import { getUsers, createUser } from "../actions/user";
import { getTables } from "../actions/table";
import { getDishes } from "../actions/dish";
import { getCegrates } from "../actions/cegrate";
import { Eye, Plus, Minus, Trash2, Search } from "lucide-react";
import { getImageUrl } from "@/lib/s3";
import { z } from "zod";
import { userDetailsSchema } from "@/zod/userDetailsSchema";
import Image from "next/image";
import { toast } from "sonner";

type OrderRow = Awaited<ReturnType<typeof getOrders>>['orders'][number];
type DialogOrder = Pick<OrderRow, 'id' | 'totalPricing' | 'status'> & Partial<Omit<OrderRow, 'id' | 'totalPricing' | 'status' | 'createdAt'>> & { createdAt: string | Date | null };
type EditableItem = Parameters<typeof updateOrderItemsList>[1][number];

export function OrderDialogClient({ order, onUpdate }: { order: DialogOrder, onUpdate?: () => void }) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<EditableItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const [status, setStatus] = useState<OrderPaymentStatus>(order.status || "pending");
    const [isRunning, setIsRunning] = useState<boolean>(order.isRunning ?? true);
    const [lendingUserId, setLendingUserId] = useState<string>(order.lendingUserId ? order.lendingUserId.toString() : "");
    const [paidOnline, setPaidOnline] = useState<number>(order.paidOnline || 0);
    const [paidCash, setPaidCash] = useState<number>(order.paidCash || 0);
    const [users, setUsers] = useState<Awaited<ReturnType<typeof getUsers>>>([]);
    const [tables, setTables] = useState<Awaited<ReturnType<typeof getTables>>>([]);
    const [selectedTableId, setSelectedTableId] = useState<string>(order.tableId ? order.tableId.toString() : "");

    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [newUserName, setNewUserName] = useState("");
    const [newUserNumber, setNewUserNumber] = useState("");
    const [createUserErrors, setCreateUserErrors] = useState<{ name?: string, mobile?: string }>({});

    const [isAddingItem, setIsAddingItem] = useState(false);
    const [dishes, setDishes] = useState<Awaited<ReturnType<typeof getDishes>>>([]);
    const [cegrates, setCegrates] = useState<Awaited<ReturnType<typeof getCegrates>>>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const calculatedTotalPricing = items.reduce((acc, item) => acc + (item.pricing * item.quantity), 0);
    const calculatedLendingAmount = Math.max(0, calculatedTotalPricing - (paidOnline || 0) - (paidCash || 0));

    const isGatewayOrder = !!order.paymentStatus;
    const isAlreadyPaid = isGatewayOrder || ['paid_online', 'paid_cash', 'paid_user', 'completed'].includes(order.status || 'pending');
    const handleCreateUser = async () => {
        setCreateUserErrors({});
        const schemaToUse = z.object({
            name: userDetailsSchema.shape.name,
            mobile: newUserNumber.trim() === "" ? z.string().optional() : userDetailsSchema.shape.mobile,
        });

        const validation = schemaToUse.safeParse({
            name: newUserName,
            mobile: newUserNumber.trim() === "" ? undefined : newUserNumber,
        });

        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            setCreateUserErrors({
                name: errors.name?.[0],
                mobile: errors.mobile?.[0],
            });
            return;
        }

        setIsUpdating(true);
        try {
            const u = await createUser({ name: newUserName, number: newUserNumber });
            setUsers(prev => [...prev, u]);
            setLendingUserId(u.id.toString());
            setIsCreatingUser(false);
            setNewUserName("");
            setNewUserNumber("");
        } catch (err) {
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSave = async () => {
        setIsUpdating(true);
        try {
            if (!isGatewayOrder) await updateOrderItemsList(order.id, items);

            await updateOrderAdvanced(order.id, {
                status,
                isRunning,
                lendingUserId: lendingUserId ? parseInt(lendingUserId) : null,
                totalPricing: calculatedTotalPricing,
                paidOnline,
                paidCash,
                lendingAmount: status === 'completed' ? calculatedLendingAmount : undefined,
                tableId: selectedTableId ? parseInt(selectedTableId) : null,
            });
            setOpen(false);
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error(err);
            toast.error(err instanceof Error ? err.message : 'Unable to update order');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleOpen = async () => {
        setOpen(true);
        // Reset state back to initial order prop values in case of discarded changes
        setStatus(order.status || "pending");
        setIsRunning(order.isRunning ?? true);
        setLendingUserId(order.lendingUserId ? order.lendingUserId.toString() : "");
        setPaidOnline(order.paidOnline || 0);
        setPaidCash(order.paidCash || 0);
        setSelectedTableId(order.tableId ? order.tableId.toString() : "");
        setIsAddingItem(false);
        setSearchQuery("");

        setLoading(true);
        try {
            const details = await getOrderDetails(order.id);
            setItems(details.map(item => ({ ...item, dishId: item.dishId ?? undefined, cegrateId: item.cegrateId ?? undefined, imageUrl: item.imageUrl ?? undefined, options: (item.options ?? []).filter((option): option is Record<string, unknown> => !!option && typeof option === 'object' && !Array.isArray(option)) })));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
        if (users.length === 0) {
            getUsers().then(setUsers).catch(console.error);
        }
        if (tables.length === 0) {
            getTables().then(setTables).catch(console.error);
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
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-muted-foreground">Table:</span>
                            {isAlreadyPaid ? (
                                <span>{order.tableName || "N/A"}</span>
                            ) : (
                                <select
                                    value={selectedTableId}
                                    onChange={(e) => setSelectedTableId(e.target.value)}
                                    className="border rounded px-2 py-1 text-sm bg-background flex-1"
                                >
                                    <option value="">-- No Table --</option>
                                    {tables.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                    {/* Include current table if it's not in the fetched list somehow */}
                                    {order.tableId && !tables.find(t => t.id === order.tableId) && (
                                        <option value={order.tableId}>{order.tableName}</option>
                                    )}
                                </select>
                            )}
                        </div>
                        <div>
                            <span className="font-semibold text-muted-foreground">Total:</span> ₹ {calculatedTotalPricing}
                        </div>
                        <div className="flex flex-col gap-3 col-span-2 border p-3 rounded bg-muted/30">
                            {isAlreadyPaid ? (
                                <div className="text-sm text-green-600 font-medium py-2">
                                    {isGatewayOrder ? `Razorpay payment: ${order.paymentStatus}. Items and payment totals are managed automatically.` : `This order has been marked as paid (${order.status}) and cannot be modified further.`}
                                    {isGatewayOrder && <div className="flex items-center gap-3 mt-3 text-foreground">
                                        <label className="flex items-center gap-2"><input type="checkbox" checked={isRunning} onChange={event => setIsRunning(event.target.checked)} />Order is active</label>
                                        <Button size="sm" onClick={handleSave} disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save fulfillment settings'}</Button>
                                    </div>}
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4">
                                        <span className="font-semibold text-muted-foreground w-20">Status:</span>
                                        <select
                                            value={status}
                                            onChange={(e) => {
                                                setStatus(e.target.value as OrderPaymentStatus);
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
                                        <div className="flex flex-col gap-2">
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
                                                <Button variant="outline" size="sm" onClick={() => setIsCreatingUser(!isCreatingUser)}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            {isCreatingUser && (
                                                <div className="flex flex-col gap-2 mt-2 p-3 border rounded bg-muted/20">
                                                    <div className="text-sm font-semibold">Create New User</div>
                                                    <div className="flex gap-2">
                                                        <div className="flex-1 flex flex-col gap-1">
                                                            <input type="text" placeholder="Name" value={newUserName} onChange={e => setNewUserName(e.target.value)} className={`border rounded px-2 py-1 text-sm bg-background ${createUserErrors.name ? 'border-red-500' : ''}`} />
                                                            {createUserErrors.name && <span className="text-xs text-red-500">{createUserErrors.name}</span>}
                                                        </div>
                                                        <div className="flex-1 flex flex-col gap-1">
                                                            <input type="text" placeholder="Phone (Optional)" value={newUserNumber} onChange={e => setNewUserNumber(e.target.value)} className={`border rounded px-2 py-1 text-sm bg-background ${createUserErrors.mobile ? 'border-red-500' : ''}`} />
                                                            {createUserErrors.mobile && <span className="text-xs text-red-500">{createUserErrors.mobile}</span>}
                                                        </div>
                                                        <div className="flex items-start">
                                                            <Button size="sm" onClick={handleCreateUser} disabled={isUpdating}>Save</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
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
                                                <span className="font-semibold">₹ {calculatedLendingAmount}</span>
                                            </div>

                                            {calculatedLendingAmount > 0 && (
                                                <div className="flex flex-col gap-2 mt-2">
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-semibold w-32 text-red-500">Select User (Req):</span>
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
                                                        <Button variant="outline" size="sm" onClick={() => setIsCreatingUser(!isCreatingUser)}>
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    {isCreatingUser && (
                                                        <div className="flex flex-col gap-2 p-3 border rounded bg-muted/20">
                                                            <div className="text-sm font-semibold">Create New User</div>
                                                            <div className="flex gap-2 flex-col">
                                                                <div className="flex flex-col gap-1">
                                                                    <input type="text" placeholder="Name" value={newUserName} onChange={e => setNewUserName(e.target.value)} className={`border rounded px-2 py-1 text-sm bg-background ${createUserErrors.name ? 'border-red-500' : ''}`} />
                                                                    {createUserErrors.name && <span className="text-xs text-red-500">{createUserErrors.name}</span>}
                                                                </div>
                                                                <div className="flex flex-col gap-1">
                                                                    <input type="text" placeholder="Phone (Optional)" value={newUserNumber} onChange={e => setNewUserNumber(e.target.value)} className={`border rounded px-2 py-1 text-sm bg-background ${createUserErrors.mobile ? 'border-red-500' : ''}`} />
                                                                    {createUserErrors.mobile && <span className="text-xs text-red-500">{createUserErrors.mobile}</span>}
                                                                </div>
                                                                <Button size="sm" onClick={handleCreateUser} disabled={isUpdating}>Save</Button>
                                                            </div>
                                                        </div>
                                                    )}
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
                            <span className="font-semibold text-muted-foreground">Date:</span> {new Date(order.createdAt || Date.now()).toLocaleString()}
                        </div>
                    </div>

                    <div className="border max-h-[50vh] overflow-y-auto rounded-md">
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
                                    items.map((item, idx) => (
                                        <tr key={item.id} className="bg-card">
                                            <td className="p-3">
                                                {item.imageUrl ? (
                                                    <Image width={40} height={40} src={getImageUrl(item.imageUrl)} alt={item.dishName} className="w-10 h-10 rounded object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-[10px]">No Img</div>
                                                )}
                                            </td>
                                            <td className="p-3 font-medium">{item.dishName} {item?.options?.map((option) => `(${option.name})`).join(", ")}</td>
                                            <td className="p-3">₹ {item.pricing}</td>
                                            <td className="p-3">
                                                {isAlreadyPaid ? (
                                                    item.quantity
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => {
                                                            setItems(prev => prev.map((i, index) => index === idx ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i));
                                                        }}>
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="w-4 text-center">{item.quantity}</span>
                                                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => {
                                                            setItems(prev => prev.map((i, index) => index === idx ? { ...i, quantity: i.quantity + 1 } : i));
                                                        }}>
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3 text-right font-semibold">
                                                <div className="flex items-center justify-end gap-3">
                                                    ₹ {item.pricing * item.quantity}
                                                    {!isAlreadyPaid && (
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => {
                                                            setItems(prev => prev.filter((_, index) => index !== idx));
                                                        }}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!isAlreadyPaid && (
                        <div className="mt-4 border-t pt-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold">Add Items</h3>
                                <Button size="sm" variant="outline" onClick={() => {
                                    setIsAddingItem(!isAddingItem);
                                    if (!isAddingItem && dishes.length === 0) {
                                        getDishes().then(setDishes).catch(console.error);
                                        getCegrates().then(setCegrates).catch(console.error);
                                    }
                                }}>
                                    {isAddingItem ? "Close" : "Browse Menu"}
                                </Button>
                            </div>
                            
                            {isAddingItem && (
                                <div className="space-y-4 border p-3 rounded-md bg-muted/20">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search dishes or cigarettes..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="w-full border rounded-md pl-8 pr-3 py-2 text-sm bg-background"
                                        />
                                    </div>
                                    <div className="max-h-48 overflow-y-auto space-y-2">
                                        {dishes.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())).map(dish => (
                                            <div key={`d-${dish.id}`} className="flex items-center justify-between p-2 bg-background border rounded text-sm">
                                                <div>
                                                    <span className="font-medium">{dish.name}</span> <span className="text-muted-foreground text-xs">₹{dish.price}</span>
                                                </div>
                                                <Button size="sm" variant="secondary" onClick={() => {
                                                    setItems(prev => {
                                                        const exists = prev.find(i => i.dishId === dish.id);
                                                        if (exists) {
                                                            return prev.map(i => i.id === exists.id ? { ...i, quantity: i.quantity + 1 } : i);
                                                        }
                                                        return [...prev, { id: Math.random(), dishId: dish.id, dishName: dish.name, pricing: dish.price, quantity: 1, imageUrl: dish.imageUrl ?? undefined, options: [] }];
                                                    });
                                                }}>Add</Button>
                                            </div>
                                        ))}
                                        {cegrates.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(ceg => (
                                            <div key={`c-${ceg.id}`} className="flex items-center justify-between p-2 bg-background border rounded text-sm">
                                                <div>
                                                    <span className="font-medium">{ceg.name}</span> <span className="text-muted-foreground text-xs">₹{ceg.amount} (Cigarette)</span>
                                                </div>
                                                <Button size="sm" variant="secondary" onClick={() => {
                                                    setItems(prev => {
                                                        const exists = prev.find(i => i.cegrateId === ceg.id);
                                                        if (exists) {
                                                            return prev.map(i => i.id === exists.id ? { ...i, quantity: i.quantity + 1 } : i);
                                                        }
                                                        return [...prev, { id: Math.random(), cegrateId: ceg.id, dishName: ceg.name, pricing: ceg.amount, quantity: 1, options: [] }];
                                                    });
                                                }}>Add</Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
