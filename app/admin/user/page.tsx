import db from "@/db";
import { getUsers } from "../actions/user";
import { UserTableClient } from "./user-table-client";
import { user } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-static";
export const revalidate = 20;

export default async function UsersPage() {
  const users = await db.select().from(user).orderBy(desc(user.lendingAmount));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
      </div>

      <UserTableClient users={users} />
    </div>
  );
}
