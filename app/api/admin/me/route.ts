import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { jwtVerify } from "jose"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-change-me"

export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("admin_session")?.value

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
        const restaurantId = payload.restaurantId as string

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            include: {
                rewards: true,
                dailyStats: {
                    orderBy: { date: 'desc' },
                    take: 30
                }
            }
        })

        if (!restaurant) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
        }

        return NextResponse.json(restaurant)

    } catch (error) {
        console.error("Error fetching me:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
