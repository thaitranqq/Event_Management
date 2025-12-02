import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
    const session = await auth()
    const pathname = request.nextUrl.pathname

    // Public routes that don't require authentication
    const publicRoutes = ["/login", "/register", "/"]
    const isPublicRoute = publicRoutes.some(route => pathname === route)

    // If not authenticated and trying to access protected route
    if (!session && !isPublicRoute && !pathname.startsWith("/api/auth")) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    // Admin-only routes
    const adminRoutes = ["/admin", "/events/create", "/speakers/create", "/venues/create"]
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

    if (isAdminRoute && session?.user?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
