import React from 'react'
import db from '@/db'
import { dailySalesSummary } from '@/db/schema'
import Link from 'next/link'

const SalesReportPage = async () => {
    const data = await db.select().from(dailySalesSummary);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Sales Report</h1>
            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Total Orders</th>
                            <th className="px-6 py-3">Completed</th>
                            <th className="px-6 py-3">Cancelled</th>
                            <th className="px-6 py-3">Gross Revenue</th>
                            <th className="px-6 py-3">Cash Revenue</th>
                            <th className="px-6 py-3">Online Revenue</th>
                            <th className="px-6 py-3">Lending Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => (
                            <tr key={row.id} className="bg-white border-b hover:bg-gray-50 relative group">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    {/* Making the whole row clickable using an overlaid absolute link */}
                                    <Link href={`/admin/sales-report/${row.date}`} className="absolute inset-0"></Link>
                                    {row.date as unknown as string}
                                </td>
                                <td className="px-6 py-4">{row.totalOrders}</td>
                                <td className="px-6 py-4">{row.completedOrders}</td>
                                <td className="px-6 py-4">{row.cancelledOrders}</td>
                                <td className="px-6 py-4">₹{row.grossRevenue}</td>
                                <td className="px-6 py-4">₹{row.cashRevenue}</td>
                                <td className="px-6 py-4">₹{row.onlineRevenue}</td>
                                <td className="px-6 py-4">₹{row.lendingTotal}</td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                    No sales reports found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default SalesReportPage