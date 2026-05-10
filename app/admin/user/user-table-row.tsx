"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export function UserTableRow({ user }: { user: any }) {
    const router = useRouter();

    return (
        <TableRow 
            key={user.id} 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => router.push(`/admin/user/${user.id}`)}
        >
            <TableCell className="font-medium">{user.id}</TableCell>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.number}</TableCell>
            <TableCell>₹{user.lendingAmount || 0}</TableCell>
            <TableCell className="text-right">
                <Button variant="ghost" size="icon">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </TableCell>
        </TableRow>
    );
}
