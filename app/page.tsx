import { getDishes } from "./admin/actions/dish";
import { Header } from "@/components/header";
import { ClientMenu } from "@/components/client-menu";
import { CartSnak } from "@/components/cartSnak";

export default async function Home() {
  const data = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/category-products`, { next: { revalidate: 3600 } })
  const res: { data: any } = await data.json();
  return (
    <div className="min-h-screen max-w-xl mx-auto flex flex-col">
      <Header />
      <ClientMenu initialDishes={res.data} />
      <CartSnak />
    </div>
  );
}
