import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Users } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/utils"

interface Event {
    id: string
    title: string
    description: string
    category: string
    startDate: string
    endDate: string
    capacity: number
    imageUrl?: string
    status: string
    speaker?: {
        name: string
        title?: string
        organization?: string
    }
    venue?: {
        name: string
        address: string
    }
    _count: {
        registrations: number
        checkins: number
    }
}

interface EventCardProps {
    event: Event
}

export function EventCard({ event }: EventCardProps) {
    const availableSlots = event.capacity - event._count.registrations
    const isFullyBooked = availableSlots <= 0

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
        <Link href={`/events/${event.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                    {event.imageUrl ? (
                        <Image
                            src={event.imageUrl}
                            alt={event.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-white text-6xl font-bold opacity-20">
                            {event.title.charAt(0)}
                        </div>
                    )}
                    <div className="absolute top-4 right-4">
                        <Badge className={getCategoryColor(event.category)}>
                            {event.category}
                        </Badge>
                    </div>
                </div>
                <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {event.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {event.description}
                    </p>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDateTime(event.startDate)}</span>
                        </div>
                        {event.venue && (
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span className="line-clamp-1">{event.venue.name}</span>
                            </div>
                        )}
                        {event.speaker && (
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span className="line-clamp-1">{event.speaker.name}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                    <div className="text-sm">
                        {isFullyBooked ? (
                            <span className="text-red-600 font-medium">Fully Booked</span>
                        ) : (
                            <span className="text-gray-600">
                                <span className="font-medium text-gray-900">{availableSlots}</span> slots available
                            </span>
                        )}
                    </div>
                    <div className="text-sm text-gray-500">
                        {event._count.registrations} registered
                    </div>
                </CardFooter>
            </Card>
        </Link>
    )
}
