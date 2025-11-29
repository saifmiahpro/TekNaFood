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

        // Set canvas size (Poster format A4 ratio-ish)
        canvas.width = 1200
        canvas.height = 1600
        const w = canvas.width
        const h = canvas.height

        // Background - Clean White
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, w, h)

        // Header Banner
        ctx.fillStyle = primaryColor
        ctx.fillRect(0, 0, w, 200)

        // Restaurant Name (in Header)
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 80px Inter, system-ui, sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(restaurantName.toUpperCase(), w / 2, 100)

        // Main Title
        ctx.fillStyle = "#111827" // Gray-900
        ctx.font = "900 100px Inter, system-ui, sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "top"
        ctx.fillText("GAGNEZ DES CADEAUX !", w / 2, 280)

        // Subtitle
        ctx.fillStyle = primaryColor
        ctx.font = "bold 50px Inter, system-ui, sans-serif"
        ctx.fillText("Donnez votre avis & Tournez la roue 🎁", w / 2, 400)

        // QR Code Container (Shadow)
        const qrSize = 600
        const qrX = (w - qrSize) / 2
        const qrY = 500

        ctx.shadowColor = "rgba(0, 0, 0, 0.15)"
        ctx.shadowBlur = 40
        ctx.shadowOffsetY = 20
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(qrX - 40, qrY - 40, qrSize + 80, qrSize + 80)
        ctx.shadowBlur = 0
        ctx.shadowOffsetY = 0

        // Generate QR code
        try {
            const qrCanvas = document.createElement("canvas")
            await QRCode.toCanvas(qrCanvas, url, {
                width: qrSize,
                margin: 1,
                color: {
                    dark: "#000000",
                    light: "#ffffff",
                },
                errorCorrectionLevel: "H",
            })

            // Draw QR code
            ctx.drawImage(qrCanvas, qrX, qrY)

            // Steps / Instructions
            const stepY = 1250
            ctx.fillStyle = "#374151" // Gray-700
            ctx.font = "bold 40px Inter, system-ui, sans-serif"

            // Step 1
            ctx.fillText("1. Scannez", w * 0.25, stepY)
            // Step 2
            ctx.fillText("2. Jouez", w * 0.5, stepY)
            // Step 3
            ctx.fillText("3. Gagnez", w * 0.75, stepY)

            // Icons (Simple Emoji fallback for canvas)
            ctx.font = "80px Inter, system-ui, sans-serif"
            ctx.fillText("📱", w * 0.25, stepY - 80)
            ctx.fillText("⭐️", w * 0.5, stepY - 80)
            ctx.fillText("🎁", w * 0.75, stepY - 80)

            // CTA Button (Visual only)
            const btnY = 1400
            const btnW = 600
            const btnH = 100

            ctx.fillStyle = "#000000"
            ctx.beginPath()
            ctx.roundRect((w - btnW) / 2, btnY, btnW, btnH, 50)
            ctx.fill()

            ctx.fillStyle = "#ffffff"
            ctx.font = "bold 40px Inter, system-ui, sans-serif"
            ctx.textBaseline = "middle"
            ctx.fillText("SCANNEZ POUR JOUER", w / 2, btnY + btnH / 2)

            // Footer
            ctx.fillStyle = "#9ca3af" // Gray-400
            ctx.font = "30px Inter, system-ui, sans-serif"
            ctx.fillText("Powered by ReviewSpin", w / 2, 1550)

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
