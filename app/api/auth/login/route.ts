
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { SignJWT } from "jose"
import bcrypt from "bcryptjs"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-key-change-it")

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json()

        // 1. Chercher l'admin en base
        const admin = await prisma.admin.findUnique({
            where: { username }
        })

        if (!admin) {
            return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 })
        }

        // 2. Vérifier le mot de passe haché
        const isValid = await bcrypt.compare(password, admin.passwordHash)

        if (!isValid) {
            return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 })
        }

        // 3. Générer le token JWT
        const token = await new SignJWT({ role: "super-admin", username: admin.username })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("24h")
            .sign(JWT_SECRET)

        const response = NextResponse.json({ success: true })

        response.cookies.set("admin_session", token, {
            httpOnly: true, // Invisible pour le JS client (Anti-XSS)
            secure: process.env.NODE_ENV === "production", // HTTPS seulement en prod
            sameSite: "strict", // Protection CSRF
            maxAge: 60 * 60 * 24, // 24 heures
            path: "/",
        })

        return response

    } catch (error: any) {
        console.error("Login error details:", error)
        return NextResponse.json({ error: "Erreur serveur: " + error.message }, { status: 500 })
    }
}
