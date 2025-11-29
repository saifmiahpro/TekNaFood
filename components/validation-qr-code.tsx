"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"

interface ValidationQRCodeProps {
    url: string
    color?: string
}

export function ValidationQRCode({ url, color = "#000000" }: ValidationQRCodeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (canvasRef.current) {
            QRCode.toCanvas(canvasRef.current, url, {
                width: 200,
                margin: 1,
                color: {
                    dark: color,
                    light: "#ffffff",
                },
            }, (error) => {
                if (error) console.error(error)
            })
        }
    }, [url, color])

    return (
        <div className="bg-white p-4 rounded-xl shadow-inner inline-block">
            <canvas ref={canvasRef} className="rounded-lg" />
        </div>
    )
}
