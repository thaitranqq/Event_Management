"use client"

import React from "react"
import { Button } from "@/components/ui/button"

export default function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    loading = false,
}: {
    open: boolean
    title: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel: () => void
    loading?: boolean
}) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

            <div className="relative w-full max-w-md mx-4">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-4">
                        <h3 className="text-lg font-semibold">{title}</h3>
                        {description && <p className="text-sm text-gray-600 mt-2">{description}</p>}
                    </div>
                    <div className="flex justify-end gap-2 p-4 border-t">
                        <Button variant="outline" onClick={onCancel} disabled={loading}>
                            {cancelLabel}
                        </Button>
                        <Button variant="destructive" onClick={onConfirm} disabled={loading}>
                            {loading ? "Processing..." : confirmLabel}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
