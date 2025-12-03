"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"
import { Label } from "@/components/ui/label" // Added Label import

export default function LoginPage() {
    const router = useRouter()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            })

            if (res.ok) {
                router.push("/super-admin") // Redirect to Dashboard directly
                router.refresh()
            } else {
                const data = await res.json()
                setError(data.error || "Login failed")
            }
        } catch (err) {
            setError("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
            <Card className="w-full max-w-md border-gray-800 bg-gray-900/50 backdrop-blur-xl">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 bg-purple-600 rounded-xl flex items-center justify-center">
                            <Lock className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center text-white">Admin Access</CardTitle>
                    <CardDescription className="text-center text-gray-400">
                        Enter your credentials to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-gray-200">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="saif"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                                required
                                autocomplete="username"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                                    required
                                    autocomplete="current-password"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
                            disabled={loading}
                        >
                            {loading ? "Vérification..." : "Se connecter"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
