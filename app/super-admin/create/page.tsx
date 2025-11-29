"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Building2,
    Palette,
    Link as LinkIcon,
    Gift,
    Sparkles
} from "lucide-react"

const CATEGORIES = [
    { value: "FAST_FOOD", label: "Fast Food", icon: "🍔" },
    { value: "CAFE", label: "Café", icon: "☕" },
    { value: "RESTAURANT", label: "Restaurant", icon: "🍽️" },
    { value: "BAR", label: "Bar", icon: "🍺" },
    { value: "CAR_WASH", label: "Car Wash", icon: "🚗" },
    { value: "BEAUTY", label: "Beauty Salon", icon: "💇" },
    { value: "OTHER", label: "Other", icon: "🏪" },
]

const DEFAULT_REWARD_TEMPLATES = {
    CAFE: [
        { label: "Boisson offerte", probability: 0.3, icon: "☕", colorHex: "#3b82f6", isWin: true },
        { label: "Pâtisserie offerte", probability: 0.2, icon: "🥐", colorHex: "#ec4899", isWin: true },
        { label: "10% de réduction", probability: 0.25, icon: "💰", colorHex: "#8b5cf6", isWin: true },
        { label: "Merci d'avoir participé", probability: 0.25, icon: "🙏", colorHex: "#6b7280", isWin: false },
    ],
    RESTAURANT: [
        { label: "Dessert offert", probability: 0.25, icon: "🍰", colorHex: "#ec4899", isWin: true },
        { label: "Apéritif offert", probability: 0.2, icon: "🍷", colorHex: "#f59e0b", isWin: true },
        { label: "15% de réduction", probability: 0.3, icon: "💰", colorHex: "#8b5cf6", isWin: true },
        { label: "Merci d'avoir participé", probability: 0.25, icon: "🙏", colorHex: "#6b7280", isWin: false },
    ],
    FAST_FOOD: [
        { label: "Menu gratuit", probability: 0.15, icon: "🍔", colorHex: "#ef4444", isWin: true },
        { label: "Boisson offerte", probability: 0.35, icon: "🥤", colorHex: "#3b82f6", isWin: true },
        { label: "Frites gratuites", probability: 0.25, icon: "🍟", colorHex: "#f59e0b", isWin: true },
        { label: "Merci d'avoir participé", probability: 0.25, icon: "🙏", colorHex: "#6b7280", isWin: false },
    ],
    DEFAULT: [
        { label: "Cadeau surprise", probability: 0.25, icon: "🎁", colorHex: "#3b82f6", isWin: true },
        { label: "10% de réduction", probability: 0.25, icon: "💰", colorHex: "#8b5cf6", isWin: true },
        { label: "Service gratuit", probability: 0.25, icon: "✨", colorHex: "#ec4899", isWin: true },
        { label: "Merci d'avoir participé", probability: 0.25, icon: "🙏", colorHex: "#6b7280", isWin: false },
    ],
}

export default function CreateRestaurantPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token")

    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [createdRestaurant, setCreatedRestaurant] = useState<any>(null)

    // Form data
    const [name, setName] = useState("")
    const [category, setCategory] = useState("")
    const [googleMapsUrl, setGoogleMapsUrl] = useState("")
    const [primaryColor, setPrimaryColor] = useState("#16a34a")
    const [secondaryColor, setSecondaryColor] = useState("#facc15")
    const [introTitle, setIntroTitle] = useState("Merci pour votre visite !")
    const [introSubtitle, setIntroSubtitle] = useState("Laissez-nous un avis honnête puis tentez de gagner une surprise.")
    const [contactEmail, setContactEmail] = useState("")

    const handleCreate = async () => {
        setLoading(true)
        try {
            // Get reward template based on category
            const rewardTemplate = DEFAULT_REWARD_TEMPLATES[category as keyof typeof DEFAULT_REWARD_TEMPLATES] || DEFAULT_REWARD_TEMPLATES.DEFAULT

            const res = await fetch(`/api/super-admin/create-restaurant?token=${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    category,
                    googleMapsUrl,
                    primaryColor,
                    secondaryColor,
                    introTitle,
                    introSubtitle,
                    contactEmail: contactEmail || null,
                    rewards: rewardTemplate,
                }),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || "Failed to create restaurant")
            }

            const data = await res.json()
            setCreatedRestaurant(data)
            setStep(5) // Move to success step
        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-red-600">Access Denied</CardTitle>
                        <CardDescription>Missing super admin token</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    if (step === 5 && createdRestaurant) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <Card className="border-0 shadow-2xl">
                        <CardHeader className="text-center bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                            <div className="flex justify-center mb-4">
                                <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center">
                                    <Check className="h-10 w-10 text-white" />
                                </div>
                            </div>
                            <CardTitle className="text-3xl">Restaurant Created Successfully!</CardTitle>
                            <CardDescription className="text-lg mt-2">
                                {createdRestaurant.name} is ready to collect reviews
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-8">
                            {/* Restaurant Details */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <h3 className="font-bold text-xl mb-4">Important Links</h3>
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-gray-600">Customer Page URL</Label>
                                        <div className="flex gap-2 mt-1">
                                            <Input
                                                readOnly
                                                value={`${window.location.origin}/r/${createdRestaurant.slug}`}
                                                className="font-mono text-sm"
                                            />
                                            <Button
                                                variant="outline"
                                                onClick={() => window.open(`/r/${createdRestaurant.slug}`, "_blank")}
                                            >
                                                <LinkIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-gray-600">Admin Dashboard URL</Label>
                                        <div className="flex gap-2 mt-1">
                                            <Input
                                                readOnly
                                                value={`${window.location.origin}/admin?token=${createdRestaurant.adminToken}`}
                                                className="font-mono text-sm"
                                            />
                                            <Button
                                                variant="outline"
                                                onClick={() => window.open(`/admin?token=${createdRestaurant.adminToken}`, "_blank")}
                                            >
                                                <LinkIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-gray-600">Admin Token (Keep Secret!)</Label>
                                        <Input
                                            readOnly
                                            value={createdRestaurant.adminToken}
                                            className="font-mono text-sm bg-yellow-50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* QR Code */}
                            <div>
                                <h3 className="font-bold text-xl mb-4 text-center">Your QR Code</h3>
                                <QRCodeGenerator
                                    url={`${window.location.origin}/r/${createdRestaurant.slug}`}
                                    restaurantName={createdRestaurant.name}
                                    primaryColor={createdRestaurant.primaryColor}
                                    secondaryColor={createdRestaurant.secondaryColor}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 justify-center flex-wrap">
                                <Button
                                    size="lg"
                                    onClick={() => router.push(`/admin?token=${createdRestaurant.adminToken}`)}
                                    style={{
                                        background: `linear-gradient(135deg, ${createdRestaurant.primaryColor}, ${createdRestaurant.secondaryColor})`,
                                    }}
                                >
                                    Go to Admin Dashboard
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => router.push(`/super-admin?token=${token}`)}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Super Admin
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8">
            <div className="max-w-3xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.push(`/super-admin?token=${token}`)}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                    <h1 className="text-4xl font-bold mb-2">Create New Restaurant</h1>
                    <p className="text-gray-600">Set up a new business in just a few steps</p>
                </div>

                {/* Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex items-center flex-1">
                                <div
                                    className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${s <= step
                                            ? "bg-purple-600 text-white"
                                            : "bg-gray-200 text-gray-500"
                                        }`}
                                >
                                    {s}
                                </div>
                                {s < 4 && (
                                    <div
                                        className={`h-1 flex-1 mx-2 ${s < step ? "bg-purple-600" : "bg-gray-200"
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <Card className="border-0 shadow-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {step === 1 && <><Building2 className="h-6 w-6" /> Basic Information</>}
                            {step === 2 && <><Palette className="h-6 w-6" /> Branding</>}
                            {step === 3 && <><LinkIcon className="h-6 w-6" /> Google Review Link</>}
                            {step === 4 && <><Gift className="h-6 w-6" /> Review & Create</>}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Step 1: Basic Info */}
                        {step === 1 && (
                            <>
                                <div>
                                    <Label htmlFor="name">Restaurant Name *</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., Café de Paris"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label>Category *</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                                        {CATEGORIES.map((cat) => (
                                            <button
                                                key={cat.value}
                                                onClick={() => setCategory(cat.value)}
                                                className={`p-4 border-2 rounded-lg text-center transition-all ${category === cat.value
                                                        ? "border-purple-600 bg-purple-50"
                                                        : "border-gray-200 hover:border-purple-300"
                                                    }`}
                                            >
                                                <div className="text-3xl mb-1">{cat.icon}</div>
                                                <div className="text-sm font-medium">{cat.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="email">Contact Email (optional)</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                        placeholder="contact@restaurant.com"
                                        className="mt-1"
                                    />
                                </div>
                            </>
                        )}

                        {/* Step 2: Branding */}
                        {step === 2 && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="primaryColor">Primary Color</Label>
                                        <div className="flex gap-2 mt-1">
                                            <Input
                                                id="primaryColor"
                                                type="color"
                                                value={primaryColor}
                                                onChange={(e) => setPrimaryColor(e.target.value)}
                                                className="w-20 h-12 p-1"
                                            />
                                            <Input
                                                value={primaryColor}
                                                onChange={(e) => setPrimaryColor(e.target.value)}
                                                className="flex-1 font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="secondaryColor">Secondary Color</Label>
                                        <div className="flex gap-2 mt-1">
                                            <Input
                                                id="secondaryColor"
                                                type="color"
                                                value={secondaryColor}
                                                onChange={(e) => setSecondaryColor(e.target.value)}
                                                className="w-20 h-12 p-1"
                                            />
                                            <Input
                                                value={secondaryColor}
                                                onChange={(e) => setSecondaryColor(e.target.value)}
                                                className="flex-1 font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="introTitle">Intro Title</Label>
                                    <Input
                                        id="introTitle"
                                        value={introTitle}
                                        onChange={(e) => setIntroTitle(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="introSubtitle">Intro Subtitle</Label>
                                    <Input
                                        id="introSubtitle"
                                        value={introSubtitle}
                                        onChange={(e) => setIntroSubtitle(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>

                                {/* Preview */}
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                    <p className="text-sm text-gray-600 mb-3">Preview:</p>
                                    <div
                                        className="p-6 rounded-lg"
                                        style={{
                                            background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}20)`,
                                        }}
                                    >
                                        <h3 className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>
                                            {introTitle}
                                        </h3>
                                        <p className="text-gray-600">{introSubtitle}</p>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Step 3: Google Link */}
                        {step === 3 && (
                            <>
                                <div>
                                    <Label htmlFor="googleMapsUrl">Google Review URL *</Label>
                                    <Input
                                        id="googleMapsUrl"
                                        value={googleMapsUrl}
                                        onChange={(e) => setGoogleMapsUrl(e.target.value)}
                                        placeholder="https://g.page/r/..."
                                        className="mt-1 font-mono"
                                    />
                                    <p className="text-sm text-gray-500 mt-2">
                                        This is the link where customers will leave their Google review
                                    </p>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="font-semibold text-blue-900 mb-2">How to find your Google Review URL:</p>
                                    <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                                        <li>Search for your business on Google Maps</li>
                                        <li>Click on your business name</li>
                                        <li>Scroll down and click "Write a review"</li>
                                        <li>Copy the URL from your browser</li>
                                    </ol>
                                </div>
                            </>
                        )}

                        {/* Step 4: Review */}
                        {step === 4 && (
                            <>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-gray-600">Name</Label>
                                            <p className="font-semibold text-lg">{name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-gray-600">Category</Label>
                                            <Badge>{CATEGORIES.find((c) => c.value === category)?.label}</Badge>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-gray-600">Colors</Label>
                                        <div className="flex gap-2 mt-1">
                                            <div
                                                className="h-12 w-12 rounded-lg border shadow"
                                                style={{ backgroundColor: primaryColor }}
                                            />
                                            <div
                                                className="h-12 w-12 rounded-lg border shadow"
                                                style={{ backgroundColor: secondaryColor }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-gray-600">Google Review URL</Label>
                                        <p className="text-sm font-mono break-all">{googleMapsUrl}</p>
                                    </div>

                                    <div>
                                        <Label className="text-gray-600">Default Rewards</Label>
                                        <p className="text-sm text-gray-500">
                                            We'll create {DEFAULT_REWARD_TEMPLATES[category as keyof typeof DEFAULT_REWARD_TEMPLATES]?.length || 4} default rewards based on your category. You can edit them later.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="font-semibold text-green-900 flex items-center gap-2">
                                        <Check className="h-5 w-5" />
                                        Everything looks good! Ready to create?
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between pt-6 border-t">
                            {step > 1 && (
                                <Button
                                    variant="outline"
                                    onClick={() => setStep(step - 1)}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Previous
                                </Button>
                            )}
                            {step < 4 ? (
                                <Button
                                    onClick={() => setStep(step + 1)}
                                    disabled={
                                        (step === 1 && (!name || !category)) ||
                                        (step === 3 && !googleMapsUrl)
                                    }
                                    className="ml-auto"
                                    style={{
                                        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                                    }}
                                >
                                    Next
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleCreate}
                                    disabled={loading}
                                    className="ml-auto"
                                    style={{
                                        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                                    }}
                                >
                                    {loading ? (
                                        <>Creating...</>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-5 w-5" />
                                            Create Restaurant
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
