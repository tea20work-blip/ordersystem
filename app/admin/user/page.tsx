import { getUsers } from "../actions/user";
import { UserTableClient } from "./user-table-client";

export const dynamic = 'force-static'
export const revalidate = 20;

export default async function UsersPage() {
    const users = await getUsers();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            </div>

            <UserTableClient users={users} />
        </div>
    );
}
