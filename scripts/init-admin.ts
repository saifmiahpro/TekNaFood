import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const restaurant = await prisma.restaurant.findFirst()

    if (!restaurant) {
        console.error("No restaurant found!")
        return
    }

    const password = "admin" // Default password
    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: { passwordHash: hashedPassword }
    })

    console.log(`✅ Password updated for restaurant: ${restaurant.name}`)
    console.log(`👉 Token (Login ID): ${restaurant.adminToken}`)
    console.log(`👉 Password: ${password}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
