"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function ChangePasswordPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const { toast } = useToast()
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        }
    }, [status, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            toast({ variant: "destructive", title: "Error", description: "Passwords do not match" })
            return
        }
        if (!session?.user?.email) {
            toast({ variant: "destructive", title: "Error", description: "Unable to determine user" })
            return
        }
        setLoading(true)
        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: session.user.email, oldPassword, newPassword }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Failed to change password")

            toast({ title: "Success", description: "Password changed successfully." })
            setOldPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (err: any) {
            toast({ variant: "destructive", title: "Error", description: err.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Change Password</CardTitle>
                    <CardDescription className="text-center">Enter your current password and choose a new one.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="oldPassword" className="text-sm font-medium">Current Password</label>
                            <Input id="oldPassword" type="password" placeholder="Current password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required disabled={loading} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
                            <Input id="newPassword" type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={loading} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</label>
                            <Input id="confirmPassword" type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading} />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Changing..." : "Change Password"}</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
