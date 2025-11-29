import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { RestaurantCategory, GameType } from "@prisma/client"

import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-key-change-it")

function generateRandomToken(): string {
    return `${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

export async function POST(req: Request) {
    try {
        // 1. Auth Check (Cookie)
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

        const body = await req.json()
        const {
            name,
            category,
            googleMapsUrl,
            primaryColor,
            secondaryColor,
            logoUrl,
            introTitle,
            introSubtitle,
            contactEmail,
            rewards,
        } = body

        // Validation
        if (!name || !category || !googleMapsUrl) {
            return NextResponse.json(
                { error: "Missing required fields: name, category, googleMapsUrl" },
                { status: 400 }
            )
        }

        // Generate unique slug
        let slug = generateSlug(name)
        let slugExists = await prisma.restaurant.findUnique({ where: { slug } })
        let counter = 1
        while (slugExists) {
            slug = `${generateSlug(name)}-${counter}`
            slugExists = await prisma.restaurant.findUnique({ where: { slug } })
            counter++
        }

        // Generate admin token
        const adminToken = generateRandomToken()

        // Create restaurant with rewards
        const restaurant = await prisma.restaurant.create({
            data: {
                name,
                slug,
                category: category as RestaurantCategory,
                googleMapsUrl,
                primaryColor: primaryColor || "#16a34a",
                secondaryColor: secondaryColor || "#facc15",
                logoUrl: logoUrl || null,
                introTitle: introTitle || "Merci pour votre visite !",
                introSubtitle: introSubtitle || "Laissez-nous un avis honnête puis tentez de gagner une surprise.",
                contactEmail: contactEmail || null,
                adminToken,
                gameType: GameType.ROULETTE,
                rewards: {
                    create: rewards || [
                        {
                            label: "Boisson offerte",
                            probability: 0.3,
                            isWin: true,
                            colorHex: "#3b82f6",
                            icon: "☕",
                            isActive: true,
                        },
                        {
                            label: "Dessert offert",
                            probability: 0.2,
                            isWin: true,
                            colorHex: "#ec4899",
                            icon: "🍰",
                            isActive: true,
                        },
                        {
                            label: "10% de réduction",
                            probability: 0.25,
                            isWin: true,
                            colorHex: "#8b5cf6",
                            icon: "💰",
                            isActive: true,
                        },
                        {
                            label: "Merci d'avoir participé",
                            probability: 0.25,
                            isWin: false,
                            colorHex: "#6b7280",
                            icon: "🙏",
                            isActive: true,
                        },
                    ],
                },
            },
            include: {
                rewards: true,
            },
        })

        return NextResponse.json(restaurant, { status: 201 })
    } catch (error) {
        console.error("Restaurant creation error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
