export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen max-w-md mx-auto">
            {children}
        </div>
    );
}