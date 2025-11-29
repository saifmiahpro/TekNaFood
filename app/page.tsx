import { redirect } from "next/navigation"

export default function Home() {
  // Redirection automatique vers le login
  // C'est votre outil personnel, pas un produit public
  redirect("/auth/login")
}
