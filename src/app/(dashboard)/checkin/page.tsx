"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScanLine, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

// Dynamically load the QR scanner on client only (no SSR)
const QrScanner: any = dynamic(() => import("react-qr-scanner"), { ssr: false })

export default function CheckInPage() {
    const [scanning, setScanning] = useState(false)
    const [result, setResult] = useState<{
        type: "success" | "error" | "warning"
        message: string
        data?: any
    } | null>(null)
    const [recentCheckIns, setRecentCheckIns] = useState<any[]>([])
    const [manualCode, setManualCode] = useState("")
    const [cameraActive, setCameraActive] = useState(false)
    const [cameraError, setCameraError] = useState<string | null>(null)

    const handleScan = async (qrCode: string) => {
        setScanning(true)
        setResult(null)

        try {
            const res = await fetch("/api/checkin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ qrCode }),
            })

            const data = await res.json()

            if (res.ok) {
                setResult({
                    type: "success",
                    message: "Check-in successful!",
                    data: data.checkIn,
                })
                setRecentCheckIns((prev) => [data.checkIn, ...prev.slice(0, 9)])
                setManualCode("")
            } else if (res.status === 409) {
                setResult({
                    type: "warning",
                    message: `Already checked in at ${new Date(
                        data.checkedInAt
                    ).toLocaleString()}`,
                })
            } else {
                setResult({
                    type: "error",
                    message: data.error || "Check-in failed",
                })
            }
        } catch (error) {
            setResult({
                type: "error",
                message: "An error occurred. Please try again.",
            })
        } finally {
            setScanning(false)
            setTimeout(() => setResult(null), 5000)
        }
    }

    const handleManualCheckIn = (e: React.FormEvent) => {
        e.preventDefault()
        if (manualCode.trim()) {
            handleScan(manualCode.trim())
        }
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Event Check-in</h1>
                <p className="text-gray-600 mt-1">
                    Scan QR codes to check in attendees
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>QR Code Scanner</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                {cameraActive ? (
                                    <div className="w-full h-full">
                                        {cameraError && (
                                            <div className="p-3 text-sm text-red-600">{cameraError}</div>
                                        )}
                                        <div className="w-full h-full relative overflow-hidden rounded-lg">
                                            <QrScanner
                                                delay={300}
                                                facingMode="environment"
                                                onError={(err: any) => {
                                                    console.error('QR Scanner error', err)
                                                    setCameraError(err?.message || 'Camera error')
                                                    setCameraActive(false)
                                                }}
                                                onScan={(data: any) => {
                                                    if (!data) return
                                                    // data may be string or object depending on library
                                                    const code = typeof data === 'string' ? data : data?.text || data?.data || ''
                                                    if (code) {
                                                        setCameraActive(false)
                                                        handleScan(code)
                                                    }
                                                }}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                                <div className="border-2 border-white/70 rounded-md w-3/4 h-3/4 md:w-2/3 md:h-2/3" />
                                            </div>
                                        </div>
                                        <div className="mt-2 text-center">
                                            <Button variant="outline" onClick={() => setCameraActive(false)}>Stop camera</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <ScanLine className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600 mb-4">Camera scanner will be available here</p>
                                        <p className="text-sm text-gray-500">Note: Camera access requires HTTPS in production</p>
                                        <div className="mt-4">
                                            <Button onClick={() => { setCameraError(null); setCameraActive(true) }}>
                                                Start Camera
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t pt-4">
                                <form onSubmit={handleManualCheckIn} className="space-y-3">
                                    <label className="text-sm font-medium">
                                        Manual Entry (for testing)
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={manualCode}
                                            onChange={(e) => setManualCode(e.target.value)}
                                            placeholder="Enter QR code manually"
                                            className="flex-1 px-3 py-2 border rounded-md"
                                            disabled={scanning}
                                        />
                                        <Button type="submit" disabled={scanning || !manualCode}>
                                            {scanning ? "Processing..." : "Check In"}
                                        </Button>
                                    </div>
                                </form>
                            </div>

                            {result && (
                                <div
                                    className={`p-4 rounded-lg ${result.type === "success"
                                        ? "bg-green-50 text-green-800"
                                        : result.type === "warning"
                                            ? "bg-yellow-50 text-yellow-800"
                                            : "bg-red-50 text-red-800"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {result.type === "success" ? (
                                            <CheckCircle2 className="w-6 h-6" />
                                        ) : result.type === "warning" ? (
                                            <AlertCircle className="w-6 h-6" />
                                        ) : (
                                            <XCircle className="w-6 h-6" />
                                        )}
                                        <div>
                                            <p className="font-medium">{result.message}</p>
                                            {result.data && (
                                                <div className="mt-2 text-sm">
                                                    <p>
                                                        <strong>{result.data.user.name}</strong>
                                                    </p>
                                                    <p>{result.data.user.email}</p>
                                                    <p className="text-xs mt-1">
                                                        {result.data.event.title}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Check-ins</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentCheckIns.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-8">
                                    No check-ins yet
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {recentCheckIns.map((checkIn, index) => (
                                        <div
                                            key={index}
                                            className="p-3 bg-gray-50 rounded-lg space-y-1"
                                        >
                                            <p className="font-medium text-sm">
                                                {checkIn.user.name}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {checkIn.user.studentId}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(checkIn.checkedInAt).toLocaleTimeString()}
                                            </p>
                                            <Badge variant="outline" className="text-xs">
                                                {checkIn.method}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Check-in Stats</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">{`Today's Check-ins`}</span>
                                    <span className="text-2xl font-bold text-primary">
                                        {recentCheckIns.length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Success Rate</span>
                                    <span className="text-lg font-semibold text-green-600">
                                        100%
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
