import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateRewardValidity } from "@/lib/date-utils"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { restaurantId, customerName, customerEmail, googleName, ticketNumber, platformAction } = body

        // Map frontend strings to Prisma Enum
        const actionMap: Record<string, any> = {
            "google": "GOOGLE_REVIEW",
            "tripadvisor": "TRIPADVISOR_REVIEW",
            "instagram": "INSTAGRAM_FOLLOW",
            "tiktok": "TIKTOK_FOLLOW",
            "facebook": "FACEBOOK_LIKE"
        }

        // Validate required fields
        if (!restaurantId || !customerName || !platformAction) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Vérifier si le client a déjà participé avec cette action
        if (customerEmail) {
            const existingParticipation = await prisma.participation.findFirst({
                where: {
                    restaurantId,
                    customerEmail,
                    platformAction: actionMap[platformAction] || "GOOGLE_REVIEW"
                }
            })

            if (existingParticipation) {
                return NextResponse.json(
                    { error: "Vous avez déjà utilisé cette action pour jouer" },
                    { status: 409 } // Conflict
                )
            }
        }

        // Get restaurant with active rewards
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: {
                maxPlaysPerDay: true,
                replayDelayHours: true,
                rewardDelayHours: true,
                rewardValidityDays: true,
                rewards: {
                    where: { isActive: true },
                },
            },
        })

        if (!restaurant) {
            return NextResponse.json(
                { error: "Restaurant not found" },
                { status: 404 }
            )
        }

        if (restaurant.rewards.length === 0) {
            return NextResponse.json(
                { error: "No active rewards available" },
                { status: 400 }
            )
        }

        // Vérifier la limite quotidienne globale
        if (customerEmail) {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const participationsToday = await prisma.participation.count({
                where: {
                    restaurantId,
                    customerEmail,
                    createdAt: {
                        gte: today
                    }
                }
            })

            if (participationsToday >= restaurant.maxPlaysPerDay) {
                return NextResponse.json(
                    { error: `Limite quotidienne atteinte (${restaurant.maxPlaysPerDay} jeux max/jour)` },
                    { status: 429 } // Too Many Requests
                )
            }
        }

        // Calculer canReplayAt
        const currentTime = new Date()
        const canReplayAt = new Date(currentTime.getTime() + restaurant.replayDelayHours * 60 * 60 * 1000)

        // Select a random reward based on probabilities
        const selectedReward = selectRewardByProbability(restaurant.rewards)

        // Calculate validity dates based on restaurant settings
        const now = new Date()
        const { validFrom, expiresAt } = calculateRewardValidity(now, restaurant.rewardValidityDays)

        // Create participation record
        const participation = await prisma.participation.create({
            data: {
                restaurantId,
                customerName,
                customerEmail,
                googleName,
                ticketNumber,
                platformAction: actionMap[platformAction] || "GOOGLE_REVIEW", // Map string to Enum
                rewardId: selectedReward.id,
                status: "PENDING",
                validFrom,
                expiresAt,
                canReplayAt, // Date où le joueur pourra rejouer
            },
            include: {
                reward: true,
            },
        })

        // Update Daily Stats (Async, non-blocking for user response ideally, but here we await for safety)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        await prisma.dailyStat.upsert({
            where: {
                restaurantId_date: {
                    restaurantId,
                    date: today,
                },
            },
            update: {
                participations: { increment: 1 },
                wins: selectedReward.isWin ? { increment: 1 } : undefined,
            },
            create: {
                restaurantId,
                date: today,
                participations: 1,
                wins: selectedReward.isWin ? 1 : 0,
            },
        })

        return NextResponse.json(participation)
    } catch (error) {
        console.error("Error creating participation:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// Helper function to select reward based on probability distribution
function selectRewardByProbability(rewards: any[]) {
    // Normalize probabilities to sum to 1
    const totalProbability = rewards.reduce((sum, r) => sum + r.probability, 0)

    // Generate random number between 0 and 1
    const random = Math.random()

    // Select reward based on cumulative probability
    let cumulativeProbability = 0
    for (const reward of rewards) {
        cumulativeProbability += reward.probability / totalProbability
        if (random <= cumulativeProbability) {
            return reward
        }
    }

    // Fallback to last reward (should never reach here)
    return rewards[rewards.length - 1]
}
