"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Star, ThumbsUp, MessageSquare, ArrowRight, Mail, MapPin, Users, Gift, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

interface Restaurant {
    id: string
    name: string
    slug: string
    googleMapsUrl: string
    introTitle: string
    introSubtitle: string
    primaryColor: string
    secondaryColor: string
    logoUrl: string | null
}

export default function RestaurantClient({ restaurant }: { restaurant: Restaurant }) {
    const [step, setStep] = useState<"welcome" | "rating" | "feedback" | "google" | "form">("welcome")
    const [rating, setRating] = useState(0)
    const [customerName, setCustomerName] = useState("")
    const [customerEmail, setCustomerEmail] = useState("")
    const [feedback, setFeedback] = useState("")
    const [ticketNumber, setTicketNumber] = useState("")
    const [emailError, setEmailError] = useState("")

    const router = useRouter()

    // Fonction de validation email
    const isValidEmail = (email: string): boolean => {
        if (!email) return false
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const email = e.target.value
        setCustomerEmail(email)

        if (email && !isValidEmail(email)) {
            setEmailError("Adresse email invalide")
        } else {
            setEmailError("")
        }
    }

    const handleRating = (stars: number) => {
        setRating(stars)
        if (stars >= 4) {
            setStep("google")
        } else {
            setStep("feedback")
        }
    }

    const handleGoogleClick = () => {
        if (restaurant?.googleMapsUrl) {
            window.open(restaurant.googleMapsUrl, "_blank")
            setTimeout(() => setStep("form"), 2000)
        }
    }

    const handleSubmitFeedback = async () => {
        setStep("form")
    }

    const handleProceedToGame = () => {
        const data = {
            restaurantId: restaurant.id,
            customerName,
            customerEmail,
            rating,
            feedback,
            source: "qr",
        }
        const encodedData = encodeURIComponent(JSON.stringify(data))
        router.push(`/r/${restaurant.slug}/play?data=${encodedData}`)
    }

    return (
        <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
            {/* Brand Header */}
            <div
                className="w-full py-6 px-4 shadow-lg text-center relative overflow-hidden"
                style={{ backgroundColor: restaurant.primaryColor }}
            >
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold text-white tracking-tight">{restaurant.name}</h1>
                    <p className="text-white/90 text-sm mt-1 font-medium">Programme de Fidélité</p>
                </div>
            </div>

            <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
                <AnimatePresence mode="wait">

                    {/* STEP 1: WELCOME */}
                    {step === "welcome" && (
                        <div className="text-center space-y-8 w-full animate-in fade-in duration-500">
                            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <ThumbsUp className="h-10 w-10 text-yellow-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">{restaurant.introTitle}</h2>
                                <p className="text-gray-700 leading-relaxed font-medium">{restaurant.introSubtitle}</p>
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm font-bold text-gray-700 uppercase tracking-widest">Comment s'est passé votre moment ?</p>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => handleRating(star)}
                                            className="transform hover:scale-110 transition-transform focus:outline-none"
                                        >
                                            <Star
                                                className={`h-10 w-10 ${rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: GOOGLE REVIEW (Positive) */}
                    {step === "google" && (
                        <motion.div
                            key="google"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="text-center w-full"
                        >
                            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Gift className="h-8 w-8 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-bold mb-2">Un cadeau vous attend ! 🎁</h2>
                                <p className="text-gray-700 mb-6 text-base font-medium">
                                    Merci pour cette super note ! Partagez votre expérience sur Google en 2 clics pour <strong>lancer la roue magique</strong>.
                                </p>

                                <Button
                                    onClick={handleGoogleClick}
                                    className="w-full py-6 text-lg font-bold shadow-lg hover:scale-105 transition-transform"
                                    style={{ backgroundColor: restaurant.primaryColor }}
                                >
                                    <MapPin className="mr-2 h-5 w-5" />
                                    Poster mon avis & Jouer
                                </Button>
                                <p className="text-sm text-gray-500 mt-4 font-medium">Ça ne prend que 10 secondes !</p>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: FEEDBACK (Negative) */}
                    {step === "feedback" && (
                        <motion.div
                            key="feedback"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="text-center w-full"
                        >
                            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare className="h-8 w-8 text-orange-600" />
                                </div>
                                <h2 className="text-xl font-bold mb-2">Aidez-nous à nous améliorer</h2>
                                <p className="text-gray-700 mb-6 text-base font-medium">
                                    Désolé que tout n'ait pas été parfait. Votre avis compte énormément pour nous (et restera privé).
                                </p>

                                <textarea
                                    className="w-full p-4 border border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none bg-gray-50"
                                    rows={4}
                                    placeholder="Dites-nous ce qui n'a pas été..."
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                />

                                <Button
                                    onClick={handleSubmitFeedback}
                                    className="w-full py-6 text-lg font-bold bg-black text-white hover:bg-gray-800"
                                >
                                    Envoyer mes remarques
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: FORM */}
                    {step === "form" && (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center w-full"
                        >
                            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="h-8 w-8 text-purple-600" />
                                </div>
                                <h2 className="text-xl font-bold mb-2">C'est le moment de vérité !</h2>
                                <p className="text-gray-700 mb-6 text-base font-medium">
                                    Où devons-nous envoyer votre gain si vous gagnez ?
                                    <br /><span className="text-sm text-gray-500 font-normal">(Promis, zéro spam. Juste votre cadeau.)</span>
                                </p>

                                <div className="space-y-4 text-left">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 uppercase ml-1 mb-1 block">Prénom</label>
                                        <Input
                                            placeholder="Ex: Thomas"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            className="h-12 bg-gray-50 border-gray-300 text-gray-900 font-medium text-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 uppercase ml-1 mb-1 block">Email</label>
                                        <Input
                                            type="email"
                                            placeholder="thomas@exemple.com"
                                            value={customerEmail}
                                            onChange={handleEmailChange}
                                            className={`h-12 bg-gray-50 border-gray-300 text-gray-900 font-medium text-lg ${emailError ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        />
                                        {emailError && (
                                            <p className="text-red-600 text-xs mt-1 ml-1 font-medium">{emailError}</p>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    onClick={handleProceedToGame}
                                    disabled={!customerName || !customerEmail || !isValidEmail(customerEmail)}
                                    className="w-full mt-8 py-6 text-lg font-bold shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                                    style={{ backgroundColor: restaurant.primaryColor }}
                                >
                                    {!customerName || !customerEmail ? "Remplissez le formulaire" : !isValidEmail(customerEmail) ? "Email invalide" : "LANCER LA ROUE ! 🎰"}
                                </Button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>

            <footer className="py-6 text-center text-gray-400 text-xs">
                Propulsé par <span className="font-bold text-gray-500">ReviewSpin</span>
            </footer>
        </div>
    )
}
