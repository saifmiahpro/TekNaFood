import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-key-change-it")

export async function GET(req: Request) {
    try {
        // 1. Vérification Sécurisée (Cookie)
        const cookieStore = await cookies()
        const token = cookieStore.get("admin_session")?.value

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        try {
            await jwtVerify(token, JWT_SECRET)
        } catch (err) {
            return NextResponse.json({ error: "Invalid Token" }, { status: 401 })
        }

        // 2. Fetch Data
        // Fetch all restaurants with aggregated stats
        const restaurants = await prisma.restaurant.findMany({
            include: {
                rewards: {
                    where: { isActive: true },
                },
                participations: {
                    include: {
                        reward: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        // Transform data to include stats
        const restaurantsWithStats = restaurants.map((restaurant) => {
            const totalParticipations = restaurant.participations.length
            const totalWins = restaurant.participations.filter((p) => p.reward?.isWin).length
            const winRate = totalParticipations > 0 ? (totalWins / totalParticipations) * 100 : 0

            // Get recent participations (last 7 days)
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
            const recentParticipations = restaurant.participations.filter(
                (p) => new Date(p.createdAt) > sevenDaysAgo
            ).length

            return {
                id: restaurant.id,
                name: restaurant.name,
                slug: restaurant.slug,
                category: restaurant.category,
                primaryColor: restaurant.primaryColor,
                secondaryColor: restaurant.secondaryColor,
                adminToken: restaurant.adminToken,
                createdAt: restaurant.createdAt,
                stats: {
                    totalParticipations,
                    totalWins,
                    winRate: Math.round(winRate),
                    recentParticipations,
                    activeRewards: restaurant.rewards.length,
                },
            }
        })

        return NextResponse.json(restaurantsWithStats)
    } catch (error) {
        console.error("Super admin fetch error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
