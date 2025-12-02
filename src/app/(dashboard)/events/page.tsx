"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { EventCard } from "@/components/EventCard"
import { Plus, Search } from "lucide-react"
import { useSession } from "next-auth/react"

const EVENT_CATEGORIES = [
    "ALL",
    "TECHNOLOGY",
    "BUSINESS",
    "WORKSHOP",
    "SEMINAR",
    "NETWORKING",
    "CAREER",
    "SOCIAL",
    "SPORTS",
    "OTHER",
]

export default function EventsPage() {
    const { data: session } = useSession()
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("ALL")

    const isAdmin = session?.user?.role === "ADMIN"

    useEffect(() => {
        fetchEvents()
    }, [search, selectedCategory])

    const fetchEvents = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.append("search", search)
            if (selectedCategory !== "ALL") params.append("category", selectedCategory)

            const res = await fetch(`/api/events?${params}`)
            const data = await res.json()
            setEvents(data.events || [])
        } catch (error) {
            console.error("Error fetching events:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Events</h1>
                    <p className="text-gray-600 mt-1">
                        Discover and register for upcoming university events
                    </p>
                </div>
                {isAdmin && (
                    <Link href="/events/create">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Event
                        </Button>
                    </Link>
                )}
            </div>

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search events..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {EVENT_CATEGORIES.map((cat) => (
                        <Badge
                            key={cat}
                            variant={selectedCategory === cat ? "default" : "outline"}
                            className="cursor-pointer hover:bg-primary/90"
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </Badge>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading events...</div>
            ) : events.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No events found</p>
                    {isAdmin && (
                        <Link href="/events/create">
                            <Button className="mt-4">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First Event
                            </Button>
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    <div className="text-sm text-gray-600 mb-4">
                        {events.length} event{events.length !== 1 ? "s" : ""} found
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event: any) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
