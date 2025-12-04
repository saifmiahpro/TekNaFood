"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ExternalLink, CheckCircle2 } from "lucide-react"
import { Icons } from "@/components/icons"

interface Action {
    platform: "GOOGLE_REVIEW" | "TRIPADVISOR_REVIEW" | "INSTAGRAM_FOLLOW" | "TIKTOK_FOLLOW"
    label: string
    icon: React.ReactNode
    url: string | null
    completed: boolean
    description: string
}

interface ActionSelectorProps {
    restaurantId: string
    restaurantSlug: string // Ajout du slug
    restaurantName: string
    primaryColor: string
    secondaryColor: string
    onActionSelected: (platform: string, url: string) => void
}

export function ActionSelector({
    restaurantId,
    restaurantSlug,
    restaurantName,
    primaryColor,
    secondaryColor,
    onActionSelected
}: ActionSelectorProps) {
    const [actions, setActions] = useState<Action[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
    const [loadingAction, setLoadingAction] = useState<string | null>(null)

    useEffect(() => {
        fetchAvailableActions()
    }, [])

    const fetchAvailableActions = async () => {
        try {
            // Utilisation du slug pour l'API
            const res = await fetch(`/api/restaurant/${restaurantSlug}/actions`)
            const data = await res.json()

            const formattedActions: Action[] = []

            // Google (toujours disponible)
            if (data.googleMapsUrl) {
                formattedActions.push({
                    platform: "GOOGLE_REVIEW",
                    label: "Avis Google",
                    icon: <Icons.Google className="w-6 h-6" />,
                    url: data.googleMapsUrl,
                    completed: data.completedActions?.includes("GOOGLE_REVIEW") || false,
                    description: "Laissez un avis sur Google Maps"
                })
            }

            // TripAdvisor (optionnel)
            if (data.tripadvisorUrl) {
                formattedActions.push({
                    platform: "TRIPADVISOR_REVIEW",
                    label: "Avis TripAdvisor",
                    icon: <Icons.TripAdvisor className="w-6 h-6" />,
                    url: data.tripadvisorUrl,
                    completed: data.completedActions?.includes("TRIPADVISOR_REVIEW") || false,
                    description: "Partagez votre expérience sur TripAdvisor"
                })
            }

            // Helper pour nettoyer et générer les URLs sociales
            const getSocialUrl = (input: string, platform: 'instagram' | 'tiktok') => {
                if (!input) return null

                // Si c'est déjà une URL complète
                if (input.startsWith('http')) return input
                if (input.includes('instagram.com') || input.includes('tiktok.com')) return `https://${input}`

                // Sinon c'est un handle
                const cleanHandle = input.replace('@', '').trim()
                if (platform === 'instagram') return `https://instagram.com/${cleanHandle}`
                if (platform === 'tiktok') return `https://tiktok.com/@${cleanHandle}`

                return input
            }

            // Helper pour l'affichage du handle
            const getDisplayHandle = (input: string) => {
                if (!input) return ''
                if (input.includes('/')) {
                    const parts = input.split('/')
                    return '@' + parts[parts.length - 1].replace('@', '')
                }
                return '@' + input.replace('@', '')
            }

            // Instagram (optionnel)
            if (data.instagramHandle) {
                formattedActions.push({
                    platform: "INSTAGRAM_FOLLOW",
                    label: "Instagram",
                    icon: <Icons.Instagram className="w-6 h-6" />,
                    url: getSocialUrl(data.instagramHandle, 'instagram'),
                    completed: data.completedActions?.includes("INSTAGRAM_FOLLOW") || false,
                    description: `Suivez ${getDisplayHandle(data.instagramHandle)}`
                })
            }

            // TikTok (optionnel)
            if (data.tiktokHandle) {
                formattedActions.push({
                    platform: "TIKTOK_FOLLOW",
                    label: "TikTok",
                    icon: <Icons.TikTok className="w-6 h-6" />,
                    url: getSocialUrl(data.tiktokHandle, 'tiktok'),
                    completed: data.completedActions?.includes("TIKTOK_FOLLOW") || false,
                    description: `Suivez ${getDisplayHandle(data.tiktokHandle)}`
                })
            }

            setActions(formattedActions)
        } catch (error) {
            console.error("Error fetching actions:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleActionClick = (action: Action) => {
        if (action.completed || loadingAction) return
        if (!action.url) return

        setLoadingAction(action.platform)
        setSelectedPlatform(action.platform)
        onActionSelected(action.platform, action.url)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: primaryColor }} />
            </div>
        )
    }

    const availableActions = actions.filter(a => !a.completed)
    const completedActions = actions.filter(a => a.completed)

    if (availableActions.length === 0 && completedActions.length > 0) {
        return (
            <Card className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                    <CheckCircle2 className="w-8 h-8" style={{ color: primaryColor }} />
                </div>
                <h2 className="text-2xl font-bold">Vous avez déjà participé ! 🎉</h2>
                <p className="text-gray-600">
                    Vous avez épuisé toutes les actions disponibles aujourd'hui.
                </p>
                <p className="text-sm text-gray-400">
                    Revenez demain pour de nouvelles chances !
                </p>
            </Card>
        )
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center space-y-3">
                <h1 className="text-3xl md:text-4xl font-black" style={{ color: primaryColor }}>
                    Gagnez un cadeau ! 🎁
                </h1>
                <p className="text-gray-600 text-lg">
                    Choisissez une action pour tenter votre chance à la roue
                </p>
            </div>

            {/* Actions */}
            <div className="grid gap-4">
                {actions.map((action, index) => (
                    <motion.div
                        key={action.platform}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card
                            className={`p-6 transition-all cursor-pointer relative overflow-hidden border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1 ${action.completed ? 'opacity-60 grayscale' : ''}`}
                            style={{
                                backgroundColor: 'white',
                            }}
                            onClick={() => handleActionClick(action)}
                        >
                            {action.platform === 'GOOGLE_REVIEW' && !action.completed && (
                                <div className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
                                    RECOMMANDÉ
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-4">
                                {/* Icon + Info */}
                                <div className="flex items-center gap-5 flex-1">
                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gray-50 shadow-inner"
                                    >
                                        <div className={`transform scale-110 ${action.completed ? 'opacity-50' : ''}`}>
                                            {action.icon}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-black text-lg mb-1 flex items-center gap-2 text-gray-900 leading-tight">
                                            {action.label}
                                        </h3>
                                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                            {action.description}
                                        </p>
                                        {action.completed && (
                                            <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1 bg-green-50 w-fit px-2 py-1 rounded-full">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Fait
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* CTA */}
                                {!action.completed && (
                                    <Button
                                        size="icon"
                                        disabled={!!loadingAction}
                                        className="h-12 w-12 rounded-full shadow-md flex-shrink-0 transition-transform active:scale-95"
                                        style={{
                                            backgroundColor: action.platform === 'GOOGLE_REVIEW' ? 'black' : primaryColor,
                                            color: 'white',
                                            opacity: (loadingAction && loadingAction !== action.platform) ? 0.5 : 1
                                        }}
                                    >
                                        {loadingAction === action.platform ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                        ) : (
                                            <ExternalLink className="w-5 h-5" />
                                        )}
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Info Footer */}
            <div className="text-center space-y-2">
                <p className="text-sm text-gray-500">
                    💡 Vous pouvez faire plusieurs actions pour multiplier vos chances
                </p>
                <p className="text-xs text-gray-400">
                    1 action = 1 jeu · Pas de limite si vous faites des actions différentes
                </p>
            </div>
        </div>
    )
}
