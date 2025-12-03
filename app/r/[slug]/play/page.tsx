"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { PrizeWheelV2, WheelSegment } from "@/components/prize-wheel-v2"
import { ValidationQRCode } from "@/components/validation-qr-code"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Gift, Sparkles, PartyPopper, CheckCircle, Mail, Receipt } from "lucide-react"
import confetti from "canvas-confetti"
import { motion } from "framer-motion"

interface Restaurant {
    id: string
    name: string
    slug: string
    primaryColor: string
    secondaryColor: string
    rewards: Array<{
        id: string
        label: string
        description?: string
        colorHex?: string
        icon?: string
        isWin: boolean
    }>
}

interface Participation {
    id: string
    validFrom?: string | Date
    expiresAt?: string | Date
    customerEmail?: string
    reward: {
        id: string
        label: string
        description?: string
        isWin: boolean
    }
}

export default function PlayPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const slug = params.slug as string
    const dataParam = searchParams.get("data")

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [loading, setLoading] = useState(true)
    const [hasSpun, setHasSpun] = useState(false)
    const [participation, setParticipation] = useState<Participation | null>(null)
    const [wheelSegments, setWheelSegments] = useState<WheelSegment[]>([])
    const [isRedeeming, setIsRedeeming] = useState(false)
    const [isRedeemed, setIsRedeemed] = useState(false)
    const [emailSent, setEmailSent] = useState(false)
    const [sendingEmail, setSendingEmail] = useState(false)

    const handleSendEmail = async () => {
        setSendingEmail(true)
        try {
            const res = await fetch("/api/send-reward-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ participationId: participation?.id })
            })
            if (res.ok) {
                setEmailSent(true)
                triggerConfetti()
            } else {
                alert("Erreur lors de l'envoi. Réessayez.")
            }
        } catch (e) {
            alert("Erreur connexion.")
        } finally {
            setSendingEmail(false)
        }
    }

    useEffect(() => {
        fetchRestaurant()
    }, [slug])

    const handleRedeem = async () => {
        if (!participation?.id) return

        if (!confirm("Attention : Êtes-vous sûr de vouloir valider ce cadeau ? Il ne sera plus utilisable après.")) {
            return
        }

        setIsRedeeming(true)
        try {
            const res = await fetch("/api/redeem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ participationId: participation.id }),
            })

            if (!res.ok) {
                const err = await res.json()
                if (err.redeemedAt) {
                    setIsRedeemed(true) // Already redeemed
                    alert("Ce cadeau a déjà été validé le " + new Date(err.redeemedAt).toLocaleString())
                } else {
                    throw new Error(err.error || "Erreur lors de la validation")
                }
            } else {
                setIsRedeemed(true)
            }
        } catch (error) {
            console.error(error)
            alert("Erreur de connexion. Réessayez.")
        } finally {
            setIsRedeeming(false)
        }
    }

    const fetchRestaurant = async () => {
        try {
            console.log('Fetching restaurant:', slug)
            const res = await fetch(`/api/restaurant/${slug}`)
            console.log('Response status:', res.status)

            if (!res.ok) {
                const errorData = await res.json()
                console.error('API Error:', errorData)
                throw new Error("Restaurant not found")
            }

            const data = await res.json()
            console.log('Restaurant data:', data)
            setRestaurant(data)

            // Prepare wheel segments
            const segments: WheelSegment[] = data.rewards.map((reward: any) => ({
                id: reward.id,
                label: reward.label,
                color: reward.colorHex || generateColorFromString(reward.label),
                icon: reward.icon,
                probability: reward.probability, // Passer la probabilité pour l'affichage
            }))
            console.log('Wheel segments:', segments)
            setWheelSegments(segments)
        } catch (error) {
            console.error('Fetch error:', error)
            alert("Restaurant not found: " + error)
        } finally {
            setLoading(false)
        }
    }

    const handleSpinComplete = async (winningSegment: WheelSegment) => {
        setHasSpun(true)

        // Find the reward that matches the winning segment
        const wonReward = restaurant?.rewards.find(r => r.id === winningSegment.id)

        if (wonReward) {
            // Trigger confetti if they won
            if (wonReward.isWin) {
                triggerConfetti()
            }
        }
    }

    const handleStartSpin = async (): Promise<string | null> => {
        const customerDataParam = searchParams.get("data")
        if (!customerDataParam) {
            alert("Missing customer data")
            return null
        }

        const customerData = JSON.parse(decodeURIComponent(customerDataParam))

        try {
            // Call API to determine the prize BEFORE spinning
            const res = await fetch("/api/play", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(customerData),
            })

            if (!res.ok) throw new Error("Failed to record participation")

            const data = await res.json()
            setParticipation(data)

            // Find the wheel segment that matches this reward
            const targetSegment = wheelSegments.find(seg => seg.id === data.reward.id)

            // Trigger the wheel to spin to this specific segment
            return targetSegment?.id || wheelSegments[0]?.id
        } catch (error) {
            console.error(error)
            alert("Something went wrong. Please try again.")
            return null
        }
    }

    const triggerConfetti = () => {
        const count = 200
        const defaults = {
            origin: { y: 0.7 },
        }

        function fire(particleRatio: number, opts: any) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio),
            })
        }

        fire(0.25, { spread: 26, startVelocity: 55 })
        fire(0.2, { spread: 60 })
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
        fire(0.1, { spread: 120, startVelocity: 45 })
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading game...</p>
                </div>
            </div>
        )
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl text-gray-600">Restaurant not found</p>
            </div>
        )
    }

    return (
        <div className="min-h-[100dvh] w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-3 md:p-4 overflow-hidden relative">
            {/* Background Effects - Reduced on mobile */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 md:opacity-100">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-600 blur-[120px] opacity-20 md:opacity-30 animate-pulse"></div>
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-600 blur-[120px] opacity-10 md:opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[60%] rounded-full bg-pink-600 blur-[120px] opacity-20 animate-pulse delay-2000"></div>
            </div>

            <div className="w-full max-w-md md:max-w-2xl relative z-10">
                {!hasSpun ? (
                    <>
                        {/* Header / Hype Section */}
                        <div className="text-center mb-4 md:mb-8 relative z-10">
                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white drop-shadow-2xl mb-2 md:mb-4 tracking-tight">
                                Tournez & <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">Gagnez</span>
                            </h1>
                            <p className="text-base md:text-xl text-white/80 font-medium max-w-lg mx-auto leading-relaxed px-4">
                                Pour vous remercier de votre avis, voici une petite surprise...
                            </p>
                        </div>

                        {/* Main Game Card - Compact on mobile */}
                        <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-2xl overflow-hidden relative ring-1 ring-white/20">
                            {/* Decorative blobs */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500" />

                            <CardContent className="pt-6 md:pt-12 pb-6 md:pb-12 px-3 md:px-12">
                                <div className="flex flex-col items-center">
                                    {/* Win Rate Badge - Removed for cleaner look */}

                                    <PrizeWheelV2
                                        segments={wheelSegments}
                                        onStartSpin={handleStartSpin}
                                        onSpinComplete={handleSpinComplete}
                                        primaryColor={restaurant.primaryColor}
                                        secondaryColor={restaurant.secondaryColor}
                                    />

                                    <div className="mt-4 md:mt-8 text-white/40 text-xs md:text-sm font-medium flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        Jeu gratuit & sans engagement
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <Card className="border-0 bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden relative">
                        <CardContent className="pt-12 pb-12">
                            {participation?.reward.isWin ? (
                                <div className="text-center space-y-8">
                                    {/* Winner Animation */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", bounce: 0.5 }}
                                        className="relative"
                                    >
                                        <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 animate-pulse"></div>
                                        <Trophy className="h-32 w-32 mx-auto text-yellow-500 drop-shadow-2xl relative z-10" />
                                        <Sparkles className="h-12 w-12 text-yellow-400 absolute top-0 right-1/3 animate-bounce" />
                                        <Sparkles className="h-8 w-8 text-yellow-300 absolute bottom-0 left-1/3 animate-pulse delay-75" />
                                    </motion.div>

                                    <div className="space-y-2">
                                        <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600 uppercase tracking-tight drop-shadow-sm">
                                            Félicitations ! 🎉
                                        </h1>
                                        <p className="text-2xl font-bold text-gray-900">
                                            Vous avez gagné :
                                        </p>
                                    </div>

                                    {/* Prize Display */}
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-8 shadow-xl mx-4 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-yellow-300 opacity-20 rounded-full blur-2xl"></div>
                                        <div className="flex items-center justify-center gap-4">
                                            <Gift className="h-8 w-8 text-orange-500 animate-bounce" />
                                            <span className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tight">
                                                {participation?.reward.label}
                                            </span>
                                            <Gift className="h-8 w-8 text-orange-500 animate-bounce delay-100" />
                                        </div>
                                    </motion.div>

                                    {/* Redemption Options - REBOUND MARKETING */}
                                    <div className="space-y-4 w-full max-w-sm mx-auto">
                                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-left">
                                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                                                <Gift className="h-6 w-6 text-purple-600" />
                                                Votre cadeau est débloqué !
                                            </h3>

                                            <div className="mb-6 p-4 bg-purple-50 border border-purple-100 rounded-xl text-center space-y-2">
                                                <p className="text-purple-900 font-black text-lg uppercase tracking-tight">
                                                    Pour votre prochaine visite
                                                </p>
                                                <p className="text-purple-700 text-sm font-medium">
                                                    Valable à partir de demain et pendant 30 jours.
                                                </p>
                                            </div>

                                            {!emailSent ? (
                                                <div className="space-y-3">
                                                    <Button
                                                        onClick={handleSendEmail}
                                                        className="w-full py-6 text-lg font-bold shadow-lg hover:scale-105 transition-transform"
                                                        style={{ backgroundColor: restaurant.primaryColor }}
                                                        disabled={sendingEmail}
                                                    >
                                                        {sendingEmail ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                                                Envoi en cours...
                                                            </div>
                                                        ) : (
                                                            <>
                                                                RECEVOIR MON BON PAR EMAIL 📩
                                                            </>
                                                        )}
                                                    </Button>
                                                    <p className="text-center text-xs text-gray-400">
                                                        On vous l'envoie à {participation?.customerEmail || "votre adresse"}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="text-center p-6 bg-green-50 rounded-xl border border-green-100 animate-in fade-in zoom-in duration-300">
                                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                                    </div>
                                                    <p className="font-bold text-green-800 text-lg mb-1">C'est envoyé !</p>
                                                    <p className="text-sm text-green-700 font-medium mb-4">Vérifiez vos emails (et vos spams).</p>
                                                    <div className="bg-white p-3 rounded border border-green-100 text-xs text-gray-500">
                                                        👋 Présentez l'email reçu lors de votre prochaine venue pour profiter de votre cadeau.
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-xs text-gray-400 mb-2">Besoin d'aide ? Montrez ce code au manager</p>
                                        <p className="font-mono text-xs text-gray-300">{participation?.id} • v2.1</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-6">
                                    {/* No Win - Very Clear */}
                                    <div className="relative">
                                        <div className="h-32 w-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center shadow-inner">
                                            <span className="text-6xl grayscale opacity-80">😢</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                                            Pas de chance cette fois...
                                        </h1>
                                        <p className="text-lg text-gray-600">
                                            Mais ce n'est que partie remise !
                                        </p>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 max-w-md mx-auto">
                                        <p className="text-blue-900 font-bold mb-2 flex items-center justify-center gap-2">
                                            💙 Merci pour votre avis !
                                        </p>
                                        <p className="text-blue-800/80 text-sm leading-relaxed">
                                            Grâce à vous, nous allons pouvoir nous améliorer.
                                            Revenez vite nous voir pour retenter votre chance !
                                        </p>
                                    </div>

                                    <Button
                                        onClick={() => window.location.href = `/r/${slug}`}
                                        size="lg"
                                        className="mt-6 w-full max-w-xs"
                                        variant="outline"
                                        style={{ borderColor: restaurant.primaryColor, color: restaurant.primaryColor }}
                                    >
                                        Retour à l'accueil
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Footer */}
                <p className="text-center text-xs text-white/30 mt-8 font-medium tracking-widest uppercase">
                    Powered by ReviewSpin
                </p>
            </div>
        </div>
    )
}

// Helper function to generate consistent colors from strings
function generateColorFromString(str: string): string {
    const colors = [
        "#ef4444", // red
        "#f97316", // orange
        "#f59e0b", // amber
        "#eab308", // yellow
        "#84cc16", // lime
        "#22c55e", // green
        "#10b981", // emerald
        "#14b8a6", // teal
        "#06b6d4", // cyan
        "#0ea5e9", // sky
        "#3b82f6", // blue
        "#6366f1", // indigo
        "#8b5cf6", // violet
        "#a855f7", // purple
        "#d946ef", // fuchsia
        "#ec4899", // pink
    ]

    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }

    return colors[Math.abs(hash) % colors.length]
}
