import { getOrders } from "../actions/order";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderDialogClient } from "./OrderDialogClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const limit = 10;

    const { orders, totalPages } = await getOrders(page, limit);

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
                            <TableHead>Total (Rs)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">#{order.id}</TableCell>
                                    <TableCell>{new Date(order.createdAt!).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{order.userName || "N/A"}</span>
                                            <span className="text-xs text-muted-foreground">{order.userNumber}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{order.tableName || "N/A"}</TableCell>
                                    <TableCell className="font-semibold">Rs. {order.totalPricing}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {order.status}
                                        </span>
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
                            Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
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
                            <Button variant="outline" size="sm" disabled={page >= totalPages} asChild={page < totalPages}>
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
