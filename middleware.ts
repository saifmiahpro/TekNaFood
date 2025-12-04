import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { auth } from "@/auth"

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-change-me"

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // 1. Protection Super Admin (/super) - Via NextAuth
    if (path.startsWith("/super")) {
        const session = await auth()
        if (!session) {
            return NextResponse.redirect(new URL("/auth/login", request.url))
        }
        return NextResponse.next()
    }

    // 2. Protection Admin Restaurant (/admin) - Via Custom JWT
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
