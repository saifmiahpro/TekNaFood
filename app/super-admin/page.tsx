"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Building2,
    TrendingUp,
    Users,
    Trophy,
    Search,
    Settings,
    Sparkles,
    Filter,
    ExternalLink,
    Trash2,
    QrCode,
} from "lucide-react"

interface Restaurant {
    id: string
    name: string
    slug: string
    category: string
    primaryColor: string
    secondaryColor: string
    adminToken: string
    createdAt: string
    stats: {
        totalParticipations: number
        totalWins: number
        winRate: number
        recentParticipations: number
        activeRewards: number
    }
}

export default function SuperAdminPage() {
    const router = useRouter()
    const [restaurants, setRestaurants] = useState<Restaurant[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchRestaurants()
    }, [])

    const fetchRestaurants = async () => {
        try {
            const res = await fetch(`/api/super-admin`)
            if (res.status === 401) {
                window.location.href = "/auth/login"
                return
            }
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to fetch restaurants")
            }
            const data = await res.json()
            setRestaurants(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const filteredRestaurants = restaurants.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="text-red-600">Error</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    const totalStats = {
        totalRestaurants: restaurants.length,
        totalParticipations: restaurants.reduce((sum, r) => sum + r.stats.totalParticipations, 0),
        totalWins: restaurants.reduce((sum, r) => sum + r.stats.totalWins, 0),
        avgWinRate: restaurants.length > 0
            ? Math.round(restaurants.reduce((sum, r) => sum + r.stats.winRate, 0) / restaurants.length)
            : 0,
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-white hidden md:flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <Sparkles className="h-8 w-8 text-purple-400" />
                        <span className="text-xl font-bold tracking-tight">ReviewSpin</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Master Admin</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Button variant="ghost" className="w-full justify-start text-purple-400 bg-slate-800">
                        <TrendingUp className="mr-3 h-5 w-5" />
                        Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800">
                        <Building2 className="mr-3 h-5 w-5" />
                        Restaurants
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800">
                        <Users className="mr-3 h-5 w-5" />
                        Users
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800">
                        <Settings className="mr-3 h-5 w-5" />
                        Settings
                    </Button>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center font-bold">
                            SA
                        </div>
                        <div>
                            <p className="text-sm font-medium">Super Admin</p>
                            <p className="text-xs text-slate-500">master@reviewspin.com</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 md:ml-64">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                            <p className="text-gray-500 mt-1">Welcome back! Here's what's happening across all restaurants.</p>
                        </div>
                        <Button
                            onClick={() => router.push(`/super-admin/sales`)}
                            size="lg"
                            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 transition-all hover:scale-105"
                        >
                            <Sparkles className="mr-2 h-5 w-5" />
                            Nouveau Client (Sales Mode)
                        </Button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <Building2 className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">+2 this week</span>
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Total Restaurants</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{totalStats.totalRestaurants}</p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">+12%</span>
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Total Plays</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{totalStats.totalParticipations}</p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-yellow-100 rounded-lg">
                                        <Trophy className="h-6 w-6 text-yellow-600" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Avg {totalStats.avgWinRate}%</span>
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Total Wins</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{totalStats.totalWins}</p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-green-600" />
                                    </div>
                                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">Active</span>
                                </div>
                                <p className="text-sm text-gray-500 font-medium">System Status</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">Healthy</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Search & Filter */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search restaurants..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 border-gray-200"
                            />
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Filters
                        </Button>
                    </div>

                    {/* Restaurants List - Table View */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Active Restaurants</h3>
                            <Button variant="ghost" size="sm" className="text-purple-600">View All</Button>
                        </div>

                        {filteredRestaurants.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No restaurants found</h3>
                                <p className="text-gray-500 mt-1">Try adjusting your search or create a new one.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {filteredRestaurants.map((restaurant) => (
                                    <div key={restaurant.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div
                                                className="h-12 w-12 rounded-lg flex items-center justify-center text-xl shadow-sm"
                                                style={{ backgroundColor: restaurant.primaryColor + '20', color: restaurant.primaryColor }}
                                            >
                                                {restaurant.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{restaurant.name}</h4>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                    <Badge variant="secondary" className="text-xs font-normal">{restaurant.category}</Badge>
                                                    <span>•</span>
                                                    <span className="font-mono text-xs">/{restaurant.slug}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8 mr-8">
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Plays</p>
                                                <p className="font-bold text-gray-900">{restaurant.stats.totalParticipations}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Wins</p>
                                                <p className="font-bold text-gray-900">{restaurant.stats.totalWins}</p>
                                            </div>
                                            <div className="text-center hidden md:block">
                                                <p className="text-xs text-gray-500 uppercase tracking-wider">Rate</p>
                                                <p className="font-bold text-gray-900">{restaurant.stats.winRate}%</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 transition-opacity">
                                            {/* QR Code */}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="bg-white border-purple-200 hover:bg-purple-50 text-purple-700"
                                                onClick={() => {
                                                    const url = `${window.location.origin}/r/${restaurant.slug}`
                                                    window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`, '_blank')
                                                }}
                                            >
                                                <QrCode className="h-4 w-4 text-purple-700" />
                                            </Button>

                                            {/* Manage */}
                                            <a href={`/admin?token=${restaurant.adminToken}`} target="_blank" rel="noopener noreferrer">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-2 bg-white border-purple-200 hover:bg-purple-50 text-purple-700"
                                                >
                                                    <Settings className="h-4 w-4 text-purple-700" />
                                                    <span className="font-medium text-purple-700">Manage</span>
                                                </Button>
                                            </a>

                                            {/* View Public */}
                                            <a href={`/r/${restaurant.slug}`} target="_blank" rel="noopener noreferrer">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="bg-white border-purple-200 hover:bg-purple-50 text-purple-700"
                                                >
                                                    <ExternalLink className="h-4 w-4 text-purple-700" />
                                                </Button>
                                            </a>

                                            {/* Delete */}
                                            <button
                                                className="h-9 px-3 rounded-md bg-red-600 hover:bg-red-700 text-white border-0 transition-colors shadow-sm flex items-center justify-center"
                                                onClick={async () => {
                                                    if (confirm("Êtes-vous sûr de vouloir supprimer ce restaurant ? Cette action est irréversible.")) {
                                                        await fetch(`/api/super-admin/delete-restaurant?id=${restaurant.id}`, { method: "DELETE" })
                                                        fetchRestaurants() // Refresh list
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 text-white" style={{ color: 'white' }} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
