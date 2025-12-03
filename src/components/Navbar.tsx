"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Calendar, Users, MapPin, ClipboardList, BarChart3, ScanLine, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"

export function Navbar() {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()
    const { data: session } = useSession()

    const isAdmin = session?.user?.role === "ADMIN"
    const isStaff = session?.user?.role === "STAFF" || isAdmin

    const navItems = [
        { href: "/events", label: "Events", icon: Calendar },
        { href: "/registrations", label: "My Registrations", icon: ClipboardList, studentOnly: true },
        { href: "/speakers", label: "Speakers", icon: Users, adminOnly: true },
        { href: "/venues", label: "Venues", icon: MapPin, adminOnly: true },
        { href: "/checkin", label: "Check-in", icon: ScanLine, staffOnly: true },
        { href: "/reports", label: "Reports", icon: BarChart3, adminOnly: true },
    ]

    const filteredNavItems = navItems.filter(item => {
        if (item.adminOnly && !isAdmin) return false
        if (item.staffOnly && !isStaff) return false
        if (item.studentOnly && isAdmin) return false
        return true
    })

    return (
        <nav className="border-b bg-white">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/events" className="text-xl font-bold text-primary">
                            FPT Events
                        </Link>
                        <div className="hidden md:flex gap-1">
                            {filteredNavItems.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                                ? "bg-primary text-white"
                                                : "text-gray-600 hover:bg-gray-100"
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-4">
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">{session?.user?.name}</span>
                                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    {session?.user?.role}
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => signOut({ callbackUrl: "/login" })}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>
                                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile dropdown */}
            {open && (
                <div className="md:hidden border-t bg-white">
                    <div className="container mx-auto px-4 py-3 space-y-2">
                        {filteredNavItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                            ? "bg-primary text-white"
                                            : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                    onClick={() => setOpen(false)}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            )
                        })}

                        <div className="pt-2 border-t pt-3">
                            <div className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">{session?.user?.name}</span>
                                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    {session?.user?.role}
                                </span>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
