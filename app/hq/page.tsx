import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HQPage() {
    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-purple-500">⚡ ReviewSpin HQ</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SALES MODE */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition-all">
                        <h2 className="text-2xl font-bold mb-4">Sales Mode</h2>
                        <p className="text-gray-400 mb-6">Create new businesses in 3 clicks. Optimized for face-to-face sales.</p>
                        <Link href="/super-admin/sales">
                            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6">
                                Open Sales Mode ⚡
                            </Button>
                        </Link>
                    </div>

                    {/* SUPER ADMIN */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-all">
                        <h2 className="text-2xl font-bold mb-4">Super Admin</h2>
                        <p className="text-gray-400 mb-6">Manage all restaurants, view global stats, and configure system.</p>
                        <Link href="/super-admin">
                            <Button variant="outline" className="w-full border-gray-600 hover:bg-gray-700 text-lg py-6">
                                Open Dashboard 🏢
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="mt-12 p-6 bg-black/30 rounded-xl border border-gray-800">
                    <h3 className="font-bold text-gray-400 mb-4">Quick Links</h3>
                    <div className="flex gap-4">
                        <Link href="/r/demo" target="_blank" className="text-blue-400 hover:underline">Test Demo Game</Link>
                        <Link href="/admin?token=demo-admin-token" target="_blank" className="text-blue-400 hover:underline">Test Demo Admin</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
