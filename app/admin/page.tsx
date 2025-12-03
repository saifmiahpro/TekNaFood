"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
    Trophy,
    Users,
    Gift,
    CheckCircle,
    ExternalLink,
    Download,
    LogOut,
    Menu,
    X,
    Settings,
    Activity,
    QrCode,
    LayoutDashboard,
    RefreshCw,
    Save
} from "lucide-react"

interface Restaurant {
    id: string
    name: string
    slug: string
    category: string
    primaryColor: string
    secondaryColor: string
    logoUrl: string | null
    tripadvisorUrl?: string | null
    instagramHandle?: string | null
    tiktokHandle?: string | null
    facebookUrl?: string | null
    maxPlaysPerDay: number
    replayDelayHours: number
    platformStats?: Array<{
        platformAction: string
        _count: {
            platformAction: number
        }
    }>
    rewards: Array<{
        id: string
        label: string
        probability: number
        isWin: boolean
        isActive: boolean
        colorHex?: string
    }>
    participations: Array<{
        id: string
        customerName: string
        customerEmail: string
        createdAt: string
        status: string
        reward: {
            label: string
            isWin: boolean
        }
    }>
}

function AdminContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token")

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("overview")
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (token) {
            fetchAdminData()
        } else {
            setError("Token manquant")
            setLoading(false)
        }
    }, [token])

    const fetchAdminData = async () => {
        try {
            const res = await fetch(`/api/admin?token=${token}`)
            if (!res.ok) throw new Error("Erreur de chargement")
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
            if (!res.ok) throw new Error("Erreur mise à jour")
            fetchAdminData()
        } catch (err) {
            alert("Erreur lors de la mise à jour")
        }
    }

    const handleUpdateRestaurant = async () => {
        if (!restaurant) return
        setSaving(true)
        try {
            const res = await fetch(`/api/admin`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    primaryColor: restaurant.primaryColor,
                    secondaryColor: restaurant.secondaryColor,
                    logoUrl: restaurant.logoUrl,
                    tripadvisorUrl: restaurant.tripadvisorUrl,
                    instagramHandle: restaurant.instagramHandle,
                    tiktokHandle: restaurant.tiktokHandle,
                    facebookUrl: restaurant.facebookUrl
                }),
            })
            if (!res.ok) throw new Error("Erreur sauvegarde")
            alert("Modifications enregistrées !")
        } catch (err) {
            alert("Erreur lors de la sauvegarde")
        } finally {
            setSaving(false)
        }
    }

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const reader = new FileReader()
            reader.onload = (event) => {
                if (restaurant) {
                    setRestaurant({ ...restaurant, logoUrl: event.target?.result as string })
                }
            }
            reader.readAsDataURL(file)
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>
    if (error || !restaurant) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-xl font-bold text-red-600">{error || "Accès refusé"}</p></div>

    // Stats Calculation
    const stats = {
        totalParticipations: restaurant.participations.length,
        totalWins: restaurant.participations.filter((p) => p.reward.isWin).length,
        pending: restaurant.participations.filter((p) => p.status === "PENDING").length,
        redeemed: restaurant.participations.filter((p) => p.status === "REDEEMED").length,
        winRate: restaurant.participations.length > 0 ? Math.round((restaurant.participations.filter((p) => p.reward.isWin).length / restaurant.participations.length) * 100) : 0
    }

    // Unique Customers Logic
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
        const headers = ["Nom", "Email", "Total Jeux", "Gains", "Dernière Visite"]
        const rows = uniqueCustomers.map(c => [
            c.name,
            c.email,
            c.totalPlays,
            c.totalWins,
            new Date(c.lastVisit).toLocaleDateString()
        ])
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n")
        const link = document.createElement("a")
        link.setAttribute("href", encodeURI(csvContent))
        link.setAttribute("download", `${restaurant.slug}_clients.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const NavItem = ({ value, label, icon: Icon, count }: any) => (
        <Button
            variant="ghost"
            className={`w-full justify-start mb-1 ${activeTab === value ? 'bg-slate-800 text-purple-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            onClick={() => {
                setActiveTab(value)
                setMobileMenuOpen(false)
            }}
        >
            <Icon className="mr-3 h-5 w-5" />
            {label}
            {count !== undefined && (
                <span className="ml-auto bg-slate-700 text-white text-xs px-2 py-0.5 rounded-full">
                    {count}
                </span>
            )}
        </Button>
    )

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* MOBILE HEADER */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-slate-900 z-50 px-4 py-3 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-black text-sm" style={{ backgroundColor: restaurant.primaryColor }}>
                        {restaurant.name.charAt(0)}
                    </div>
                    <span className="text-white font-bold">{restaurant.name}</span>
                </div>
                <Button variant="ghost" size="icon" className="text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>

            {/* SIDEBAR (Desktop: Fixed, Mobile: Overlay) */}
            <div className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out transform 
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0 md:static md:flex md:flex-col
            `}>
                <div className="p-6 border-b border-slate-800 hidden md:block">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-lg shadow-purple-900/20" style={{ backgroundColor: restaurant.primaryColor }}>
                            {restaurant.name.charAt(0)}
                        </div>
                        <span className="text-lg font-bold tracking-tight truncate">{restaurant.name}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest">Admin Dashboard</p>
                </div>

                <div className="mt-16 md:mt-0 flex-1 p-4 overflow-y-auto">
                    <div className="space-y-1">
                        <NavItem value="overview" label="Vue d'ensemble" icon={LayoutDashboard} />
                        <NavItem value="customers" label="Clients" icon={Users} count={uniqueCustomers.length} />
                        <NavItem value="rewards" label="Récompenses" icon={Gift} />
                        <NavItem value="settings" label="Paramètres & QR" icon={Settings} />
                    </div>
                </div>

                <div className="p-4 border-t border-slate-800">
                    <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-slate-800" onClick={() => router.push("/")}>
                        <LogOut className="mr-3 h-5 w-5" />
                        Déconnexion
                    </Button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0 h-screen overflow-y-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

                    {/* HEADER SECTION */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                {activeTab === 'overview' && "Vue d'ensemble"}
                                {activeTab === 'customers' && "Base Clients"}
                                {activeTab === 'rewards' && "Gestion des Cadeaux"}
                                {activeTab === 'settings' && "Paramètres"}
                            </h1>
                            <p className="text-gray-500 mt-1">Gérez votre programme de fidélité simplement.</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => window.open(`/r/${restaurant.slug}`, '_blank')}
                                className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm"
                            >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Voir le jeu
                            </Button>
                        </div>
                    </div>

                    {/* CONTENT TABS */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

                        {/* OVERVIEW CONTENT */}
                        <TabsContent value="overview" className="space-y-6 m-0">
                            {/* Stats Cards - Super Admin Style */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <StatCard
                                    label="Total Jeux"
                                    value={stats.totalParticipations}
                                    icon={<Activity className="h-6 w-6 text-purple-600" />}
                                    bg="bg-purple-100"
                                    trend="+12% this week"
                                />
                                <StatCard
                                    label="Gagnants"
                                    value={stats.totalWins}
                                    icon={<Trophy className="h-6 w-6 text-yellow-600" />}
                                    bg="bg-yellow-100"
                                    trend={`${stats.winRate}% win rate`}
                                />
                                <StatCard
                                    label="À Valider"
                                    value={stats.pending}
                                    icon={<CheckCircle className="h-6 w-6 text-orange-600" />}
                                    bg="bg-orange-100"
                                    trend="Action required"
                                />
                                <StatCard
                                    label="Clients Uniques"
                                    value={uniqueCustomers.length}
                                    icon={<Users className="h-6 w-6 text-blue-600" />}
                                    bg="bg-blue-100"
                                    trend="Growing"
                                />
                            </div>

                            {/* Platform Stats */}
                            {restaurant.platformStats && restaurant.platformStats.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {restaurant.platformStats.map((stat) => (
                                        <Card key={stat.platformAction} className="border-0 shadow-sm bg-white">
                                            <CardContent className="pt-6 flex items-center gap-4">
                                                <div className={`p-3 rounded-lg ${stat.platformAction === 'GOOGLE_REVIEW' ? 'bg-blue-50 text-blue-600' :
                                                        stat.platformAction === 'INSTAGRAM_FOLLOW' ? 'bg-pink-50 text-pink-600' :
                                                            stat.platformAction === 'TIKTOK_FOLLOW' ? 'bg-gray-900 text-white' :
                                                                stat.platformAction === 'TRIPADVISOR_REVIEW' ? 'bg-green-50 text-green-600' :
                                                                    'bg-blue-50 text-blue-600'
                                                    }`}>
                                                    {stat.platformAction === 'GOOGLE_REVIEW' && <span className="text-xl">⭐</span>}
                                                    {stat.platformAction === 'INSTAGRAM_FOLLOW' && <span className="text-xl">📷</span>}
                                                    {stat.platformAction === 'TIKTOK_FOLLOW' && <span className="text-xl">🎵</span>}
                                                    {stat.platformAction === 'TRIPADVISOR_REVIEW' && <span className="text-xl">🦉</span>}
                                                    {stat.platformAction === 'FACEBOOK_LIKE' && <span className="text-xl">👍</span>}
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                                                        {stat.platformAction === 'GOOGLE_REVIEW' ? 'Avis Google' :
                                                            stat.platformAction === 'INSTAGRAM_FOLLOW' ? 'Instagram' :
                                                                stat.platformAction === 'TIKTOK_FOLLOW' ? 'TikTok' :
                                                                    stat.platformAction === 'TRIPADVISOR_REVIEW' ? 'TripAdvisor' :
                                                                        'Facebook'}
                                                    </p>
                                                    <p className="text-2xl font-black text-gray-900">{stat._count.platformAction}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {/* Recent Activity List */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-900">Activité Récente</h3>
                                </div>
                                {restaurant.participations.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Activity className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500">Aucune activité pour le moment.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {restaurant.participations.slice(0, 10).map((p) => (
                                            <div key={p.id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${p.reward.isWin ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                        {p.reward.isWin ? <Trophy className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{p.customerName}</p>
                                                        <p className="text-sm text-gray-500">{p.reward.label} • {new Date(p.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 self-end md:self-auto">
                                                    <Badge variant={p.status === "REDEEMED" ? "secondary" : p.reward.isWin ? "default" : "outline"} className="capitalize">
                                                        {p.status === 'PENDING' ? 'En Attente' : p.status === 'VERIFIED' ? 'Validé' : p.status === 'REDEEMED' ? 'Utilisé' : p.status}
                                                    </Badge>
                                                    {p.status === "PENDING" && p.reward.isWin && (
                                                        <Button size="sm" onClick={() => updateParticipationStatus(p.id, "VERIFIED")} className="bg-black text-white hover:bg-gray-800">
                                                            Vérifier
                                                        </Button>
                                                    )}
                                                    {p.status === "VERIFIED" && p.reward.isWin && (
                                                        <Button size="sm" onClick={() => updateParticipationStatus(p.id, "REDEEMED")} className="bg-green-600 text-white hover:bg-green-700">
                                                            Consommer
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* CUSTOMERS CONTENT */}
                        <TabsContent value="customers" className="space-y-6 m-0">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                                    <h3 className="font-bold text-gray-900">Liste des Clients</h3>
                                    <Button variant="outline" size="sm" onClick={handleExportCSV}>
                                        <Download className="h-4 w-4 mr-2" /> Export CSV
                                    </Button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Nom</th>
                                                <th className="p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Email</th>
                                                <th className="p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Jeux</th>
                                                <th className="p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Gains</th>
                                                <th className="p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Dernière Visite</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {uniqueCustomers.map((c) => (
                                                <tr key={c.email} className="hover:bg-gray-50">
                                                    <td className="p-4 font-medium text-gray-900">{c.name}</td>
                                                    <td className="p-4 text-gray-500">{c.email}</td>
                                                    <td className="p-4 font-medium text-gray-900">{c.totalPlays}</td>
                                                    <td className="p-4 font-medium text-green-600">{c.totalWins}</td>
                                                    <td className="p-4 text-gray-500">{new Date(c.lastVisit).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </TabsContent>

                        {/* REWARDS CONTENT */}
                        <TabsContent value="rewards" className="space-y-6 m-0">
                            <div className="grid gap-4">
                                {restaurant.rewards.map((reward, index) => (
                                    <div key={reward.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6">
                                        <div className="h-12 w-12 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: reward.colorHex || '#ccc' }}>
                                            <Gift className="h-6 w-6 text-white opacity-75" />
                                        </div>

                                        <div className="flex-1 space-y-4 w-full">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Nom</Label>
                                                    <Input
                                                        value={reward.label}
                                                        onChange={(e) => {
                                                            const newRewards = [...restaurant.rewards]
                                                            newRewards[index].label = e.target.value
                                                            setRestaurant({ ...restaurant, rewards: newRewards })
                                                        }}
                                                        className="font-medium"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Probabilité (%)</Label>
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
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Type</Label>
                                                    <Button
                                                        variant={reward.isWin ? "default" : "outline"}
                                                        onClick={() => {
                                                            const newRewards = [...restaurant.rewards]
                                                            newRewards[index].isWin = !newRewards[index].isWin
                                                            setRestaurant({ ...restaurant, rewards: newRewards })
                                                        }}
                                                        className={`w-full ${reward.isWin ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                                    >
                                                        {reward.isWin ? "Gagnant" : "Perdant"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end sticky bottom-6">
                                <Button
                                    size="lg"
                                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200"
                                    onClick={async () => {
                                        try {
                                            const res = await fetch(`/api/admin/update-rewards`, {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ token, rewards: restaurant.rewards })
                                            })
                                            if (res.ok) alert("Sauvegardé !")
                                            else alert("Erreur")
                                        } catch (e) { alert("Erreur réseau") }
                                    }}
                                >
                                    Enregistrer les modifications
                                </Button>
                            </div>
                        </TabsContent>

                        {/* SETTINGS CONTENT */}
                        <TabsContent value="settings" className="space-y-6 m-0">
                            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm max-w-4xl mx-auto">

                                {/* Branding Section */}
                                <div className="mb-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                            <RefreshCw className="h-6 w-6 text-purple-600" />
                                            Personnalisation & Branding
                                        </h2>
                                        <Button
                                            onClick={handleUpdateRestaurant}
                                            disabled={saving}
                                            className="bg-black text-white hover:bg-gray-800"
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {saving ? "Sauvegarde..." : "Enregistrer"}
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                                        <div>
                                            <Label className="mb-2 block text-xs uppercase text-gray-500 font-bold">Couleur Principale</Label>
                                            <div className="flex items-center gap-3">
                                                <Input
                                                    type="color"
                                                    value={restaurant.primaryColor}
                                                    onChange={(e) => setRestaurant({ ...restaurant, primaryColor: e.target.value })}
                                                    className="h-12 w-20 p-1 cursor-pointer"
                                                />
                                                <span className="text-sm font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded">{restaurant.primaryColor}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">Utilisée pour les titres, boutons et l'arc du QR code.</p>
                                        </div>

                                        <div>
                                            <Label className="mb-2 block text-xs uppercase text-gray-500 font-bold">Couleur Secondaire</Label>
                                            <div className="flex items-center gap-3">
                                                <Input
                                                    type="color"
                                                    value={restaurant.secondaryColor}
                                                    onChange={(e) => setRestaurant({ ...restaurant, secondaryColor: e.target.value })}
                                                    className="h-12 w-20 p-1 cursor-pointer"
                                                />
                                                <span className="text-sm font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded">{restaurant.secondaryColor}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">Utilisée pour les accents et décorations.</p>
                                        </div>

                                        <div>
                                            <Label className="mb-2 block text-xs uppercase text-gray-500 font-bold">Logo (Centre du QR)</Label>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                className="text-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                            />
                                            {restaurant.logoUrl && (
                                                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                                    <CheckCircle className="h-3 w-3" /> Logo chargé
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 my-8"></div>

                                {/* Game Limits Section */}
                                <div className="mb-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                            <Activity className="h-6 w-6 text-purple-600" />
                                            Limites de Jeu
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <Label className="mb-2 block text-xs uppercase text-gray-500 font-bold">Jeux Max par Jour</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={restaurant.maxPlaysPerDay}
                                                onChange={(e) => setRestaurant({ ...restaurant, maxPlaysPerDay: parseInt(e.target.value) || 1 })}
                                            />
                                            <p className="text-xs text-gray-400 mt-2">Combien de fois un client peut jouer en 24h (toutes actions confondues).</p>
                                        </div>

                                        <div>
                                            <Label className="mb-2 block text-xs uppercase text-gray-500 font-bold">Délai de Rejeu (Heures)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={restaurant.replayDelayHours}
                                                onChange={(e) => setRestaurant({ ...restaurant, replayDelayHours: parseInt(e.target.value) || 0 })}
                                            />
                                            <p className="text-xs text-gray-400 mt-2">Temps d'attente avant de pouvoir rejouer (si limite non atteinte).</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Social Platforms Section */}
                                <div className="mb-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                            <Users className="h-6 w-6 text-purple-600" />
                                            Plateformes Sociales (Optionnel)
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <Label className="mb-2 block text-xs uppercase text-gray-500 font-bold">TripAdvisor URL</Label>
                                            <Input
                                                placeholder="https://www.tripadvisor.fr/Restaurant_Review..."
                                                value={restaurant.tripadvisorUrl || ""}
                                                onChange={(e) => setRestaurant({ ...restaurant, tripadvisorUrl: e.target.value })}
                                            />
                                            <p className="text-xs text-gray-400 mt-2">Laissez vide pour désactiver.</p>
                                        </div>

                                        <div>
                                            <Label className="mb-2 block text-xs uppercase text-gray-500 font-bold">Instagram Handle</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-gray-400">@</span>
                                                <Input
                                                    placeholder="mon_restaurant"
                                                    value={restaurant.instagramHandle?.replace('@', '') || ""}
                                                    onChange={(e) => setRestaurant({ ...restaurant, instagramHandle: e.target.value })}
                                                    className="pl-8"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">Ex: @mon_restaurant</p>
                                        </div>

                                        <div>
                                            <Label className="mb-2 block text-xs uppercase text-gray-500 font-bold">TikTok Handle</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-gray-400">@</span>
                                                <Input
                                                    placeholder="mon_restaurant"
                                                    value={restaurant.tiktokHandle?.replace('@', '') || ""}
                                                    onChange={(e) => setRestaurant({ ...restaurant, tiktokHandle: e.target.value })}
                                                    className="pl-8"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">Ex: @mon_restaurant</p>
                                        </div>

                                        <div>
                                            <Label className="mb-2 block text-xs uppercase text-gray-500 font-bold">Facebook URL</Label>
                                            <Input
                                                placeholder="https://facebook.com/..."
                                                value={restaurant.facebookUrl || ""}
                                                onChange={(e) => setRestaurant({ ...restaurant, facebookUrl: e.target.value })}
                                            />
                                            <p className="text-xs text-gray-400 mt-2">Lien vers votre page Facebook.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 my-8"></div>

                                {/* QR Code Preview Section */}
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Aperçu du Poster QR Code</h3>
                                    <p className="text-gray-500 mb-8">Ce design est généré automatiquement avec vos couleurs et votre logo.</p>

                                    <div className="inline-block p-4 bg-white rounded-xl border-2 border-gray-100 shadow-sm mb-8">
                                        <QRCodeGenerator
                                            url={`${typeof window !== 'undefined' ? window.location.origin : ''}/r/${restaurant.slug}`}
                                            restaurantName={restaurant.name}
                                            primaryColor={restaurant.primaryColor}
                                            secondaryColor={restaurant.secondaryColor}
                                            logoUrl={restaurant.logoUrl || undefined}
                                        />
                                    </div>

                                    <div className="w-full max-w-md mx-auto">
                                        <Label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block text-left">Lien Direct</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                readOnly
                                                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/r/${restaurant.slug}`}
                                                className="bg-gray-50 font-mono text-sm"
                                            />
                                            <Button variant="outline" onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/r/${restaurant.slug}`)
                                                alert("Copié !")
                                            }}>
                                                Copier
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, icon, bg, trend }: any) {
    return (
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${bg}`}>
                        {icon}
                    </div>
                    {trend && <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{trend}</span>}
                </div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            </CardContent>
        </Card>
    )
}

export default function AdminPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white">Chargement...</div>}>
            <AdminContent />
        </Suspense>
    )
}
