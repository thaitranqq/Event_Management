"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

function OTPVerificationContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const paramEmail = searchParams.get("email")
    const [email, setEmail] = useState(paramEmail || "")
    const [otp, setOtp] = useState("")
    const [loading, setLoading] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)
    const { toast } = useToast()

    // Update email state if param changes
    useEffect(() => {
        if (paramEmail) {
            setEmail(paramEmail)
        }
    }, [paramEmail])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Verification failed")
            }

            toast({
                title: "Success",
                description: "Email verified successfully. Please login.",
            })

            router.push("/login")
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            })
        } finally {
            setLoading(false)
        }
    }

    const handleResendOtp = async () => {
        if (!email) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Email is required to resend OTP",
            })
            return
        }

        setResendLoading(true)
        try {
            const res = await fetch("/api/auth/resend-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Failed to resend OTP")
            }

            toast({
                title: "OTP Resent",
                description: "A new OTP has been sent to your email.",
            })
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            })
        } finally {
            setResendLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Verify Your Email
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter the 6-digit code sent to your email
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="student@fpt.edu.vn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading || !!paramEmail}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="otp" className="text-sm font-medium">
                                OTP Code
                            </label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="text-center text-2xl tracking-widest"
                                maxLength={6}
                                required
                                disabled={loading}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading || otp.length !== 6 || !email}>
                            {loading ? "Verifying..." : "Verify Email"}
                        </Button>
                        <div className="text-center">
                            <Button
                                type="button"
                                variant="link"
                                onClick={handleResendOtp}
                                disabled={resendLoading || !email}
                                className="text-sm text-muted-foreground"
                            >
                                {resendLoading ? "Sending..." : "Resend OTP"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default function OTPVerificationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OTPVerificationContent />
        </Suspense>
    )
}
