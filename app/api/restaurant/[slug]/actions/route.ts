import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    request: Request,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await context.params
        const { searchParams } = new URL(request.url)
        const customerEmail = searchParams.get("email")

        const restaurant = await prisma.restaurant.findUnique({
            where: { slug },
            select: {
                id: true,
                googleMapsUrl: true,
                tripadvisorUrl: true,
                instagramHandle: true,
                tiktokHandle: true,
                facebookUrl: true,
            }
        })

        if (!restaurant) {
            return NextResponse.json(
                { error: "Restaurant not found" },
                { status: 404 }
            )
        }

        // Si email fourni, vérifier les actions déjà complétées
        let completedActions: string[] = []

        if (customerEmail) {
            const participations = await prisma.participation.findMany({
                where: {
                    restaurantId: restaurant.id,
                    customerEmail,
                },
                select: {
                    platformAction: true
                }
            })

            completedActions = participations.map(p => p.platformAction)
        }

        return NextResponse.json({
            ...restaurant,
            completedActions
        })

    } catch (error) {
        console.error("Error fetching actions:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
