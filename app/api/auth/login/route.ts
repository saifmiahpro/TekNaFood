import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { SignJWT } from "jose"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-change-me"

export async function POST(request: Request) {
    try {
        const { adminToken, password } = await request.json()

        if (!adminToken || !password) {
            return NextResponse.json({ error: "Missing credentials" }, { status: 400 })
        }

        // 1. Trouver le restaurant via son token (ou on pourrait utiliser l'email/slug)
        const restaurant = await prisma.restaurant.findUnique({
            where: { adminToken }
        })

        if (!restaurant) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
        }

        // 2. Vérifier le mot de passe
        // Note: Si le mot de passe n'est pas encore défini (migration), on peut autoriser temporairement ou forcer la définition
        if (!restaurant.passwordHash) {
            return NextResponse.json({ error: "Password not set up yet. Please contact support." }, { status: 403 })
        }

        const isValid = await bcrypt.compare(password, restaurant.passwordHash)

        if (!isValid) {
            return NextResponse.json({ error: "Invalid password" }, { status: 401 })
        }

        // 3. Créer le token de session (JWT)
        const token = await new SignJWT({ restaurantId: restaurant.id, role: 'admin' })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(new TextEncoder().encode(JWT_SECRET))

        // 4. Créer la réponse avec le cookie HttpOnly
        const response = NextResponse.json({ success: true })

        response.cookies.set({
            name: 'admin_session',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 // 24h
        })

        return response

    } catch (error) {
        console.error("Login error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
