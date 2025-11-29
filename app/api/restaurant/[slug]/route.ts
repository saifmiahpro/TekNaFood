import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params

        const restaurant = await prisma.restaurant.findUnique({
            where: { slug },
            include: {
                rewards: {
                    where: { isActive: true },
                    orderBy: { probability: 'desc' }
                },
            },
        })

        if (!restaurant) {
            return NextResponse.json(
                { error: "Restaurant not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(restaurant)
    } catch (error) {
        console.error("Error fetching restaurant:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
