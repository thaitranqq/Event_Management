import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

class UnverifiedEmailError extends CredentialsSignin {
    code = "UNVERIFIED_EMAIL"
}

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
    // Ensure a secret is provided. Auth.js requires a `secret`.
    // Read from `NEXTAUTH_SECRET` or `AUTH_SECRET`. In development, fall back
    // to an insecure dev secret so the app keeps working locally.
    secret:
        process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET ||
        (process.env.NODE_ENV !== "production" ? "insecure-dev-secret" : undefined),
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const parsed = loginSchema.safeParse(credentials)

                if (!parsed.success) {
                    return null
                }

                const { email, password } = parsed.data

                const user = await prisma.user.findUnique({
                    where: { email },
                })

                if (!user) {
                    return null
                }

                const isValidPassword = await bcrypt.compare(password, user.password)

                if (!isValidPassword) {
                    return null
                }

                if (!user.emailVerified) {
                    throw new CredentialsSignin("UNVERIFIED_EMAIL")
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.image,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string
                session.user.id = token.id as string
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
})
