import { notFound } from "next/navigation";
import { getUserById, getUserOrders } from "../../actions/user";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PayLendingDialog } from "./pay-lending-dialog";
import { ArrowLeft } from "lucide-react";
import { OrderDialogClient } from "../../orders/OrderDialogClient";

export default async function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
        return notFound();
    }

    const user = await getUserById(userId);
    if (!user) {
        return notFound();
    }

    const orders = await getUserOrders(userId);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <Link href="/admin/user" className="text-sm flex gap-1 justify-center items-center hover:underline">
                    <ArrowLeft size={16} /> Back to Users
                </Link>
                <div className=" text-right flex items-end flex-col">
                    <h1 className="text-2xl font-bold">{user.name || "Unknown User"}</h1>
                    <p className="text-gray-500 mt-1">{user.number || "No number provided"}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">User Information</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{user.email || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Lending Amount</p>
                        <div className="flex gap-4 items-center">
                            <p className="font-medium text-red-600">₹{user.lendingAmount}</p>
                            <PayLendingDialog userId={userId} currentLendingAmount={user.lendingAmount || 0} />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Email Verified</p>
                        <p className="font-medium">{user.isEmailVerified ? "Yes" : "No"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Number Verified</p>
                        <p className="font-medium">{user.isNumberVerified ? "Yes" : "No"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Joined</p>
                        <p className="font-medium">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Order History</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.tableName || "Takeaway"}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <Badge variant={order.status === "paid_user" ? "destructive" : "secondary"}>{order.status}</Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{order.totalPricing}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <OrderDialogClient order={order} />
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No orders found for this user.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
