import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-change-me"

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // 1. Protection Super Admin (/super)
    if (path.startsWith("/super")) {
        if (path === "/super/login") {
            return NextResponse.next()
        }

        const token = request.cookies.get("super_admin_session")?.value

        if (!token) {
            return NextResponse.redirect(new URL("/super/login", request.url))
        }

        try {
            const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
            if (payload.role !== 'super_admin') throw new Error("Invalid role")
            return NextResponse.next()
        } catch (error) {
            return NextResponse.redirect(new URL("/super/login", request.url))
        }
    }

    // 2. Protection Admin Restaurant (/admin)
    if (path.startsWith("/admin")) {

        // Exclure la page de login
        if (path === "/admin/login") {
            return NextResponse.next()
        }

        // 2. Vérifier le cookie de session
        const token = request.cookies.get("admin_session")?.value

        if (!token) {
            return NextResponse.redirect(new URL("/admin/login", request.url))
        }

        try {
            // 3. Vérifier la validité du token
            await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
            return NextResponse.next()
        } catch (error) {
            // Token invalide ou expiré
            return NextResponse.redirect(new URL("/admin/login", request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/admin/:path*", "/super/:path*"],
}
