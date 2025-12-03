import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(date: string | Date | null | undefined) {
  if (!date) return ""
  const d = typeof date === "string" ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return ""

  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function generateQRCode(userId: string, eventId: string) {
  // Simple deterministic-ish QR payload: userId:eventId:timestamp:random
  // Encode as base64url and trim to a reasonable length for storage.
  const timestamp = Date.now()
  const rand = Math.floor(Math.random() * 1e9)
  const payload = `${userId}:${eventId}:${timestamp}:${rand}`
  // base64url
  const base64 = Buffer.from(payload).toString("base64")
  const base64url = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
  // Return a truncated value to keep it compact but still unique
  return base64url.slice(0, 64)
}
