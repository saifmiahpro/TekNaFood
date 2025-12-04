import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [GitHub],
    callbacks: {
        async signIn({ user, account, profile }) {
            // Whitelist: Only allow the specific admin email
            const allowedEmail = process.env.ADMIN_EMAIL
            if (user.email === allowedEmail) {
                return true
            }
            return false // Deny access
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = "super_admin"
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                // @ts-ignore
                session.user.role = token.role
            }
            return session
        }
    },
    pages: {
        signIn: "/auth/login",
    }
})
