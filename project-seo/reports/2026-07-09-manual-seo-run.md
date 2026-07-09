# 2026-07-09 Manual SEO Run

## Research Summary

Google Search Console shows iCloseLeads earning impressions for high-intent terms such as "web design leads", "freelance cold outreach", "exclusive web design leads", "leads for web design", "ai consulting clients", and "ai search optimisation for small business". Live Google SERPs confirm the strongest near-term opportunity is practical, signup-intent support content around web design lead discovery, businesses without websites, local business leads, remote job leads, decision maker checks, and cold outreach.

RankyTools/Ahrefs was not accessible in the in-app browser session because the tool redirected to login, so this run used browser-first GSC review plus live Google SERP inspection.

## Shipped Assets

- Added `/resources` as a new SEO resource hub.
- Added 13 indexable resource pages targeting commercial and support-intent searches:
  - `/resources/web-design-leads`
  - `/resources/businesses-without-websites`
  - `/resources/freelance-cold-outreach`
  - `/resources/local-business-leads-for-web-designers`
  - `/resources/exclusive-web-design-leads`
  - `/resources/outdated-website-leads`
  - `/resources/remote-job-leads`
  - `/resources/ai-consulting-clients`
  - `/resources/decision-maker-finder`
  - `/resources/ai-proposal-generator-for-freelancers`
  - `/resources/freelance-client-acquisition`
  - `/resources/live-job-leads`
  - `/resources/website-design-prospecting`
- Added Article, FAQPage, BreadcrumbList, CollectionPage, and ItemList structured data coverage for the resource hub and templates.
- Added every resource URL to the sitemap.
- Added a footer link to `/resources` so the hub has sitewide internal discovery.
- Refreshed metadata and keyword targets on:
  - `/use-cases/remote-job-leads`
  - `/use-cases/freelance-cold-outreach`
  - `/use-cases/local-business-leads`
  - `/use-cases/live-job-leads`
  - `/features/lead-discovery`
  - `/features/ai-proposals`
  - `/features/email-outreach`

## Local QA

- `npm run build` passed.
- `npm run type-check` passed after the build regenerated `.next/types`.
- Local mobile QA on `/resources` and representative resource pages passed:
  - no 404 state
  - no horizontal overflow at 390px viewport
  - `index, follow` robots meta present
  - canonical URLs point to `https://icloseleads.com`
  - JSON-LD present
  - signup links present

## Next Actions

- Monitor GSC impressions for the new `/resources/*` paths after indexing.
- Once Ahrefs/RankyTools login is available in the browser, validate keyword difficulty and competitor gaps for the next support-content batch.
- Add deeper original examples or screenshots to the highest-impression resource pages after the first 7-14 days of GSC data.
