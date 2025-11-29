import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-key-change-it")

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Routes protégées
    const isProtectedPath = path.startsWith('/admin') || path.startsWith('/super-admin') || path.startsWith('/hq')

    if (isProtectedPath) {
        // Vérification de l'authentification JWT
        const token = request.cookies.get('admin_session')?.value

        if (!token) {
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }

        try {
            // Vérifier la signature du token
            await jwtVerify(token, JWT_SECRET)
            return NextResponse.next()
        } catch (err) {
            // Token invalide ou expiré
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/super-admin/:path*',
        '/hq/:path*',
    ],
}
