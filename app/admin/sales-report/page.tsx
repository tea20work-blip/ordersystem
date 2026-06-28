import React from "react";
import db from "@/db";
import { dailySalesSummary } from "@/db/schema";
import Link from "next/link";
import { and, gte, lte, desc } from "drizzle-orm";
import { DateFilter } from "./date-filter";

export const dynamic = "force-dynamic";

const SalesReportPage = async (props: { searchParams?: Promise<{ startDate?: string; endDate?: string }> }) => {
  const searchParams = await props.searchParams;
  const startDate = searchParams?.startDate;
  const endDate = searchParams?.endDate;

  const conditions = [];
  if (startDate) {
    conditions.push(gte(dailySalesSummary.date, startDate));
  }
  if (endDate) {
    conditions.push(lte(dailySalesSummary.date, endDate));
  }

  const data = await db.select()
    .from(dailySalesSummary)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(dailySalesSummary.date));

  const totals = data.reduce(
    (acc, row) => {
      acc.totalOrders += row.totalOrders || 0;
      acc.completedOrders += row.completedOrders || 0;
      acc.cancelledOrders += row.cancelledOrders || 0;
      acc.grossRevenue += row.grossRevenue || 0;
      acc.cashRevenue += row.cashRevenue || 0;
      acc.onlineRevenue += row.onlineRevenue || 0;
      acc.lendingTotal += row.lendingTotal || 0;
      return acc;
    },
    {
      totalOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      grossRevenue: 0,
      cashRevenue: 0,
      onlineRevenue: 0,
      lendingTotal: 0,
    }
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Sales Report</h1>
      
      <DateFilter startDate={startDate} endDate={endDate} />

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
              <tr
                key={row.id}
                className="bg-white border-b hover:bg-gray-50"
              >
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  <Link
                    href={`/admin/sales-report/${row.date}`}
                    className="text-blue-600 hover:underline"
                  >
                    {row.date as unknown as string}
                  </Link>
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
          {data.length > 0 && (
            <tfoot className="bg-gray-50 font-bold text-gray-900 border-t-2 border-gray-200">
              <tr>
                <td className="px-6 py-4 uppercase">Total</td>
                <td className="px-6 py-4">{totals.totalOrders}</td>
                <td className="px-6 py-4">{totals.completedOrders}</td>
                <td className="px-6 py-4">{totals.cancelledOrders}</td>
                <td className="px-6 py-4">₹{totals.grossRevenue}</td>
                <td className="px-6 py-4">₹{totals.cashRevenue}</td>
                <td className="px-6 py-4">₹{totals.onlineRevenue}</td>
                <td className="px-6 py-4">₹{totals.lendingTotal}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default SalesReportPage;
