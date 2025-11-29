import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Create demo restaurant (café)
    const demoRestaurant = await prisma.restaurant.create({
        data: {
            name: 'Café Délice',
            slug: 'demo',
            category: 'CAFE',
            googleMapsUrl: 'https://www.google.com/maps',
            primaryColor: '#16a34a', // Green
            secondaryColor: '#facc15', // Yellow
            logoUrl: null,
            introTitle: 'Merci pour votre visite ! ☕',
            introSubtitle: 'Laissez-nous un avis honnête puis tentez de gagner une surprise.',
            contactEmail: 'hello@cafedelice.com',
            adminToken: 'demo-admin-token',
            gameType: 'ROULETTE',
            rewards: {
                create: [
                    {
                        label: 'Café offert',
                        description: 'Un café de votre choix',
                        probability: 0.25,
                        isWin: true,
                        colorHex: '#6f4e37',
                        icon: '☕',
                        isActive: true,
                    },
                    {
                        label: 'Cookie offert',
                        description: 'Un délicieux cookie maison',
                        probability: 0.20,
                        isWin: true,
                        colorHex: '#d97706',
                        icon: '🍪',
                        isActive: true,
                    },
                    {
                        label: '10% de réduction',
                        description: 'Sur votre prochaine visite',
                        probability: 0.15,
                        isWin: true,
                        colorHex: '#dc2626',
                        icon: '🎫',
                        isActive: true,
                    },
                    {
                        label: 'Merci !',
                        description: 'Pas de gain cette fois, mais merci pour votre avis',
                        probability: 0.40,
                        isWin: false,
                        colorHex: '#64748b',
                        icon: '❤️',
                        isActive: true,
                    },
                ],
            },
        },
    })

    console.log(`✅ Created restaurant: ${demoRestaurant.name} (${demoRestaurant.slug})`)

    // Create a fast-food restaurant
    const burgerKing = await prisma.restaurant.create({
        data: {
            name: 'Burger Bros',
            slug: 'burger-bros',
            category: 'FAST_FOOD',
            googleMapsUrl: 'https://www.google.com/maps',
            primaryColor: '#dc2626', // Red
            secondaryColor: '#facc15', // Yellow
            logoUrl: null,
            introTitle: 'Thanks for visiting! 🍔',
            introSubtitle: 'Leave us an honest review and spin to win a prize!',
            contactEmail: 'hello@burgerbros.com',
            adminToken: 'burger-bros-admin-token-secure-123',
            gameType: 'ROULETTE',
            rewards: {
                create: [
                    {
                        label: 'Free Fries',
                        description: 'Medium fries on your next visit',
                        probability: 0.30,
                        isWin: true,
                        colorHex: '#facc15',
                        icon: '🍟',
                        isActive: true,
                    },
                    {
                        label: 'Free Drink',
                        description: 'Any medium drink',
                        probability: 0.25,
                        isWin: true,
                        colorHex: '#3b82f6',
                        icon: '🥤',
                        isActive: true,
                    },
                    {
                        label: 'Free Burger',
                        description: 'Classic burger on next visit',
                        probability: 0.10,
                        isWin: true,
                        colorHex: '#dc2626',
                        icon: '🍔',
                        isActive: true,
                    },
                    {
                        label: 'Better luck next time!',
                        description: 'No prize, but thanks for your review!',
                        probability: 0.35,
                        isWin: false,
                        colorHex: '#6b7280',
                        icon: '👍',
                        isActive: true,
                    },
                ],
            },
        },
    })

    console.log(`✅ Created restaurant: ${burgerKing.name} (${burgerKing.slug})`)

    // Create a car wash
    const carWash = await prisma.restaurant.create({
        data: {
            name: 'ShineTime Car Wash',
            slug: 'shinetime',
            category: 'CAR_WASH',
            googleMapsUrl: 'https://www.google.com/maps',
            primaryColor: '#0ea5e9', // Sky blue
            secondaryColor: '#06b6d4', // Cyan
            logoUrl: null,
            introTitle: 'Thanks for choosing us! 🚗',
            introSubtitle: 'Leave a review and spin the wheel for a special offer!',
            contactEmail: 'info@shinetime.com',
            adminToken: 'shinetime-admin-secure-xyz',
            gameType: 'ROULETTE',
            rewards: {
                create: [
                    {
                        label: 'Interior Cleaning',
                        description: 'Free interior vacuum & wipe',
                        probability: 0.20,
                        isWin: true,
                        colorHex: '#0ea5e9',
                        icon: '✨',
                        isActive: true,
                    },
                    {
                        label: '20% Off',
                        description: 'Next full-service wash',
                        probability: 0.25,
                        isWin: true,
                        colorHex: '#10b981',
                        icon: '💰',
                        isActive: true,
                    },
                    {
                        label: 'Tire Shine',
                        description: 'Free tire shine upgrade',
                        probability: 0.15,
                        isWin: true,
                        colorHex: '#6366f1',
                        icon: '⚡',
                        isActive: true,
                    },
                    {
                        label: 'Thank you!',
                        description: 'No prize this time',
                        probability: 0.40,
                        isWin: false,
                        colorHex: '#64748b',
                        icon: '🙏',
                        isActive: true,
                    },
                ],
            },
        },
    })

    console.log(`✅ Created restaurant: ${carWash.name} (${carWash.slug})`)

    console.log('\n🎉 Seed completed successfully!')
    console.log('\n📋 Access your restaurants:')
    console.log(`   - Customer page: http://localhost:3000/r/demo`)
    console.log(`   - Customer page: http://localhost:3000/r/burger-bros`)
    console.log(`   - Customer page: http://localhost:3000/r/shinetime`)
    console.log('\n🔐 Admin access:')
    console.log(`   - Café Délice: http://localhost:3000/admin?token=demo-admin-token`)
    console.log(`   - Burger Bros: http://localhost:3000/admin?token=burger-bros-admin-token-secure-123`)
    console.log(`   - ShineTime: http://localhost:3000/admin?token=shinetime-admin-secure-xyz`)
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
