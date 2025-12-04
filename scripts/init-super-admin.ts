import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const username = "admin"
    const password = "superpassword123" // Change this!

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.admin.upsert({
        where: { username },
        update: { passwordHash: hashedPassword },
        create: {
            username,
            passwordHash: hashedPassword
        }
    })

    console.log(`✅ Super Admin created/updated!`)
    console.log(`👉 Username: ${username}`)
    console.log(`👉 Password: ${password}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
