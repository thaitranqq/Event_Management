"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar } from "lucide-react"

const EVENT_CATEGORIES = [
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

const EVENT_STATUSES = ["DRAFT", "PUBLISHED", "CANCELLED"]

export default function CreateEventPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [speakers, setSpeakers] = useState<any[]>([])
    const [venues, setVenues] = useState<any[]>([])

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "TECHNOLOGY",
        startDate: "",
        endDate: "",
        capacity: "",
        imageUrl: "",
        status: "DRAFT",
        speakerId: "",
        venueId: "",
    })

    // Load speakers and venues
    useState(() => {
        const loadData = async () => {
            try {
                const [speakersRes, venuesRes] = await Promise.all([
                    fetch("/api/speakers"),
                    fetch("/api/venues"),
                ])
                const speakersData = await speakersRes.json()
                const venuesData = await venuesRes.json()
                setSpeakers(speakersData.speakers || [])
                setVenues(venuesData.venues || [])
            } catch (err) {
                console.error("Error loading data:", err)
            }
        }
        loadData()
    })

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            // Validate dates
            if (new Date(formData.startDate) >= new Date(formData.endDate)) {
                setError("Start date must be before end date")
                setLoading(false)
                return
            }

            // Convert datetime-local (no timezone) to ISO strings
            const startISO = formData.startDate ? new Date(formData.startDate).toISOString() : null
            const endISO = formData.endDate ? new Date(formData.endDate).toISOString() : null

            const res = await fetch("/api/events", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    startDate: startISO,
                    endDate: endISO,
                    capacity: parseInt(formData.capacity),
                    speakerId: formData.speakerId || null,
                    venueId: formData.venueId || null,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Failed to create event")
                return
            }

            // Navigate to the new event and refresh server components to show latest data
            router.push(`/events/${data.id}`)
            router.refresh()
        } catch (err) {
            setError("An error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Calendar className="w-6 h-6" />
                        Create New Event
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium">
                                Event Title *
                            </label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter event title"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium">
                                Description *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the event..."
                                rows={5}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="category" className="text-sm font-medium">
                                    Category *
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                >
                                    {EVENT_CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="status" className="text-sm font-medium">
                                    Status *
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                >
                                    {EVENT_STATUSES.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="startDate" className="text-sm font-medium">
                                    Start Date & Time *
                                </label>
                                <Input
                                    id="startDate"
                                    name="startDate"
                                    type="datetime-local"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="endDate" className="text-sm font-medium">
                                    End Date & Time *
                                </label>
                                <Input
                                    id="endDate"
                                    name="endDate"
                                    type="datetime-local"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="capacity" className="text-sm font-medium">
                                Capacity *
                            </label>
                            <Input
                                id="capacity"
                                name="capacity"
                                type="number"
                                min="1"
                                value={formData.capacity}
                                onChange={handleChange}
                                placeholder="Maximum number of attendees"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="speakerId" className="text-sm font-medium">
                                    Speaker (Optional)
                                </label>
                                <select
                                    id="speakerId"
                                    name="speakerId"
                                    value={formData.speakerId}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="">-- Select Speaker --</option>
                                    {speakers.map((speaker) => (
                                        <option key={speaker.id} value={speaker.id}>
                                            {speaker.name}
                                            {speaker.organization && ` (${speaker.organization})`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="venueId" className="text-sm font-medium">
                                    Venue (Optional)
                                </label>
                                <select
                                    id="venueId"
                                    name="venueId"
                                    value={formData.venueId}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="">-- Select Venue --</option>
                                    {venues.map((venue) => (
                                        <option key={venue.id} value={venue.id}>
                                            {venue.name} (Capacity: {venue.capacity})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="imageUrl" className="text-sm font-medium">
                                Image URL (Optional)
                            </label>
                            <Input
                                id="imageUrl"
                                name="imageUrl"
                                type="url"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                            />
                            <p className="text-xs text-gray-500">
                                Provide a URL to an event poster or cover image
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={loading} className="flex-1">
                                {loading ? "Creating..." : "Create Event"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
