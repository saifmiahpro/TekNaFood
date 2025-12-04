import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function PUT(req: Request) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { id, name, address } = body

        if (!id || !name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const restaurant = await prisma.restaurant.update({
            where: { id },
            data: {
                name,
                address,
            },
        })

        return NextResponse.json(restaurant)
    } catch (error) {
        console.error("Update error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
