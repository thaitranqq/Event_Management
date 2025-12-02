"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, MapPin, Users } from "lucide-react"
import ConfirmDialog from "@/components/ConfirmDialog"

interface Venue {
    id: string
    name: string
    address: string
    capacity: number
    facilities: string[]
    _count: {
        events: number
    }
}

export default function VenuesPage() {
    const { data: session } = useSession()
    const isAdmin = session?.user?.role === "ADMIN"

    const [venues, setVenues] = useState<Venue[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [showForm, setShowForm] = useState(false)
    const [editVenue, setEditVenue] = useState<Venue | null>(null)
    const [selectedVenueToDelete, setSelectedVenueToDelete] = useState<Venue | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    useEffect(() => {
        fetchVenues()
    }, [search])

    const fetchVenues = async () => {
        try {
            const params = new URLSearchParams()
            if (search) params.append("search", search)

            const res = await fetch(`/api/venues?${params}`)
            const data = await res.json()
            setVenues(data.venues || [])
        } catch (error) {
            console.error("Error fetching venues:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="text-center py-12">Loading venues...</div>
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Venues</h1>
                    <p className="text-gray-600 mt-1">Manage event venues and locations</p>
                </div>
                <Button onClick={() => { setEditVenue(null); setShowForm(true) }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Venue
                </Button>
            </div>

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search venues by name or address..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {showForm && (
                <VenueForm
                    initialData={editVenue || undefined}
                    onClose={() => { setShowForm(false); setEditVenue(null) }}
                    onSuccess={() => {
                        setShowForm(false)
                        setEditVenue(null)
                        fetchVenues()
                    }}
                />
            )}

            {venues.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <p className="text-gray-500 text-lg mb-4">No venues found</p>
                        <Button onClick={() => setShowForm(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Venue
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {venues.map((venue) => (
                        <Card key={venue.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg">{venue.name}</CardTitle>
                                    <div className="flex items-center gap-2">
                                        {isAdmin && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => { setEditVenue(venue); setShowForm(true) }}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => { setSelectedVenueToDelete(venue); setShowDeleteDialog(true) }}
                                                >
                                                    Delete
                                                </Button>
                                            </>
                                        )}
                                        <Badge variant="outline">{venue._count.events} events</Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 mt-0.5" />
                                    <span>{venue.address}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="w-4 h-4" />
                                    <span>Capacity: {venue.capacity} people</span>
                                </div>

                                {venue.facilities.length > 0 && (
                                    <div className="pt-2">
                                        <p className="text-xs text-gray-500 mb-2">Facilities:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {venue.facilities.map((facility, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {facility}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            <ConfirmDialog
                open={showDeleteDialog}
                title={selectedVenueToDelete ? `Delete venue: ${selectedVenueToDelete.name}` : "Delete venue"}
                description="This will permanently remove the venue. Events referencing this venue will set venue to null."
                confirmLabel="Delete"
                cancelLabel="Keep"
                loading={false}
                onCancel={() => { setShowDeleteDialog(false); setSelectedVenueToDelete(null) }}
                onConfirm={async () => {
                    if (!selectedVenueToDelete) return
                    try {
                        const res = await fetch(`/api/venues/${selectedVenueToDelete.id}`, { method: "DELETE" })
                        if (!res.ok) throw new Error("Failed")
                        setShowDeleteDialog(false)
                        setSelectedVenueToDelete(null)
                        fetchVenues()
                    } catch (err) {
                        console.error(err)
                        alert("Failed to delete venue")
                    }
                }}
            />
        </div>
    )
}

function VenueForm({
    onClose,
    onSuccess,
    initialData,
}: {
    onClose: () => void
    onSuccess: () => void
    initialData?: Partial<Venue>
}) {
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        address: initialData?.address || "",
        capacity: initialData?.capacity ? String(initialData.capacity) : "",
        facilities: initialData?.facilities ? initialData.facilities.join(", ") : "",
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const facilitiesArray = formData.facilities
                .split(",")
                .map((f) => f.trim())
                .filter((f) => f)

            const method = initialData?.id ? "PUT" : "POST"
            const url = initialData?.id ? `/api/venues/${initialData.id}` : "/api/venues"

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    address: formData.address,
                    capacity: parseInt(formData.capacity),
                    facilities: facilitiesArray,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || `Failed to ${method === "POST" ? "create" : "update"} venue`)
                return
            }

            onSuccess()
        } catch (err) {
            setError("An error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>{initialData?.id ? "Edit Venue" : "Add New Venue"}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Venue Name *</label>
                        <Input
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="Main Auditorium"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Address *</label>
                        <Input
                            value={formData.address}
                            onChange={(e) =>
                                setFormData({ ...formData, address: e.target.value })
                            }
                            placeholder="FPT University, Building A, Floor 2"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Capacity *</label>
                        <Input
                            type="number"
                            min="1"
                            value={formData.capacity}
                            onChange={(e) =>
                                setFormData({ ...formData, capacity: e.target.value })
                            }
                            placeholder="Maximum number of attendees"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Facilities (comma-separated)
                        </label>
                        <Input
                            value={formData.facilities}
                            onChange={(e) =>
                                setFormData({ ...formData, facilities: e.target.value })
                            }
                            placeholder="Projector, Sound System, WiFi, Air Conditioning"
                        />
                        <p className="text-xs text-gray-500">
                            Separate multiple facilities with commas
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={loading}>
                            {loading ? (initialData?.id ? "Saving..." : "Adding...") : (initialData?.id ? "Save Changes" : "Add Venue")}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
