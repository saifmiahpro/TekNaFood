"use client"

import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Share2, Upload, RefreshCw } from "lucide-react"

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
    logoUrl: initialLogoUrl,
}: QRCodeGeneratorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [qrDataUrl, setQrDataUrl] = useState<string>("")

    // Customization State
    const [customPrimaryColor, setCustomPrimaryColor] = useState(primaryColor)
    const [customSecondaryColor, setCustomSecondaryColor] = useState(secondaryColor)
    const [customLogo, setCustomLogo] = useState<string | null>(initialLogoUrl || null)
    const [logoFile, setLogoFile] = useState<File | null>(null)

    useEffect(() => {
        generateQRCode()
    }, [url, customPrimaryColor, customSecondaryColor, customLogo])

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setLogoFile(file)
            const reader = new FileReader()
            reader.onload = (event) => {
                setCustomLogo(event.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

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

        // Top Decoration (Arc)
        ctx.fillStyle = customPrimaryColor
        ctx.beginPath()
        ctx.ellipse(w / 2, 0, w * 0.8, 150, 0, 0, Math.PI * 2)
        ctx.fill()

        // Main Title - HUGE & CATCHY
        ctx.fillStyle = "#111827" // Gray-900
        ctx.font = "900 110px Inter, system-ui, sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("CADEAU OFFERT ? 🎁", w / 2, 250)

        // Subtitle - Action oriented
        ctx.fillStyle = customPrimaryColor
        ctx.font = "bold 60px Inter, system-ui, sans-serif"
        ctx.fillText("TOURNEZ LA ROUE !", w / 2, 380)

        // Tagline
        ctx.fillStyle = "#4b5563" // Gray-600
        ctx.font = "50px Inter, system-ui, sans-serif"
        ctx.fillText("Gagnez une récompense immédiatement", w / 2, 480)

        // QR Code Container
        const qrSize = 700
        const qrX = (w - qrSize) / 2
        const qrY = 600

        // Decorative circle behind QR
        ctx.fillStyle = customSecondaryColor + "20" // Very light secondary
        ctx.beginPath()
        ctx.arc(w / 2, qrY + qrSize / 2, qrSize * 0.65, 0, Math.PI * 2)
        ctx.fill()

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
                errorCorrectionLevel: "H", // High error correction for logo
            })

            // Draw QR code
            ctx.drawImage(qrCanvas, qrX, qrY)

            // Draw Logo in Center if exists
            if (customLogo) {
                const logoImg = new Image()
                logoImg.src = customLogo
                await new Promise((resolve) => {
                    logoImg.onload = resolve
                    logoImg.onerror = resolve // Skip if error
                })

                const logoSize = qrSize * 0.25 // 25% of QR size
                const logoX = qrX + (qrSize - logoSize) / 2
                const logoY = qrY + (qrSize - logoSize) / 2

                // White background for logo
                ctx.fillStyle = "#ffffff"
                ctx.beginPath()
                ctx.roundRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10, 10)
                ctx.fill()

                // Draw Logo
                ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
            }

            // CTA Arrow
            ctx.fillStyle = "#000000"
            ctx.font = "100px Inter, system-ui, sans-serif"
            ctx.fillText("👇", w / 2, 560)

            // Bottom CTA Button
            const btnY = 1350
            const btnW = 800
            const btnH = 140

            // Button Shadow
            ctx.fillStyle = "rgba(0,0,0,0.2)"
            ctx.beginPath()
            ctx.roundRect((w - btnW) / 2 + 10, btnY + 10, btnW, btnH, 70)
            ctx.fill()

            // Button Body
            ctx.fillStyle = "#000000"
            ctx.beginPath()
            ctx.roundRect((w - btnW) / 2, btnY, btnW, btnH, 70)
            ctx.fill()

            // Button Text
            ctx.fillStyle = "#ffffff"
            ctx.font = "bold 60px Inter, system-ui, sans-serif"
            ctx.fillText("SCANNEZ POUR JOUER", w / 2, btnY + btnH / 2)

            // Footer
            ctx.fillStyle = "#9ca3af" // Gray-400
            ctx.font = "30px Inter, system-ui, sans-serif"
            ctx.fillText("Jeu gratuit sans obligation d'achat*", w / 2, 1550)

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
        <div className="space-y-8">
            {/* Customization Controls */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-6">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Personnaliser le Design
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <Label className="mb-2 block text-xs uppercase text-gray-500 font-bold">Couleur Principale</Label>
                        <div className="flex items-center gap-3">
                            <Input
                                type="color"
                                value={customPrimaryColor}
                                onChange={(e) => setCustomPrimaryColor(e.target.value)}
                                className="h-10 w-14 p-1 cursor-pointer"
                            />
                            <span className="text-sm font-mono text-gray-500">{customPrimaryColor}</span>
                        </div>
                    </div>

                    <div>
                        <Label className="mb-2 block text-xs uppercase text-gray-500 font-bold">Couleur Secondaire</Label>
                        <div className="flex items-center gap-3">
                            <Input
                                type="color"
                                value={customSecondaryColor}
                                onChange={(e) => setCustomSecondaryColor(e.target.value)}
                                className="h-10 w-14 p-1 cursor-pointer"
                            />
                            <span className="text-sm font-mono text-gray-500">{customSecondaryColor}</span>
                        </div>
                    </div>

                    <div>
                        <Label className="mb-2 block text-xs uppercase text-gray-500 font-bold">Logo (Centre du QR)</Label>
                        <div className="flex items-center gap-3">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="text-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview */}
            <div className="flex justify-center bg-gray-100 p-8 rounded-2xl border border-gray-200">
                <canvas
                    ref={canvasRef}
                    className="rounded-lg shadow-xl max-w-full h-auto bg-white"
                    style={{ maxWidth: "400px" }}
                />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center flex-wrap">
                <Button
                    onClick={downloadQRCode}
                    size="lg"
                    className="gap-2 shadow-lg hover:scale-105 transition-transform"
                    style={{
                        background: `linear-gradient(135deg, ${customPrimaryColor} 0%, ${customSecondaryColor} 100%)`,
                    }}
                >
                    <Download className="h-5 w-5" />
                    Télécharger le Poster
                </Button>

                <Button
                    onClick={shareQRCode}
                    size="lg"
                    variant="outline"
                    className="gap-2 hover:bg-gray-50"
                >
                    <Share2 className="h-5 w-5" />
                    Partager
                </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <p className="font-semibold text-blue-900 mb-2">💡 Astuce :</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li>Imprimez ce poster en haute qualité (A4 ou A3)</li>
                    <li>Placez-le à l'entrée ou sur les tables</li>
                    <li>Le QR code est généré avec une correction d'erreur élevée pour rester lisible même avec un logo</li>
                </ul>
            </div>
        </div>
    )
}
