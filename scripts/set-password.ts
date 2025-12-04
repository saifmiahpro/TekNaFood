import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const token = process.argv[2]
    const password = process.argv[3]

    if (!token || !password) {
        console.error("Usage: tsx scripts/set-password.ts <token> <password>")
        process.exit(1)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.restaurant.update({
        where: { adminToken: token },
        data: { passwordHash: hashedPassword }
    })

    console.log(`Password set for restaurant with token ${token}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
