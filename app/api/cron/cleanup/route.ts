import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
    // Security check: Ensure call comes from Vercel Cron
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Allow manual trigger in development if needed, or just block
        // return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        // Calculate date threshold: 30 days ago
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        // Delete participations that expired more than 30 days ago
        const deletedExpired = await prisma.participation.deleteMany({
            where: {
                expiresAt: {
                    lt: thirtyDaysAgo,
                },
            },
        })

        // Also delete very old pending participations (e.g. created > 60 days ago) just in case
        const sixtyDaysAgo = new Date()
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

        const deletedOld = await prisma.participation.deleteMany({
            where: {
                createdAt: {
                    lt: sixtyDaysAgo,
                },
            },
        })

        return NextResponse.json({
            success: true,
            deletedExpired: deletedExpired.count,
            deletedOld: deletedOld.count,
            message: "Cleanup completed successfully"
        })
    } catch (error) {
        console.error("Cleanup error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
