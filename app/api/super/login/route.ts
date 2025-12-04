import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { SignJWT } from "jose"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-change-me"

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json()

        if (!username || !password) {
            return NextResponse.json({ error: "Missing credentials" }, { status: 400 })
        }

        // 1. Trouver le super admin
        const admin = await prisma.admin.findUnique({
            where: { username }
        })

        if (!admin) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        // 2. Vérifier le mot de passe
        const isValid = await bcrypt.compare(password, admin.passwordHash)

        if (!isValid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        // 3. Créer le token de session (JWT) avec rôle spécial
        const token = await new SignJWT({ adminId: admin.id, role: 'super_admin' })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(new TextEncoder().encode(JWT_SECRET))

        // 4. Créer la réponse avec le cookie HttpOnly
        const response = NextResponse.json({ success: true })

        response.cookies.set({
            name: 'super_admin_session', // Différent du cookie restaurant
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 // 24h
        })

        return response

    } catch (error) {
        console.error("Super Admin Login error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
