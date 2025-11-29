import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { VerifyClient } from "./client"

export default async function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    console.log("Verifying participation ID:", id)

    try {
        const participation = await prisma.participation.findUnique({
            where: { id },
            include: {
                restaurant: true,
                reward: true,
            },
        })

        if (!participation) {
            console.error("Participation not found for ID:", id)
            notFound()
        }

        return <VerifyClient participation={participation} />
    } catch (error) {
        console.error("Error fetching participation:", error)
        throw error
    }
}
