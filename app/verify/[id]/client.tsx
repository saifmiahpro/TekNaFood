"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, AlertTriangle, Gift } from "lucide-react"

export function VerifyClient({ participation }: { participation: any }) {
    const [status, setStatus] = useState(participation.status)
    const [redeemedAt, setRedeemedAt] = useState(participation.redeemedAt)
    const [loading, setLoading] = useState(false)

    const handleRedeem = async () => {
        if (!confirm("Confirmer la remise du cadeau ?")) return

        setLoading(true)
        try {
            const res = await fetch("/api/redeem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ participationId: participation.id }),
            })

            if (res.ok) {
                const data = await res.json()
                setStatus("REDEEMED")
                setRedeemedAt(data.redeemedAt)
            } else {
                alert("Erreur lors de la validation")
            }
        } catch (error) {
            console.error(error)
            alert("Erreur de connexion")
        } finally {
            setLoading(false)
        }
    }

    const isRedeemed = status === "REDEEMED"

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center border-b bg-white rounded-t-xl pb-6">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Gift className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-black text-gray-900">
                        Vérification Gain
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        {participation.restaurant.name}
                    </p>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                    {/* Customer Info */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-100">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Client :</span>
                            <span className="font-bold text-gray-900">{participation.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Email :</span>
                            <span className="font-medium text-gray-900">{participation.customerEmail}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Date :</span>
                            <span className="text-sm text-gray-900">
                                {new Date(participation.createdAt).toLocaleDateString()} à {new Date(participation.createdAt).toLocaleTimeString()}
                            </span>
                        </div>
                    </div>

                    {/* Reward Info */}
                    <div className="text-center py-4 bg-yellow-50 rounded-xl border-2 border-yellow-200 border-dashed">
                        <p className="text-sm text-yellow-800 font-bold uppercase tracking-wider mb-1">Gain à remettre</p>
                        <p className="text-3xl font-black text-gray-900">{participation.reward.label}</p>
                    </div>

                    {/* Status & Action */}
                    {isRedeemed ? (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center animate-in fade-in zoom-in duration-300">
                            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                            <h3 className="text-xl font-black text-red-600 mb-1">DÉJÀ UTILISÉ</h3>
                            <p className="text-sm text-red-800">
                                Ce cadeau a déjà été validé le :<br />
                                <strong>{new Date(redeemedAt).toLocaleString()}</strong>
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-bold text-green-800 text-sm">Cadeau Valide</p>
                                    <p className="text-xs text-green-700 mt-1">
                                        Vérifiez le ticket de caisse du client avant de valider.
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={handleRedeem}
                                disabled={loading}
                                className="w-full py-8 text-xl font-black bg-green-600 hover:bg-green-700 shadow-lg transition-all active:scale-95"
                            >
                                {loading ? "Validation..." : "✅ VALIDER LE GAIN"}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
