'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star } from 'lucide-react'

interface Feedback {
    id: string
    rating: number
    comment: string | null
    submittedAt: string
    user: {
        id: string
        name: string
        image: string | null
    }
}

interface FeedbackListProps {
    eventId: string
}

export function FeedbackList({ eventId, version }: FeedbackListProps & { version?: number }) {
    const [feedback, setFeedback] = useState<Feedback[]>([])
    const [averageRating, setAverageRating] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const res = await fetch(`/api/events/${eventId}/feedback`)
                if (res.ok) {
                    const data = await res.json()
                    setFeedback(data.feedback)
                    setAverageRating(data.averageRating)
                }
            } catch (error) {
                console.error('Error fetching feedback:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchFeedback()
    }, [eventId, version])

    if (isLoading) {
        return <div className="text-center py-8">Loading feedback...</div>
    }

    return (
        <div className="space-y-6">
            {feedback.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            Average Rating: {averageRating.toFixed(1)} / 5.0
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Based on {feedback.length} {feedback.length === 1 ? 'review' : 'reviews'}
                        </p>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                {feedback.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No feedback yet
                        </CardContent>
                    </Card>
                ) : (
                    feedback.map((item) => (
                        <Card key={item.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <Avatar>
                                        <AvatarImage src={item.user.image || undefined} />
                                        <AvatarFallback>
                                            {item.user.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-semibold">{item.user.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true })}
                                            </p>
                                        </div>

                                        <div className="flex gap-1 mb-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`h-4 w-4 ${star <= item.rating
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>

                                        {item.comment && (
                                            <p className="text-sm text-muted-foreground mt-2">
                                                {item.comment}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
