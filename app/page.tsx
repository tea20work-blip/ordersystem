import { getDishes } from "./admin/actions/dish";
import { Header } from "@/components/header";
import { ClientMenu } from "@/components/client-menu";
import { CartSnak } from "@/components/cartSnak";

export default async function Home() {
  const dishes = await getDishes("");
  return (
    <div className="min-h-screen max-w-xl mx-auto flex flex-col">
      <Header />
      <ClientMenu initialDishes={dishes} />
      <CartSnak />
    </div>
  );
}
