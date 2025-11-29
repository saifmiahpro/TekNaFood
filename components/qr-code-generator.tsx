"use client"

import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { Download, Share2 } from "lucide-react"

interface QRCodeGeneratorProps {
    url: string
    restaurantName: string
    primaryColor?: string
    secondaryColor?: string
    logoUrl?: string
}

export function QRCodeGenerator({
    url,
    restaurantName,
    primaryColor = "#16a34a",
    secondaryColor = "#facc15",
    logoUrl,
}: QRCodeGeneratorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [qrDataUrl, setQrDataUrl] = useState<string>("")

    useEffect(() => {
        generateQRCode()
    }, [url, primaryColor, secondaryColor])

    const generateQRCode = async () => {
        if (!canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set canvas size
        canvas.width = 800
        canvas.height = 1000

        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        gradient.addColorStop(0, primaryColor + "20")
        gradient.addColorStop(1, secondaryColor + "30")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Add decorative border
        ctx.strokeStyle = primaryColor
        ctx.lineWidth = 8
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)

        // Add inner white card
        ctx.fillStyle = "#ffffff"
        ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
        ctx.shadowBlur = 20
        ctx.shadowOffsetY = 10
        ctx.fillRect(60, 80, canvas.width - 120, canvas.height - 160)
        ctx.shadowBlur = 0

        // Add restaurant name at top
        ctx.fillStyle = primaryColor
        ctx.font = "bold 48px Inter, system-ui, sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(restaurantName, canvas.width / 2, 180)

        // Add tagline
        ctx.fillStyle = "#6b7280"
        ctx.font = "24px Inter, system-ui, sans-serif"
        ctx.fillText("Leave a review & Win prizes! 🎁", canvas.width / 2, 230)

        // Generate QR code
        try {
            const qrCanvas = document.createElement("canvas")
            await QRCode.toCanvas(qrCanvas, url, {
                width: 450,
                margin: 2,
                color: {
                    dark: primaryColor,
                    light: "#ffffff",
                },
                errorCorrectionLevel: "H",
            })

            // Draw QR code on main canvas
            ctx.drawImage(qrCanvas, (canvas.width - 450) / 2, 280)

            // Add instructions at bottom
            ctx.fillStyle = "#374151"
            ctx.font = "bold 32px Inter, system-ui, sans-serif"
            ctx.fillText("Scan to Play!", canvas.width / 2, 800)

            // Add small footer
            ctx.fillStyle = "#9ca3af"
            ctx.font = "20px Inter, system-ui, sans-serif"
            ctx.fillText("Powered by ReviewSpin", canvas.width / 2, 900)

            // Get data URL for download
            const dataUrl = canvas.toDataURL("image/png")
            setQrDataUrl(dataUrl)
        } catch (error) {
            console.error("Error generating QR code:", error)
        }
    }

    const downloadQRCode = () => {
        const link = document.createElement("a")
        link.download = `${restaurantName.replace(/\s+/g, "_")}_QR_Code.png`
        link.href = qrDataUrl
        link.click()
    }

    const shareQRCode = async () => {
        if (navigator.share) {
            try {
                // Convert data URL to blob
                const response = await fetch(qrDataUrl)
                const blob = await response.blob()
                const file = new File([blob], `${restaurantName}_QR_Code.png`, {
                    type: "image/png",
                })

                await navigator.share({
                    title: `${restaurantName} - Review & Win`,
                    text: "Scan this QR code to leave a review and win prizes!",
                    files: [file],
                })
            } catch (error) {
                console.error("Error sharing:", error)
                downloadQRCode()
            }
        } else {
            downloadQRCode()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-center">
                <canvas
                    ref={canvasRef}
                    className="rounded-2xl shadow-2xl max-w-full h-auto"
                    style={{ maxWidth: "400px" }}
                />
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
                <Button
                    onClick={downloadQRCode}
                    size="lg"
                    className="gap-2 shadow-lg"
                    style={{
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    }}
                >
                    <Download className="h-5 w-5" />
                    Download QR Code
                </Button>

                <Button
                    onClick={shareQRCode}
                    size="lg"
                    variant="outline"
                    className="gap-2"
                    style={{
                        borderColor: primaryColor,
                        color: primaryColor,
                    }}
                >
                    <Share2 className="h-5 w-5" />
                    Share
                </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <p className="font-semibold text-blue-900 mb-2">💡 How to use this QR code:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li>Print it and place it on tables, counters, or receipts</li>
                    <li>Display it on digital screens or tablets</li>
                    <li>Share it on social media or in emails</li>
                    <li>Add it to your menu or business cards</li>
                </ul>
            </div>
        </div>
    )
}
