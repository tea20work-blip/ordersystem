import { getPoster, createPoster, updatePoster } from "../../actions/poster";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";
import { getImageUrl } from "@/lib/s3";
import { revalidatePath } from "next/cache";

export default async function PosterFormPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>;
}) {
    const resolvedParams = await searchParams;
    const isEdit = !!resolvedParams?.id;
    const posterId = isEdit ? parseInt(resolvedParams.id!, 10) : null;

    const posterData = isEdit && posterId ? await getPoster(posterId) : null;

    async function handleSubmit(formData: FormData) {
        "use server";
        const { uploadToS3 } = await import("@/lib/s3");

        const posterName = formData.get("posterName") as string;
        const posterUrl = formData.get("posterUrl") as string;

        const imageFile = formData.get("posterImage") as File | null;
        const imageFileRemoved = formData.get("posterImageRemoved") === "true";
        
        let posterImage = posterData?.posterImage || "";

        if (imageFileRemoved) {
            posterImage = "";
        }

        if (imageFile && imageFile.size > 0) {
            posterImage = await uploadToS3(imageFile);
        }

        if (!posterImage) {
            // Throwing or returning an error could be handled better, but we assume client side validation or it's required
            throw new Error("Poster image is required");
        }

        if (isEdit && posterId) {
            await updatePoster(posterId, { posterName, posterUrl, posterImage });
        } else {
            await createPoster({ posterName, posterUrl, posterImage });
        }

        revalidatePath("/admin/poster");
        redirect("/admin/poster");
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/admin/poster">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">
                    {isEdit ? "Edit Poster" : "Add Poster"}
                </h1>
            </div>

            <div className="rounded-md border bg-card text-card-foreground p-6 shadow-sm">
                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="posterName">Poster Name</Label>
                        <Input
                            id="posterName"
                            name="posterName"
                            defaultValue={posterData?.posterName || ""}
                            required
                            placeholder="e.g. Summer Sale Banner"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="posterUrl">Poster Redirect URL</Label>
                        <Input
                            id="posterUrl"
                            name="posterUrl"
                            defaultValue={posterData?.posterUrl || ""}
                            required
                            placeholder="e.g. https://example.com/summer-sale"
                        />
                        <p className="text-xs text-muted-foreground">
                            Users will be redirected to this external URL when they click the poster.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Poster Image</Label>
                        <ImageUpload
                            defaultValue={posterData?.posterImage ? getImageUrl(posterData.posterImage) : undefined}
                            name="posterImage"
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <Button variant="outline" asChild>
                            <Link href="/admin/poster">Cancel</Link>
                        </Button>
                        <Button type="submit">
                            {isEdit ? "Update Poster" : "Save Poster"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
