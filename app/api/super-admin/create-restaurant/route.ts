import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { RestaurantCategory, GameType } from "@prisma/client"
import bcrypt from "bcryptjs"

import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-key-change-it")

function generateRandomToken(): string {
    return `${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`
}

function generateRandomPassword(): string {
    return Math.random().toString(36).slice(-8) // 8 char random string
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
            tripadvisorUrl,
            instagramHandle,
            tiktokHandle,
            facebookUrl,
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

        // Generate admin token & password
        const adminToken = generateRandomToken()
        const plainPassword = generateRandomPassword()
        const passwordHash = await bcrypt.hash(plainPassword, 10)

        // Default rewards templates by category
        const rewardTemplates: Record<string, any[]> = {
            FAST_FOOD: [
                { label: "Menu offert", probability: 0.15, isWin: true, colorHex: "#ef4444", icon: "🍔", isActive: true },
                { label: "Boisson gratuite", probability: 0.25, isWin: true, colorHex: "#3b82f6", icon: "🥤", isActive: true },
                { label: "Frites offertes", probability: 0.20, isWin: true, colorHex: "#f59e0b", icon: "🍟", isActive: true },
                { label: "10% de réduction", probability: 0.20, isWin: true, colorHex: "#8b5cf6", icon: "💰", isActive: true },
                { label: "Merci !", probability: 0.20, isWin: false, colorHex: "#6b7280", icon: "🙏", isActive: true },
            ],
            CAFE: [
                { label: "Café offert", probability: 0.25, isWin: true, colorHex: "#92400e", icon: "☕", isActive: true },
                { label: "Pâtisserie offerte", probability: 0.20, isWin: true, colorHex: "#ec4899", icon: "🥐", isActive: true },
                { label: "Croissant offert", probability: 0.15, isWin: true, colorHex: "#f59e0b", icon: "🥨", isActive: true },
                { label: "15% de réduction", probability: 0.20, isWin: true, colorHex: "#8b5cf6", icon: "💰", isActive: true },
                { label: "Merci !", probability: 0.20, isWin: false, colorHex: "#6b7280", icon: "🙏", isActive: true },
            ],
            RESTAURANT: [
                { label: "Entrée offerte", probability: 0.15, isWin: true, colorHex: "#10b981", icon: "🥗", isActive: true },
                { label: "Dessert offert", probability: 0.25, isWin: true, colorHex: "#ec4899", icon: "🍰", isActive: true },
                { label: "Café offert", probability: 0.20, isWin: true, colorHex: "#92400e", icon: "☕", isActive: true },
                { label: "10% de réduction", probability: 0.20, isWin: true, colorHex: "#8b5cf6", icon: "💰", isActive: true },
                { label: "Merci !", probability: 0.20, isWin: false, colorHex: "#6b7280", icon: "🙏", isActive: true },
            ],
            BAR: [
                { label: "Shot offert", probability: 0.20, isWin: true, colorHex: "#ef4444", icon: "🍷", isActive: true },
                { label: "Bière offerte", probability: 0.25, isWin: true, colorHex: "#f59e0b", icon: "🍺", isActive: true },
                { label: "Cocktail -50%", probability: 0.15, isWin: true, colorHex: "#ec4899", icon: "🍹", isActive: true },
                { label: "15% sur l'addition", probability: 0.20, isWin: true, colorHex: "#8b5cf6", icon: "💰", isActive: true },
                { label: "Merci !", probability: 0.20, isWin: false, colorHex: "#6b7280", icon: "🙏", isActive: true },
            ],
        }

        // Get rewards template based on category, with fallback
        const defaultRewards = rewardTemplates[category] || rewardTemplates.RESTAURANT

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
                tripadvisorUrl: tripadvisorUrl || null,
                instagramHandle: instagramHandle || null,
                tiktokHandle: tiktokHandle || null,
                facebookUrl: facebookUrl || null,
                adminToken,
                passwordHash, // Save hashed password
                gameType: GameType.ROULETTE,
                rewards: {
                    create: (rewards && rewards.length > 0) ? rewards : defaultRewards,
                },
            },
            include: {
                rewards: true,
            },
        })

        // Return restaurant + plain password (only once)
        return NextResponse.json({ ...restaurant, generatedPassword: plainPassword }, { status: 201 })
    } catch (error) {
        console.error("Restaurant creation error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
