"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"

export default function AdminLogin() {
    const [adminToken, setAdminToken] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminToken, password })
            })

            const data = await res.json()

            if (res.ok) {
                router.push("/admin")
                router.refresh()
            } else {
                setError(data.error || "Erreur de connexion")
            }
        } catch (err) {
            setError("Erreur réseau")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Connexion Admin</CardTitle>
                    <p className="text-sm text-gray-500">Accédez à votre tableau de bord</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="token">Token Restaurant (ID)</Label>
                            <Input
                                id="token"
                                placeholder="Votre token secret"
                                value={adminToken}
                                onChange={(e) => setAdminToken(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md font-medium text-center">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-black hover:bg-gray-800" disabled={loading}>
                            {loading ? "Connexion..." : "Se connecter"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
