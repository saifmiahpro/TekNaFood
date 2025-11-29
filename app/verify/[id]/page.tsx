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
            // Instead of notFound(), return a custom error UI to confirm we reached the page
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                    <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                        <h1 className="text-xl font-bold text-red-600 mb-2">Participation Introuvable</h1>
                        <p className="text-gray-600 mb-4">Impossible de trouver le gain associé à ce code.</p>
                        <div className="bg-gray-100 p-3 rounded font-mono text-xs text-gray-500 break-all">
                            ID reçu : {id}
                        </div>
                    </div>
                </div>
            )
        }

        return <VerifyClient participation={participation} />
    } catch (error) {
        console.error("Error fetching participation:", error)
        throw error
    }
}
