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

        // Calculer les stats par plateforme
        const platformStats = await prisma.participation.groupBy({
            by: ['platformAction'],
            where: { restaurantId: restaurant.id },
            _count: {
                platformAction: true
            }
        })

        return NextResponse.json({ ...restaurant, platformStats })
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
        const {
            token,
            primaryColor,
            secondaryColor,
            logoUrl,
            googleMapsUrl,
            tripadvisorUrl,
            instagramHandle,
            tiktokHandle,
            facebookUrl,
            maxPlaysPerDay,
            replayDelayHours,
            rewardDelayHours,
            rewardValidityDays,
            qrLogoPlacement
        } = body

        if (!token) {
            return NextResponse.json({ error: "Missing token" }, { status: 401 })
        }

        const restaurant = await prisma.restaurant.update({
            where: { adminToken: token },
            data: {
                primaryColor,
                secondaryColor,
                logoUrl,
                googleMapsUrl,
                tripadvisorUrl,
                instagramHandle,
                tiktokHandle,
                facebookUrl,
                maxPlaysPerDay: maxPlaysPerDay ? parseInt(maxPlaysPerDay) : undefined,
                replayDelayHours: replayDelayHours ? parseInt(replayDelayHours) : undefined,
                rewardDelayHours: rewardDelayHours ? parseInt(rewardDelayHours) : undefined,
                rewardValidityDays: rewardValidityDays ? parseInt(rewardValidityDays) : undefined,
                qrLogoPlacement,
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
