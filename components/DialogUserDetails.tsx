"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// ------------------ ZOD SCHEMA ------------------
const formSchema = z.object({
    name: z.string().min(2, "Name is required"),
    mobile: z
        .string()
        .regex(/^[6-9]\d{9}$/, "Enter valid mobile number"),
    tableName: z.string().min(1, "Table name required"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    message: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

// ------------------ COMPONENT ------------------
type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data?: Partial<FormData>;
    onSubmit: (data: FormData) => Promise<void> | void;
};

export function DialogUserDetails({
    open,
    onOpenChange,
    data,
    onSubmit,
}: Props) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: data,
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Booking Form</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Name */}
                    <div>
                        <Label>Name</Label>
                        <Input {...register("name")} />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Mobile */}
                    <div>
                        <Label>Mobile Number</Label>
                        <Input {...register("mobile")} />
                        {errors.mobile && (
                            <p className="text-sm text-red-500">{errors.mobile.message}</p>
                        )}
                    </div>

                    {/* Table Name */}
                    {/* <div>
                        <Label>Table Name</Label>
                        <Input {...register("tableName")} />
                        {errors.tableName && (
                            <p className="text-sm text-red-500">
                                {errors.tableName.message}
                            </p>
                        )}
                    </div> */}

                    {/* Email */}
                    <div>
                        <Label>Email (Optional)</Label>
                        <Input {...register("email")} />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Message */}
                    <div>
                        <Label>Message (Optional)</Label>
                        <Textarea {...register("message")} />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Submit"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}