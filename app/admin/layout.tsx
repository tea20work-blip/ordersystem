import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";

import AdminNotifications from "@/components/admin-notifications";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <AdminSidebar />
            <div className="flex flex-col flex-1 h-screen overflow-hidden bg-muted/20">
                <header className="flex items-center h-16 px-4 gap-4 border-b bg-background shrink-0">
                    <SidebarTrigger />
                    <AdminNotifications />
                </header>
                <main className="flex-1 overflow-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}
