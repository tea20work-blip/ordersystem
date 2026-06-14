import { z } from "zod";

export const userDetailsSchema = z.object({
    name: z.string().min(2, "Name is required"),
    mobile: z
        .string()
        .regex(
            /^(?:\+91|91)?[6-9]\d{9}$/,
            "Enter valid mobile number"
        ),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    message: z.string().optional(),
});

export type UserDetailsFormData = z.infer<typeof userDetailsSchema>;
