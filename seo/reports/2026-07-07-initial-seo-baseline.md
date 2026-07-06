# Initial SEO Baseline

Date: 2026-07-07

## What Is Already In Place

- Dynamic sitemap at `/sitemap.xml`.
- Robots rules that block private app routes and allow public pages.
- Sitewide metadata and OG/Twitter metadata in the root layout.
- GA4 component with measurement ID `G-WRSW1WG2DY`.
- Public feature pages and use-case pages.
- Blog system with internal/outbound link helpers.
- `llms.txt` exists for AI discovery.
- Content cluster data already exists in `src/data/seo-content-cluster.ts`.

## Main SEO Gap

The project has good technical foundations, but Ahrefs and Search Console data need to become an operating loop:

1. Export data.
2. Score opportunities.
3. Refresh or create pages.
4. Add internal links.
5. Build relevant backlinks.
6. Check Search Console movement.

## Known Search Console Clues

Recent screenshots show impressions for:

- `web design leads`
- `freelance cold outreach`
- `exclusive web design leads`
- `leads for web design`
- `get web design leads`
- `website design prospect`
- `freelance client acquisition`
- `iclose`
- `icloser`

The highest product-fit cluster is web design leads/local business leads.

## Immediate Recommendations

1. Use Ahrefs Organic Keywords exports for US, UK, and Canada.
2. Run `npm run seo:score-ahrefs` to generate a keyword priority report.
3. Refresh `/use-cases/local-business-leads` around "web design leads" and "businesses without websites."
4. Refresh `/features/email-outreach` around "freelance cold outreach."
5. Keep brand copy consistent as `iCloseLeads` to reduce iClose/iCloser ambiguity.
6. Build one linkable resource around "web design leads" before doing backlink outreach.

## Risks

- Publishing too many blog posts without Ahrefs/GSC prioritisation can dilute internal authority.
- Chasing broad sales-intelligence competitors directly can pull the product away from its freelancer/agency positioning.
- Owner/decision-maker features must avoid overclaiming what public data can reliably provide.
- Ahrefs exports should stay private and are now ignored inside `seo/data/`.
