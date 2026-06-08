"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LayoutDashboard, List, Utensils, Armchair, ClipboardList, User, AlarmSmoke, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
    {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Categories",
        url: "/admin/categories",
        icon: List,
    },
    {
        title: "Dishes",
        url: "/admin/dishes",
        icon: Utensils,
    },
    {
        title: "Cegrates",
        url: "/admin/cegrates",
        icon: AlarmSmoke,
    },
    {
        title: "Tables",
        url: "/admin/tables",
        icon: Armchair,
    },
    {
        title: "Orders",
        url: "/admin/orders",
        icon: ClipboardList,
    },
    {
        title: "User",
        url: "/admin/user",
        icon: User,
    },
    {
        title: "Sales Report",
        url: "/admin/sales-report",
        icon: TrendingUp,
    },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar>
            <SidebarHeader className="h-16 flex items-center px-4 border-b">
                <h2 className="text-lg font-bold">Admin Panel</h2>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Management</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
                                const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`);

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton data-xyz={!!isActive} asChild isActive={isActive}>
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
