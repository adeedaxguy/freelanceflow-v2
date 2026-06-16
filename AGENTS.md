# iCloseLeads — Codex Agent Guide

> This file is the single source of truth for any AI agent (Codex, Claude, etc.) working on this codebase. Read it fully before making any changes.

---

## 1. What This Project Is

**iCloseLeads** (`icloseleads.com`) is a SaaS platform for freelancers to find clients via direct outreach. Users search for leads across 11+ job boards and remote work platforms, generate AI proposals, send cold emails, and manage their pipeline — all in one dashboard.

- **Live URL:** https://icloseleads.com
- **GitHub:** https://github.com/adeedaxguy/freelanceflow-v2
- **Stack:** Next.js 14 (App Router) · TypeScript · Prisma · PostgreSQL (Neon) · NextAuth.js · Tailwind CSS · Vercel

---

## 2. Repo Structure

```
freelanceflow-v2/
├── prisma/
│   └── schema.prisma          # Single source of truth for DB schema
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js App Router pages + API routes
│   │   ├── page.tsx           # Homepage (uses HomepageClient.tsx)
│   │   ├── layout.tsx         # Root layout — GA4, fonts, providers
│   │   ├── globals.css        # Tailwind base + .blog-content styles
│   │   ├── auth/              # Sign in / Sign up
│   │   ├── blog/              # Blog listing + individual post pages
│   │   ├── dashboard/         # Logged-in user area
│   │   ├── admin/             # Admin-only panel
│   │   ├── api/               # All API routes
│   │   ├── for/[industry]/    # Programmatic SEO landing pages
│   │   ├── features/          # Feature deep-dive pages
│   │   ├── tools/             # Free tools (lead calculator)
│   │   ├── sitemap.ts         # Dynamic sitemap (36 URLs)
│   │   ├── robots.ts          # robots.txt
│   │   └── opengraph-image.tsx # Dynamic OG image
│   ├── components/            # Shared React components
│   ├── data/                  # Static data files
│   │   ├── blog-posts.ts      # Static/hardcoded blog posts (legacy)
│   │   ├── blog-queue.ts      # 25 SEO blog posts for cron publishing
│   │   └── marketing.ts       # Marketing copy data
│   ├── lib/                   # Server-side utilities
│   └── types/                 # Shared TypeScript types
├── vercel.json                # Cron job config
├── deploy-limits.sh           # THE deploy script (see Section 5)
└── AGENTS.md                  # This file
```

---

## 3. Database Schema (Prisma + Neon PostgreSQL)

**Production DB:** Neon (auto-suspending PostgreSQL). Set via `DATABASE_URL` in Vercel env vars.
**Local .env:** Uses `file:./dev.db` (SQLite) — only for local dev, NOT production.

### Models

| Model | Purpose |
|---|---|
| `User` | Accounts — plan, usage counters, bonus leads, referral |
| `Lead` | Saved leads per user with status pipeline |
| `SentEmail` | Email history per user |
| `Campaign` | Grouped outreach campaigns |
| `Template` | Email templates (default + custom) |
| `BlogPost` | DB-published blog posts (created by daily cron) |
| `BlogComment` | Comments on blog posts with threading (parentId) |
| `BlogCommentRateLimit` | IP-based rate limit tracker for comments |
| `ContactSubmission` | Contact form entries |
| `PlatformSetting` | Key-value store for admin settings |
| `SupportTicket` | User support tickets |
| `FollowUp` | Scheduled follow-up emails |

### CRITICAL: How to run DB migrations

**NEVER run `prisma db push --accept-data-loss`** — it will drop columns/data.

For schema changes, use targeted SQL:
```bash
# From freelanceflow-v2/ directory
echo 'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "newField" TEXT;' \
  | node node_modules/prisma/build/index.js db execute --stdin
```

The local `.env` DATABASE_URL points to SQLite so local `prisma db execute` won't hit production. Production migrations must go through the `/api/db/migrate` route or be added as `CREATE TABLE IF NOT EXISTS` / `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` in the relevant API route.

---

## 4. Environment Variables

All secrets live in **Vercel environment variables** — never hardcoded.

| Variable | Used for |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | NextAuth session signing |
| `NEXTAUTH_URL` | `https://icloseleads.com` |
| `HUNTER_API_KEY` | Hunter.io email finder |
| `OPENAI_API_KEY` | GPT-4o-mini for proposals/replies |
| `RESEND_API_KEY` | Transactional email delivery |
| `RESEND_FROM_EMAIL` | Verified sender domain |
| `CRON_SECRET` | Protects `/api/cron/publish-blog` |
| `MIGRATE_SECRET` | Protects `/api/db/migrate` |
| `POSTHOG_KEY` | PostHog analytics (optional) |
| `NEXT_PUBLIC_APP_URL` | `https://icloseleads.com` |

The GA4 tag `G-WRSW1WG2DY` is hardcoded in `src/app/layout.tsx` — this is intentional and safe (GA IDs are always public).

---

## 5. Deployment — HOW IT ACTUALLY WORKS

**This is the most important thing to understand.**

The GitHub repo (`freelanceflow-v2`) is the source, but it is **NOT** directly connected to Vercel for auto-deploys. There is no CI/CD pipeline.

Deployments happen via a shell script:

```bash
bash ~/Documents/Claude/Projects/icloseleads/deploy-limits.sh
```

### What deploy-limits.sh does

1. Copies specific files from two local workspace repos into a **deploy destination directory**
2. Commits changes to a local git repo in the deploy destination
3. Runs `vercel --prod` from the deploy destination directory

### Why two source repos?

Some features were built in a separate workspace (`main-project/`) and merged at deploy time:

| Source | Files |
|---|---|
| `freelanceflow-v2/src/` | Homepage, blog, auth, most components, layout |
| `main-project/src/` | `leads-aggregator.ts`, `local-leads-engine.ts`, dashboard/local-leads, dashboard/live-jobs, api/leads/search, api/local-leads/search, api/usage |

**Implication for Codex:** If you edit files in GitHub, changes to the above `main-project/` files won't take effect until the deploy script is updated or those files are migrated into `freelanceflow-v2/src/`. For now, treat the GitHub repo as the canonical source for all files EXCEPT those listed above.

### To deploy after making changes

1. Edit files in the GitHub repo (`freelanceflow-v2/src/`)
2. Commit and push to `main`
3. The repo owner runs `deploy-limits.sh` locally — it picks up the latest files and deploys to Vercel

---

## 6. Authentication & Authorization

- **Auth provider:** NextAuth.js with credentials (email/password) + Google OAuth
- **Session:** JWT-based, stored in cookies
- **Roles:** `USER` (default) | `ADMIN`
- **Route protection:** Middleware at `src/middleware.ts` — protects `/dashboard/*` and `/admin/*`
- **Admin check:** `role === "ADMIN"` in DB. Admin routes verify via `getServerSession` + role check.
- **Agency bypass:** `adnan@technodigg.com` and similar agency accounts always get unlimited leads regardless of DB plan value (hardcoded in `src/lib/usage.ts`)

---

## 7. Lead System

### How leads are found

`POST /api/leads/search` aggregates from 11+ sources:

| Source | Type |
|---|---|
| RemoteOK, Remotive, WeWorkRemotely, Arbeitnow, Jobicy, WorkingNomads, Remote.co | Remote job boards |
| Reddit (`r/forhire`, `r/hiring`) | Community posts |
| Hacker News (Who's Hiring) | Tech-focused |
| GitHub Issues (help-wanted) | Open source |
| Craigslist | Local gigs |

The aggregator is in `src/lib/leads-aggregator.ts` (deployed from `main-project/`).

### Usage limits

Defined in `src/lib/usage.ts`:

```
free:   20 leads/week, 10 proposals/month, 1 campaign
pro:    unlimited leads, 999 proposals/month, 10 campaigns
agency: unlimited everything
```

Weekly counter resets every 7 days. Bonus leads (from referrals/social sharing) add to the free tier limit.

### SessionStorage cache

Lead results are cached in `sessionStorage` with key `icl_cache_v`. Current version: `"4"`. If the lead data shape changes, bump this string to bust stale caches across all three dashboard pages (`leads`, `live-jobs`, `local-leads`).

---

## 8. Blog System

### Two types of posts

1. **Static posts** — hardcoded in `src/data/blog-posts.ts`. These are legacy; do not add new ones here.
2. **DB posts** — created by the daily cron job from `src/data/blog-queue.ts`. These are the canonical posts going forward.

### Daily cron publisher

- **Schedule:** `0 9 * * *` (9am UTC every day) — defined in `vercel.json`
- **Route:** `GET /api/cron/publish-blog`
- **Auth:** Vercel sends `Authorization: Bearer CRON_SECRET` automatically
- **Logic:** Finds the first post in `BLOG_QUEUE` whose slug doesn't exist in DB yet, creates it
- **Queue:** `src/data/blog-queue.ts` — 25 posts covering target SEO keywords. Add more entries here to extend the queue.

### Blog post page rendering

`src/app/blog/[slug]/page.tsx` handles both static and DB posts:

- Static posts → content from `FULL_POSTS` dict in the same file → rendered via `renderContent()` (custom markdown parser)
- DB posts → content from `prisma.blogPost` → auto-detects HTML vs markdown:
  - If content starts with `<` → `dangerouslySetInnerHTML` (HTML)
  - Otherwise → `renderContent()` (markdown)

`renderContent()` handles: `#` `##` `###` `####` headings, `> ` blockquotes, `- ` bullet lists, `1. ` numbered lists, `**bold**` `*italic*` `` `code` `` inline formatting, `---` dividers.

### Comments

`BlogComments` component loads on every blog post page. API at `GET/POST /api/blog/comments`.

Spam protection layers: honeypot field, IP rate limit (5/hour), spam keywords, URL-in-name check, excessive links check, duplicate detection, HTML stripping.

Tables auto-create on first request (no manual migration needed).

---

## 9. Key Components

| Component | What it does |
|---|---|
| `HomepageClient.tsx` | Full homepage — hero, features, pricing, testimonials, FAQ. Large file (~600 lines). |
| `Navbar.tsx` | Top nav with mobile overlay menu. Reads announcement banner height to offset mobile menu. |
| `NicheSelector.tsx` | Multi-select niche picker. Supports both `selectedMany`/`onChangeMany` (multi) and `selected`/`onChange` (single/legacy). |
| `BonusLeadsModal.tsx` | "+300 leads" modal — subscribe/share flows. Calls `/api/leads/claim-bonus`. |
| `BlogComments.tsx` | Comment + reply UI. Client component, fetches from API client-side. |
| `ErrorBoundary.tsx` | React class component wrapping dashboard pages to catch runtime crashes. |
| `FloatingChat.tsx` | Support chat widget (bottom-right). |
| `PostHogProvider.tsx` | PostHog analytics wrapper (wraps app in `layout.tsx`). |

---

## 10. API Routes Reference

### Public

| Route | Method | Description |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handlers |
| `/api/auth/register` | POST | New account creation |
| `/api/blog/comments` | GET | Fetch comments for a post (`?slug=`) |
| `/api/blog/comments` | POST | Submit comment/reply |
| `/api/contact` | POST | Contact form |
| `/api/notify-launch` | POST | Early access email capture |

### Authenticated (USER)

| Route | Method | Description |
|---|---|---|
| `/api/leads/search` | POST | Search leads across all sources |
| `/api/leads/save` | GET/POST/DELETE | Saved leads pipeline |
| `/api/leads/claim-bonus` | POST | Claim bonus leads (subscribe/share/refer) |
| `/api/local-leads/search` | POST | Search local businesses without websites |
| `/api/usage` | GET | Current usage stats |
| `/api/proposal/generate` | POST | GPT-4o-mini proposal generation |
| `/api/reply/generate` | POST | GPT-4o-mini reply generation |
| `/api/email/send` | POST | Send email via Resend |
| `/api/email/settings` | GET/POST | SMTP/email config per user |
| `/api/emails/sent` | GET | Sent email history |
| `/api/campaigns` | GET/POST/PATCH/DELETE | Campaign management |
| `/api/templates` | GET/POST/PATCH/DELETE | Email templates |
| `/api/followup` | GET/POST | Follow-up scheduling |
| `/api/user/profile` | GET/PATCH | Profile updates |
| `/api/user/upgrade` | POST | Plan upgrade |
| `/api/ai-proposal` | POST | Alt proposal endpoint |

### Admin only

| Route | Method | Description |
|---|---|---|
| `/api/admin/stats` | GET | Platform-wide stats |
| `/api/admin/users` | GET/PATCH/DELETE | User management |
| `/api/admin/broadcast` | POST | Send broadcast email to all users |
| `/api/admin/marketing` | GET/POST | Marketing email management |
| `/api/admin/revenue` | GET | Revenue stats |
| `/api/admin/growth` | GET | Member growth stats |
| `/api/admin/support` | GET/PATCH | Support tickets |
| `/api/admin/audit` | GET | Audit log |
| `/api/admin/settings` | GET/POST | Platform settings |
| `/api/blog` | GET/POST/PATCH/DELETE | Blog CMS (admin) |
| `/api/blog/auto-post` | POST | Manually trigger blog post creation |

### Protected system routes

| Route | Auth | Description |
|---|---|---|
| `/api/cron/publish-blog` | `CRON_SECRET` | Daily blog publisher (Vercel Cron) |
| `/api/db/migrate` | `MIGRATE_SECRET` query param | Run raw SQL migrations |
| `/api/webhooks/stripe` | Stripe signature | Payment webhooks |

---

## 11. Styling Guide

- **CSS framework:** Tailwind CSS v3 with custom CSS variables
- **Color scheme:** Dark by default (`--background: 240 20% 6%`). Light mode available via `html.light` class overrides in `globals.css`
- **Primary color:** Violet/purple (`--primary: 263 79% 57%`)
- **Accent:** Emerald green (`--accent: 158 100% 43%`)
- **Font:** Inter (Google Fonts, loaded in `layout.tsx`)
- **Custom classes:** `gradient-text`, `gradient-hero`, `bg-gradient-card`, `bg-surface`, `blog-content` (and child selectors for blog typography)
- **Blog content styles:** All in `globals.css` under `/* Blog content styles */` — h2 has purple left border, blockquote has emerald left border

---

## 12. SEO Setup

| File | What it does |
|---|---|
| `src/app/sitemap.ts` | 36 URLs — homepage, blog posts (DB + static), `/for/[industry]` x12, `/features/` pages, tools |
| `src/app/robots.ts` | Allows all, points to sitemap. Host: `icloseleads.com` |
| `src/app/opengraph-image.tsx` | Dynamic branded OG image (Next.js ImageResponse) |
| `src/app/contact/layout.tsx` | Exports metadata for the contact page (client component workaround) |
| `src/app/for/[industry]/page.tsx` | 12 programmatic landing pages (web designers, copywriters, etc.) |
| `public/llms.txt` | LLM-readable site description |
| GA4 | `G-WRSW1WG2DY` — loaded in `layout.tsx` via `next/script afterInteractive` |

---

## 13. Things NOT to Do

- **Never** run `prisma db push --accept-data-loss` on production
- **Never** hardcode secrets, API keys, or credentials in source files
- **Never** push directly to Vercel by connecting GitHub — always use `deploy-limits.sh`
- **Never** edit `src/app/dashboard/local-leads/page.tsx`, `src/app/dashboard/live-jobs/page.tsx`, `src/lib/leads-aggregator.ts`, or `src/lib/local-leads-engine.ts` in this repo and expect them to deploy — those files come from `main-project/` at deploy time and will be overwritten
- **Never** modify `src/components/NicheSelector.tsx` to remove the `selectedMany`/`onChangeMany` props — the leads page depends on them
- **Never** change the `icl_cache_v` session storage key without bumping the version string in all three dashboard pages that use it

---

## 14. Local Development

```bash
cd freelanceflow-v2
npm install
cp .env.example .env   # fill in values
npm run db:generate    # generate Prisma client
npm run db:push        # push schema to local SQLite
npm run dev            # start dev server at localhost:3000
```

For local dev, `DATABASE_URL="file:./dev.db"` in `.env` — SQLite only. The local DB has no production data.

---

## 15. Pricing / Plans

| Plan | Leads/week | Proposals/month | Campaigns |
|---|---|---|---|
| free | 20 | 10 | 1 |
| pro | Unlimited | 999 | 10 |
| agency | Unlimited | 999 | 999 |

Bonus leads (free plan only) are earned by:
- Subscribing to email list (+100)
- Sharing on social media (+100)
- Referring a friend (+100, tracked via `referralCode`)

---

## 16. Admin Access

Admin panel at `/admin` — requires `role: "ADMIN"` in DB.

Key pages:
- `/admin` — overview stats
- `/admin/users` — manage all users, change plan, suspend, delete
- `/admin/blog` — create/edit/publish blog posts
- `/admin/support` — view and resolve support tickets
- `/admin/broadcast` — send email to all users
- `/admin/marketing` — marketing email management
- `/admin/settings` — platform-wide settings (stored in `PlatformSetting` table)

---

## 17. Backup Location

Local backups are stored at:
```
~/Documents/Claude/Projects/icloseleads/backups/YYYY-MM-DD/
```

Current backups:
- `2026-06-08/` — initial backup
- `2026-06-16/` — latest (post blog comments, markdown fix, daily cron, mobile fixes)

Each backup contains: `freelanceflow-v2-src.tar.gz`, `main-project-src.tar.gz`, `deploy-limits.sh`
