"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert } from "lucide-react"

export default function SuperAdminLogin() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/super/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            })

            const data = await res.json()

            if (res.ok) {
                router.push("/super")
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
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <Card className="w-full max-w-md shadow-2xl border-slate-800 bg-slate-900 text-white">
                <CardHeader className="space-y-1 text-center">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-900/50">
                        <ShieldAlert className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight">Super Admin</CardTitle>
                    <p className="text-sm text-slate-400">Accès restreint au personnel autorisé</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-slate-300">Identifiant</Label>
                            <Input
                                id="username"
                                placeholder="admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-red-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">Mot de passe</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-red-500"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-950/50 border border-red-900/50 text-red-400 text-sm rounded-md font-medium text-center">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-900/20" disabled={loading}>
                            {loading ? "Connexion..." : "Accéder au Dashboard"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
