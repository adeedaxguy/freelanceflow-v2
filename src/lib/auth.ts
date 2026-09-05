import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { notifyNewUserSignup } from "@/lib/admin-notifications";
import { getClientIp, securityRateLimit } from "@/lib/security-rate-limit";

type UserRole = "USER" | "MANAGER" | "ADMIN";
const DUMMY_PASSWORD_HASH = bcrypt.hashSync("invalid-login-placeholder", 12);

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      plan: string;
      createdAt?: string;
    };
  }
  interface User {
    id: string;
    role?: UserRole;
    plan?: string;
    createdAt?: string;
    sessionVersion?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    plan?: string;
    createdAt?: string;
    sessionVersion?: number;
    active?: boolean;
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
            profile(profile) {
              return {
                id: profile.sub,
                name: profile.name,
                email: profile.email_verified === true ? profile.email : null,
                image: profile.picture,
              };
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
            userinfo: {
              url: "https://api.github.com/user",
              async request({ client, tokens }) {
                if (!tokens.access_token) throw new Error("GitHub did not return an access token");
                const profile = await client.userinfo(tokens.access_token);
                const response = await fetch("https://api.github.com/user/emails", {
                  headers: { Authorization: `Bearer ${tokens.access_token}` },
                });
                const emails = response.ok
                  ? await response.json() as Array<{ email?: string; primary?: boolean; verified?: boolean }>
                  : [];
                const verified = emails.find(email => email.primary && email.verified)
                  ?? emails.find(email => email.verified);
                profile.email = verified?.email;
                return profile;
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
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.trim().toLowerCase();
        if (email.length > 254 || credentials.password.length > 128) return null;

        try {
          const headers = new Headers(request.headers as HeadersInit);
          const ip = getClientIp(headers);
          const [ipLimit, accountLimit] = await Promise.all([
            securityRateLimit("login-ip", ip, 30, 15 * 60 * 1000),
            securityRateLimit("login-account", email, 10, 15 * 60 * 1000),
          ]);
          if (!ipLimit.allowed || !accountLimit.allowed) {
            console.warn("[security] Login throttled");
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, name: true, email: true, password: true, role: true, plan: true, suspended: true, createdAt: true, sessionVersion: true },
          });

          const isValid = await bcrypt.compare(credentials.password, user?.password ?? DUMMY_PASSWORD_HASH);
          if (!user || user.suspended || !user.password || !isValid) return null;

          return {
            id:    user.id,
            name:  user.name,
            email: user.email,
            role:  (user.role as UserRole) ?? "USER",
            plan:  user.plan ?? "free",
            createdAt: user.createdAt.toISOString(),
            sessionVersion: user.sessionVersion,
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
            select: { id: true, role: true, plan: true, suspended: true, createdAt: true, sessionVersion: true },
          });

          if (existing) {
            if (existing.suspended) return false;
            user.id = existing.id;
            (user as { role?: string; plan?: string }).role = existing.role ?? "USER";
            (user as { role?: string; plan?: string }).plan = existing.plan ?? "free";
            user.createdAt = existing.createdAt.toISOString();
            user.sessionVersion = existing.sessionVersion;
          } else {
            // Create new OAuth account
            const newUser = await prisma.user.create({
              data: {
                email: normalizedEmail,
                name:  user.name ?? normalizedEmail.split("@")[0],
                plan:  "free",
                role:  "USER",
              },
              select: { id: true, role: true, plan: true, createdAt: true, sessionVersion: true },
            });
            user.id = newUser.id;
            (user as { role?: string; plan?: string }).role = newUser.role;
            (user as { role?: string; plan?: string }).plan = newUser.plan ?? "free";
            user.createdAt = newUser.createdAt.toISOString();
            user.sessionVersion = newUser.sessionVersion;

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

    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = (user as { role?: UserRole }).role ?? "USER";
        token.plan = (user as { plan?: string }).plan ?? "free";
        token.createdAt = user.createdAt;
        token.sessionVersion = user.sessionVersion ?? 0;
        token.active = true;
      } else if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id },
            select: { plan: true, role: true, suspended: true, sessionVersion: true },
          });
          const versionMatches = token.sessionVersion === undefined || token.sessionVersion === dbUser?.sessionVersion;
          if (!dbUser || dbUser.suspended || !versionMatches) {
            token.id = undefined;
            token.role = undefined;
            token.plan = undefined;
            token.active = false;
          } else {
            token.plan = dbUser.plan ?? "free";
            token.role = (dbUser.role as UserRole) ?? "USER";
            token.sessionVersion = dbUser.sessionVersion;
            token.active = true;
          }
        } catch (error) {
          console.error("[auth] Session validation failed:", error);
          token.id = undefined;
          token.role = undefined;
          token.plan = undefined;
          token.active = false;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (!token.active || !token.id) {
        return null as unknown as typeof session;
      }
      if (session.user) {
        session.user.id   = token.id;
        session.user.role = token.role ?? "USER";
        session.user.plan = token.plan ?? "free";
        session.user.createdAt = token.createdAt;
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
