import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789") // Fallback for build

export async function POST(request: Request) {
    try {
        const { participationId } = await request.json()

        if (!participationId) {
            return NextResponse.json({ error: "Missing participationId" }, { status: 400 })
        }

        const participation = await prisma.participation.findUnique({
            where: { id: participationId },
            include: {
                restaurant: true,
                reward: true
            }
        })

        if (!participation) {
            return NextResponse.json({ error: "Participation not found" }, { status: 404 })
        }

        if (!participation.customerEmail) {
            return NextResponse.json({ error: "No email associated" }, { status: 400 })
        }

        if (!participation.reward) {
            return NextResponse.json({ error: "Reward not found" }, { status: 400 })
        }

        const redeemUrl = `${process.env.NEXT_PUBLIC_APP_URL}/redeem/${participation.redeemToken}`

        // Send Email
        try {
            if (process.env.RESEND_API_KEY) {
                console.log("Attempting to send email with key starting with:", process.env.RESEND_API_KEY.substring(0, 5))
                await resend.emails.send({
                    from: 'ReviewSpin <contact@tekna.studio>',
                    to: participation.customerEmail,
                    subject: `🎁 Votre cadeau chez ${participation.restaurant.name} vous attend !`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                            <h1 style="color: ${participation.restaurant.primaryColor};">Bravo ${participation.customerName} !</h1>
                            <p>Vous avez gagné : <strong>${participation.reward.label}</strong></p>
                            <p>Ce cadeau est valable pour votre <strong>PROCHAINE VISITE</strong>.</p>
                            <p>Valable du ${new Date(participation.validFrom!).toLocaleDateString()} au ${new Date(participation.expiresAt!).toLocaleDateString()}.</p>
                            <br/>
                            <a href="${redeemUrl}" style="background-color: ${participation.restaurant.primaryColor}; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                CLIQUER ICI DEVANT LE SERVEUR POUR VALIDER
                            </a>
                            <br/><br/>
                            <p style="font-size: 12px; color: #888;">Si le bouton ne fonctionne pas, copiez ce lien : ${redeemUrl}</p>
                        </div>
                    `
                })
            } else {
                console.log("MOCK EMAIL SENT TO:", participation.customerEmail, "LINK:", redeemUrl)
            }
        } catch (emailError) {
            console.error("Resend Error:", emailError)
            // On ne bloque pas le flow si l'email échoue, mais on devrait le signaler
            return NextResponse.json({ error: "Failed to send email", details: emailError }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Error sending reward email:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
