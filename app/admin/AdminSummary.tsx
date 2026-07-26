import React from "react";
import { getTodayRevenue } from "../actions/dashboard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

const AdminSummary = async () => {
  const todayRevenue = await getTodayRevenue();
  return (
    <div className=" py-6 grid grid-cols-1 md:grid-cols-3 gap-5">
      <AdminSummaryCard
        slug="/admin?filter=paid_online"
        title="Today's Online"
        amount={todayRevenue.paidOnline}
      />
      <AdminSummaryCard
        slug="/admin?filter=paid_cash"
        title="Today's Cash"
        amount={todayRevenue.paidCash}
      />
      <AdminSummaryCard
        slug="/admin?filter=paid_user"
        title="Today's Lending"
        amount={todayRevenue.lendingAmount}
      />
    </div>
  );
};

export default AdminSummary;

function AdminSummaryCard({
  slug,
  title,
  amount,
}: {
  slug: string;
  title: string;
  amount: number;
}) {
  return (
    <Card className=" bg-white">
      <Link prefetch={false} href={slug}>
        <CardHeader className="text-2xl font-bold">{title}</CardHeader>
        <CardContent className="text-lg">₹ {amount} / -</CardContent>
      </Link>
    </Card>
  );
}
