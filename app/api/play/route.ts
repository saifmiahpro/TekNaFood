import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { restaurantId, customerName, customerEmail, googleName, ticketNumber } = body

        // Validate required fields
        if (!restaurantId || !customerName) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Get restaurant with active rewards
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            include: {
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

        // Select a random reward based on probabilities
        const selectedReward = selectRewardByProbability(restaurant.rewards)

        // Create participation record
        const participation = await prisma.participation.create({
            data: {
                restaurantId,
                customerName,
                customerEmail,
                googleName,
                ticketNumber,
                rewardId: selectedReward.id,
                status: "PENDING",
            },
            include: {
                reward: true,
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
