import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")
        const token = searchParams.get("token") // On garde le token pour l'instant, ou on passera au cookie plus tard

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

        // Delete related data first (Cascade is usually handled by Prisma schema, but let's be safe)
        // Actually, Prisma schema should handle cascade delete if configured, otherwise we delete manually

        // Delete participations
        await prisma.participation.deleteMany({ where: { restaurantId: id } })

        // Delete rewards
        await prisma.reward.deleteMany({ where: { restaurantId: id } })

        // Delete restaurant
        await prisma.restaurant.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
