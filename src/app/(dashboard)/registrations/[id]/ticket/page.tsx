import { TicketPageClient } from "@/components/TicketPageClient"

interface PageProps {
    params: {
        id: string
    }
}

export default function TicketPage({ params }: PageProps) {
    return <TicketPageClient registrationId={params.id} />
}
