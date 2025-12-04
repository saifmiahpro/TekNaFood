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

        // 4. Redirect to Super Admin Dashboard
        return NextResponse.redirect(new URL("/super-admin", request.url))

    } catch (error) {
        console.error("Auth Success Error:", error)
        return NextResponse.redirect(new URL("/auth/login", request.url))
    }
}
