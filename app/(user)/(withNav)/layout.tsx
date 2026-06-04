import { Header } from "@/components/header";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <div className="overflow-hidden bg-background border-y py-1">
                <div className="animate-marquee whitespace-nowrap text-primary text-sm">
                    For <span className=" font-semibold"> 🚬 cigarettes</span> you can contact the counter person.
                </div>
            </div>
            {children}
        </>
    )
}