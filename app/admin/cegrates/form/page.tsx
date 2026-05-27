import { getCegrate, createCegrate, updateCegrate } from "../../actions/cegrate";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default async function CegrateFormPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>;
}) {
    const resolvedParams = await searchParams;
    const isEdit = !!resolvedParams?.id;
    const cegrateId = isEdit ? parseInt(resolvedParams.id!, 10) : null;

    const cegrateData = isEdit && cegrateId ? await getCegrate(cegrateId) : null;

    async function handleSubmit(formData: FormData) {
        "use server";
        const name = formData.get("name") as string;
        const amount = parseInt(formData.get("amount") as string, 10);

        if (isEdit && cegrateId) {
            await updateCegrate(cegrateId, { name, amount });
        } else {
            await createCegrate({ name, amount });
        }
        redirect("/admin/cegrates");
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/admin/cegrates">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">
                    {isEdit ? "Edit Cigarette" : "Add Cigarette"}
                </h1>
            </div>

            <div className="rounded-md border bg-card text-card-foreground p-6 shadow-sm">
                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={cegrateData?.name || ""}
                            required
                            placeholder="e.g. Marlboro"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="amount">Price (Rs.)</Label>
                        <Input
                            id="amount"
                            name="amount"
                            type="number"
                            defaultValue={cegrateData?.amount || ""}
                            required
                            placeholder="e.g. 350"
                        />
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/admin/cegrates">Cancel</Link>
                        </Button>
                        <Button type="submit">
                            {isEdit ? "Update Cigarette" : "Save Cigarette"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
