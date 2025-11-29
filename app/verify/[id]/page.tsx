import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { VerifyClient } from "./client"

export default async function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const participation = await prisma.participation.findUnique({
        where: { id },
        include: {
            restaurant: true,
            reward: true,
        },
    })

    if (!participation) {
        notFound()
    }

    return <VerifyClient participation={participation} />
}
