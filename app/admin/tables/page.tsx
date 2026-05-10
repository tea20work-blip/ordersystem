import { getTables, deleteTable } from "../actions/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableOrdersDialogClient } from "./TableOrdersDialogClient";

export default async function TablesPage() {
    const tables = await getTables();
    console.log(tables);
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Tables</h1>
                <Button asChild>
                    <Link href="/admin/tables/form">
                        <Plus className="mr-2 h-4 w-4" /> Add Table
                    </Link>
                </Button>
            </div>

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                <Button asChild>
                    <Link href="/admin/orders/form">
                        <Plus className="h-4 w-4 mr-2" /> New Order
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Running</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tables.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                    No tables found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tables.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-medium">{t.id}</TableCell>
                                    <TableCell>
                                        <TableOrdersDialogClient table={t} />
                                    </TableCell>
                                    <TableCell>
                                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={t.isRunning ? "destructive" : "default"}>{t.isRunning ? "yes" : "no"}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="icon" asChild>
                                                <Link href={`/admin/tables/form?id=${t.id}`}>
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">Edit</span>
                                                </Link>
                                            </Button>
                                            <form action={async () => {
                                                "use server";
                                                await deleteTable(t.id);
                                            }}>
                                                <Button type="submit" variant="destructive" size="icon">
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                            </form>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
