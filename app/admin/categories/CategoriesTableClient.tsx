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
import { DeleteCategoryButton } from "@/components/delete-category-button";
import { updateCategoryPriorities } from "../actions/category";

type Category = {
  id: number;
  name: string;
  priority: number;
  createdAt: Date | null;
  updatedAt: Date | null;
};

interface SortableTableRowProps {
  category: Category;
}

function SortableTableRow({ category }: SortableTableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

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
      <TableCell className="font-medium">{category.priority}</TableCell>
      <TableCell>{category.name}</TableCell>
      <TableCell>
        {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : "N/A"}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/categories/form?id=${category.id}`}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Link>
          </Button>
          <DeleteCategoryButton id={category.id} />
        </div>
      </TableCell>
    </TableRow>
  );
}

interface CategoriesTableClientProps {
  initialCategories: Category[];
}

export function CategoriesTableClient({ initialCategories }: CategoriesTableClientProps) {
  const [categories, setCategories] = useState(initialCategories);
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
      setCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Save automatically
        savePriorities(newItems);

        return newItems;
      });
    }
  }

  async function savePriorities(itemsToSave: Category[]) {
    try {
      setIsSaving(true);
      const updates = itemsToSave.map((item, index) => ({
        id: item.id,
        priority: index,
      }));

      await updateCategoryPriorities(updates);
      toast.success("Category order updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update category order");
      // Reset to initial on error
      setCategories(initialCategories);
    } finally {
      setIsSaving(false);
    }
  }

  if(isSaving){
    <div>saving...</div>
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                No categories found.
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
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Created At</TableHead>
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
              items={categories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {categories.map((category) => (
                <SortableTableRow key={category.id} category={category} />
              ))}
            </SortableContext>
          </DndContext>
        </TableBody>
      </Table>
    </div>
  );
}
