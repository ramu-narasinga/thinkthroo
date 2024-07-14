import SiteHeader from "@/components/site/header";
import SiteSidebar from "@/components/site/sidebar";

export default function AppLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
        <div className="flex h-screen w-full">
            <SiteSidebar />
            <div className="flex-1">
                <SiteHeader />
                <main className="p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}