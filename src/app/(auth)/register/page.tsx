"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function RegisterPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        studentId: "",
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.password !== formData.confirmPassword) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Passwords do not match",
            })
            return
        }

        // Client-side validation: enforce FPT student email domain
        if (!formData.email.toLowerCase().endsWith("@fpt.edu.vn")) {
            toast({
                variant: "destructive",
                title: "Invalid email domain",
                description: "Email must be an @fpt.edu.vn address",
            })
            return
        }

        // Basic studentId validation: alphanumeric, 6-10 chars
        const sid = formData.studentId || ""
        if (!/^[a-zA-Z0-9]{6,10}$/.test(sid)) {
            toast({
                variant: "destructive",
                title: "Invalid student ID",
                description: "Student ID must be alphanumeric and 6-10 characters",
            })
            return
        }

        setLoading(true)

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    studentId: formData.studentId,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Registration failed")
            }

            toast({
                title: "Success",
                description: "Account created. Please verify your email.",
            })

            router.push(`/otp-verification?email=${encodeURIComponent(formData.email)}`)
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center">
                        <Image src="/images/logo.png" alt="FPT University" width={160} height={48} />
                    </div>
                    <CardTitle className="text-3xl font-bold">
                        Create Account
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your details to create a new account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Full Name
                            </label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="studentId" className="text-sm font-medium">
                                Student ID
                            </label>
                            <Input
                                id="studentId"
                                placeholder="SE123456"
                                value={formData.studentId}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="student@fpt.edu.vn"
                                value={formData.email}
                                onChange={handleChange}
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
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium">
                                Confirm Password
                            </label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                minLength={6}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating Account..." : "Create Account"}
                        </Button>
                        <div className="text-center text-sm">
                            Already have an account?{" "}
                            <Link href="/login" className="text-blue-600 hover:underline">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
