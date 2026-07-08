# Daily SEO Note

Date: 2026-07-09
Project: iCloseLeads

## Discovery

- Active deployable app path confirmed as `/Users/adeedaxguy/Documents/Codex/2026-06-16/double-check-now-i-have-connected/work/freelanceflow-v2`.
- Existing SEO workspace found in `project-seo/` and `seo/`.
- Public SEO surface still confirmed in-repo: dynamic sitemap, robots route, programmatic `/for/*` pages, blog article metadata/schema helpers, and article enhancement panels driven by `src/lib/blog-seo.ts`.

## Live GSC Signals

Source: Google Search Console browser UI.
Property: `sc-domain:icloseleads.com`.
Account: `adnan.toprated@gmail.com`.
Search type: Web.
Visible date range: 11 June 2026 to 6 July 2026.
Visible freshness: `Last update: 5 hours ago`.

- Totals: 7 clicks, 271 impressions, 2.6% CTR, average position 32.8.
- Top visible queries by impressions:
  - `web design leads`: 20 impressions, 0 clicks.
  - `freelance cold outreach`: 16 impressions, 0 clicks.
  - `iclose`: 9 impressions, 0 clicks.
  - `exclusive web design leads`: 9 impressions, 0 clicks.
  - `leads for web design`: 8 impressions, 0 clicks.
  - `icloser`: 7 impressions, 0 clicks.
  - `aantal leads berekenen`: 7 impressions, 0 clicks.
  - `ai consulting clients`: 6 impressions, 0 clicks.
- Top visible pages by impressions:
  - `https://www.icloseleads.com/`: 26 impressions, 3 clicks.
  - `https://icloseleads.com/`: 21 impressions, 2 clicks.
  - `https://icloseleads.com/blog/best-lead-sources-for-web-design-agencies`: 64 impressions, 1 click.
  - `https://icloseleads.com/features/email-outreach`: 17 impressions, 1 click.
  - `https://icloseleads.com/blog/find-clients-for-ai-consulting`: 17 impressions, 0 clicks.
  - `https://icloseleads.com/tools/lead-calculator`: 17 impressions, 0 clicks.

## Live Indexing / Sitemap Signals

Source: Google Search Console browser UI.
Property: `sc-domain:icloseleads.com`.

- Page indexing: 82 indexed, 54 not indexed.
- Not indexed reasons:
  - `Discovered – currently not indexed`: 49
  - `Duplicate without user-selected canonical`: 3
  - `Page with redirect`: 2
- Sitemap status:
  - `https://icloseleads.com/sitemap.xml`
  - Submitted: 12 June 2026
  - Last read: 8 July 2026
  - Status: Success
  - Discovered pages: 142

## Live GA4 Signals

Source: GA4 browser UI.
Account/property: `icloseleads.com / icloseleads`.
Visible date range: `Last 7 days` on GA4 Home cards. Exact dates were not shown in the visible home view.

- Home totals: 6 active users, 54 views, 131 events, 0 key events.
- Sessions by default channel group:
  - Referral: 11
  - Organic Search: 5
  - Direct: 4
  - Unassigned: 4
  - Cross-network: 1
- Top page titles by views:
  - `iCloseLeads - Freelance Lead Generation and Cold Outreach Software`: 36
  - `iCloseLeads: Freelance Lead Generation Software for Cold Outreach`: 5
  - Several lower-volume utility/legal pages at 1 view each.
- Top visible events:
  - `page_view`: 54
  - `session_start`: 21
  - `scroll`: 16
  - `form_start`: 15
  - `click`: 12
  - `user_engagement`: 9
  - `first_visit`: 4
- Important limitation:
  - GA4 is still showing `0` key events.
  - GA4 is also prompting to link Search Console property `sc-domain:icloseleads.com` for organic query + landing page analysis.

## Ahrefs / RankyTools Status

Source attempted: RankyTools Ahrefs Site Explorer browser flow.

- Result: unavailable this run.
- Current state: redirected to RankyTools login page instead of an authenticated Ahrefs session.
- Action: treated as unavailable; no competitor/backlink/top-pages pull was used for prioritization today.
- Follow-up: update `project-seo/tool-access.md` once RankyTools session access is restored in-browser.

## Shipped

- Added a dedicated `webdesign` topic router in `src/lib/blog-seo.ts`.
- Added web-design-cluster internal links so blog enhancement panels can now route matching articles toward:
  - `/for/web-designers`
  - `/blog/local-business-leads-for-web-designers`
  - `/blog/find-web-design-clients-near-me`
  - `/use-cases/local-business-leads`
- Added matching trusted-reference links for the new topic bucket.

## Why This Action Won

- GSC’s strongest non-brand query cluster is still web-design intent:
  - `web design leads`
  - `exclusive web design leads`
  - `leads for web design`
- GSC’s strongest non-homepage page by impressions is still:
  - `https://icloseleads.com/blog/best-lead-sources-for-web-design-agencies`
- GA4 confirms there is at least some organic activity, but not enough key-event quality data to justify a broader conversion-path rewrite yet.
- Ahrefs was unavailable, so the safest evidence-backed win was internal-link support for the exact cluster that Google is already testing the site on.

## Validation

- `npm run type-check` passed after the blog SEO router update.

## Deploy / GSC Actions

- No GSC URL inspection or request indexing was performed in this run.
- No sitemap submission change was needed because the current sitemap is already healthy and was read on 8 July 2026.
- If the web-design internal-link update is deployed, the first inspection candidate should be:
  - `https://icloseleads.com/blog/best-lead-sources-for-web-design-agencies`

## Watchlist

- `www` and non-`www` homepage URLs are still both visible in top GSC pages; keep watching host consolidation.
- GA4 Search Console linking is still missing in the visible property state.
- GA4 key events remain `0`, so SEO scoring should still prioritize GSC impressions/clicks/position over conversion assumptions.
- RankyTools/Ahrefs browser access regressed from the 2026-07-07 note and needs a fresh authenticated session before backlink or competitor work can resume.

## Next Measurement Date

- Recheck GSC and GA4 on 2026-07-10 after the next settled data refresh.
