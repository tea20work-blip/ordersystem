import { getDishes, deleteDish } from "../actions/dish";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DishesTableClient } from "./DishesTableClient";

export const dynamic = "force-dynamic";

export default async function DishesPage() {
  const dishes = await getDishes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dishes</h1>
        <Button asChild>
          <Link href="/admin/dishes/form">
            <Plus className="mr-2 h-4 w-4" /> Add Dish
          </Link>
        </Button>
      </div>

      <DishesTableClient initialDishes={dishes} />
    </div>
  );
}
