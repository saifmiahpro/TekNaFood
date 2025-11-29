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

        // Calculate rotation - pointer is at top (270deg in circle coordinates)
        const segmentAngle = 360 / segments.length
        const spins = 5 // Full rotations
        // We want the CENTER of the winning segment to be at the top
        const targetAngle = 360 * spins + (360 - (finalIndex * segmentAngle) - (segmentAngle / 2))

        setRotation(targetAngle)

        // Wait for animation
        setTimeout(() => {
            setIsSpinning(false)
            if (onSpinComplete) {
                onSpinComplete(winningSegment)
            }
        }, 4000)
    }

    const segmentAngle = 360 / segments.length
    const radius = 150
    const centerX = 160
    const centerY = 160

    return (
        <div className="relative flex flex-col items-center w-full max-w-sm mx-auto">
            {/* Pointer Triangle at top */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-30">
                <div className="relative">
                    <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse absolute -top-6 left-1/2 -translate-x-1/2" />
                    <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[32px] border-t-red-500 drop-shadow-2xl"></div>
                </div>
            </div>

            {/* Wheel Container */}
            <div className="relative w-full aspect-square max-w-[320px]">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/50 to-orange-500/50 blur-2xl"></div>

                {/* SVG Wheel */}
                <motion.div
                    className="relative w-full h-full"
                    animate={{ rotate: rotation }}
                    transition={{ duration: 4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    <svg viewBox="0 0 320 320" className="w-full h-full drop-shadow-2xl">
                        {/* Outer circle border */}
                        <circle cx="160" cy="160" r="156" fill="white" stroke="#fbbf24" strokeWidth="8" />

                        {/* Segments */}
                        {segments.map((segment, index) => {
                            const startAngle = (index * segmentAngle - 90) * (Math.PI / 180)
                            const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180)

                            const x1 = centerX + radius * Math.cos(startAngle)
                            const y1 = centerY + radius * Math.sin(startAngle)
                            const x2 = centerX + radius * Math.cos(endAngle)
                            const y2 = centerY + radius * Math.sin(endAngle)

                            const largeArc = segmentAngle > 180 ? 1 : 0
                            const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`

                            // Calculate text position (middle of segment)
                            const midAngle = (startAngle + endAngle) / 2
                            const textRadius = radius * 0.65
                            const textX = centerX + textRadius * Math.cos(midAngle)
                            const textY = centerY + textRadius * Math.sin(midAngle)

                            return (
                                <g key={segment.id}>
                                    <path d={pathData} fill={segment.color} stroke="white" strokeWidth="2" />
                                    {/* Icon and text */}
                                    <text
                                        x={textX}
                                        y={textY - 12}
                                        textAnchor="middle"
                                        fontSize="28"
                                        transform={`rotate(${index * segmentAngle}, ${textX}, ${textY})`}
                                    >
                                        {segment.icon}
                                    </text>
                                    <text
                                        x={textX}
                                        y={textY + 12}
                                        textAnchor="middle"
                                        fontSize="11"
                                        fontWeight="bold"
                                        fill="white"
                                        transform={`rotate(${index * segmentAngle}, ${textX}, ${textY})`}
                                    >
                                        {segment.label.length > 12 ? segment.label.substring(0, 12) + '...' : segment.label}
                                    </text>
                                </g>
                            )
                        })}

                        {/* Center circle */}
                        <circle cx="160" cy="160" r="40" fill="white" stroke="#fbbf24" strokeWidth="4" />
                        <text x="160" y="170" textAnchor="middle" fontSize="32">🎰</text>
                    </svg>
                </motion.div>
            </div>

            {/* Spin Button */}
            <button
                onClick={spinWheel}
                disabled={isSpinning}
                className="mt-8 w-full max-w-xs px-8 py-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full font-black text-white text-xl shadow-2xl active:scale-95 transition-all uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
                style={{ minHeight: '64px' }}
            >
                <span className="relative z-10 flex items-center justify-center gap-3">
                    {isSpinning ? (
                        <>
                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>En cours...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-7 h-7" />
                            <span>TOURNER LA ROUE</span>
                        </>
                    )}
                </span>
            </button>
        </div>
    )
}
