import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import RestaurantClient from "./client"

// Server Component (No 'use client')
export default async function RestaurantPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    // Fetch directly from DB (Server Side) - No API call, No ngrok issues
    const restaurant = await prisma.restaurant.findUnique({
        where: { slug },
        select: {
            id: true,
            name: true,
            slug: true,
            googleMapsUrl: true,
            introTitle: true,
            introSubtitle: true,
            primaryColor: true,
            secondaryColor: true,
            logoUrl: true,
        }
    })

    if (!restaurant) {
        return notFound()
    }

    // Pass data to Client Component
    return <RestaurantClient restaurant={restaurant} />
}
