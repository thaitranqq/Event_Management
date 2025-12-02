"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, QrCode } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

interface Registration {
    id: string
    qrCode: string
    status: string
    registeredAt: string
    event: {
        id: string
        title: string
        startDate: string
        endDate: string
        category: string
        venue?: {
            name: string
            address: string
        }
    }
}

export default function RegistrationsPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchRegistrations()
    }, [])

    const fetchRegistrations = async () => {
        try {
            const res = await fetch("/api/registrations")
            const data = await res.json()
            setRegistrations(data.registrations || [])
        } catch (error) {
            console.error("Error fetching registrations:", error)
        } finally {
            setLoading(false)
        }
    }

    const upcomingRegistrations = registrations.filter(
        (reg) => new Date(reg.event.startDate) > new Date()
    )
    const pastRegistrations = registrations.filter(
        (reg) => new Date(reg.event.startDate) <= new Date()
    )

    if (loading) {
        return <div className="text-center py-12">Loading...</div>
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Registrations</h1>
                <p className="text-gray-600 mt-1">
                    View and manage your event registrations
                </p>
            </div>

            {registrations.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <p className="text-gray-500 text-lg mb-4">
                            You haven't registered for any events yet
                        </p>
                        <Link href="/events">
                            <Button>Browse Events</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8">
                    {upcomingRegistrations.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">
                                Upcoming Events ({upcomingRegistrations.length})
                            </h2>
                            <div className="grid gap-4">
                                {upcomingRegistrations.map((registration) => (
                                    <RegistrationCard
                                        key={registration.id}
                                        registration={registration}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {pastRegistrations.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">
                                Past Events ({pastRegistrations.length})
                            </h2>
                            <div className="grid gap-4">
                                {pastRegistrations.map((registration) => (
                                    <RegistrationCard
                                        key={registration.id}
                                        registration={registration}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function RegistrationCard({ registration }: { registration: Registration }) {
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
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className={getCategoryColor(registration.event.category)}>
                                {registration.event.category}
                            </Badge>
                            <Badge variant="outline">{registration.status}</Badge>
                        </div>
                        <h3 className="text-xl font-semibold mb-3">
                            {registration.event.title}
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDateTime(registration.event.startDate)}</span>
                            </div>
                            {registration.event.venue && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{registration.event.venue.name}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>
                                    Registered on {formatDateTime(registration.registeredAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Link href={`/registrations/${registration.id}/ticket`}>
                            <Button variant="outline" size="sm">
                                <QrCode className="w-4 h-4 mr-2" />
                                View Ticket
                            </Button>
                        </Link>
                        <Link href={`/events/${registration.event.id}`}>
                            <Button variant="ghost" size="sm">
                                Event Details
                            </Button>
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
