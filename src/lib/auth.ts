import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { notifyNewUserSignup } from "@/lib/admin-notifications";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "USER" | "ADMIN";
      plan: string;
    };
  }
  interface User {
    id: string;
    role: "USER" | "ADMIN";
    plan?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "USER" | "ADMIN";
    plan: string;
  }
}

// ─── Auth options ──────────────────────────────────────────────────────────────
export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth — skipped if env vars not set
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            // IMPORTANT: only request basic non-sensitive scopes.
            // gmail.send is handled separately in email-settings via gmail-oauth.ts
            // Keeping scopes here to just openid+email+profile means Google
            // does NOT require app verification for sign-in — works for all users.
            authorization: {
              params: {
                scope: "openid email profile",
                prompt: "select_account",
                access_type: "online",
                response_type: "code",
              },
            },
          }),
        ]
      : []),

    // GitHub OAuth — skipped if env vars not set
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            authorization: {
              params: {
                scope: "read:user user:email",
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

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.trim().toLowerCase() },
            select: { id: true, name: true, email: true, password: true, role: true, plan: true, suspended: true },
          });

          if (!user) return null;

          // Treat suspended as suspended
          if (user.suspended) return null;

          // Google-only accounts have no password
          if (!user.password) return null;

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;

          return {
            id:    user.id,
            name:  user.name,
            email: user.email,
            role:  (user.role as "USER" | "ADMIN") ?? "USER",
            plan:  user.plan ?? "free",
          };
        } catch (err) {
          console.error("[auth] authorize error:", err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Handle OAuth sign-in / account creation for Google and GitHub
      const isOAuth = account?.provider === "google" || account?.provider === "github";
      if (isOAuth) {
        if (!user.email) {
          return "/auth?error=GitHubEmailUnavailable";
        }

        const normalizedEmail = user.email.trim().toLowerCase();
        user.email = normalizedEmail;

        try {
          const existing = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, role: true, plan: true, suspended: true },
          });

          if (existing) {
            if (existing.suspended) return false;
            user.id = existing.id;
            (user as { role?: string; plan?: string }).role = existing.role ?? "USER";
            (user as { role?: string; plan?: string }).plan = existing.plan ?? "free";
          } else {
            // Create new OAuth account
            const newUser = await prisma.user.create({
              data: {
                email: normalizedEmail,
                name:  user.name ?? normalizedEmail.split("@")[0],
                plan:  "free",
                role:  "USER",
              },
              select: { id: true, role: true, plan: true },
            });
            user.id = newUser.id;
            (user as { role?: string; plan?: string }).role = newUser.role;
            (user as { role?: string; plan?: string }).plan = newUser.plan ?? "free";

            try {
              await notifyNewUserSignup({
                id: newUser.id,
                name: user.name ?? normalizedEmail.split("@")[0] ?? null,
                email: normalizedEmail,
                plan: newUser.plan ?? "free",
                expertise: [],
                referralSource: `${account.provider} OAuth`,
              });
            } catch (notificationError) {
              console.error("[auth] OAuth signup notification failed:", notificationError);
            }
          }
        } catch (err) {
          console.error(`[auth] ${account?.provider} signIn error:`, err);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        token.id   = user.id;
        token.role = (user as { role?: "USER" | "ADMIN" }).role ?? "USER";
        token.plan = (user as { plan?: string }).plan ?? "free";
      }
      // Re-fetch plan on session refresh
      if (trigger === "update" && token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id },
            select: { plan: true, role: true },
          });
          if (dbUser) {
            if (dbUser.plan) token.plan = dbUser.plan;
            if (dbUser.role) token.role = dbUser.role as "USER" | "ADMIN";
          }
        } catch { /* non-fatal */ }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id;
        session.user.role = token.role ?? "USER";
        session.user.plan = token.plan ?? "free";
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth",
    error:  "/auth",
  },
  session: {
    strategy: "jwt",
    maxAge:   30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
