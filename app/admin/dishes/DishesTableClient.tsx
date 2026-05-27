"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DeleteDishButton } from "@/components/delete-dish-button";
import { getImageUrl } from "@/lib/s3";
import { updateDishPriorities } from "../actions/dish";

type Dish = {
  id: number;
  name: string;
  price: number;
  description: string | null;
  priority: number;
  imageUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  dishOptions: unknown | null;
  isOutOfStock: boolean | null;
  isHidden: boolean | null;
  isDeleted: boolean | null;
  dishVarients: unknown | null;
  maxSelectOptions: number | null;
  maxSelectVarient: number | null;
  minSelectVarient: number | null;
};

interface SortableTableRowProps {
  dish: Dish;
}

function SortableTableRow({ dish }: SortableTableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dish.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { zIndex: 50, position: "relative" as const, opacity: 0.8, background: "var(--background)" } : {}),
  };

  return (
    <TableRow ref={setNodeRef} style={style} className={isDragging ? "shadow-md" : ""}>
      <TableCell className="w-[50px]">
        <div {...attributes} {...listeners} className="cursor-grab hover:text-primary p-2">
          <GripVertical className="h-4 w-4" />
        </div>
      </TableCell>
      <TableCell className="font-medium">{dish.priority}</TableCell>
      <TableCell>
        {dish.imageUrl ? (
          <img src={getImageUrl(dish.imageUrl)} alt={dish.name} className="w-12 h-12 rounded object-cover" />
        ) : (
          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs">No Image</div>
        )}
      </TableCell>
      <TableCell>{dish.name}</TableCell>
      <TableCell>Rs. {dish.price}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/dishes/form?id=${dish.id}`}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Link>
          </Button>
          <DeleteDishButton id={dish.id} />
        </div>
      </TableCell>
    </TableRow>
  );
}

interface DishesTableClientProps {
  initialDishes: Dish[];
}

export function DishesTableClient({ initialDishes }: DishesTableClientProps) {
  const [dishes, setDishes] = useState(initialDishes);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setDishes((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Save automatically
        savePriorities(newItems);

        return newItems;
      });
    }
  }

  async function savePriorities(itemsToSave: Dish[]) {
    try {
      setIsSaving(true);
      const updates = itemsToSave.map((item, index) => ({
        id: item.id,
        priority: index,
      }));

      await updateDishPriorities(updates);
      toast.success("Dish order updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update dish order");
      // Reset to initial on error
      setDishes(initialDishes);
    } finally {
      setIsSaving(false);
    }
  }

  if (isSaving) {
    return <div>Saving...</div>;
  }

  if (dishes.length === 0) {
    return (
      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No dishes found.
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
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={dishes.map((d) => d.id)}
              strategy={verticalListSortingStrategy}
            >
              {dishes.map((dish) => (
                <SortableTableRow key={dish.id} dish={dish} />
              ))}
            </SortableContext>
          </DndContext>
        </TableBody>
      </Table>
    </div>
  );
}
