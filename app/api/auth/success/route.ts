import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { SignJWT } from "jose"
import { auth } from "@/auth"

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-change-me"

export async function GET(request: Request) {
    try {
        // 1. Verify GitHub Session
        const session = await auth()
        if (!session) {
            return NextResponse.redirect(new URL("/auth/login", request.url))
        }

        // 2. Find the FIRST restaurant (Main one)
        const restaurant = await prisma.restaurant.findFirst({
            orderBy: { createdAt: 'asc' } // The first one created
        })

        if (!restaurant) {
            // If no restaurant exists, go to Super Dashboard to create one
            return NextResponse.redirect(new URL("/super", request.url))
        }

        // 3. Create Restaurant Admin Session Token
        const token = await new SignJWT({ restaurantId: restaurant.id, role: 'admin' })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(new TextEncoder().encode(JWT_SECRET))

        // 4. Set cookie and redirect to /admin
        const response = NextResponse.redirect(new URL("/admin", request.url))

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
        console.error("Auth Success Error:", error)
        return NextResponse.redirect(new URL("/auth/login", request.url))
    }
}
