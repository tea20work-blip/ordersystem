import { getTable, createTable, updateTable } from "../../actions/table";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { getRendomTableName } from "@/helper/getRendomTableName";

export default async function TableFormPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>;
}) {
    const resolvedParams = await searchParams;
    const isEdit = !!resolvedParams?.id;
    const tableId = isEdit ? parseInt(resolvedParams.id!, 10) : null;

    const tableData = isEdit && tableId ? await getTable(tableId) : null;

    async function handleSubmit(formData: FormData) {
        "use server";
        const name = formData.get("name") as string;
        const tableCode = formData.get("tableCode") as string;

        if (isEdit && tableId) {
            await updateTable(tableId, { name });
        } else {
            await createTable({ name, tableCode });
        }
        redirect("/admin/tables");
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/admin/tables">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">
                    {isEdit ? "Edit Table" : "Add Table"}
                </h1>
            </div>

            <div className="rounded-md border bg-card text-card-foreground p-6 shadow-sm">
                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Table Name / Number</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={tableData?.name || ""}
                            required
                            placeholder="e.g. Table 1"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tableCode">Table Code</Label>
                        <Input
                            id="tableCode"
                            name="tableCode"
                            defaultValue={tableData?.tableCode ? tableData.tableCode : getRendomTableName().toUpperCase()}
                            required
                            disabled={!!tableId}
                            placeholder="e.g. Table 1"
                        />
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/admin/tables">Cancel</Link>
                        </Button>
                        <Button type="submit">
                            {isEdit ? "Update Table" : "Save Table"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
