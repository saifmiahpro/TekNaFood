const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const username = 'saif'
    const password = 'Caramele1'

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Upsert (Créer ou Mettre à jour)
    const admin = await prisma.admin.upsert({
        where: { username },
        update: { passwordHash: hashedPassword },
        create: {
            username,
            passwordHash: hashedPassword,
        },
    })

    console.log(`Admin user created/updated: ${admin.username}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
