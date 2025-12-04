import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { SignJWT } from "jose"
import { auth } from "@/auth"

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-change-me"

export async function GET(request: Request) {
    try {
        // 1. Verify Super Admin Session (NextAuth)
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // 2. Get Token from URL
        const { searchParams } = new URL(request.url)
        const token = searchParams.get("token")

        if (!token) {
            return NextResponse.json({ error: "Token required" }, { status: 400 })
        }

        // 3. Find Restaurant
        const restaurant = await prisma.restaurant.findUnique({
            where: { adminToken: token }
        })

        if (!restaurant) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
        }

        // 4. Create Restaurant Admin Session Token
        const jwt = await new SignJWT({ restaurantId: restaurant.id, role: 'admin' })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(new TextEncoder().encode(JWT_SECRET))

        // 5. Set cookie and redirect to /admin
        const response = NextResponse.redirect(new URL("/admin", request.url))

        response.cookies.set({
            name: 'admin_session',
            value: jwt,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 // 24h
        })

        return response

    } catch (error) {
        console.error("Impersonation Error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
