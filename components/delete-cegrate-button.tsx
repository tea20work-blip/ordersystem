"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteCegrate } from "@/app/admin/actions/cegrate";
import { toast } from "sonner";

export function DeleteCegrateButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (confirm("Are you sure you want to delete this cigarette?")) {
      startTransition(async () => {
        try {
          await deleteCegrate(id);
          toast.success("Cigarette deleted");
        } catch (error) {
          console.error(error);
          toast.error("Failed to delete cigarette");
        }
      });
    }
  }

  return (
    <Button
      variant="destructive"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Delete</span>
    </Button>
  );
}
