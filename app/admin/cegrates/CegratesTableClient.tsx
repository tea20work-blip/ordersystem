"use client";

import Link from "next/link";
import { Edit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DeleteCegrateButton } from "@/components/delete-cegrate-button";

type Cegrate = {
  id: number;
  name: string;
  amount: number;
  createdAt: Date | null;
};

interface CegratesTableClientProps {
  initialCegrates: Cegrate[];
}

export function CegratesTableClient({ initialCegrates }: CegratesTableClientProps) {
  if (initialCegrates.length === 0) {
    return (
      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                No cigarettes found.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialCegrates.map((cegrate) => (
            <TableRow key={cegrate.id}>
              <TableCell>{cegrate.id}</TableCell>
              <TableCell className="font-medium">{cegrate.name}</TableCell>
              <TableCell>Rs. {cegrate.amount}</TableCell>
              <TableCell>
                {cegrate.createdAt ? new Date(cegrate.createdAt).toLocaleDateString() : "N/A"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="icon" asChild>
                    <Link href={`/admin/cegrates/form?id=${cegrate.id}`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                  <DeleteCegrateButton id={cegrate.id} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
