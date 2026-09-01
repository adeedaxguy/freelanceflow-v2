# FreelanceFlow — Go-Live Guide

> Two paths: **Cheap Route** (free tier, ~$0/mo, ready in ~30 min) or **Proper Route** (paid, production-grade, ready in ~2 hours).

---

## What's New in This Build

The Find Leads pipeline was rebuilt end-to-end. Before launching, know what changed:

- **8 lead sources**: RemoteOK, Remotive, Reddit, WeWorkRemotely, Arbeitnow, Jobicy, Working Nomads, HackerNews "Who's Hiring".
- **Multi-niche search**: pick up to 10 niches; keyword sets are merged and de-duped.
- **Fresh-only time ranges**: 12h / 24h / 48h / 72h / 7d (no more 30d noise).
- **Auto-broaden fallback**: if a 24h window returns 0 leads, the API silently retries at 7 days and tells the UI it widened.
- **Force Refresh button**: bypasses Next's fetch cache (`cache: 'no-store'`) so cold searches always pull fresh.
- **Reddit OAuth fallback**: production IPs (Vercel, Lambda) get 403'd on anonymous reddit.com. Add `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` and the aggregator switches to `oauth.reddit.com` automatically.
- **Diagnostics**: every search returns per-source success/failure counts so you can debug any "no leads" case without guessing.

---

## Admin Panel

- **URL:** `/admin`
- **Default Email:** `admin@freelanceflow.io`
- **Default Password:** `Admin@FF2025!`

> **Change this password the moment you log in.** Admin → Users → click your user → set new password.

---

# ROUTE A — Cheap Route ($0/month)

Vercel free + Neon free + Resend free + Reddit OAuth (free) + Groq free.
Works for up to ~hundreds of users. No credit card required for any service in this stack.

## Step A1 — Generate secrets locally

```bash
cd freelanceflow-v2
npm install
npx prisma generate

# Generate a NextAuth secret — copy the output, you'll paste it into env vars
openssl rand -base64 32
```

## Step A2 — Create the database (Neon, free tier — 0.5 GB)

1. Go to https://neon.tech, sign up with GitHub (no card needed).
2. Click **Create project**. Name it `freelanceflow`. Pick the region closest to your Vercel region.
3. Copy the **pooled connection string** that starts with `postgres://`. Keep it handy — this is your `DATABASE_URL`.
4. In `prisma/schema.prisma`, change the datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
5. Push the schema and seed:
   ```bash
   DATABASE_URL="postgres://..." npx prisma db push
   DATABASE_URL="postgres://..." npm run db:seed
   ```

## Step A3 — Create the Reddit OAuth app (5 min, free, fixes most "no leads" cases)

Vercel/Lambda/Cloudflare IPs get 403'd by anonymous reddit.com about half the time. With OAuth set up, Reddit becomes a reliable source.

1. Visit https://www.reddit.com/prefs/apps (logged in to your Reddit account).
2. Click **"are you a developer? create an app..."** at the bottom.
3. Choose **script** type. Name it `freelanceflow`. Redirect URI: `http://localhost:3000` (unused but required).
4. Click **create app**. You'll see two values:
   - **client ID** — the short string under your app name (looks like `aBcD1234EfGhIj`)
   - **client secret** — the longer string in the secret field
5. Save those — they go into env vars below.

## Step A4 — Get a free email sender (Resend, 3000 emails/mo free)

1. Go to https://resend.com, sign up.
2. **Domains** → **Add Domain** → enter your domain (e.g. `yourapp.com`).
3. Add the DNS records Resend gives you to your domain provider. Wait for verification (~5 min).
4. **API Keys** → create one called `production`. Copy the value.

> Don't have a custom domain yet? Skip Resend for now and the system will use SMTP fallback OR fall back to "demo mode" where emails are logged but not sent. Set up Resend before your first paid customer.

## Step A5 — Get a free AI key for proposals (Groq, generous free tier)

1. Go to https://console.groq.com, sign in.
2. **API Keys** → **Create API Key**. Name it `freelanceflow-prod`. Copy.
3. The default model `llama-3.3-70b-versatile` is plenty good for proposal generation.

## Step A6 — Push to GitHub

```bash
cd freelanceflow-v2
git init
git add .
git commit -m "Initial commit"
gh repo create freelanceflow --private --source=. --push
# OR manually create the repo on github.com and push
```

## Step A7 — Deploy to Vercel (free, no card)

1. Go to https://vercel.com, sign in with GitHub.
2. **Add New** → **Project** → import the `freelanceflow` repo.
3. **Framework Preset** = Next.js (auto-detected).
4. Expand **Environment Variables** and paste these in. Add to **Production**, **Preview**, and **Development**:

```env
DATABASE_URL=postgres://...                     # from Neon
NEXTAUTH_URL=https://your-vercel-url.vercel.app # update after first deploy
NEXTAUTH_SECRET=...                             # from openssl rand
GROQ_API_KEY=gsk_...                            # from Groq
RESEND_API_KEY=re_...                           # from Resend (skip if not set up)
RESEND_FROM_EMAIL=hello@yourdomain.com          # must be verified in Resend
REDDIT_CLIENT_ID=...                            # from Reddit (Step A3)
REDDIT_CLIENT_SECRET=...                        # from Reddit (Step A3)
NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app
```

5. Click **Deploy**. First build takes ~2 min.
6. Once deployed, Vercel gives you a URL like `https://freelanceflow-abc123.vercel.app`. Copy it.
7. Go back to **Settings → Environment Variables**, update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to that real URL. Hit **Redeploy** on the latest deployment.

## Step A8 — Smoke test (10 min — DO NOT skip)

Open your deployed URL and walk through this exact flow:

1. **Sign up** with a real email. Confirm you can log in.
2. Go to **Find Leads**, pick `Web Development`, time range `24h`, hit **Find Real Leads**.
   - **Expected:** 5–30 leads in 5–8 seconds. If 0 leads, click the **Sources** chip — at least 5/8 should be green. If 3+ are red (errors), check Vercel logs.
   - **If Reddit is red:** double-check `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` in Vercel env vars.
3. **Save** one lead. Confirm it appears in `/dashboard/saved-leads`.
4. Click **AI Apply** on a lead. Confirm a proposal is generated. If it says `source: "template"` instead of `source: "groq"`, your `GROQ_API_KEY` isn't loaded — re-check.
5. **Send** the proposal to a test email of yours. Confirm delivery.
6. Promote your account to admin: in Neon SQL editor, run:
   ```sql
   UPDATE "User" SET role = 'ADMIN', plan = 'agency' WHERE email = 'YOUR_EMAIL';
   ```
7. Visit `/admin` and confirm you have access.

If any of these fail, the **Sources** chip on the leads page tells you exactly which source errored — fix that one rather than blaming the whole pipeline.

## Cheap-route monthly cost: $0

Limits to watch:
- Neon free: 0.5 GB DB (good for ~50k leads / 10k users).
- Vercel free: 100 GB bandwidth, 100 hours of serverless function compute. Most SaaS launches stay well under.
- Resend free: 3000 emails/mo and 100/day. Above that you'll need a paid plan.
- Groq free: rate-limited but generous. The system auto-falls-back to a template proposal if you hit the limit.
- Reddit OAuth: 60 requests/minute (more than enough).

---

# ROUTE B — Proper Route (production-grade, ~$30–60/month)

Use this once you have paying customers or expect spiky traffic.

## Differences from cheap route

| Service | Cheap | Proper |
|---|---|---|
| DB | Neon free (0.5 GB) | Neon Pro $19/mo (10 GB, autoscale, point-in-time restore) — OR — Supabase Pro $25/mo |
| Hosting | Vercel free | Vercel Pro $20/mo (commercial use, longer fn timeouts, team features) |
| Email | Resend free (3000/mo) | Resend Pro $20/mo (50k/mo, dedicated IP option) |
| AI | Groq free | Groq paid + OpenAI fallback |
| Monitoring | Vercel logs only | Sentry free tier + Better Stack uptime |
| Domain | `*.vercel.app` | Your own domain on Cloudflare DNS |
| CDN/WAF | Vercel default | Cloudflare in front (rate limit, bot block) |
| Backups | Neon free PITR (7 days) | Neon Pro PITR (30 days) + nightly off-site dump |

## Step B1 — Custom domain on Cloudflare

1. Buy domain on https://www.cloudflare.com/products/registrar (no markup, often cheapest).
2. In Cloudflare DNS, add: `A  @  76.76.21.21  Proxied=ON` (Vercel's edge IP). Or use the CNAME Vercel gives you.
3. In Vercel **Settings → Domains**, add your domain. Vercel auto-issues SSL.
4. Update env vars: `NEXTAUTH_URL=https://yourdomain.com`, `NEXT_PUBLIC_APP_URL=https://yourdomain.com`. Redeploy.

## Step B2 — Upgrade DB to Neon Pro

In Neon dashboard → **Settings** → **Plan** → upgrade to Pro.

Then enable **Point-in-Time Restore** for 30 days. This alone is worth the $19/mo if you ever fat-finger a `DELETE` query.

## Step B3 — Add Sentry (free tier, 5k errors/mo)

```bash
npx @sentry/wizard@latest -i nextjs
```

Follow prompts, paste DSN into Vercel env vars.

## Step B4 — Add Cloudflare in front of Vercel

In Vercel **Settings → Domains**, set domain to "Cloudflare proxied (orange cloud)" mode. In Cloudflare:
- **Security → WAF** → enable the OWASP managed ruleset.
- **Security → Bots** → set bot fight mode ON.
- **Rules → Rate Limiting** → add rule: max 30 requests / 10 sec for `/api/*` paths.

This stops most scraping attacks before they hit Vercel.

## Step B5 — Set up nightly DB backups (off-site)

Even with Neon's PITR, take an external dump nightly. Cron on a $5 Hetzner box or GitHub Actions:

```yaml
# .github/workflows/db-backup.yml
name: Nightly DB Backup
on:
  schedule: [{ cron: '0 3 * * *' }]
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Dump
        run: pg_dump "$DATABASE_URL" | gzip > backup-$(date +%Y%m%d).sql.gz
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      - name: Upload to R2
        # use any S3-compatible storage; Cloudflare R2 has 10GB free
        run: aws s3 cp backup-*.sql.gz s3://my-backups/ --endpoint-url $R2_ENDPOINT
        env:
          AWS_ACCESS_KEY_ID:     ${{ secrets.R2_KEY }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.R2_SECRET }}
          R2_ENDPOINT:           ${{ secrets.R2_ENDPOINT }}
```

## Step B6 — Add OpenAI as a Groq fallback

In Vercel env vars, add `OPENAI_API_KEY`. The proposal generator already has Groq → template fallback; OpenAI fits between them. (Add a small patch to `src/app/api/proposal/generate/route.ts` if you want explicit OpenAI fallback — Groq alone is already 90% reliable.)

## Step B7 — Stripe billing for paid plans

`/api/webhooks/stripe/route.ts` is already wired. Set up:

1. https://stripe.com → create products **Pro** ($19/mo) and **Agency** ($49/mo).
2. Copy the price IDs into the upgrade page (`src/app/dashboard/upgrade/UpgradeClient.tsx`).
3. Add env vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and the four `STRIPE_{PRO|AGENCY}_{MONTHLY|ANNUAL}_PRICE_ID` values.
4. Set up the webhook endpoint in Stripe pointing to `https://yourdomain.com/api/webhooks/stripe`.

## Proper-route monthly cost: ~$30–60

- Neon Pro: $19
- Vercel Pro: $20 (only if your traffic exceeds free limits)
- Resend Pro: $20 (only if you exceed 3000 emails/mo)
- Domain: ~$10/yr
- Cloudflare: free
- Sentry: free up to 5k errors/mo

You can stay under $20/mo until you have 50+ paying customers — Vercel and Resend free tiers are very generous.

---

## Pre-Launch Checklist (do this before driving traffic)

- [ ] All env vars set in Vercel (production + preview)
- [ ] Reddit OAuth working (test by clicking Sources on a search — Reddit should show green and a non-zero count)
- [ ] Custom domain has SSL (green lock in browser)
- [ ] Default admin password CHANGED
- [ ] At least one paid plan tested via Stripe test mode
- [ ] Resend domain verified, test email delivers to gmail/outlook (not spam)
- [ ] Privacy policy + terms updated with your real business name
- [ ] Sitemap.xml resolves: `https://yourdomain.com/sitemap.xml`
- [ ] robots.txt allows crawlers: `https://yourdomain.com/robots.txt`
- [ ] Run **Find Leads** with each of the 15 niches. Each should return ≥5 leads in a 7d window. If a niche returns 0, the Sources panel will tell you which API failed.

---

## Post-Launch — Things to monitor in week one

- **Find Leads success rate**: in Vercel logs, search for `Lead search error`. Target: <1% of searches.
- **Source health**: visit `/dashboard/leads` daily, click **Sources**, note any source that's been red for >24h. RemoteOK and Reddit are the most fragile; HN and Arbeitnow are the most reliable.
- **Email deliverability**: send a test from `production` to a fresh Gmail address every day. If it lands in spam, your Resend domain reputation needs warming.
- **DB row count**: in Neon dashboard. If `Lead` grows past 100k, set up an archive job (delete leads older than 90 days that aren't saved by any user).
- **Vercel function timeouts**: `/api/leads/search` is the heaviest. Each fetch has a 7–9 second timeout, all 8 sources run in parallel, so worst case is ~10 seconds. If you see timeouts on Vercel free (10s limit), upgrade to Pro (60s limit) or reduce the source count.

---

## Fast-recovery cheat sheet

**"Find Leads returns 0 results"**
1. Click **Sources** chip on the page. Read the per-source counts.
2. If 5+ sources are red: a network issue or Vercel region problem. Check Vercel **Status** dashboard.
3. If only Reddit is red: re-check `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET`. Try removing OAuth env vars temporarily to fall back to anonymous.
4. If sources are green but `kept` is 0: the niche keywords aren't matching anything. Try widening the time range to 7d.
5. If `requestedMaxHours` differs from `effectiveMaxHours` in diagnostics: auto-broaden kicked in (working as designed).

**"Proposals say `source: template` instead of `source: groq`"**
- `GROQ_API_KEY` is missing or invalid. Check Vercel env vars. The template fallback still works — users still get a proposal — but your proposals are generic.

**"Emails not sending"**
- Check `/dashboard/email-settings`. If using Resend: domain must be verified. If using SMTP: test connection on the settings page first.
- Check `SentEmail` table in DB — if rows have `status = "FAILED"`, the body field has the error.

**"Database connection error"**
- Neon's free tier scales-to-zero after 5 min idle. First request after idle has a 1–2s cold start (this is normal).
- If `DATABASE_URL` references the pooled endpoint (recommended): you should never run out of connections.

---

## Going Viral — Operational Capacity

Each hardening step lets you handle ~10× more traffic:

| Stage | Users | What breaks first | Fix |
|---|---|---|---|
| Day 1–14 | 0–500 | Nothing | — |
| 500–5k | Vercel free fn-hours | Upgrade to Pro |
| 5k–50k | Neon free DB connections | Upgrade Neon to Pro + add connection pooling |
| 50k–500k | Resend free email cap | Upgrade Resend to Pro + add SES as secondary |
| 500k+ | Source rate limits | Cache aggressively + add YOUR OWN job board scrapers |

The find-leads pipeline is now the bottleneck for viral growth — at ~50k DAU, the third-party APIs WILL rate-limit you. Plan to add your own scraping or paid API tier at that scale.

---

Built with care. Ship fast, fix fast, and don't forget to change the admin password.
