import { getUsers } from "../actions/user";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserTableRow } from "./user-table-row";

export const dynamic = 'force-static'
export const revalidate = 20;


export default async function UsersPage() {
    const users = await getUsers();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            </div>

            <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone Number</TableHead>
                            <TableHead>Lending Amount</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((u) => (
                                <UserTableRow key={u.id} user={u} />
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
