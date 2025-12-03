import { redirect } from "next/navigation"

export default function HomePage() {
    // Always redirect root to the public events listing
    redirect("/events")
}
