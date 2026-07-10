# iCloseLeads Daily SEO Check - 2026-07-11

## Source Evidence

### Sameer - Google Search Console
- Browser/profile: already-open Chrome `adnan.toprated@gmail.com`
- Property: `sc-domain:icloseleads.com`
- Report: Performance on Search results
- Date range: `3 months`, visible chart from `2026-06-11` through `2026-07-08`
- Filters: `Search type: Web`, query view and page view
- Snapshot:
  - `8` total clicks
  - `312` total impressions
  - `2.6%` average CTR
  - `32.5` average position
- Visible top queries:
  - `web design leads` - `20` impressions
  - `freelance cold outreach` - `16` impressions
  - `iclose` - `10` impressions
  - `icloser` - `10` impressions
  - `exclusive web design leads` - `9` impressions
  - `ai consulting clients` - `8` impressions
  - `leads for web design` - `8` impressions
- Visible top pages:
  - `/` - `3` clicks, `34` impressions
  - `https://www.icloseleads.com/` - `3` clicks, `28` impressions
  - `/blog/best-lead-sources-for-web-design-agencies` - `1` click, `71` impressions
  - `/features/email-outreach` - `1` click, `17` impressions
  - `/blog/find-clients-for-ai-consulting` - `24` impressions
  - `/tools/lead-calculator` - `20` impressions
- Indexing:
  - `82` indexed
  - `54` not indexed
  - Reasons: `Discovered - currently not indexed (49)`, `Duplicate without user-selected canonical (3)`, `Page with redirect (2)`
- Sitemaps:
  - `https://icloseleads.com/sitemap.xml`
  - Submitted `2026-06-12`
  - Last read `2026-07-10`
  - Status `Success`
  - `163` discovered pages
- Limitation: sampled through browser UI only; no export was taken.

### Sameer - GA4
- Browser/profile: already-open Chrome `adnan.toprated@gmail.com`
- Property/account visibility: authenticated GA4 property in URL `a397114900p540635529`; the sampled panes did not expose a clearer human-readable property label in visible DOM, but the page-title rows matched iCloseLeads URLs and titles.
- Reports used:
  - Home
  - Landing page
- Date ranges:
  - Home visible range: `Last 7 days`
  - Landing page visible range: `Last 28 days (13 Jun - 10 Jul 2026)`
- Snapshot:
  - Home: `11` active users, `0` key events, `360` event count, `150` views
  - Visible channel summary: `Direct 8`, `Organic Search 8`, `Unassigned 3`
  - Visible event summary: `page_view 150`, `session_start 37`, `form_start 32`, `scroll 23`
  - Landing page totals: `85` sessions, `25` active users, `21` new users, `2m 05s` average engagement, `0` key events
  - Leading landing paths: `/` with `33` sessions and `/dashboard/local-leads` with `12` sessions
- Interpretation:
  - Organic traffic exists and reaches signup/supporting pages.
  - `form_start` activity is present, but key-event instrumentation is still too weak to confirm signup or activation wins cleanly in GA4.
- Limitation: no comparison filter or export was used; findings are from visible report cards and tables only.

### Rayan - RankyTools/Ahrefs
- Browser/profile: already-open Chrome `adnan.toprated@gmail.com`
- Areas used:
  - Site Explorer overview
  - Organic keywords module
  - Referring domains module entry points
- Database/location sampled: `All locations`
- Snapshot for `icloseleads.com/` in `Subdomains` mode:
  - `507` backlinks
  - `355` referring domains
  - `0` organic keywords
  - `0` top pages traffic
  - `0` paid keywords
- Interpretation:
  - Ahrefs remains useful for backlink profile and authority checks.
  - Keyword database coverage is still too thin to drive prioritization; GSC remains the primary source for query selection.
- Limitation: no deeper competitor gap export was taken because overview-level data already showed zero organic keyword coverage for the domain in the sampled dataset.

### Rayan - Live SERPs and Competitor Sampling
- Browser: Chrome, US search (`gl=us`, `hl=en`, `pws=0`)
- Sampled queries:
  - `web design leads`
  - `freelance cold outreach`
  - `businesses without websites`
- Visible SERP patterns:
  - `web design leads`: Reddit discussion, Webleadr, Leadsify
  - `freelance cold outreach`: Double Your Freelancing, Reddit, Being Freelance
  - `businesses without websites`: Grape Leads, Reddit, Fundraise Insider, Outscraper
- Competitor/page observations:
  - `webleadr.com`: strong H1 around instant web design leads and businesses without websites
  - `doubleyourfreelancing.com/get-clients-through-cold-outreach/`: practical cold outreach angle with template/tool positioning
  - `grapeleads.com`: page rendered poorly in sampled session, so no reliable content extraction
- Takeaway:
  - Current SERPs reward practical workflows, specific prospecting language, and conversion-oriented framing over broad SaaS claims.

## Awais - 20-Item Agenda

| # | Item | Type | Source | Acquisition intent | Ship today |
|---|---|---|---|---|---|
| 1 | Refresh homepage signup schema action | Existing page/schema | GSC + conversion path | High | Yes |
| 2 | Tighten `/resources` metadata toward first-search intent | Existing page refresh | GSC + SERP | High | Yes |
| 3 | Tighten `/resources` hero copy toward signup/use intent | Existing page refresh | GA4 + SERP | High | Yes |
| 4 | Refresh resource-page CTA copy template | Template-wide UX | GA4 | High | Yes |
| 5 | Refresh `/use-cases` hero copy toward faster activation | Existing page refresh | GA4 | High | Yes |
| 6 | Refresh `/features/lead-discovery` acquisition framing | Existing page refresh | GSC + Ahrefs | High | Yes |
| 7 | Refresh `/features/email-outreach` proof + engagement framing | Existing page refresh | GSC + GA4 | High | Yes |
| 8 | Refresh `/features/crm-pipeline` activation framing | Existing page refresh | GA4 | Medium | Yes |
| 9 | Refresh `/resources/web-design-leads` metadata/proof | Existing page refresh | GSC + SERP | High | Yes |
| 10 | Refresh `/resources/businesses-without-websites` metadata/proof | Existing page refresh | GSC + SERP | High | Yes |
| 11 | Refresh `/resources/freelance-cold-outreach` metadata/proof | Existing page refresh | GSC + GA4 + SERP | High | Yes |
| 12 | Refresh `/resources/local-business-leads-for-web-designers` proof | Existing page refresh | GSC + SERP | High | Yes |
| 13 | Refresh `/resources/exclusive-web-design-leads` proof | Existing page refresh | GSC + SERP | High | Yes |
| 14 | Refresh `/resources/outdated-website-leads` proof | Existing page refresh | SERP + page fit | Medium | Yes |
| 15 | Refresh `/resources/ai-consulting-clients` proof | Existing page refresh | GSC | Medium | Yes |
| 16 | Refresh `/resources/remote-job-leads` with fresh proof | Existing page refresh | GA4 + page fit | Medium | No |
| 17 | Refresh `/blog/best-lead-sources-for-web-design-agencies` CTR surface | Existing page refresh | GSC | High | No - dirty worktree risk |
| 18 | Refresh `/blog/find-clients-for-ai-consulting` metadata and links | Existing page refresh | GSC | Medium | No - dirty worktree risk |
| 19 | Add 5-8 new authority prospects for current clusters | Authority | SERP + Ahrefs | High | Pending hub write |
| 20 | Update hub trackers and redeploy SEO Ops dashboard | Reporting/ops | Workflow requirement | High | Pending external write/deploy |

## Zara/Bilal/Hamdan - Shipped Batch

Shipped count: `15`

1. Homepage structured-data upgrade for signup action
2. `/resources` metadata refresh
3. `/resources` hero copy refresh
4. Resource-page template CTA refresh
5. `/use-cases` hero and conversion copy refresh
6. `/features/lead-discovery` conversion framing refresh
7. `/features/email-outreach` proof refresh
8. `/features/crm-pipeline` activation-proof refresh
9. `/resources/web-design-leads` refresh
10. `/resources/businesses-without-websites` refresh
11. `/resources/freelance-cold-outreach` refresh
12. `/resources/local-business-leads-for-web-designers` refresh
13. `/resources/exclusive-web-design-leads` refresh
14. `/resources/outdated-website-leads` refresh
15. `/resources/ai-consulting-clients` refresh

Note: countable shipped total is `15`. Fewer than `20` shipped because blog files with relevant opportunity signals are already dirty in the worktree and were intentionally avoided to prevent stomping unrelated in-progress edits.

## Nida - QA

- `npm run type-check` passed.
- `npm run build` passed.
- Existing build warning persisted during static generation:
  - `DATABASE_URL` missing during Prisma blog lookup in static generation logs.
  - Build still completed successfully.
- Risk audit:
  - No new claims, stats, reviews, or unsupported credentials were added.
  - No thin doorway pages were published.
  - Changes stayed inside acquisition pages and data-driven SEO copy layers.

## Blockers

1. Blog opportunity pages with live GSC impressions are already dirty in the worktree (`src/data/blog-posts.ts`, `src/data/pillar-posts.ts`), so they were left untouched today.
2. Hub tracker updates and SEO Ops dashboard deployment still require write/deploy access outside the current writable workspace.
3. Ahrefs organic keyword coverage is still near-zero for the domain, so it cannot yet replace GSC as the primary keyword source.
4. GA4 key events remain `0`, which limits signup/activation measurement quality.

## Next 5 Queued Actions

1. Refresh `/blog/best-lead-sources-for-web-design-agencies` once the dirty-file conflict is resolved.
2. Refresh `/blog/find-clients-for-ai-consulting` with stronger internal links and conversion framing.
3. Add 5-8 authority prospects for web design leads, businesses without websites, and freelance cold outreach.
4. Update hub CSV trackers and redeploy the SEO Ops dashboard.
5. Recheck GSC page/indexing movement for `/resources/*`, `/features/email-outreach`, and `/use-cases/*` in 3-7 days.

## Measurement Date

- Next measurement date: `2026-07-14`
