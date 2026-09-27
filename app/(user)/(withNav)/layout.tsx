import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="overflow-hidden bg-background border-y py-1">
                <div className="animate-marquee whitespace-nowrap text-primary text-sm">
                    For <span className=" font-semibold"> 🚬 cigarettes</span> you can contact the counter person.
                </div>
            </div>
            <div className="flex-1">
                {children}
            </div>
            <Footer />
        </div>
    )
}