import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get("token")

        if (!token) {
            return NextResponse.json(
                { error: "Missing admin token" },
                { status: 401 }
            )
        }

        const restaurant = await prisma.restaurant.findUnique({
            where: { adminToken: token },
            include: {
                rewards: {
                    orderBy: { createdAt: "desc" },
                },
                participations: {
                    orderBy: { createdAt: "desc" },
                    take: 50,
                    include: {
                        reward: true,
                    },
                },
            },
        })

        if (!restaurant) {
            return NextResponse.json(
                { error: "Invalid admin token" },
                { status: 401 }
            )
        }

        return NextResponse.json(restaurant)
    } catch (error) {
        console.error("Error fetching admin data:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const { token, primaryColor, secondaryColor, logoUrl } = body

        if (!token) {
            return NextResponse.json({ error: "Missing token" }, { status: 401 })
        }

        const restaurant = await prisma.restaurant.update({
            where: { adminToken: token },
            data: {
                primaryColor,
                secondaryColor,
                logoUrl,
            },
        })

        return NextResponse.json(restaurant)
    } catch (error) {
        console.error("Error updating restaurant:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
