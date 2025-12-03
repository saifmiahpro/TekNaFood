import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import RedeemClient from "./client"

export default async function RedeemPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params

    const participation = await prisma.participation.findUnique({
        where: { redeemToken: token },
        include: {
            restaurant: true,
            reward: true
        }
    })

    if (!participation) {
        return notFound()
    }

    return <RedeemClient participation={participation} />
}
