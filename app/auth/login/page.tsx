import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, Github } from "lucide-react"

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <Card className="w-full max-w-md shadow-2xl border-slate-800 bg-slate-900 text-white">
                <CardHeader className="space-y-1 text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Github className="w-8 h-8 text-black" />
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight">TekNaFood Admin</CardTitle>
                    <p className="text-sm text-slate-400">Connexion sécurisée via GitHub</p>
                </CardHeader>
                <CardContent>
                    <form
                        action={async () => {
                            "use server"
                            await signIn("github", { redirectTo: "/super" })
                        }}
                    >
                        <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200 font-bold shadow-lg">
                            <Github className="mr-2 h-5 w-5" />
                            Se connecter avec GitHub
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
