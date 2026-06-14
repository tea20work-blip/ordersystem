import { CartSnak } from "@/components/cartSnak";
import { ClientMenu } from "@/components/client-menu";
import CategoryMenuSnack from "@/components/CategoryMenuSnack";
import { Suspense } from "react";
import { getCachedMenu } from "@/app/actions/home";
import db from "@/db";
import { table } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function Home({ params }: { params: Promise<{ tableCode: string }> }) {
    const pageParams = await params;
    const [currentTable] = await db.select({ id: table.id, name: table.name, tableCode: table.tableCode }).from(table).where(eq(table.tableCode, pageParams.tableCode));
    if (!currentTable) {
        return notFound();
    }
    const data = await getCachedMenu();

    return (
        <div className=" flex flex-col">
            <Suspense>
                <ClientMenu currentTable={currentTable} initialDishes={data} />
            </Suspense>
            <CategoryMenuSnack data={data} />
            <CartSnak />
        </div>
    );
}