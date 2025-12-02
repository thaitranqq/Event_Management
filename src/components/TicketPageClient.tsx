"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Download, ArrowLeft } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

interface Registration {
    id: string
    qrCode: string
    status: string
    registeredAt: string
    event: {
        id: string
        title: string
        description: string
        category: string
        startDate: string
        endDate: string
        speaker?: {
            name: string
            title?: string
        }
        venue?: {
            name: string
            address: string
        }
    }
}

interface TicketPageClientProps {
    registrationId: string
}

export function TicketPageClient({ registrationId }: TicketPageClientProps) {
    const router = useRouter()
    const [registration, setRegistration] = useState<Registration | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchRegistration()
    }, [registrationId])

    const fetchRegistration = async () => {
        try {
            const res = await fetch("/api/registrations")
            const data = await res.json()
            const reg = data.registrations?.find((r: Registration) => r.id === registrationId)
            setRegistration(reg || null)
        } catch (error) {
            console.error("Error fetching registration:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = () => {
        if (!registration) return

        const svg = document.getElementById("qr-code")
        if (!svg) return

        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()

        img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx?.drawImage(img, 0, 0)
            const pngFile = canvas.toDataURL("image/png")

            const downloadLink = document.createElement("a")
            downloadLink.download = `ticket-${registration.event.title}-${registrationId}.png`
            downloadLink.href = pngFile
            downloadLink.click()
        }

        img.src = "data:image/svg+xml;base64," + btoa(svgData)
    }

    const handlePrint = () => {
        window.print()
    }

    if (loading) {
        return <div className="text-center py-12">Loading ticket...</div>
    }

    if (!registration) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 mb-4">Registration not found</p>
                <Button onClick={() => router.push("/registrations")}>
                    Back to Registrations
                </Button>
            </div>
        )
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
        <div className="max-w-2xl mx-auto">
            <div className="mb-6 print:hidden">
                <Button
                    variant="outline"
                    onClick={() => router.push("/registrations")}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Registrations
                </Button>
            </div>

            <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <Badge className={`${getCategoryColor(registration.event.category)} mb-2`}>
                                {registration.event.category}
                            </Badge>
                            <h1 className="text-3xl font-bold text-white">Event Ticket</h1>
                        </div>
                        <Badge variant="secondary" className="bg-white text-blue-600">
                            {registration.status}
                        </Badge>
                    </div>
                </div>

                <CardContent className="p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-2">
                            {registration.event.title}
                        </h2>
                        <p className="text-gray-600">{registration.event.description}</p>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <Calendar className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-sm text-gray-600">Date & Time</p>
                                <p className="font-medium">
                                    {formatDateTime(registration.event.startDate)}
                                </p>
                            </div>
                        </div>

                        {registration.event.venue && (
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <MapPin className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="text-sm text-gray-600">Venue</p>
                                    <p className="font-medium">{registration.event.venue.name}</p>
                                    <p className="text-sm text-gray-600">
                                        {registration.event.venue.address}
                                    </p>
                                </div>
                            </div>
                        )}

                        {registration.event.speaker && (
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <div className="w-5 h-5 text-primary flex items-center justify-center">
                                    👤
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Speaker</p>
                                    <p className="font-medium">{registration.event.speaker.name}</p>
                                    {registration.event.speaker.title && (
                                        <p className="text-sm text-gray-600">
                                            {registration.event.speaker.title}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-6">
                        <div className="text-center mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                Show this QR code at the event check-in
                            </p>
                        </div>
                        <div className="flex justify-center p-8 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                            <QRCodeSVG
                                id="qr-code"
                                value={registration.qrCode}
                                size={256}
                                level="H"
                                includeMargin
                            />
                        </div>
                        <div className="text-center mt-4">
                            <p className="text-xs text-gray-500 font-mono">
                                {registration.qrCode}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3 print:hidden">
                        <Button onClick={handleDownload} className="flex-1">
                            <Download className="w-4 h-4 mr-2" />
                            Download QR Code
                        </Button>
                        <Button onClick={handlePrint} variant="outline" className="flex-1">
                            Print Ticket
                        </Button>
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>Registered on {formatDateTime(registration.registeredAt)}</p>
                        <p className="mt-2">
                            Please arrive 15 minutes before the event starts
                        </p>
                    </div>
                </CardContent>
            </Card>

            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .max-w-2xl,
          .max-w-2xl * {
            visibility: visible;
          }
          .max-w-2xl {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
        </div>
    )
}
