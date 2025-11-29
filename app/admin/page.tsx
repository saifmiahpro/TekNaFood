"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Trophy,
    Users,
    Gift,
    CheckCircle,
    Clock,
    ExternalLink,
    TrendingUp,
    Calendar,
    QrCode,
    Download
} from "lucide-react"

interface Restaurant {
    id: string
    name: string
    slug: string
    category: string
    googleMapsUrl: string
    primaryColor: string
    secondaryColor: string
    rewards: Array<{
        id: string
        label: string
        probability: number
        isWin: boolean
        isActive: boolean
        colorHex?: string
        icon?: string
    }>
    participations: Array<{
        id: string
        customerName: string
        customerEmail: string
        googleName?: string
        createdAt: string
        status: string
        reward: {
            label: string
            isWin: boolean
        }
    }>
}

export default function AdminPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token")

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (token) {
            fetchAdminData()
        } else {
            setError("Missing admin token")
            setLoading(false)
        }
    }, [token])

    const fetchAdminData = async () => {
        try {
            const res = await fetch(`/api/admin?token=${token}`)
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to fetch data")
            }
            const data = await res.json()
            setRestaurant(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const updateParticipationStatus = async (participationId: string, status: string) => {
        try {
            const res = await fetch(`/api/admin/participation/${participationId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, token }),
            })

            if (!res.ok) throw new Error("Failed to update")

            // Refresh data
            fetchAdminData()
        } catch (err) {
            alert("Failed to update participation")
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading admin panel...</p>
                </div>
            </div>
        )
    }

    if (error || !restaurant) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="text-red-600">Access Denied</CardTitle>
                        <CardDescription>{error || "Invalid admin token"}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    const stats = {
        totalParticipations: restaurant.participations.length,
        totalWins: restaurant.participations.filter((p) => p.reward.isWin).length,
        pending: restaurant.participations.filter((p) => p.status === "PENDING").length,
        redeemed: restaurant.participations.filter((p) => p.status === "REDEEMED").length,
    }

    // Calculate unique customers for the CRM view
    const uniqueCustomers = Array.from(new Set(restaurant.participations.map(p => p.customerEmail)))
        .map(email => {
            const customerParticipations = restaurant.participations.filter(p => p.customerEmail === email)
            const lastParticipation = customerParticipations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
            return {
                email,
                name: lastParticipation.customerName,
                totalPlays: customerParticipations.length,
                lastVisit: lastParticipation.createdAt,
                totalWins: customerParticipations.filter(p => p.reward.isWin).length
            }
        })

    const handleExportCSV = () => {
        const headers = ["Name", "Email", "Total Plays", "Total Wins", "Last Visit"]
        const rows = uniqueCustomers.map(c => [
            c.name,
            c.email,
            c.totalPlays,
            c.totalWins,
            new Date(c.lastVisit).toLocaleDateString()
        ])

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n")

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `${restaurant.slug}_customers.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg"
                                style={{ backgroundColor: restaurant.primaryColor }}
                            >
                                {restaurant.name.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{restaurant.name}</h1>
                                <p className="text-xs text-gray-500">Admin Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" onClick={() => window.open(`/r/${restaurant.slug}`, '_blank')}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Game
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => {
                                // In a real app we would clear a cookie, but here we just redirect
                                router.push("/")
                            }}>
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-white p-1 border border-gray-200 rounded-xl shadow-sm w-full md:w-auto grid grid-cols-4 md:flex">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-gray-100">Overview</TabsTrigger>
                        <TabsTrigger value="customers" className="data-[state=active]:bg-gray-100">
                            Customers <Badge variant="secondary" className="ml-2 hidden md:inline-flex">{uniqueCustomers.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="rewards" className="data-[state=active]:bg-gray-100">Rewards</TabsTrigger>
                        <TabsTrigger value="settings" className="data-[state=active]:bg-gray-100">Settings</TabsTrigger>
                    </TabsList>

                    {/* OVERVIEW TAB */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Total Plays</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{stats.totalParticipations}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Winners</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-600">{stats.totalWins}</div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {stats.totalParticipations > 0 ? Math.round((stats.totalWins / stats.totalParticipations) * 100) : 0}% win rate
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Pending Prizes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-orange-600">
                                        {stats.pending}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Customers Collected</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-blue-600">{uniqueCustomers.length}</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {restaurant.participations.length === 0 ? (
                                        <p className="text-center text-gray-500 py-4">No activity yet.</p>
                                    ) : (
                                        restaurant.participations.slice(0, 10).map((p) => (
                                            <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${p.reward.isWin ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                                                        {p.reward.isWin ? <Trophy className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{p.customerName}</p>
                                                        <p className="text-sm text-gray-500">{p.reward.label}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-2">
                                                    <p className="text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={p.status === "REDEEMED" ? "secondary" : p.reward.isWin ? "default" : "outline"}>
                                                            {p.status}
                                                        </Badge>
                                                        {p.status === "PENDING" && p.reward.isWin && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-6 text-xs"
                                                                onClick={() => updateParticipationStatus(p.id, "VERIFIED")}
                                                            >
                                                                Verify
                                                            </Button>
                                                        )}
                                                        {p.status === "VERIFIED" && p.reward.isWin && (
                                                            <Button
                                                                size="sm"
                                                                className="h-6 text-xs bg-green-600 hover:bg-green-700"
                                                                onClick={() => updateParticipationStatus(p.id, "REDEEMED")}
                                                            >
                                                                Redeem
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* CUSTOMERS TAB (CRM) */}
                    <TabsContent value="customers">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Customer Database</CardTitle>
                                    <CardDescription>All customers who have played the game.</CardDescription>
                                </div>
                                <Button onClick={handleExportCSV} variant="outline" className="gap-2">
                                    <Download className="h-4 w-4" />
                                    Export CSV
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Total Plays</TableHead>
                                            <TableHead>Wins</TableHead>
                                            <TableHead>Last Visit</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {uniqueCustomers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                                    No customers yet.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            uniqueCustomers.map((customer) => (
                                                <TableRow key={customer.email}>
                                                    <TableCell className="font-medium">{customer.name}</TableCell>
                                                    <TableCell>{customer.email}</TableCell>
                                                    <TableCell>{customer.totalPlays}</TableCell>
                                                    <TableCell>{customer.totalWins}</TableCell>
                                                    <TableCell>{new Date(customer.lastVisit).toLocaleDateString()}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* REWARDS TAB (EDITABLE) */}
                    <TabsContent value="rewards">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gestion des Récompenses</CardTitle>
                                <CardDescription>Modifiez les cadeaux et leurs probabilités.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {restaurant.rewards.map((reward, index) => (
                                        <div key={reward.id} className="flex items-center gap-4 p-4 border rounded-lg bg-white shadow-sm">
                                            {/* Color Indicator */}
                                            <div
                                                className="h-10 w-10 rounded-full flex-shrink-0 border-2 border-gray-100 shadow-inner"
                                                style={{ backgroundColor: reward.colorHex || '#ccc' }}
                                            />

                                            {/* Label Input */}
                                            <div className="flex-1">
                                                <Label className="text-xs text-gray-500">Nom du Cadeau</Label>
                                                <Input
                                                    value={reward.label}
                                                    onChange={(e) => {
                                                        const newRewards = [...restaurant.rewards]
                                                        newRewards[index].label = e.target.value
                                                        setRestaurant({ ...restaurant, rewards: newRewards })
                                                    }}
                                                    className="font-bold"
                                                />
                                            </div>

                                            {/* Probability Input */}
                                            <div className="w-24">
                                                <Label className="text-xs text-gray-500">Chance (%)</Label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        value={(reward.probability * 100).toFixed(0)}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value) || 0
                                                            const newRewards = [...restaurant.rewards]
                                                            newRewards[index].probability = val / 100
                                                            setRestaurant({ ...restaurant, rewards: newRewards })
                                                        }}
                                                    />
                                                    <span className="absolute right-2 top-2 text-gray-400 text-xs">%</span>
                                                </div>
                                            </div>

                                            {/* Status Toggle */}
                                            <div className="flex flex-col items-center gap-1">
                                                <Label className="text-xs text-gray-500">Gagnant ?</Label>
                                                <Button
                                                    size="sm"
                                                    variant={reward.isWin ? "default" : "secondary"}
                                                    onClick={() => {
                                                        const newRewards = [...restaurant.rewards]
                                                        newRewards[index].isWin = !newRewards[index].isWin
                                                        setRestaurant({ ...restaurant, rewards: newRewards })
                                                    }}
                                                    className={reward.isWin ? "bg-green-600 hover:bg-green-700" : "bg-gray-200 text-gray-500 hover:bg-gray-300"}
                                                >
                                                    {reward.isWin ? "OUI" : "NON"}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pt-4 flex justify-end">
                                        <Button
                                            onClick={async () => {
                                                // Save logic
                                                try {
                                                    const res = await fetch(`/api/admin/update-rewards`, {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({
                                                            token,
                                                            rewards: restaurant.rewards
                                                        })
                                                    })
                                                    if (res.ok) alert("Récompenses mises à jour !")
                                                    else alert("Erreur lors de la sauvegarde")
                                                } catch (e) { alert("Erreur réseau") }
                                            }}
                                            className="bg-black text-white hover:bg-gray-800"
                                        >
                                            Enregistrer les modifications
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* SETTINGS TAB */}
                    <TabsContent value="settings">
                        <Card>
                            <CardHeader>
                                <CardTitle>QR Code & Links</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col items-center p-6 bg-white border border-gray-200 rounded-xl">
                                    <QRCodeGenerator
                                        url={`${typeof window !== 'undefined' ? window.location.origin : ''}/r/${restaurant.slug}`}
                                        restaurantName={restaurant.name}
                                        primaryColor={restaurant.primaryColor}
                                        secondaryColor={restaurant.secondaryColor}
                                    />
                                    <p className="mt-4 text-sm text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded">
                                        {`${typeof window !== 'undefined' ? window.location.origin : ''}/r/${restaurant.slug}`}
                                    </p>
                                    <Button className="mt-4" variant="outline" onClick={() => window.print()}>
                                        Print QR Code
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
