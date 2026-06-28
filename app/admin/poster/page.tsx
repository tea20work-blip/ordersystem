import { getPosters } from "../actions/poster";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PosterTableClient } from "./PosterTableClient";

export const dynamic = 'force-dynamic';

export default async function PosterPage() {
    const posters = await getPosters();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Posters</h1>
                <Button asChild>
                    <Link href="/admin/poster/form">
                        <Plus className="mr-2 h-4 w-4" /> Add Poster
                    </Link>
                </Button>
            </div>

            <PosterTableClient posters={posters} />
        </div>
    );
}
