import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
    try {
        const { participationId } = await request.json()

        if (!participationId) {
            return NextResponse.json(
                { error: "Missing participation ID" },
                { status: 400 }
            )
        }

        // Check if participation exists and is not already redeemed
        const participation = await prisma.participation.findUnique({
            where: { id: participationId },
        })

        if (!participation) {
            return NextResponse.json(
                { error: "Participation not found" },
                { status: 404 }
            )
        }

        if (participation.status === "REDEEMED") {
            return NextResponse.json(
                { error: "Reward already redeemed", redeemedAt: participation.redeemedAt },
                { status: 400 }
            )
        }

        // Mark as redeemed
        const updated = await prisma.participation.update({
            where: { id: participationId },
            data: {
                status: "REDEEMED",
                redeemedAt: new Date(),
            },
        })

        return NextResponse.json({ success: true, redeemedAt: updated.redeemedAt })
    } catch (error) {
        console.error("Redemption error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
