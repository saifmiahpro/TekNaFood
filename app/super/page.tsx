"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ShieldAlert, Plus, ExternalLink, LogIn, Search, LogOut } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function SuperAdminDashboard() {
    const router = useRouter()
    const [restaurants, setRestaurants] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    // New Restaurant Form
    const [newRestoOpen, setNewRestoOpen] = useState(false)
    const [newName, setNewName] = useState("")
    const [newSlug, setNewSlug] = useState("")
    const [newEmail, setNewEmail] = useState("")

    useEffect(() => {
        fetchRestaurants()
    }, [])

    const fetchRestaurants = async () => {
        try {
            const res = await fetch("/api/super/restaurants")
            if (res.ok) {
                const data = await res.json()
                setRestaurants(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateRestaurant = async () => {
        try {
            const res = await fetch("/api/super/restaurants", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName, slug: newSlug, email: newEmail })
            })
            if (res.ok) {
                setNewRestoOpen(false)
                fetchRestaurants()
                setNewName("")
                setNewSlug("")
                setNewEmail("")
            }
        } catch (error) {
            alert("Erreur création")
        }
    }

    const handleImpersonate = async (restaurantId: string) => {
        try {
            const res = await fetch("/api/super/impersonate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ restaurantId })
            })
            if (res.ok) {
                // Redirect to restaurant admin
                window.open("/admin", "_blank")
            } else {
                alert("Erreur de connexion")
            }
        } catch (error) {
            alert("Erreur réseau")
        }
    }

    const filteredRestaurants = restaurants.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <header className="bg-slate-900 text-white p-4 shadow-md">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <ShieldAlert className="h-8 w-8 text-red-500" />
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Super Admin</h1>
                            <p className="text-xs text-slate-400">Master Control</p>
                        </div>
                    </div>
                    <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-slate-800" onClick={() => window.location.href = "/api/auth/signout"}>
                        <LogOut className="h-4 w-4 mr-2" /> Déconnexion
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-900">Clients ({restaurants.length})</h2>

                    <Dialog open={newRestoOpen} onOpenChange={setNewRestoOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-black hover:bg-slate-800 text-white">
                                <Plus className="h-4 w-4 mr-2" /> Nouveau Client
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Ajouter un Restaurant</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Nom du Restaurant</Label>
                                    <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Burger King" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Slug (URL)</Label>
                                    <Input value={newSlug} onChange={e => setNewSlug(e.target.value)} placeholder="ex: burger-king-paris" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Contact</Label>
                                    <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="contact@..." />
                                </div>
                                <Button onClick={handleCreateRestaurant} className="w-full">Créer</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Total Participations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {restaurants.reduce((acc, r) => acc + (r._count?.participations || 0), 0)}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="md:col-span-2 flex items-end">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Rechercher un client..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead>URL (Slug)</TableHead>
                                <TableHead>Jeux Joués</TableHead>
                                <TableHead>Créé le</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRestaurants.map((resto) => (
                                <TableRow key={resto.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                                {resto.name.charAt(0)}
                                            </div>
                                            {resto.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <a href={`/r/${resto.slug}`} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1">
                                            {resto.slug} <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </TableCell>
                                    <TableCell>{resto._count?.participations || 0}</TableCell>
                                    <TableCell>{new Date(resto.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-purple-600 border-purple-200 hover:bg-purple-50"
                                            onClick={() => handleImpersonate(resto.id)}
                                        >
                                            <LogIn className="h-3 w-3 mr-2" /> Accéder Admin
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </main>
        </div>
    )
}
