"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DeleteDishButton({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this dish?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/dishes/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to delete dish");
      } else {
        router.refresh();
      }
    } catch (error) {
      alert("An error occurred while deleting the dish");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="icon"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Delete</span>
    </Button>
  );
}
