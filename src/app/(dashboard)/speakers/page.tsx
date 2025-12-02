"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Mail, Phone, Building2 } from "lucide-react"
import ConfirmDialog from "@/components/ConfirmDialog"

interface Speaker {
    id: string
    name: string
    bio?: string
    title?: string
    organization?: string
    email?: string
    phone?: string
    _count: {
        events: number
    }
}

export default function SpeakersPage() {
    const { data: session } = useSession()
    const isAdmin = session?.user?.role === "ADMIN"

    const [speakers, setSpeakers] = useState<Speaker[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [showForm, setShowForm] = useState(false)
    const [editSpeaker, setEditSpeaker] = useState<Speaker | null>(null)
    const [selectedSpeakerToDelete, setSelectedSpeakerToDelete] = useState<Speaker | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    useEffect(() => {
        fetchSpeakers()
    }, [search])

    const fetchSpeakers = async () => {
        try {
            const params = new URLSearchParams()
            if (search) params.append("search", search)

            const res = await fetch(`/api/speakers?${params}`)
            const data = await res.json()
            setSpeakers(data.speakers || [])
        } catch (error) {
            console.error("Error fetching speakers:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="text-center py-12">Loading speakers...</div>
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Speakers</h1>
                    <p className="text-gray-600 mt-1">
                        Manage event speakers and presenters
                    </p>
                </div>
                <Button onClick={() => { setEditSpeaker(null); setShowForm(true) }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Speaker
                </Button>
            </div>

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search speakers by name or organization..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {showForm && (
                <SpeakerForm
                    initialData={editSpeaker || undefined}
                    onClose={() => { setShowForm(false); setEditSpeaker(null) }}
                    onSuccess={() => {
                        setShowForm(false)
                        setEditSpeaker(null)
                        fetchSpeakers()
                    }}
                />
            )}

            {speakers.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <p className="text-gray-500 text-lg mb-4">No speakers found</p>
                        <Button onClick={() => setShowForm(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Speaker
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {speakers.map((speaker) => (
                            <Card key={speaker.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{speaker.name}</CardTitle>
                                            {speaker.title && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {speaker.title}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isAdmin && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setEditSpeaker(speaker)
                                                            setShowForm(true)
                                                        }}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => {
                                                            setSelectedSpeakerToDelete(speaker)
                                                            setShowDeleteDialog(true)
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </>
                                            )}
                                            <Badge variant="outline">{speaker._count.events} events</Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {speaker.organization && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Building2 className="w-4 h-4" />
                                            <span>{speaker.organization}</span>
                                        </div>
                                    )}
                                    {speaker.email && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail className="w-4 h-4" />
                                            <span className="truncate">{speaker.email}</span>
                                        </div>
                                    )}
                                    {speaker.phone && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Phone className="w-4 h-4" />
                                            <span>{speaker.phone}</span>
                                        </div>
                                    )}
                                    {speaker.bio && (
                                        <p className="text-sm text-gray-700 line-clamp-3 mt-3">
                                            {speaker.bio}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
            )}
                <ConfirmDialog
                    open={showDeleteDialog}
                    title={selectedSpeakerToDelete ? `Delete speaker: ${selectedSpeakerToDelete.name}` : "Delete speaker"}
                    description="This will permanently remove the speaker. Events referencing this speaker will set speaker to null."
                    confirmLabel="Delete"
                    cancelLabel="Keep"
                    loading={false}
                    onCancel={() => { setShowDeleteDialog(false); setSelectedSpeakerToDelete(null) }}
                    onConfirm={async () => {
                        if (!selectedSpeakerToDelete) return
                        try {
                            const res = await fetch(`/api/speakers/${selectedSpeakerToDelete.id}`, { method: "DELETE" })
                            if (!res.ok) throw new Error("Failed")
                            setShowDeleteDialog(false)
                            setSelectedSpeakerToDelete(null)
                            fetchSpeakers()
                        } catch (err) {
                            console.error(err)
                            alert("Failed to delete speaker")
                        }
                    }}
                />
        </div>
    )
}

function SpeakerForm({
    onClose,
    onSuccess,
    initialData,
}: {
    onClose: () => void
    onSuccess: () => void
    initialData?: Partial<Speaker>
}) {
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        bio: initialData?.bio || "",
        title: initialData?.title || "",
        organization: initialData?.organization || "",
        email: initialData?.email || "",
        phone: initialData?.phone || "",
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const method = initialData?.id ? "PUT" : "POST"
            const url = initialData?.id ? `/api/speakers/${initialData.id}` : "/api/speakers"

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || `Failed to ${method === "POST" ? "create" : "update"} speaker`)
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
                <CardTitle>{initialData?.id ? "Edit Speaker" : "Add New Speaker"}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name *</label>
                            <Input
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="Speaker name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                placeholder="e.g., Professor, CEO"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Organization</label>
                            <Input
                                value={formData.organization}
                                onChange={(e) =>
                                    setFormData({ ...formData, organization: e.target.value })
                                }
                                placeholder="Company or institution"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                placeholder="email@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Phone</label>
                        <Input
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                            }
                            placeholder="+84 123 456 789"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Bio</label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) =>
                                setFormData({ ...formData, bio: e.target.value })
                            }
                            placeholder="Speaker biography..."
                            rows={4}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={loading}>
                            {loading ? (initialData?.id ? "Saving..." : "Adding...") : (initialData?.id ? "Save Changes" : "Add Speaker")}
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
