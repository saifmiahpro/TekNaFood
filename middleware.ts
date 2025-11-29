import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-key-change-it")

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname
    const host = request.headers.get('host') || ''

    // Routes protégées
    const isProtectedPath = path.startsWith('/admin') || path.startsWith('/super-admin') || path.startsWith('/hq')

    // 1. SÉCURITÉ LOCALE (Layer 1)
    // On garde ça : l'admin n'est accessible que depuis localhost (ou via tunnel autorisé explicitement)
    // Sur Vercel, ça bloquera tout accès externe à l'admin, ce qui est TRÈS sécurisé.
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1')

    if (isProtectedPath) {
        // Si on n'est pas en local, on bloque DIRECT (404 ou Redirect Home)
        if (!isLocal) {
            return NextResponse.redirect(new URL('/', request.url))
        }

        // 2. AUTHENTIFICATION (Layer 2)
        // Même en local, on veut un login.
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
