import React from "react";
import { DashboardDuration, getRevenue } from "../actions/dashboard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const summaryTitle: Record<DashboardDuration, string> = {
  day: "Today's",
  week: "This Week's",
  month: "This Month's",
};

const AdminSummary = async ({ duration }: { duration: DashboardDuration }) => {
  const revenue = await getRevenue(duration);

  return (
    <div className=" py-6 grid grid-cols-1 md:grid-cols-3 gap-5">
      <AdminSummaryCard
        title={`${summaryTitle[duration]} Online`}
        amount={revenue.paidOnline}
      />
      <AdminSummaryCard
        title={`${summaryTitle[duration]} Cash`}
        amount={revenue.paidCash}
      />
      <AdminSummaryCard
        title={`${summaryTitle[duration]} Lending`}
        amount={revenue.lendingAmount}
      />
    </div>
  );
};

export default AdminSummary;

function AdminSummaryCard({
  title,
  amount,
}: {
  title: string;
  amount: number;
}) {
  return (
    <Card className=" bg-white gap-1">
      <CardHeader className="">{title}</CardHeader>
      <CardContent className="text-2xl font-semibold">₹ {amount}</CardContent>
    </Card>
  );
}
