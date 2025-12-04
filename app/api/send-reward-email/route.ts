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
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
                            <h1 style="color: ${participation.restaurant.primaryColor};">Bravo ${participation.customerName} !</h1>
                            
                            <div style="background-color: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0;">
                                <p style="font-size: 18px; margin-bottom: 5px;">Vous avez gagné :</p>
                                <strong style="font-size: 24px; color: #111827;">${participation.reward.label}</strong>
                            </div>

                            <p>Ce cadeau est valable pour votre <strong>PROCHAINE VISITE</strong>.</p>
                            <p style="font-size: 14px; color: #6b7280;">Valable du ${new Date(participation.validFrom!).toLocaleDateString()} au ${new Date(participation.expiresAt!).toLocaleDateString()}.</p>
                            
                            <div style="margin: 30px 0;">
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(redeemUrl)}" alt="QR Code de validation" style="width: 200px; height: 200px;" />
                            </div>

                            <div style="background-color: #fff7ed; border: 1px solid #fdba74; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: left;">
                                <p style="margin: 0; font-weight: bold; color: #9a3412;">⚠️ IMPORTANT : À présenter au commerçant</p>
                                <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #9a3412;">
                                    <li>Ce QR Code pour valider votre gain.</li>
                                    <li><strong>La preuve de votre action</strong> (votre avis Google/TripAdvisor publié ou votre abonnement Instagram/TikTok).</li>
                                </ul>
                            </div>

                            <a href="${redeemUrl}" style="background-color: ${participation.restaurant.primaryColor}; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                LIEN DE VALIDATION (SECOURS)
                            </a>
                            
                            <br/><br/>
                            <p style="font-size: 12px; color: #888;">Si le QR code ne fonctionne pas, le commerçant peut cliquer sur le bouton ci-dessus.</p>
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
