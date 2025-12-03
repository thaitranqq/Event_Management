'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Info, AlertTriangle } from 'lucide-react'

interface Announcement {
    id: string
    title: string
    content: string
    priority: 'LOW' | 'NORMAL' | 'HIGH'
    publishedAt: string
}

interface AnnouncementListProps {
    eventId: string
    version?: number
}

export function AnnouncementList({ eventId, version }: AnnouncementListProps) {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await fetch(`/api/events/${eventId}/announcements`)
                if (res.ok) {
                    const data = await res.json()
                    setAnnouncements(data.announcements)
                }
            } catch (error) {
                console.error('Error fetching announcements:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchAnnouncements()
    }, [eventId, version])

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'HIGH':
                return <AlertCircle className="h-5 w-5" />
            case 'NORMAL':
                return <Info className="h-5 w-5" />
            case 'LOW':
                return <AlertTriangle className="h-5 w-5" />
            default:
                return <Info className="h-5 w-5" />
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH':
                return 'destructive'
            case 'NORMAL':
                return 'default'
            case 'LOW':
                return 'secondary'
            default:
                return 'default'
        }
    }

    if (isLoading) {
        return <div className="text-center py-4">Loading announcements...</div>
    }

    if (announcements.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    No announcements yet
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {announcements.map((announcement) => (
                <Card key={announcement.id}>
                    <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                                <div className="mt-1">
                                    {getPriorityIcon(announcement.priority)}
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDistanceToNow(new Date(announcement.publishedAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                            <Badge variant={getPriorityColor(announcement.priority) as any}>
                                {announcement.priority}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{announcement.content}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
