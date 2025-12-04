import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-change-me"

export async function middleware(request: NextRequest) {
    // 1. Définir les routes protégées
    if (request.nextUrl.pathname.startsWith("/admin")) {

        // Exclure la page de login
        if (request.nextUrl.pathname === "/admin/login") {
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
    matcher: ["/admin/:path*"],
}
