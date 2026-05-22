import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "USER" | "ADMIN";
    };
  }
  interface User {
    id: string;
    role: "USER" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "USER" | "ADMIN";
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth — credentials come from env; skipped if not set
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code",
              },
            },
          }),
        ]
      : []),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;
        if (user.suspended) return null;
        // Google-only accounts have no password
        if (!user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as "USER" | "ADMIN",
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth sign-in / account creation
      if (account?.provider === "google" && user.email) {
        try {
          const existing = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, role: true, suspended: true },
          });

          if (existing) {
            if (existing.suspended) return false;
            // Link Google ID if not already linked (raw query to avoid type issue)
            await prisma.$executeRawUnsafe(
              `UPDATE "User" SET "googleId" = ? WHERE email = ? AND "googleId" IS NULL`,
              account.providerAccountId,
              user.email
            ).catch(() => { /* column may not exist yet — safe to ignore */ });
            user.id = existing.id;
            (user as { role?: string }).role = existing.role;
          } else {
            // Create new account for Google user
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name ?? user.email.split("@")[0],
                plan: "free",
                role: "USER",
              },
              select: { id: true, role: true },
            });
            // Store googleId via raw query (graceful if column absent)
            await prisma.$executeRawUnsafe(
              `UPDATE "User" SET "googleId" = ? WHERE id = ?`,
              account.providerAccountId,
              newUser.id
            ).catch(() => { /* ignore */ });
            user.id = newUser.id;
            (user as { role?: string }).role = newUser.role;
          }
        } catch (err) {
          console.error("Google signIn error:", err);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: "USER" | "ADMIN" }).role ?? "USER";
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
