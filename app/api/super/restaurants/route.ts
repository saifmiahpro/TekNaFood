import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
    try {
        const session = await auth()
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const restaurants = await prisma.restaurant.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { participations: true }
                }
            }
        })

        return NextResponse.json(restaurants)
    } catch (error) {
        console.error("Error fetching restaurants:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, slug, email } = body

        // Basic validation
        if (!name || !slug) {
            return NextResponse.json({ error: "Name and Slug are required" }, { status: 400 })
        }

        // Create restaurant
        const restaurant = await prisma.restaurant.create({
            data: {
                name,
                slug,
                contactEmail: email,
                category: "RESTAURANT", // Default
                googleMapsUrl: "https://google.com", // Placeholder
                adminToken: Math.random().toString(36).substring(2, 15), // Temporary token
                rewards: {
                    create: [
                        { label: "Café Offert", probability: 0.5, isWin: true, colorHex: "#16a34a", icon: "Coffee" },
                        { label: "Perdu", probability: 0.5, isWin: false, colorHex: "#ef4444", icon: "Frown" }
                    ]
                }
            }
        })

        return NextResponse.json(restaurant)
    } catch (error) {
        console.error("Error creating restaurant:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
