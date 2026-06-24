import React from 'react'
import db from '@/db'
import { order } from '@/db/schema'
import { sql } from 'drizzle-orm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type Props = {
    params: Promise<{ date: string }>;
}

const SalesReportDatePage = async ({ params }: Props) => {
    const { date } = await params;

    const orders = await db.select().from(order).where(
        sql`DATE(${order.createdAt}) = ${date}::date`
    );

    return (
        <div className="p-6">
            <div className="flex flex-col gap-12 mb-6">
                <Link href="/admin/sales-report" className=" flex gap-2 items-center text-blue-600 hover:underline mr-4">
                    <ArrowLeft size={18} /> Back to Sales Report
                </Link>
                <h1 className="text-2xl font-bold">Orders for {date}</h1>
            </div>

            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Order ID</th>
                            <th className="px-6 py-3">Table ID</th>
                            <th className="px-6 py-3">Total Pricing</th>
                            <th className="px-6 py-3">Paid Online</th>
                            <th className="px-6 py-3">Paid Cash</th>
                            <th className="px-6 py-3">Lending Amount</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((o) => (
                            <tr key={o.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">#{o.id}</td>
                                <td className="px-6 py-4">{o.tableId || 'N/A'}</td>
                                <td className="px-6 py-4">₹{o.totalPricing}</td>
                                <td className="px-6 py-4">₹{o.paidOnline}</td>
                                <td className="px-6 py-4">₹{o.paidCash}</td>
                                <td className="px-6 py-4">₹{o.lendingAmount}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold
                                        ${o.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            o.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'}`}>
                                        {o.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {o.createdAt ? new Date(o.createdAt).toLocaleTimeString() : 'N/A'}
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                    No orders found for this date.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default SalesReportDatePage
