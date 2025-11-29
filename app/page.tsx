import { headers } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, Trophy, Zap } from "lucide-react"

export default async function Home() {
  const headersList = await headers()
  const host = headersList.get("host") || ""
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1")

  // --- MODE LOCAL : AFFICHER LE QG (VOTRE OUTIL) ---
  if (isLocal) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl w-full space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4">
              Local Environment • Secure
            </div>
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Command Center
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Welcome back, Master. All systems are operational.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* SALES MODE */}
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-purple-500 transition-all group cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap className="w-24 h-24 text-purple-500" />
              </div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-purple-500" />
                Sales Mode
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Create new client accounts in seconds. Optimized for live demos and rapid onboarding.
              </p>
              <Link href="/super-admin/sales">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6 font-semibold shadow-lg shadow-purple-900/20">
                  Launch Sales Mode 🚀
                </Button>
              </Link>
            </div>

            {/* SUPER ADMIN */}
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-blue-500 transition-all group cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Star className="w-24 h-24 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-blue-500" />
                Super Admin
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Global dashboard. Manage all restaurants, view analytics, and configure system settings.
              </p>
              <Link href="/super-admin">
                <Button variant="outline" className="w-full border-gray-600 hover:bg-gray-700 text-lg py-6 font-semibold">
                  Open Dashboard 🏢
                </Button>
              </Link>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            ReviewSpin v1.0 • Localhost Access Only
          </div>
        </div>
      </div>
    )
  }

  // --- MODE PUBLIC (VERCEL) : AFFICHER LA LANDING PAGE ---
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">R</div>
            <span className="font-bold text-xl text-gray-900">ReviewSpin</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900">How it works</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-100/50 via-white to-white"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-800 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-purple-600 mr-2"></span>
            New: AI-Powered Review Management
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Turn Google Reviews into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Customer Loyalty</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            The fun way to get 5-star reviews. Customers spin the wheel, win prizes, and you get better rankings. Zero friction, 100% automated.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 h-14 px-8 text-lg shadow-xl shadow-purple-200">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need to grow</h2>
            <p className="text-gray-600 mt-4">Powerful features to boost your online reputation.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Gamified Experience",
                description: "Engage customers with a fun spin-the-wheel game that rewards them for their feedback.",
                icon: Trophy
              },
              {
                title: "Instant Reviews",
                description: "Direct integration with Google Maps makes leaving a review seamless and fast.",
                icon: Star
              },
              {
                title: "Automated Rewards",
                description: "Set up probabilities and prizes once, and let the system handle the rest.",
                icon: Zap
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
