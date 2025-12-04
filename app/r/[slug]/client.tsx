"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Star, ThumbsUp, MessageSquare, ArrowRight, Mail, MapPin, Users, Gift, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ActionSelector } from "@/components/action-selector"

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
    // Nouveau workflow : on commence par le choix de l'action
    const [step, setStep] = useState<"action-select" | "rating" | "feedback" | "form">("action-select")
    const [rating, setRating] = useState(0)
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null) // Nouvelle: stocker l'URL pour l'ouvrir après la note
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

    const handleActionSelected = (platform: string, url: string) => {
        setSelectedPlatform(platform)
        setSelectedUrl(url)

        if (platform === 'GOOGLE_REVIEW' || platform === 'TRIPADVISOR_REVIEW') {
            // Pour les avis, on demande d'abord la note pour filtrer
            setStep("rating")
        } else {
            // Pour les réseaux sociaux (Insta, TikTok), action directe
            window.open(url, "_blank")
            setTimeout(() => setStep("form"), 2000)
        }
    }

    const handleRating = (stars: number) => {
        setRating(stars)
        if (stars >= 4) {
            // Si bonne note, on redirige vers la plateforme d'avis choisie
            if (selectedUrl) {
                window.open(selectedUrl, "_blank")
            }
            setTimeout(() => setStep("form"), 2000)
        } else {
            // Si mauvaise note, feedback privé
            setStep("feedback")
        }
    }

    const handleSubmitFeedback = async () => {
        // On remercie et on laisse accéder au jeu (ou pas ? Le client voulait éviter les avis négatifs publics)
        // Dans l'ancien flow, ça allait vers "form".
        setStep("form")
    }

    const handleProceedToGame = () => {
        const data = {
            restaurantId: restaurant.id,
            customerName,
            customerEmail,
            rating,
            feedback,
            platformAction: selectedPlatform || "GOOGLE_REVIEW", // Fallback
            source: "qr",
        }
        const encodedData = encodeURIComponent(JSON.stringify(data))
        router.push(`/r/${restaurant.slug}/play?data=${encodedData}`)
    }

    return (
        <div className="min-h-[100dvh] bg-gray-50 flex flex-col font-sans">
            {/* Brand Header - Compact Mobile */}
            <div
                className="w-full py-6 md:py-8 px-4 shadow-xl text-center relative overflow-hidden"
                style={{
                    backgroundColor: restaurant.primaryColor,
                    borderBottomLeftRadius: '1.5rem',
                    borderBottomRightRadius: '1.5rem'
                }}
            >
                <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
                <div className="relative z-10 flex flex-col items-center justify-center space-y-2">
                    {restaurant.logoUrl ? (
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full p-1.5 shadow-lg flex items-center justify-center overflow-hidden border-4 border-white/20">
                            <img
                                src={restaurant.logoUrl}
                                alt={restaurant.name}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    ) : (
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-xl md:text-2xl font-bold text-white shadow-inner border border-white/30">
                            {restaurant.name.charAt(0)}
                        </div>
                    )}

                    <div className="space-y-0.5">
                        <h1 className="text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-md">
                            {restaurant.name}
                        </h1>
                        <p className="text-white/90 text-[10px] md:text-xs font-medium uppercase tracking-widest opacity-80">
                            Programme de Fidélité
                        </p>
                    </div>
                </div>
            </div>

            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 max-w-md mx-auto w-full">
                <AnimatePresence mode="wait">

                    {/* STEP 1: ACTION SELECTION (Nouvel Accueil) */}
                    {step === "action-select" && (
                        <div className="text-center space-y-6 w-full animate-in fade-in duration-500">
                            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100">
                                <div
                                    className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6"
                                    style={{ backgroundColor: `${restaurant.primaryColor}20` }}
                                >
                                    <Gift className="h-8 w-8 md:h-10 md:w-10" style={{ color: restaurant.primaryColor }} />
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">{restaurant.introTitle}</h2>
                                <p className="text-gray-600 text-sm md:text-base leading-relaxed font-medium">{restaurant.introSubtitle}</p>
                            </div>

                            <ActionSelector
                                restaurantId={restaurant.id}
                                restaurantSlug={restaurant.slug}
                                restaurantName={restaurant.name}
                                primaryColor={restaurant.primaryColor}
                                secondaryColor={restaurant.secondaryColor}
                                onActionSelected={handleActionSelected}
                            />
                        </div>
                    )}

                    {/* STEP 2: RATING (Seulement si Avis Google/TripAdvisor choisi) */}
                    {step === "rating" && (
                        <motion.div
                            key="rating"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="text-center w-full"
                        >
                            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100">
                                <div
                                    className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                    style={{ backgroundColor: `${restaurant.primaryColor}20` }}
                                >
                                    <Star className="h-7 w-7 md:h-8 md:w-8" style={{ color: restaurant.primaryColor }} />
                                </div>
                                <h2 className="text-lg md:text-xl font-bold mb-2 text-gray-900">Votre avis compte !</h2>
                                <p className="text-gray-600 mb-6 text-sm md:text-base font-medium">
                                    Combien d'étoiles mérite votre expérience ?
                                </p>

                                <div className="flex justify-center gap-1 md:gap-2 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => handleRating(star)}
                                            className="transform hover:scale-110 transition-transform focus:outline-none p-1"
                                        >
                                            <Star
                                                className={`h-8 w-8 md:h-10 md:w-10 ${rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: FEEDBACK (Si mauvaise note) */}
                    {step === "feedback" && (
                        <motion.div
                            key="feedback"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="text-center w-full"
                        >
                            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100">
                                <div
                                    className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                    style={{ backgroundColor: `${restaurant.primaryColor}20` }}
                                >
                                    <MessageSquare className="h-7 w-7 md:h-8 md:w-8" style={{ color: restaurant.primaryColor }} />
                                </div>
                                <h2 className="text-lg md:text-xl font-bold mb-2 text-gray-900">Aidez-nous à nous améliorer</h2>
                                <p className="text-gray-600 mb-6 text-sm md:text-base font-medium">
                                    Désolé que tout n'ait pas été parfait. Votre avis compte énormément pour nous (et restera privé).
                                </p>

                                <textarea
                                    className="w-full p-3 md:p-4 border border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none bg-gray-50 text-sm"
                                    rows={4}
                                    placeholder="Dites-nous ce qui n'a pas été..."
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                />

                                <Button
                                    onClick={handleSubmitFeedback}
                                    className="w-full py-5 md:py-6 text-base md:text-lg font-bold text-white hover:opacity-90"
                                    style={{ backgroundColor: restaurant.primaryColor }}
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
                            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100">
                                <div
                                    className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                    style={{ backgroundColor: `${restaurant.primaryColor}20` }}
                                >
                                    <Sparkles className="h-7 w-7 md:h-8 md:w-8" style={{ color: restaurant.primaryColor }} />
                                </div>
                                <h2 className="text-lg md:text-xl font-bold mb-2 text-gray-900">C'est le moment de vérité !</h2>
                                <p className="text-gray-600 mb-6 text-sm md:text-base font-medium">
                                    Où devons-nous envoyer votre gain si vous gagnez ?
                                    <br /><span className="text-xs text-gray-400 font-normal">(Promis, zéro spam. Juste votre cadeau.)</span>
                                </p>

                                <div className="space-y-3 md:space-y-4 text-left">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Prénom</label>
                                        <Input
                                            placeholder="Ex: Thomas"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            className="h-10 md:h-12 bg-gray-50 border-gray-300 text-gray-900 font-medium text-base md:text-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Email</label>
                                        <Input
                                            type="email"
                                            placeholder="thomas@exemple.com"
                                            value={customerEmail}
                                            onChange={handleEmailChange}
                                            className={`h-10 md:h-12 bg-gray-50 border-gray-300 text-gray-900 font-medium text-base md:text-lg ${emailError ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        />
                                        {emailError && (
                                            <p className="text-red-600 text-[10px] mt-1 ml-1 font-medium">{emailError}</p>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    onClick={handleProceedToGame}
                                    disabled={!customerName || !customerEmail || !isValidEmail(customerEmail)}
                                    className="w-full mt-6 md:mt-8 py-5 md:py-6 text-base md:text-lg font-bold shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                                    style={{ backgroundColor: restaurant.primaryColor }}
                                >
                                    {!customerName || !customerEmail ? "Remplissez le formulaire" : !isValidEmail(customerEmail) ? "Email invalide" : "LANCER LA ROUE ! 🎰"}
                                </Button>

                                <p className="text-[10px] text-gray-400 mt-3 text-center">
                                    En jouant, vous acceptez notre <a href="/privacy" target="_blank" className="underline hover:text-gray-600">politique de confidentialité</a> et le <a href="/terms" target="_blank" className="underline hover:text-gray-600">règlement du jeu</a>.
                                </p>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>

            <footer className="py-4 md:py-6 text-center text-gray-400 text-[10px] md:text-xs">
                Propulsé par <a href="https://tekna.studio" target="_blank" rel="noopener noreferrer" className="font-bold text-gray-500 hover:text-gray-700 transition-colors">Tekna Studio</a>
            </footer>
        </div>
    )
}
