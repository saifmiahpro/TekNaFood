import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { status, token } = body

        // Verify admin token
        const participation = await prisma.participation.findUnique({
            where: { id },
            include: { restaurant: true },
        })

        if (!participation) {
            return NextResponse.json(
                { error: "Participation not found" },
                { status: 404 }
            )
        }

        if (participation.restaurant.adminToken !== token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Update participation status
        const updated = await prisma.participation.update({
            where: { id },
            data: { status },
            include: { reward: true },
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error("Error updating participation:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
