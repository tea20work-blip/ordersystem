import { CartSnak } from "@/components/cartSnak";
import { ClientMenu } from "@/components/client-menu";
import CategoryMenuSnack from "@/components/CategoryMenuSnack";
import { Suspense } from "react";
import { getCachedMenu, getCachedPosters } from "@/app/actions/home";

export default async function Home() {
    const data = await getCachedMenu();
    const posters = await getCachedPosters();

    return (
        <div className=" flex flex-col">
            <Suspense>
                <ClientMenu initialDishes={data} posters={posters} />
            </Suspense>
            <CategoryMenuSnack data={data} />
            <CartSnak />
        </div>
    );
}