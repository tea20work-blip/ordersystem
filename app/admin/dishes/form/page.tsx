import { getDish, createDish, updateDish, getDishes } from "../../actions/dish";
import { getCategories } from "../../actions/category";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";
import { getImageUrl } from "@/lib/s3";
import { DishOptionsInput, DishOption } from "./DishOptionsInput";
import { DishVarientsInput, DishVarient } from "./DishVarientsInput";
import { revalidateTag } from "next/cache";

export default async function DishFormPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>;
}) {
    const resolvedParams = await searchParams;
    const isEdit = !!resolvedParams?.id;
    const dishId = isEdit ? parseInt(resolvedParams.id!, 10) : null;

    const [dishData, categories, allProducts] = await Promise.all([
        isEdit && dishId ? getDish(dishId) : null,
        getCategories(),
        getDishes()
    ]);

    async function handleSubmit(formData: FormData) {
        "use server";
        const { uploadToS3 } = await import("@/lib/s3");

        const name = formData.get("name") as string;
        const price = parseInt(formData.get("price") as string, 10);
        const description = formData.get("description") as string;

        const imageFile = formData.get("imageFile") as File | null;
        const imageFileRemoved = formData.get("imageFileRemoved") === "true";
        const isOutOfStock = formData.get("isOutOfStock") === "on";
        const isHidden = formData.get("isHidden") === "on";
        let imageUrl = dishData?.imageUrl || "";

        if (imageFileRemoved) {
            imageUrl = "";
        }

        if (imageFile && imageFile.size > 0) {
            imageUrl = await uploadToS3(imageFile);
        }

        // Get all checked category IDs
        const categoryIds = formData.getAll("categories").map(id => parseInt(id as string, 10));

        // Get all checked addon IDs
        const addonIds = formData.getAll("addons").map(id => parseInt(id as string, 10));

        let dishOptions: DishOption[] = [];
        try {
            const dishOptionsJson = formData.get("dishOptionsJson") as string;
            if (dishOptionsJson) {
                dishOptions = JSON.parse(dishOptionsJson);
            }
        } catch (e) {
            console.error("Failed to parse dish options", e);
        }

        let styleOptions: DishOption[] = [];
        try {
            const styleOptionsJson = formData.get("styleOptionsJson") as string;
            if (styleOptionsJson) {
                styleOptions = JSON.parse(styleOptionsJson);
            }
        } catch (e) {
            console.error("Failed to parse style options", e);
        }

        let dishVarients: DishVarient[] = [];
        try {
            const dishVarientsJson = formData.get("dishVarientsJson") as string;
            if (dishVarientsJson) {
                dishVarients = JSON.parse(dishVarientsJson);
            }
        } catch (e) {
            console.error("Failed to parse dish variants", e);
        }

        const maxSelectOptions = parseInt(formData.get("maxSelectOptions") as string || "1", 10);
        const maxSelectVarient = parseInt(formData.get("maxSelectVarient") as string || "1", 10);
        const minSelectVarient = parseInt(formData.get("minSelectVarient") as string || "0", 10);
        const minStyleOptions = parseInt(formData.get("minStyleOptions") as string || "0", 10);
        const maxStyleOptions = parseInt(formData.get("maxStyleOptions") as string || "1", 10);

        if (isEdit && dishId) {
            await updateDish(dishId, { name, price, description, imageUrl, categoryIds, addonIds, dishOptions, styleOptions, dishVarients, maxSelectOptions, maxSelectVarient, minSelectVarient, minStyleOptions, maxStyleOptions, isOutOfStock, isHidden });
        } else {
            await createDish({ name, price, description, imageUrl, categoryIds, addonIds, dishOptions, styleOptions, dishVarients, maxSelectOptions, maxSelectVarient, minSelectVarient, minStyleOptions, maxStyleOptions, isOutOfStock, isHidden });
        }
        revalidateTag("menu-data", "max");

        redirect("/admin/dishes");
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/admin/dishes">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">
                    {isEdit ? "Edit Dish" : "Add Dish"}
                </h1>
            </div>

            <div className="rounded-md border bg-card text-card-foreground p-6 shadow-sm">
                <form action={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="name">Dish Name</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={dishData?.name || ""}
                                required
                                placeholder="e.g. Margherita Pizza"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">Price</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                min="0"
                                defaultValue={dishData?.price || ""}
                                required
                                placeholder="e.g. 499"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Dish Image</Label>
                            <ImageUpload
                                defaultValue={dishData?.imageUrl ? getImageUrl(dishData.imageUrl) : undefined}
                                name="imageFile"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                            id="description"
                            name="description"
                            defaultValue={dishData?.description || ""}
                            placeholder="A delicious classic pizza..."
                        />
                    </div>

                    <div className="flex gap-6 pt-2">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isOutOfStock"
                                name="isOutOfStock"
                                defaultChecked={dishData?.isOutOfStock || false}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="isOutOfStock" className="font-normal cursor-pointer">
                                Is Out Of Stock
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isHidden"
                                name="isHidden"
                                defaultChecked={dishData?.isHidden || false}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="isHidden" className="font-normal cursor-pointer">
                                Is Hidden
                            </Label>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Categories</Label>
                        <div className="grid grid-cols-2 gap-2 border rounded-md p-4 bg-muted/20">
                            {categories.length === 0 ? (
                                <p className="text-sm text-muted-foreground col-span-2">No categories found. Create some first.</p>
                            ) : (
                                categories.map(cat => (
                                    <div key={cat.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`category-${cat.id}`}
                                            name="categories"
                                            value={cat.id}
                                            defaultChecked={dishData?.categoryIds?.includes(cat.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <Label htmlFor={`category-${cat.id}`} className="font-normal cursor-pointer">
                                            {cat.name}
                                        </Label>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Addons (Related Products)</Label>
                        <div className="grid grid-cols-2 gap-2 border rounded-md p-4 bg-muted/20">
                            {allProducts.filter(p => !isEdit || p.id !== dishId).length === 0 ? (
                                <p className="text-sm text-muted-foreground col-span-2">No related products found.</p>
                            ) : (
                                allProducts
                                    .filter(p => !isEdit || p.id !== dishId)
                                    .map(product => (
                                        <div key={product.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`addon-${product.id}`}
                                                name="addons"
                                                value={product.id}
                                                // @ts-ignore
                                                defaultChecked={dishData?.addonIds?.includes(product.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <Label htmlFor={`addon-${product.id}`} className="font-normal cursor-pointer">
                                                {product.name} (₹ {product.price})
                                            </Label>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>

                    <div className="pt-2">
                        <DishOptionsInput defaultValue={dishData?.dishOptions as DishOption[] | null} />
                    </div>

                    <div className="pt-2">
                        <DishOptionsInput name="styleOptionsJson" title="Style Options" defaultValue={dishData?.styleOptions as DishOption[] | null} />
                    </div>

                    <div className="pt-2">
                        <DishVarientsInput defaultValue={dishData?.dishVarients as DishVarient[] | null} />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="maxSelectOptions">Max Select Options</Label>
                            <Input
                                id="maxSelectOptions"
                                name="maxSelectOptions"
                                type="number"
                                min="1"
                                defaultValue={dishData?.maxSelectOptions ?? 1}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxSelectVarient">Max Select Variant</Label>
                            <Input
                                id="maxSelectVarient"
                                name="maxSelectVarient"
                                type="number"
                                min="1"
                                defaultValue={dishData?.maxSelectVarient ?? 1}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="minSelectVarient">Min Select Variant</Label>
                            <Input
                                id="minSelectVarient"
                                name="minSelectVarient"
                                type="number"
                                min="0"
                                defaultValue={dishData?.minSelectVarient ?? 0}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxStyleOptions">Max Style Options</Label>
                            <Input
                                id="maxStyleOptions"
                                name="maxStyleOptions"
                                type="number"
                                min="1"
                                defaultValue={dishData?.maxStyleOptions ?? 1}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="minStyleOptions">Min Style Options</Label>
                            <Input
                                id="minStyleOptions"
                                name="minStyleOptions"
                                type="number"
                                min="0"
                                defaultValue={dishData?.minStyleOptions ?? 0}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <Button variant="outline" asChild>
                            <Link href="/admin/dishes">Cancel</Link>
                        </Button>
                        <Button type="submit">
                            {isEdit ? "Update Dish" : "Save Dish"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
