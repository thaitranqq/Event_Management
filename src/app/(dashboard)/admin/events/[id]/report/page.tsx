"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Calendar, Users, CheckCircle, Clock } from "lucide-react"
import { format } from "date-fns"

interface ReportData {
    event: {
        id: string
        title: string
        startDate: string
        endDate: string
        status: string
    }
    stats: {
        totalRegistrations: number
        totalCheckIns: number
        checkInTimeRange: {
            earliest: string | null
            latest: string | null
        }
    }
    staffCheckIns: Array<{
        staff: {
            id: string
            name: string
            email: string
        }
        count: number
        checkIns: Array<{
            user: {
                id: string
                name: string
                email: string
                studentId: string | null
            }
            checkedInAt: string
        }>
    }>
}

export default function EventReportPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [data, setData] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await fetch(`/api/admin/events/${params.id}/report`)
                if (!res.ok) throw new Error("Failed to fetch report")
                const reportData = await res.json()
                setData(reportData)
            } catch (err) {
                setError("Failed to load report data")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchReport()
    }, [params.id])

    if (loading) return <div className="p-8 text-center">Loading report...</div>
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>
    if (!data) return null

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Event Report</h1>
                    <p className="text-muted-foreground">{data.event.title}</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.totalRegistrations}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Check-ins</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.totalCheckIns}</div>
                        <p className="text-xs text-muted-foreground">
                            {data.stats.totalRegistrations > 0
                                ? `${Math.round((data.stats.totalCheckIns / data.stats.totalRegistrations) * 100)}% attendance rate`
                                : "0% attendance rate"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Check-in Activity</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {data.stats.checkInTimeRange.earliest ? (
                            <div className="text-xs space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">First:</span>
                                    <span>{format(new Date(data.stats.checkInTimeRange.earliest), "HH:mm dd/MM")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Last:</span>
                                    <span>{format(new Date(data.stats.checkInTimeRange.latest!), "HH:mm dd/MM")}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">No activity yet</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Staff Performance</CardTitle>
                    <CardDescription>Breakdown of check-ins by staff member</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {data.staffCheckIns.map((staffStat) => (
                            <AccordionItem key={staffStat.staff.id} value={staffStat.staff.id}>
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex flex-1 items-center justify-between pr-4">
                                        <div className="flex flex-col items-start text-left">
                                            <span className="font-medium">{staffStat.staff.name}</span>
                                            <span className="text-xs text-muted-foreground">{staffStat.staff.email}</span>
                                        </div>
                                        <Badge variant="secondary" className="ml-auto mr-2">
                                            {staffStat.count} check-ins
                                        </Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Student</TableHead>
                                                    <TableHead>Student ID</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead className="text-right">Time</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {staffStat.checkIns.map((checkIn, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell className="font-medium">{checkIn.user.name}</TableCell>
                                                        <TableCell>{checkIn.user.studentId || "N/A"}</TableCell>
                                                        <TableCell>{checkIn.user.email}</TableCell>
                                                        <TableCell className="text-right">
                                                            {format(new Date(checkIn.checkedInAt), "HH:mm:ss")}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                        {data.staffCheckIns.length === 0 && (
                            <div className="text-center py-6 text-muted-foreground">
                                No check-in data available
                            </div>
                        )}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    )
}
