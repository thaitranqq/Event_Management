import dynamic from "next/dynamic"

// Render the client component dynamically to avoid prerender/runtime errors on the server
const ResetPasswordClient = dynamic(() => import("./ResetPasswordClient"), { ssr: false })

export default function ResetPasswordPage() {
    return <ResetPasswordClient />
}
