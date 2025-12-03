import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
    try {
        const { token } = await request.json()

        if (!token) {
            return NextResponse.json({ error: "Missing token" }, { status: 400 })
        }

        const participation = await prisma.participation.findUnique({
            where: { redeemToken: token }
        })

        if (!participation) {
            return NextResponse.json({ error: "Invalid token" }, { status: 404 })
        }

        if (participation.redeemedAt) {
            return NextResponse.json({ error: "Already redeemed" }, { status: 400 })
        }

        // Update
        await prisma.participation.update({
            where: { id: participation.id },
            data: { redeemedAt: new Date() }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Redeem error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
