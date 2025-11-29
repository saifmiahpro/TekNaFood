import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const { token, rewards } = await req.json()

        if (!token) {
            return NextResponse.json({ error: "Missing token" }, { status: 400 })
        }

        // 1. Verify admin token
        const restaurant = await prisma.restaurant.findFirst({
            where: { adminToken: token },
        })

        if (!restaurant) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 })
        }

        // 2. Update each reward
        // We use a transaction to ensure all updates succeed or fail together
        await prisma.$transaction(
            rewards.map((reward: any) =>
                prisma.reward.update({
                    where: { id: reward.id },
                    data: {
                        label: reward.label,
                        probability: parseFloat(reward.probability),
                        isWin: reward.isWin,
                    }
                })
            )
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error updating rewards:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
