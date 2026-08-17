"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TableOrdersDialogClient } from "./TableOrdersDialogClient";
import { cn } from "@/lib/utils";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TablesPageClient() {
  const {
    data: tables = [],
    error,
    isLoading,
  } = useSWR(`/api/tables`, fetcher, {
    refreshInterval: 30 * 1000, // 30 sec
    refreshWhenHidden: false,
    revalidateOnFocus: true,
  });

  const groupedTables = [
    {
      name: "A",
      tables: tables.filter((t: any) =>
        ["A1", "A2", "A3", "A4", "A5", "A6", "A7"].includes(t.name),
      ),
    },
    {
      name: "B",
      tables: tables.filter((t: any) =>
        ["B1", "B2", "B3", "B4", "B5", "B6"].includes(t.name),
      ),
    },
    {
      name: "C",
      tables: tables.filter((t: any) => ["C1", "C2", "Table"].includes(t.name)),
    },
    {
      name: "Temporary",
      tables: tables.filter(
        (t: any) =>
          ![
            "A1",
            "A2",
            "A3",
            "A4",
            "A5",
            "A6",
            "A7",
            "B1",
            "B2",
            "B3",
            "B4",
            "B5",
            "B6",
            "C1",
            "C2",
            "Table",
          ].includes(t.name),
      ),
    },
  ];

  if (error) {
    return <div className="p-4 text-red-500">Failed to load tables.</div>;
  }

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

      <div className="flex items-center justify-end">
        <Button asChild>
          <Link href="/admin/orders/form">
            <Plus className="h-4 w-4 mr-2" /> New Order
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-6 text-muted-foreground">
          Loading tables...
        </div>
      ) : (
        <div className="w-full flex flex-col gap-10">
          {groupedTables.map((group) => (
            <div key={group.name} className="flex flex-col w-full gap-3">
              <p className="col-span-3">{group.name}</p>
              <div className="grid grid-cols-8 gap-3">
                {group.tables.map((t: any) => (
                  <div
                    key={t.id}
                    className={cn(
                      "rounded-md duration-200 aspect-square bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-md transition-shadow",
                    )}
                  >
                    <TableOrdersDialogClient table={t} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
