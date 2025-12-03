"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import ConfirmDialog from "@/components/ConfirmDialog"
import Image from "next/image"
import { Calendar, MapPin, Users, Clock, UserPlus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDateTime } from "@/lib/utils"
import { AnnouncementList } from "@/components/announcement-list"
import { AnnouncementForm } from "@/components/announcement-form"
import { FeedbackForm } from "@/components/feedback-form"
import { FeedbackList } from "@/components/feedback-list"

interface EventDetailClientProps {
    event: any
}

export function EventDetailClient({ event }: EventDetailClientProps) {
    const router = useRouter()
    const { data: session } = useSession()
    const [isRegistering, setIsRegistering] = useState(false)
    const [error, setError] = useState("")

    const isAdmin = session?.user?.role === "ADMIN"
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [announcementsVersion, setAnnouncementsVersion] = useState(0)
    const [feedbackVersion, setFeedbackVersion] = useState(0)
    const availableSlots = event.capacity - event._count.registrations
    const isFullyBooked = availableSlots <= 0

    const handleRegister = async () => {
        if (!session) {
            router.push("/login")
            return
        }

        setIsRegistering(true)
        setError("")

        try {
            const res = await fetch("/api/registrations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ eventId: event.id }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Failed to register")
                return
            }

            router.push(`/registrations/${data.id}/ticket`)
        } catch (err) {
            setError("An error occurred. Please try again.")
        } finally {
            setIsRegistering(false)
        }
    }

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            TECHNOLOGY: "bg-blue-100 text-blue-700",
            BUSINESS: "bg-green-100 text-green-700",
            WORKSHOP: "bg-purple-100 text-purple-700",
            SEMINAR: "bg-yellow-100 text-yellow-700",
            NETWORKING: "bg-pink-100 text-pink-700",
            CAREER: "bg-indigo-100 text-indigo-700",
            SOCIAL: "bg-orange-100 text-orange-700",
            SPORTS: "bg-red-100 text-red-700",
        }
        return colors[category] || "bg-gray-100 text-gray-700"
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <Button variant="outline" onClick={() => router.back()}>
                    ← Back
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="relative h-80 bg-gradient-to-br from-blue-500 to-purple-600">
                            {event.imageUrl ? (
                                <Image
                                    src={event.imageUrl}
                                    alt={event.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-white text-9xl font-bold opacity-20">
                                    {event.title.charAt(0)}
                                </div>
                            )}
                        </div>
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <Badge className={getCategoryColor(event.category)}>
                                        {event.category}
                                    </Badge>
                                    <CardTitle className="mt-2 text-3xl">
                                        {event.title}
                                    </CardTitle>
                                </div>
                                {isAdmin && (
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => router.push(`/events/${event.id}/edit`)}>
                                            Edit
                                        </Button>
                                        <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>
                                            Cancel Event
                                        </Button>
                                        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                                            Delete Permanently
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <ConfirmDialog
                            open={showCancelDialog}
                            title={`Cancel event: ${event.title}`}
                            description="This will mark the event as CANCELLED. Attendees will no longer be able to register or check in."
                            confirmLabel="Cancel Event"
                            cancelLabel="Keep"
                            loading={false}
                            onCancel={() => setShowCancelDialog(false)}
                            onConfirm={async () => {
                                try {
                                    const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" })
                                    if (!res.ok) {
                                        const data = await res.json()
                                        throw new Error(data.error || "Failed to cancel event")
                                    }
                                    setShowCancelDialog(false)
                                    router.push("/events")
                                    router.refresh()
                                } catch (err) {
                                    console.error(err)
                                    alert((err as Error).message || "Failed to cancel event")
                                }
                            }}
                        />

                        <ConfirmDialog
                            open={showDeleteDialog}
                            title={`Delete permanently: ${event.title}`}
                            description="This will permanently delete the event and all related registrations and check-ins. This action cannot be undone."
                            confirmLabel="Delete Permanently"
                            cancelLabel="Keep"
                            loading={false}
                            onCancel={() => setShowDeleteDialog(false)}
                            onConfirm={async () => {
                                try {
                                    const res = await fetch(`/api/events/${event.id}?hard=true`, { method: "DELETE" })
                                    if (!res.ok) {
                                        const data = await res.json()
                                        throw new Error(data.error || "Failed to delete event")
                                    }
                                    setShowDeleteDialog(false)
                                    router.push("/events")
                                    router.refresh()
                                } catch (err) {
                                    console.error(err)
                                    alert((err as Error).message || "Failed to delete event")
                                }
                            }}
                        />
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">About This Event</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">
                                    {event.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-primary mt-1" />
                                    <div>
                                        <p className="font-medium">Date & Time</p>
                                        <p className="text-sm text-gray-600">
                                            {formatDateTime(event.startDate)}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            to {formatDateTime(event.endDate)}
                                        </p>
                                    </div>
                                </div>

                                {event.venue && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-primary mt-1" />
                                        <div>
                                            <p className="font-medium">{event.venue.name}</p>
                                            <p className="text-sm text-gray-600">
                                                {event.venue.address}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {event.speaker && (
                                    <div className="flex items-start gap-3">
                                        <Users className="w-5 h-5 text-primary mt-1" />
                                        <div>
                                            <p className="font-medium">{event.speaker.name}</p>
                                            {event.speaker.title && (
                                                <p className="text-sm text-gray-600">
                                                    {event.speaker.title}
                                                    {event.speaker.organization && ` at ${event.speaker.organization}`}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <UserPlus className="w-5 h-5 text-primary mt-1" />
                                    <div>
                                        <p className="font-medium">Capacity</p>
                                        <p className="text-sm text-gray-600">
                                            {event._count.registrations} / {event.capacity} registered
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Registration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center py-4">
                                <p className="text-3xl font-bold text-primary">
                                    {availableSlots}
                                </p>
                                <p className="text-sm text-gray-600">Slots Available</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                                    {error}
                                </div>
                            )}

                            {event.isRegistered ? (
                                <div className="space-y-3">
                                    <div className="bg-green-50 text-green-700 p-4 rounded-md text-center">
                                        ✓ You are registered
                                    </div>
                                    <Button
                                        className="w-full"
                                        onClick={() => router.push("/registrations")}
                                    >
                                        View My Ticket
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    className="w-full"
                                    onClick={handleRegister}
                                    disabled={isRegistering || isFullyBooked || isAdmin}
                                >
                                    {isRegistering
                                        ? "Registering..."
                                        : isFullyBooked
                                            ? "Fully Booked"
                                            : isAdmin
                                                ? "Admin Cannot Register"
                                                : "Register Now"}
                                </Button>
                            )}

                            <div className="pt-4 border-t space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Status:</span>
                                    <Badge variant={event.status === "PUBLISHED" ? "default" : "secondary"}>
                                        {event.status}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>Registered:</span>
                                    <span className="font-medium">{event._count.registrations}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Checked In:</span>
                                    <span className="font-medium">{event._count.checkins}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Announcements and Feedback Tabs */}
            <Tabs defaultValue="announcements" className="mt-8">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="announcements">Announcements</TabsTrigger>
                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                </TabsList>

                <TabsContent value="announcements" className="space-y-4 mt-6">
                    {(isAdmin || session?.user?.role === 'STAFF') && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Create Announcement</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AnnouncementForm
                                    eventId={event.id}
                                    onSuccess={() => {
                                        setAnnouncementsVersion((v) => v + 1)
                                        router.refresh()
                                    }}
                                />
                            </CardContent>
                        </Card>
                    )}
                    <AnnouncementList eventId={event.id} version={announcementsVersion} />
                </TabsContent>

                <TabsContent value="feedback" className="space-y-4 mt-6">
                    {event.isRegistered && new Date(event.endDate) < new Date() && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Submit Your Feedback</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FeedbackForm
                                    eventId={event.id}
                                    eventTitle={event.title}
                                    onSuccess={() => {
                                        setFeedbackVersion((v) => v + 1)
                                        router.refresh()
                                    }}
                                />
                            </CardContent>
                        </Card>
                    )}
                    <FeedbackList eventId={event.id} version={feedbackVersion} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
