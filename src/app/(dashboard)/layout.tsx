import { Navbar } from "@/components/Navbar"
import { SessionProvider } from "next-auth/react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SessionProvider>
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="container mx-auto px-4 py-8">{children}</main>
            </div>
        </SessionProvider>
    )
}
