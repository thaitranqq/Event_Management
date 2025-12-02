"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Calendar,
    Users,
    UserCheck,
    TrendingUp,
    Award,
    MapPin,
    Presentation,
    CheckCircle2,
} from "lucide-react"

interface ReportData {
    overview: {
        totalEvents: number
        publishedEvents: number
        totalRegistrations: number
        totalCheckIns: number
        totalUsers: number
        totalSpeakers: number
        totalVenues: number
        recentRegistrations: number
        attendanceRate: number
    }
    eventsByCategory: Array<{ category: string; count: number }>
    eventsByStatus: Array<{ status: string; count: number }>
    topEvents: Array<{
        id: string
        title: string
        category: string
        _count: {
            registrations: number
            checkins: number
        }
    }>
}

export default function ReportsPage() {
    const [data, setData] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        try {
            const res = await fetch("/api/reports/overview")
            const reportData = await res.json()
            setData(reportData)
        } catch (error) {
            console.error("Error fetching reports:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="text-center py-12">Loading reports...</div>
    }

    if (!data) {
        return (
            <div className="text-center py-12 text-red-600">
                Failed to load reports
            </div>
        )
    }

    const { overview, eventsByCategory, eventsByStatus, topEvents } = data

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
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Reports & Analytics
                </h1>
                <p className="text-gray-600 mt-1">
                    Overview of event management statistics and insights
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Total Events"
                    value={overview.totalEvents}
                    subtitle={`${overview.publishedEvents} published`}
                    icon={Calendar}
                    color="blue"
                />
                <MetricCard
                    title="Total Registrations"
                    value={overview.totalRegistrations}
                    subtitle={`${overview.recentRegistrations} this week`}
                    icon={Users}
                    color="green"
                />
                <MetricCard
                    title="Total Check-ins"
                    value={overview.totalCheckIns}
                    subtitle={`${overview.attendanceRate}% attendance rate`}
                    icon={UserCheck}
                    color="purple"
                />
                <MetricCard
                    title="Total Users"
                    value={overview.totalUsers}
                    subtitle="Registered users"
                    icon={TrendingUp}
                    color="orange"
                />
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Speakers</CardTitle>
                        <Presentation className="w-4 h-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overview.totalSpeakers}</div>
                        <p className="text-xs text-gray-500 mt-1">Total speakers</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Venues</CardTitle>
                        <MapPin className="w-4 h-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overview.totalVenues}</div>
                        <p className="text-xs text-gray-500 mt-1">Available venues</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Attendance Rate
                        </CardTitle>
                        <CheckCircle2 className="w-4 h-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {overview.attendanceRate}%
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Check-in to registration ratio
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Events by Category */}
                <Card>
                    <CardHeader>
                        <CardTitle>Events by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {eventsByCategory.map((item) => (
                                <div
                                    key={item.category}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <Badge className={getCategoryColor(item.category)}>
                                            {item.category}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-sm text-gray-600">{item.count}</div>
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min(
                                                        (item.count / overview.totalEvents) * 100,
                                                        100
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Events by Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Events by Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {eventsByStatus.map((item) => (
                                <div
                                    key={item.status}
                                    className="flex items-center justify-between"
                                >
                                    <Badge
                                        variant={
                                            item.status === "PUBLISHED"
                                                ? "default"
                                                : item.status === "DRAFT"
                                                    ? "secondary"
                                                    : "outline"
                                        }
                                    >
                                        {item.status}
                                    </Badge>
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl font-bold">{item.count}</div>
                                        <div className="text-sm text-gray-500">events</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Events */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Top Events by Registration
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topEvents.map((event, index) => (
                            <div
                                key={event.id}
                                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium">{event.title}</h3>
                                    <Badge className={`${getCategoryColor(event.category)} mt-1`}>
                                        {event.category}
                                    </Badge>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-primary">
                                        {event._count.registrations}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {event._count.checkins} checked in
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function MetricCard({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
}: {
    title: string
    value: number
    subtitle: string
    icon: any
    color: string
}) {
    const colorClasses: Record<string, string> = {
        blue: "bg-blue-500",
        green: "bg-green-500",
        purple: "bg-purple-500",
        orange: "bg-orange-500",
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className={`${colorClasses[color]} p-2 rounded-lg`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{value}</div>
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            </CardContent>
        </Card>
    )
}
