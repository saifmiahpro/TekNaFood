"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export interface WheelSegment {
    id: string
    label: string
    color: string
    icon?: string
}

interface PrizeWheelProps {
    segments: WheelSegment[]
    onSpinComplete?: (winningSegment: WheelSegment) => void
    onStartSpin?: () => Promise<string | null>
    primaryColor?: string
    secondaryColor?: string
}

export function PrizeWheelV2({
    segments,
    onSpinComplete,
    onStartSpin,
    primaryColor = "#16a34a",
    secondaryColor = "#facc15",
}: PrizeWheelProps) {
    const [rotation, setRotation] = useState(0)
    const [isSpinning, setIsSpinning] = useState(false)

    const spinWheel = async () => {
        if (isSpinning) return
        setIsSpinning(true)

        // Get winning segment from server
        let winningSegmentId: string | null = null
        if (onStartSpin) {
            winningSegmentId = await onStartSpin()
            if (!winningSegmentId) {
                setIsSpinning(false)
                return
            }
        }

        // Find winning index
        const winningIndex = segments.findIndex(seg => seg.id === winningSegmentId)
        const finalIndex = winningIndex !== -1 ? winningIndex : 0
        const winningSegment = segments[finalIndex]

        // Calculate rotation
        const segmentAngle = 360 / segments.length
        const spins = 5 // Full rotations
        const targetAngle = 360 * spins - (finalIndex * segmentAngle) + (segmentAngle / 2)

        setRotation(rotation + targetAngle)

        // Wait for animation
        setTimeout(() => {
            setIsSpinning(false)
            if (onSpinComplete) {
                onSpinComplete(winningSegment)
            }
        }, 4000)
    }

    const segmentAngle = 360 / segments.length

    return (
        <div className="relative flex flex-col items-center w-full max-w-sm mx-auto">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 -translate-y-6">
                <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-500 drop-shadow-xl filter">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                        <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Wheel Container */}
            <div className="relative w-full aspect-square max-w-[300px] md:max-w-[350px]">
                {/* Outer glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 blur-xl opacity-50 animate-pulse"></div>

                {/* Wheel */}
                <motion.div
                    className="relative w-full h-full rounded-full overflow-hidden shadow-2xl border-8 border-white"
                    style={{ rotate: rotation }}
                    animate={{ rotate: rotation }}
                    transition={{ duration: 4, ease: [0.22, 1, 0.36, 1] }}
                >
                    {segments.map((segment, index) => {
                        const startAngle = index * segmentAngle
                        return (
                            <div
                                key={segment.id}
                                className="absolute inset-0"
                                style={{
                                    transform: `rotate(${startAngle}deg)`,
                                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + Math.tan((segmentAngle / 2) * Math.PI / 180) * 50}% 0%)`,
                                    transformOrigin: "50% 50%"
                                }}
                            >
                                <div
                                    className="w-full h-full flex items-start justify-center pt-8"
                                    style={{ backgroundColor: segment.color }}
                                >
                                    <div
                                        className="flex flex-col items-center gap-1"
                                        style={{ transform: `rotate(${segmentAngle / 2}deg)` }}
                                    >
                                        <span className="text-2xl">{segment.icon}</span>
                                        <span className="text-white font-bold text-xs text-center leading-tight px-1">
                                            {segment.label.split(' ').slice(0, 2).join(' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {/* Center circle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white shadow-xl border-4 border-yellow-400 flex items-center justify-center z-20">
                        <span className="text-2xl animate-spin-slow">🎰</span>
                    </div>
                </motion.div>
            </div>

            {/* Spin Button */}
            <button
                onClick={spinWheel}
                disabled={isSpinning}
                className="mt-8 w-full max-w-xs px-8 py-5 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl font-black text-white text-xl shadow-2xl active:scale-95 transition-all uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
            >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>

                <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSpinning ? (
                        <>
                            <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Bonne chance !
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-6 h-6" />
                            TOURNER !
                        </>
                    )}
                </span>
            </button>
        </div>
    )
}
