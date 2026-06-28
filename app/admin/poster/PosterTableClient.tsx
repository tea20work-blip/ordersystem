"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, GripVertical } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DeletePosterButton } from "@/components/delete-poster-button";
import { getImageUrl } from "@/lib/s3";
import { toast } from "sonner";
import { updatePosterPriorities } from "../actions/poster";
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

type Poster = {
  id: number;
  posterName: string;
  posterImage: string;
  posterUrl: string;
  priority: number;
  createdAt: Date | null;
  updatedAt: Date | null;
};

interface SortableTableRowProps {
    poster: Poster;
}

function SortableTableRow({ poster }: SortableTableRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: poster.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        ...(isDragging
            ? {
                zIndex: 50,
                position: "relative" as const,
                opacity: 0.8,
                background: "var(--background)",
            }
            : {}),
    };

    return (
        <TableRow
            ref={setNodeRef}
            style={style}
            className={isDragging ? "shadow-md" : ""}
        >
            <TableCell className="w-[50px]">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab hover:text-primary p-2"
                >
                    <GripVertical className="h-4 w-4" />
                </div>
            </TableCell>
            <TableCell className="font-medium">{poster.priority}</TableCell>
            <TableCell>
                <div className="h-16 w-16 relative rounded overflow-hidden bg-gray-100 border">
                    <img 
                        src={getImageUrl(poster.posterImage)} 
                        alt={poster.posterName} 
                        className="object-cover w-full h-full"
                    />
                </div>
            </TableCell>
            <TableCell className="font-medium">{poster.posterName}</TableCell>
            <TableCell>
                <a href={poster.posterUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline line-clamp-1">
                    {poster.posterUrl}
                </a>
            </TableCell>
            <TableCell>
                {poster.createdAt ? new Date(poster.createdAt).toLocaleDateString() : "N/A"}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/poster/form?id=${poster.id}`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Link>
                    </Button>
                    <DeletePosterButton id={poster.id} />
                </div>
            </TableCell>
        </TableRow>
    );
}

interface PosterTableClientProps {
  posters: Poster[];
}

export function PosterTableClient({ posters: initialPosters }: PosterTableClientProps) {
    const [posters, setPosters] = useState(initialPosters);
    const [isSaving, setIsSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setPosters((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Save automatically
                savePriorities(newItems);

                return newItems;
            });
        }
    }

    async function savePriorities(itemsToSave: Poster[]) {
        try {
            setIsSaving(true);
            const updates = itemsToSave.map((item, index) => ({
                id: item.id,
                priority: index,
            }));

            await updatePosterPriorities(updates);
            toast.success("Poster order updated");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update poster order");
            // Reset to initial on error
            setPosters(initialPosters);
        } finally {
            setIsSaving(false);
        }
    }

    if (isSaving) {
        // We could also just disable interactions while saving, but this matches DishesTableClient
        return <div>Saving...</div>;
    }

    if (posters.length === 0) {
        return (
            <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>URL</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                                No posters found. Add your first poster.
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
                        <TableHead>URL</TableHead>
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
                            items={posters.map((p) => p.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {posters.map((poster) => (
                                <SortableTableRow key={poster.id} poster={poster} />
                            ))}
                        </SortableContext>
                    </DndContext>
                </TableBody>
            </Table>
        </div>
    );
}
