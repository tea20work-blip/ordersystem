import { getDishes } from "../../actions/dish";
import { getTables } from "../../actions/table";
import { getCegrates } from "../../actions/cegrate";
import { OrderFormClient } from "./OrderFormClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function OrderFormPage({
    searchParams,
}: {
    searchParams: Promise<{ tableId?: string }>;
}) {
    const resolvedParams = await searchParams;
    const dishes = await getDishes();
    const tables = await getTables();
    const cegrates = await getCegrates();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/admin/tables">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">
                    Create New Order
                </h1>
            </div>

            <OrderFormClient
                initialDishes={dishes}
                initialTables={tables}
                initialCegrates={cegrates}
                defaultTableId={resolvedParams.tableId || ""}
            />
        </div>
    );
}
