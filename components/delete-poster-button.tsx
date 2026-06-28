"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletePoster } from "@/app/admin/actions/poster";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function DeletePosterButton({ id }: { id: number }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await deletePoster(id);
            toast.success("Poster deleted successfully");
            setOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while deleting the poster");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the poster.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading ? "Deleting..." : "Delete Poster"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
