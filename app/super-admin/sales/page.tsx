"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Check, Sparkles, Store, Utensils, Coffee, Beer, QrCode } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

// Presets for rapid creation
const PRESETS = [
    { id: "FAST_FOOD", label: "Fast Food", icon: Utensils, color: "#EF4444", secondary: "#FEF2F2" },
    { id: "FINE_DINING", label: "Fine Dining", icon: Sparkles, color: "#18181B", secondary: "#F4F4F5" },
    { id: "CAFE", label: "Café / Bakery", icon: Coffee, color: "#D97706", secondary: "#FFFBEB" },
    { id: "BAR", label: "Bar / Pub", icon: Beer, color: "#7C3AED", secondary: "#F5F3FF" },
]

export default function SalesModePage() {
    const router = useRouter()

    // Form State
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [name, setName] = useState("")
    const [selectedPreset, setSelectedPreset] = useState<any>(null)
    const [googleUrl, setGoogleUrl] = useState("")
    const [instagramHandle, setInstagramHandle] = useState("")
    const [tiktokHandle, setTiktokHandle] = useState("")
    const [tripadvisorUrl, setTripadvisorUrl] = useState("")
    const [createdRestaurant, setCreatedRestaurant] = useState<any>(null)

    const handleCreate = async () => {
        setLoading(true)
        setError(null)

        try {
            // 1. Prepare Data
            const payload = {
                name,
                category: selectedPreset.id,
                primaryColor: selectedPreset.color,
                secondaryColor: selectedPreset.secondary,
                googleMapsUrl: googleUrl || "https://google.com", // Default if skipped
                instagramHandle,
                tiktokHandle,
                tripadvisorUrl,
                rewards: [] // Auto-generated on server
            }

            // 2. Call API (Cookie Auth)
            const res = await fetch("/api/super-admin/create-restaurant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (res.status === 401) {
                window.location.href = "/auth/login"
                return
            }

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to create restaurant")
            }

            const data = await res.json()
            setCreatedRestaurant(data)
            setStep(4) // Success Screen
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Success Screen
    if (step === 4 && createdRestaurant) {
        const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/r/${createdRestaurant.slug}`

        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
                <Card className="max-w-lg w-full border-0 shadow-2xl animate-in zoom-in duration-500">
                    <CardContent className="p-8 text-center space-y-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <Check className="h-10 w-10 text-green-600" />
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">It's Live! 🚀</h2>
                            <p className="text-gray-500 mt-2">The restaurant is ready to accept reviews.</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border-2 border-dashed border-gray-200">
                            <div className="flex justify-center mb-4">
                                <QRCodeSVG value={publicUrl} size={200} />
                            </div>
                            <p className="text-sm font-mono text-gray-400 break-all">{publicUrl}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                className="h-14"
                                onClick={() => window.open(publicUrl, '_blank')}
                            >
                                Open Public Page
                            </Button>
                            <Button
                                className="h-14 bg-purple-600 hover:bg-purple-700"
                                onClick={() => {
                                    setStep(1)
                                    setName("")
                                    setSelectedPreset(null)
                                    setCreatedRestaurant(null)
                                    setGoogleUrl("")
                                    setInstagramHandle("")
                                    setTiktokHandle("")
                                    setTripadvisorUrl("")
                                }}
                            >
                                Create Another
                            </Button>
                        </div>

                        <Button variant="ghost" onClick={() => router.push("/super-admin")}>
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <Button variant="ghost" onClick={() => router.push("/super-admin")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                    <div className="flex gap-2">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`h-2 w-12 rounded-full transition-colors ${step >= i ? "bg-purple-600" : "bg-gray-200"}`}
                            />
                        ))}
                    </div>
                </div>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-8">
                        {/* STEP 1: BASIC INFO */}
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900">Let's start with the basics</h2>
                                    <p className="text-gray-500">What's the name of the business?</p>
                                </div>

                                <div className="space-y-4">
                                    <Label>Restaurant Name</Label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Luigi's Pizza"
                                        className="text-lg py-6"
                                        autoFocus
                                    />
                                </div>

                                <Button
                                    className="w-full py-6 text-lg bg-purple-600 hover:bg-purple-700"
                                    onClick={() => setStep(2)}
                                    disabled={!name}
                                >
                                    Next Step <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        )}

                        {/* STEP 2: BRANDING */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900">Choose a Vibe</h2>
                                    <p className="text-gray-500">Select the category that fits best.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {PRESETS.map((preset) => (
                                        <button
                                            key={preset.id}
                                            onClick={() => setSelectedPreset(preset)}
                                            className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${selectedPreset?.id === preset.id
                                                ? "border-purple-600 bg-purple-50"
                                                : "border-gray-100 hover:border-purple-200 hover:bg-gray-50"
                                                }`}
                                        >
                                            <preset.icon className={`h-8 w-8 ${selectedPreset?.id === preset.id ? "text-purple-600" : "text-gray-400"}`} />
                                            <span className={`font-medium ${selectedPreset?.id === preset.id ? "text-purple-900" : "text-gray-600"}`}>
                                                {preset.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button variant="outline" onClick={() => setStep(1)} className="w-1/3 py-6">
                                        Back
                                    </Button>
                                    <Button
                                        className="w-2/3 py-6 text-lg bg-purple-600 hover:bg-purple-700"
                                        onClick={() => setStep(3)}
                                        disabled={!selectedPreset}
                                    >
                                        Next Step <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: SOCIAL LINKS */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900">Connect Platforms</h2>
                                    <p className="text-gray-500">Where should happy customers engage?</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label>Google Maps Link (Recommended)</Label>
                                        <Input
                                            value={googleUrl}
                                            onChange={(e) => setGoogleUrl(e.target.value)}
                                            placeholder="https://g.page/..."
                                            className="text-lg py-4"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Instagram Handle</Label>
                                            <Input
                                                value={instagramHandle}
                                                onChange={(e) => setInstagramHandle(e.target.value)}
                                                placeholder="@restaurant"
                                                className="py-4"
                                            />
                                        </div>
                                        <div>
                                            <Label>TikTok Handle</Label>
                                            <Input
                                                value={tiktokHandle}
                                                onChange={(e) => setTiktokHandle(e.target.value)}
                                                placeholder="@restaurant"
                                                className="py-4"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>TripAdvisor URL</Label>
                                        <Input
                                            value={tripadvisorUrl}
                                            onChange={(e) => setTripadvisorUrl(e.target.value)}
                                            placeholder="https://tripadvisor.com/..."
                                            className="py-4"
                                        />
                                    </div>

                                    <p className="text-xs text-gray-400">
                                        Tip: Add multiple platforms to let customers choose their favorite!
                                    </p>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <Button variant="outline" onClick={() => setStep(2)} className="w-1/3 py-6">
                                        Back
                                    </Button>
                                    <Button
                                        className="w-2/3 py-6 text-lg bg-purple-600 hover:bg-purple-700"
                                        onClick={handleCreate}
                                        disabled={loading}
                                    >
                                        {loading ? "Creating Magic..." : "Launch Restaurant 🚀"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

