import React from 'react'
import { getTodayRevenue } from '../actions/dashboard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const AdminSummary = async () => {
    const todayRevenue = await getTodayRevenue();
    const todayOnline = todayRevenue.reduce((acc, curr: any) => acc + curr.paidOnline, 0);
    const todayCash = todayRevenue.reduce((acc, curr: any) => acc + curr.paidCash, 0);
    const todayLending = todayRevenue.reduce((acc, curr: any) => acc + curr.lendingAmount, 0);
    return (
        <div className=' py-6 grid grid-cols-1 md:grid-cols-3 gap-5'>
            <AdminSummaryCard title="Today's Online" amount={todayOnline} />
            <AdminSummaryCard title="Today's Cash" amount={todayCash} />
            <AdminSummaryCard title="Today's Lending" amount={todayLending} />
        </div>
    )
}

export default AdminSummary;


function AdminSummaryCard({ title, amount }: { title: string, amount: number }) {
    return (
        <Card className=' bg-white'>
            <CardHeader className='text-2xl font-bold'>{title}</CardHeader>
            <CardContent className='text-lg'>₹ {amount} / -</CardContent>
        </Card>
    )
}