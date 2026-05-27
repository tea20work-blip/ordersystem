import { getCegrates } from "../actions/cegrate";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CegratesTableClient } from "./CegratesTableClient";

export default async function CegratesPage() {
    const cegrates = await getCegrates();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Cigarettes</h1>
                <Button asChild>
                    <Link href="/admin/cegrates/form">
                        <Plus className="mr-2 h-4 w-4" /> Add Cigarette
                    </Link>
                </Button>
            </div>

            <CegratesTableClient initialCegrates={cegrates} />
        </div>
    );
}
