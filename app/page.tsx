import { CartSnak } from "@/components/cartSnak";
import { ClientMenu } from "@/components/client-menu";
import { Header } from "@/components/header";
import { getCachedMenu } from "./actions/home";

export default async function Home() {
  const data = await getCachedMenu();

  return (
    <div className="min-h-screen max-w-xl mx-auto flex flex-col">
      <Header />
      <ClientMenu initialDishes={data} />
      <CartSnak />
    </div>
  );
}