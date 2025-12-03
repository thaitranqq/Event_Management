'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface FeedbackFormProps {
    eventId: string
    eventTitle: string
    onSuccess?: () => void
}

export function FeedbackForm({ eventId, eventTitle, onSuccess }: FeedbackFormProps) {
    const router = useRouter()
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (rating === 0) {
            toast({
                title: 'Rating required',
                description: 'Please select a rating before submitting',
                variant: 'destructive',
            })
            return
        }

        setIsSubmitting(true)

        try {
            const res = await fetch(`/api/events/${eventId}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comment }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit feedback')
            }

            toast({
                title: 'Feedback submitted',
                description: 'Thank you for your feedback!',
            })

            setRating(0)
            setComment('')

            // Refresh the page to show the new feedback
            router.refresh()
            onSuccess?.()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2">Rate this event</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    How would you rate &quot;{eventTitle}&quot;?
                </p>

                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="transition-transform hover:scale-110"
                        >
                            <Star
                                className={`h-8 w-8 ${star <= (hoveredRating || rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
                {rating > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                        {rating === 1 && 'Poor'}
                        {rating === 2 && 'Fair'}
                        {rating === 3 && 'Good'}
                        {rating === 4 && 'Very Good'}
                        {rating === 5 && 'Excellent'}
                    </p>
                )}
            </div>

            <div>
                <Label htmlFor="comment">Comments (Optional)</Label>
                <Textarea
                    id="comment"
                    placeholder="Share your thoughts about the event..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="mt-2"
                />
            </div>

            <Button type="submit" disabled={isSubmitting || rating === 0}>
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
        </form>
    )
}
