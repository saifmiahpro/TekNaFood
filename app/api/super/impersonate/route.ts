import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { SignJWT } from "jose"
import { auth } from "@/auth"

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-change-me"

export async function POST(request: Request) {
    try {
        // 1. Verify Super Admin Session (NextAuth)
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // 2. Get Target Restaurant ID
        const { restaurantId } = await request.json()

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId }
        })

        if (!restaurant) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
        }

        // 3. Create Restaurant Admin Session Token
        const token = await new SignJWT({ restaurantId: restaurant.id, role: 'admin' })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(new TextEncoder().encode(JWT_SECRET))

        // 4. Set the cookie
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
        console.error("Impersonate error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
