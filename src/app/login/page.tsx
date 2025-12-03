"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            console.log("SignIn Result:", result)

            if (result?.error) {
                // Check if it's an unverified email issue
                const checkRes = await fetch("/api/auth/check-verification", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                })

                if (checkRes.ok) {
                    const { verified } = await checkRes.json()
                    if (!verified) {
                        // Email not verified, send OTP and redirect
                        await fetch("/api/auth/resend-otp", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email }),
                        })

                        router.push(`/otp-verification?email=${encodeURIComponent(email)}`)
                        return
                    }
                }

                setError("Invalid email or password")
            } else {
                router.push("/events")
                router.refresh()
            }
        } catch (error) {
            setError("An error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center">
                        <Image src="/images/logo.png" alt="FPT University" width={140} height={42} />
                    </div>
                    <CardTitle className="text-3xl font-bold text-center">
                        FPT Events
                    </CardTitle>
                    <CardDescription className="text-center">
                        Sign in to manage and attend university events
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
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md break-words">
                                {error}
                            </div>
                        )}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
                <div className="px-6 pb-6 text-center text-sm space-y-2">
                    <div>
                        Don&apos;t have an account?{" "}
                        <a href="/register" className="text-blue-600 hover:underline">
                            Sign up
                        </a>
                    </div>
                    <div>
                        <a href="/otp-forgot" className="text-sm text-blue-600 hover:underline">
                            Forgot password?
                        </a>
                    </div>
                </div>
            </Card>
        </div>
    )
}
