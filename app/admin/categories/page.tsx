import { getCategories } from "../actions/category";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoriesTableClient } from "./CategoriesTableClient";

export const dynamic = 'force-static'
export const revalidate = 20;


export default async function CategoriesPage() {
    const categories = await getCategories();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                <Button asChild>
                    <Link href="/admin/categories/form">
                        <Plus className="mr-2 h-4 w-4" /> Add Category
                    </Link>
                </Button>
            </div>

            <CategoriesTableClient initialCategories={categories} />
        </div>
    );
}
