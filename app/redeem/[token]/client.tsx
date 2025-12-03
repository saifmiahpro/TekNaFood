"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react"
import confetti from "canvas-confetti"

interface RedeemClientProps {
    participation: any
}

export default function RedeemClient({ participation }: RedeemClientProps) {
    const [redeemed, setRedeemed] = useState(!!participation.redeemedAt)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const now = new Date()
    const validFrom = participation.validFrom ? new Date(participation.validFrom) : null
    const expiresAt = participation.expiresAt ? new Date(participation.expiresAt) : null

    const isTooEarly = validFrom && now < validFrom
    const isExpired = expiresAt && now > expiresAt
    const isValid = !redeemed && !isTooEarly && !isExpired

    const handleRedeem = async () => {
        if (!confirm("Attention : Ne cliquez que devant le serveur ! Cette action est irréversible.")) return

        setLoading(true)
        try {
            const res = await fetch("/api/redeem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: participation.redeemToken })
            })

            if (!res.ok) throw new Error("Erreur lors de la validation")

            setRedeemed(true)
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            })
        } catch (err) {
            setError("Impossible de valider le cadeau. Réessayez.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl">
                {/* Header Restaurant */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold" style={{ color: participation.restaurant.primaryColor }}>
                        {participation.restaurant.name}
                    </h1>
                    <p className="text-gray-500">Bon Cadeau</p>
                </div>

                {/* Cadeau */}
                <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200">
                    <div className="text-4xl mb-2">{participation.reward.icon}</div>
                    <h2 className="text-xl font-bold text-gray-900">{participation.reward.label}</h2>
                    <p className="text-sm text-gray-600 mt-1">{participation.reward.description}</p>
                </div>

                {/* État */}
                <div className="space-y-4">
                    {redeemed ? (
                        <div className="bg-green-100 text-green-800 p-4 rounded-lg flex items-center justify-center gap-2 font-bold">
                            <CheckCircle2 className="w-6 h-6" />
                            CADEAU UTILISÉ
                        </div>
                    ) : isTooEarly ? (
                        <div className="bg-blue-100 text-blue-800 p-4 rounded-lg space-y-2">
                            <div className="flex items-center justify-center gap-2 font-bold">
                                <Clock className="w-6 h-6" />
                                PAS ENCORE VALIDE
                            </div>
                            <p className="text-sm">
                                Valable à partir du {validFrom?.toLocaleDateString()}
                            </p>
                        </div>
                    ) : isExpired ? (
                        <div className="bg-red-100 text-red-800 p-4 rounded-lg flex items-center justify-center gap-2 font-bold">
                            <XCircle className="w-6 h-6" />
                            EXPIRÉ
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-yellow-100 text-yellow-800 p-3 rounded text-sm font-medium flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                À valider UNIQUEMENT devant le personnel
                            </div>
                            <Button
                                size="lg"
                                className="w-full py-8 text-xl font-bold animate-pulse"
                                style={{ backgroundColor: participation.restaurant.primaryColor }}
                                onClick={handleRedeem}
                                disabled={loading}
                            >
                                {loading ? "Validation..." : "VALIDER MAINTENANT"}
                            </Button>
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
                </div>

                {/* Footer Dates */}
                <div className="text-xs text-gray-400 pt-4 border-t">
                    <p>Valide du {validFrom?.toLocaleDateString()} au {expiresAt?.toLocaleDateString()}</p>
                    <p className="mt-1 font-mono">Token: {participation.redeemToken.slice(0, 8)}...</p>
                </div>
            </Card>
        </div>
    )
}
