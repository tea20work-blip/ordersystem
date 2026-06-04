import { CartSnak } from "@/components/cartSnak";
import { ClientMenu } from "@/components/client-menu";
import { Header } from "@/components/header";
import Link from "next/link";
import CategoryMenuSnack from "@/components/CategoryMenuSnack";
import { Suspense } from "react";
import { getCachedMenu } from "@/app/actions/home";

export default async function Home() {
    const data = await getCachedMenu();

    // console.log(data);

    return (
        <div className=" flex flex-col">
            <Suspense>
                <ClientMenu initialDishes={data} />
            </Suspense>
            <CategoryMenuSnack data={data} />
            <CartSnak />
        </div>
    );
}