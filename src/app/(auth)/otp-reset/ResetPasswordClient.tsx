"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function ResetPasswordClient() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const paramEmail = searchParams.get("email") || ""
    const [email, setEmail] = useState(paramEmail)
    const [otp, setOtp] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        if (paramEmail) setEmail(paramEmail)
    }, [paramEmail])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            toast({ variant: "destructive", title: "Error", description: "Passwords do not match" })
            return
        }
        setLoading(true)
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Failed to reset password")

            toast({ title: "Success", description: "Password reset successfully. Please login." })
            router.push("/login")
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
                    <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
                    <CardDescription className="text-center">Enter the OTP sent to your email and set a new password.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <Input id="email" type="email" placeholder="student@fpt.edu.vn" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading || !!paramEmail} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="otp" className="text-sm font-medium">OTP</label>
                            <Input id="otp" type="text" placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0,6))} maxLength={6} required disabled={loading} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
                            <Input id="newPassword" type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={loading} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                            <Input id="confirmPassword" type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading} />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Resetting..." : "Reset Password"}</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
