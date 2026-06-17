# FreelanceFlow v2 — AI-Powered Client Acquisition for Freelancers

A production-grade SaaS web application built with Next.js 14, TypeScript, Prisma, and AI integrations. Find leads, generate personalized proposals, send outreach emails, and track everything — all in one platform.

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Prisma + SQLite (swappable to PostgreSQL)
- **Auth:** NextAuth.js with role-based access (USER / ADMIN)
- **Lead Discovery:** Hunter.io API
- **Proposal AI:** OpenAI GPT-4o-mini
- **Email Delivery:** Resend
- **Analytics:** Recharts
- **Animations:** Framer Motion
- **Testing:** Jest + React Testing Library

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/yourname/freelanceflow-v2.git
cd freelanceflow-v2
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in your `.env` file:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
HUNTER_API_KEY="your-hunter-api-key"       # https://hunter.io/api-keys
OPENAI_API_KEY="your-openai-api-key"        # https://platform.openai.com/api-keys
RESEND_API_KEY="your-resend-api-key"        # https://resend.com/api-keys
RESEND_FROM_EMAIL="hello@yourdomain.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set up the database

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to SQLite
```

### 4. Create an admin account

Register at `http://localhost:3000/auth`, then promote yourself to admin via Prisma Studio:

```bash
npm run db:studio
```

In Studio, find your user and set `role` to `ADMIN`.

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
freelanceflow-v2/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx           # Landing page
│   │   ├── auth/              # Sign in / Sign up
│   │   ├── dashboard/         # Customer panel (role: USER)
│   │   ├── admin/             # Admin panel (role: ADMIN)
│   │   └── api/               # API routes
│   ├── components/            # Shared UI components
│   │   ├── charts/            # Recharts wrappers
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── LeadsTable.tsx
│   │   ├── ProposalEditor.tsx
│   │   └── ...
│   ├── lib/                   # Server-side utilities
│   │   ├── auth.ts            # NextAuth config
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── hunter.ts          # Hunter.io client
│   │   ├── openai.ts          # OpenAI client
│   │   └── resend.ts          # Resend email client
│   └── types/                 # Shared TypeScript types
└── __tests__/                 # Jest test suites
    ├── api/                   # API route tests
    ├── lib/                   # Library function tests
    └── components/            # Component tests
```

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create new user account |
| POST | `/api/leads/search` | Search leads via Hunter.io |
| POST | `/api/leads/save` | Save a lead to your pipeline |
| GET | `/api/leads/save` | Get saved leads (paginated) |
| DELETE | `/api/leads/save?id=` | Delete a saved lead |
| POST | `/api/proposal/generate` | Generate AI proposal via OpenAI |
| POST | `/api/email/send` | Send email via Resend |
| GET | `/api/emails/sent` | Get sent email history |
| GET | `/api/dashboard/stats` | Get user analytics data |
| GET | `/api/admin/stats` | Get platform-wide stats (ADMIN) |
| GET | `/api/admin/users` | List all users (ADMIN) |
| PATCH | `/api/admin/users` | Update user role/status (ADMIN) |
| DELETE | `/api/admin/users?id=` | Delete user (ADMIN) |
| GET/POST/DELETE | `/api/blog` | Blog post CRUD (ADMIN) |
| GET | `/api/templates` | Get proposal templates |
| POST | `/api/templates` | Create custom template |
| GET/POST/PATCH/DELETE | `/api/campaigns` | Campaign management |
| GET/PATCH | `/api/user/profile` | User profile |
| POST | `/api/contact` | Contact form submission |

---

## Running Tests

```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report
```

### Test Coverage

- `__tests__/api/leads.test.ts` — Lead search and save API
- `__tests__/api/proposal.test.ts` — Proposal generation API
- `__tests__/api/email.test.ts` — Email sending API
- `__tests__/lib/hunter.test.ts` — Hunter.io client
- `__tests__/lib/openai.test.ts` — OpenAI client
- `__tests__/components/NicheSelector.test.tsx` — NicheSelector component
- `__tests__/components/StatsCard.test.tsx` — StatsCard component

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add all environment variables in Vercel dashboard
4. Set `DATABASE_URL` to a PostgreSQL connection string (e.g., Neon, Supabase, PlanetScale)
5. Update `prisma/schema.prisma` `provider` from `"sqlite"` to `"postgresql"`
6. Deploy

### PostgreSQL Migration

Change in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then run `npm run db:push` (or `prisma migrate deploy` in production).

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | SQLite: `file:./dev.db` · PostgreSQL: `postgresql://...` |
| `NEXTAUTH_SECRET` | ✅ | Random secret: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ | Your app URL (e.g., `https://yourdomain.com`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth sign-in credentials |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | ✅ | GitHub OAuth App credentials |
| `HUNTER_API_KEY` | ✅ | From [hunter.io/api-keys](https://hunter.io/api-keys) |
| `OPENAI_API_KEY` | ✅ | From [platform.openai.com](https://platform.openai.com/api-keys) |
| `RESEND_API_KEY` | ✅ | From [resend.com](https://resend.com/api-keys) |
| `RESEND_FROM_EMAIL` | ✅ | Must be a verified domain in Resend |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public URL for sitemap/OG tags |

---

## Features

### Customer Dashboard (`/dashboard`)
- **Lead Finder** — Search any domain for verified email contacts via Hunter.io
- **Saved Leads** — Pipeline view with status tracking (New → Proposal Sent → Replied → Closed)
- **AI Proposal Builder** — GPT-4o-mini generates personalized proposals per prospect
- **Email Templates** — 5 built-in niche-specific templates + custom templates
- **Campaigns** — Organize outreach into named campaigns
- **Sent Emails** — Full history with expandable body view
- **Analytics** — Charts, niche breakdowns, best send times
- **Profile Setup** — Completion meter, niche selection, bio, rate, portfolio

### Admin Panel (`/admin`)
- **Dashboard** — Platform-wide stats and recent activity
- **User Management** — Search, filter, suspend, promote, delete users
- **User Detail** — Full profile + their leads and emails
- **Email Log** — All emails sent across the platform
- **Lead Database** — All leads with niche analytics
- **Blog CMS** — Create, publish, and manage blog posts
- **Contact Submissions** — Manage contact form messages
- **Platform Settings** — Site config, API key status, maintenance mode

### Public Marketing Pages
- Landing page with animated hero, features, testimonials, pricing, FAQ
- Features deep-dive with comparison table vs Upwork/Fiverr
- Pricing page with billing FAQ and money-back guarantee
- About page with mission, values, and team
- Blog with 6 full articles and dynamic routing
- Contact form with DB persistence
- Privacy Policy (GDPR-compliant)
- Terms of Service
- Dynamic `sitemap.xml` and `robots.txt`

---

## Type Safety

All code is written in strict TypeScript with `noImplicitAny: true` and `strictNullChecks: true`. Run the type checker at any time:

```bash
npm run type-check
```

---

## License

MIT — Built with ❤️ for freelancers worldwide.
