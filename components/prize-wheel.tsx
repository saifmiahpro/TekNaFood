"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useAnimation } from "framer-motion"

export interface WheelSegment {
    id: string
    label: string
    color: string
    icon?: string
    probability?: number // Ajouté pour afficher le pourcentage
}

interface PrizeWheelProps {
    segments: WheelSegment[]
    onSpinComplete?: (winningSegment: WheelSegment) => void
    onStartSpin?: () => Promise<string | null> // Returns the winning segment ID
    primaryColor?: string
    secondaryColor?: string
}

export function PrizeWheel({
    segments,
    onSpinComplete,
    onStartSpin,
    primaryColor = "#16a34a",
    secondaryColor = "#facc15",
}: PrizeWheelProps) {
    const [rotation, setRotation] = useState(0)
    const [isSpinning, setIsSpinning] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const controls = useAnimation()

    // Logic to ensure wheel looks full: repeat segments if fewer than 8
    const displaySegments = [...segments]
    while (displaySegments.length < 8) {
        displaySegments.push(...segments)
    }
    // Trim to even number if needed for better alternating colors (optional, but good for 8/12)
    // For now we just use the multiplied list.

    useEffect(() => {
        drawWheel()
    }, [displaySegments, primaryColor])

    const drawWheel = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const radius = Math.min(centerX, centerY) - 20 // Leave room for border

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const totalSegments = displaySegments.length
        const segmentAngle = (2 * Math.PI) / totalSegments

        displaySegments.forEach((segment, index) => {
            const startAngle = index * segmentAngle - Math.PI / 2
            const endAngle = startAngle + segmentAngle

            // Slice
            ctx.beginPath()
            ctx.moveTo(centerX, centerY)
            ctx.arc(centerX, centerY, radius, startAngle, endAngle)
            ctx.closePath()
            ctx.fillStyle = segment.color
            ctx.fill()

            // Border between slices
            ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
            ctx.lineWidth = 2
            ctx.stroke()

            // Text & Icon
            ctx.save()
            ctx.translate(centerX, centerY)
            ctx.rotate(startAngle + segmentAngle / 2)
            ctx.textAlign = "right"
            ctx.fillStyle = "#ffffff"
            ctx.font = "bold 14px Inter, sans-serif"
            ctx.shadowColor = "rgba(0,0,0,0.5)"
            ctx.shadowBlur = 4

            // Icon
            if (segment.icon) {
                ctx.font = "24px Arial"
                ctx.fillText(segment.icon, radius - 20, 8)
            }

            // Label (truncated if too long)
            ctx.font = "bold 12px Inter, sans-serif"
            const label = segment.label.length > 15 ? segment.label.substring(0, 12) + "..." : segment.label
            // If icon exists, push text back, otherwise closer to edge
            ctx.fillText(label, radius - (segment.icon ? 55 : 20), 5)

            // Afficher le pourcentage si disponible
            if (segment.probability !== undefined) {
                ctx.font = "bold 10px Inter, sans-serif"
                ctx.fillStyle = "#ffffff"
                ctx.shadowColor = "rgba(0,0,0,0.7)"
                ctx.shadowBlur = 3
                const percentage = `${Math.round(segment.probability * 100)}%`
                ctx.fillText(percentage, radius - (segment.icon ? 55 : 20), 18)
            }

            ctx.restore()
        })

        // Center Hub
        ctx.beginPath()
        ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI)
        ctx.fillStyle = "#ffffff"
        ctx.fill()

        ctx.beginPath()
        ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI)
        ctx.fillStyle = primaryColor
        ctx.fill()

        // Star in center
        ctx.fillStyle = "#ffffff"
        ctx.font = "20px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("★", centerX, centerY + 2)
    }

    const spinWheel = async () => {
        if (isSpinning) return

        setIsSpinning(true)

        // Get winning segment ID from server (if callback provided)
        let winningSegmentId: string | null = null
        if (onStartSpin) {
            winningSegmentId = await onStartSpin()
            console.log('Server determined winner ID:', winningSegmentId)
            if (!winningSegmentId) {
                setIsSpinning(false)
                return // API call failed
            }
        }

        // Find the winning segment
        let winningIndex: number
        let winningSegment: WheelSegment

        if (winningSegmentId) {
            // Find the segment in displaySegments that matches the ID
            winningIndex = displaySegments.findIndex(seg => seg.id === winningSegmentId)
            console.log('Found winner at index:', winningIndex, 'in', displaySegments.length, 'segments')
            console.log('Display segments:', displaySegments.map(s => ({ id: s.id, label: s.label })))
            if (winningIndex === -1) {
                console.error('Winner ID not found in display segments! Using fallback index 0')
                winningIndex = 0 // Fallback
            }
            winningSegment = displaySegments[winningIndex]
            console.log('Will spin to segment:', winningSegment.label)
        } else {
            // Random fallback (if no onStartSpin)
            winningIndex = Math.floor(Math.random() * displaySegments.length)
            winningSegment = displaySegments[winningIndex]
        }

        // Calculate rotation
        const segmentAngle = 360 / displaySegments.length
        const spins = 5 + Math.random() * 3 // 5 to 8 spins

        const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.8) // Add some randomness within the segment
        const targetRotation = 360 * spins + (360 - (winningIndex * segmentAngle)) + randomOffset

        console.log('Segment angle:', segmentAngle)
        console.log('Target rotation:', targetRotation)

        setRotation(targetRotation)

        // Wait for animation
        setTimeout(() => {
            setIsSpinning(false)
            if (onSpinComplete) {
                onSpinComplete(winningSegment)
            }
        }, 5000)
    }

    return (
        <div className="relative flex flex-col items-center justify-center">
            {/* Casino Lights Ring */}
            <div className="absolute inset-0 rounded-full border-[12px] border-gray-800 shadow-2xl z-0 scale-105">
                {/* Lights */}
                {Array.from({ length: 24 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-3 h-3 rounded-full"
                        style={{
                            backgroundColor: i % 2 === 0 ? "#FFD700" : "#FFF",
                            top: "50%",
                            left: "50%",
                            transform: `rotate(${i * 15}deg) translate(195px) rotate(-${i * 15}deg)`, // Adjust 195px based on size
                            boxShadow: "0 0 10px currentColor",
                            animation: isSpinning ? "blink 0.5s infinite alternate" : "none",
                            animationDelay: `${i * 0.1}s`
                        }}
                    />
                ))}
            </div>

            {/* Ticker / Flapper at top */}
            <div className="absolute -top-6 z-20 drop-shadow-lg">
                <motion.div
                    animate={isSpinning ? { rotate: [0, -20, 0, -10, 0] } : { rotate: 0 }}
                    transition={{ repeat: isSpinning ? Infinity : 0, duration: 0.1 }}
                    className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[40px] border-l-transparent border-r-transparent"
                    style={{ borderTopColor: "#ef4444" }}
                />
            </div>

            {/* The Wheel */}
            <motion.div
                className="relative z-10"
                style={{ rotate: rotation }}
                transition={{ duration: 5, ease: [0.2, 0.8, 0.2, 1] }}
            >
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={400}
                    className="rounded-full w-[280px] h-[280px] md:w-[350px] md:h-[350px] lg:w-[400px] lg:h-[400px]"
                />
            </motion.div>

            {/* Spin Button - Mobile optimized */}
            <button
                onClick={spinWheel}
                disabled={isSpinning}
                className="mt-8 md:mt-12 group relative px-6 md:px-8 py-4 md:py-5 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full font-black text-white text-lg md:text-xl shadow-[0_4px_0_rgb(180,83,9)] active:shadow-none active:translate-y-1 transition-all uppercase tracking-wider z-20 min-h-[56px]"
            >
                {isSpinning ? "Bonne chance !" : "LANCER LA ROUE !"}

                {/* Shine effect */}
                <div className="absolute inset-0 rounded-full bg-white/30 group-hover:opacity-100 opacity-0 transition-opacity" />
            </button>

            <style jsx>{`
                @keyframes blink {
                    from { opacity: 0.5; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1.2); }
                }
            `}</style>
        </div>
    )
}
