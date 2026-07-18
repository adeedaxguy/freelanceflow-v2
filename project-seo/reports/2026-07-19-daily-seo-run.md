# iCloseLeads Daily SEO Run - 2026-07-19

## Source Evidence

### Google Search Console
- Property: `sc-domain:icloseleads.com`
- Performance snapshot, web search:
  - `19` clicks
  - `578` impressions
  - `3.3%` CTR
- Visible top query opportunities:
  - `freelance cold outreach` - `28` impressions, `0` clicks
  - `web design leads` - `20` impressions, `0` clicks
  - `aantal leads berekenen` - `18` impressions, `0` clicks
  - `exclusive web design leads` - `12` impressions, `0` clicks
  - `leads for web designers` - `11` impressions, `0` clicks
- Sitemap:
  - `https://icloseleads.com/sitemap.xml`
  - Submitted `2026-06-12`
  - Last read `2026-07-17`
  - Status `Success`
  - `211` discovered pages
- Manual actions: no issues detected.
- Link report: still processing in the UI, so Ahrefs/RankyTools was used for backlink triage.
- Indexing snapshot:
  - `99` indexed
  - `69` not indexed
  - Visible reasons included duplicate without user-selected canonical, alternative page with proper canonical, and discovered currently not indexed.

### GA4
- Property selected: `icloseleads.com / icloseleads / 540635529`
- Date range: visible home cards for last 7 days.
- Snapshot:
  - `86` active users
  - `0` key events
  - `1.6k` event count
  - `860` views
  - `2` active users in the last 30 minutes
- Country sample:
  - United States `50`
  - Pakistan `20`
  - Netherlands `7`
  - India `3`
  - United Arab Emirates `2`
  - France `2`
  - Iran `2`
- Page-title sample:
  - `iCloseLeads - Freelance Lead Generation and Cold Outreach Software` - `499` views
  - `iCloseLeads: Find Web Design Leads, Local Business Leads, and Cold Outreach Workflows` - `119` views
  - `Website Preview | iCloseLeads` - `34` views
  - `iCloseLeads Admin | iCloseLeads` - `23` views
  - `iCloseLeads Pricing: Simple Plans for Freelance Lead Generation` - `24` views
- Channel sample:
  - Direct `98`
  - Organic Search `32`
  - Referral `22`
- Measurement gap: key events still show `0`, so signup and activation reporting remains incomplete.

### Ahrefs / RankyTools
- Organic keywords snapshot:
  - DR `42`
  - AR `1.2M`
  - RP `7`
  - RD `2`
  - Organic keywords `0`
  - Organic traffic `0`
- Backlink/referring-domain pattern:
  - The visible backlinks were heavily dominated by link-selling, PBN, casino/crypto/loan, and generic guest-post pages.
  - Examples included `buyseobacklinks.shop`, `backlinkorbit.shop`, `backlinkzeno.shop`, `trafficspike.shop`, `thebacklinks.shop`, and similar pages using anchors such as "premium guest posts", "contextual backlinks", "take icloseleads.com to page one", and "high DR".
- Decision:
  - These are not authority opportunities and should not be pursued.
  - No disavow file was submitted today because Search Console shows no manual action and the GSC links report is still processing. Keep these domains in the reject list and revisit only if GSC exposes toxic followed links, manual action risk, or a clear pattern of unnatural links pointing at money pages.

### Live SERP
- Query sampled: `web design leads`
- SERP intent:
  - Lead lists
  - Tools
  - Reddit/comparison research
  - Agency and prospecting guides
- Ahrefs Bar sample:
  - KD `2`
  - Volume `250`
  - CPC `$6`
- Related searches visible:
  - `web design leads for free`
  - `web design leads list`
  - `web design leads for sale`
  - `web design leads reddit`
  - `best web design leads`
  - `verified web design leads`
  - `website leads`
  - `web design lead generation`
- Positioning takeaway:
  - iCloseLeads should differentiate from generic lead sellers by making verification visible: website gap, local demand, owner path, proof link, proposal draft, and follow-up.

## Shipped

Shipped count: `2`

1. Refreshed `/resources/web-design-leads` for the current SERP language around lead lists, lead sellers, Reddit comparison intent, and verification-first prospecting.
2. Refreshed `/resources/freelance-cold-outreach` with stronger related-search coverage and a tighter signal-led outreach explanation.

## QA Plan

- `npm run type-check` passed.
- `npm run build` passed.
- Existing build warning persisted: static generation logs report missing `DATABASE_URL` for Prisma blog lookup, but the production build completed successfully.
- Vercel production deployment passed and aliased to `https://icloseleads.com`.
- Deployment id: `dpl_7Vgfn7dG8vDzQLBheHjGX1ho6Axv`.
- Production URL: `https://freelanceflow-v2-4dsb2ss1z-adnanaimanager-3376s-projects.vercel.app`.
- Custom-domain live QA passed for:
  - `https://icloseleads.com/resources/web-design-leads`
  - `https://icloseleads.com/resources/freelance-cold-outreach`
- Confirmed live items:
  - Updated web-design-leads title and meta description.
  - Canonical points to `https://icloseleads.com/resources/web-design-leads`.
  - FAQPage schema includes the new lead-list and bad-lead questions.
  - Related-search chips include `web design leads list`, `web design leads for sale`, `web design leads reddit`, `website leads`, and `web design lead generation`.
  - Cold-outreach related-search chips include `freelance cold outreach examples`, `freelance cold outreach subject lines`, and `cold outreach for web designers`.
- Note: direct fetch of the raw Vercel deployment URL redirects to Vercel login because deployment protection is enabled, but the production custom domain is live and verified.

## Next Actions

1. Fix GA4 key-event measurement so organic-search sessions can be tied to signup and activation.
2. Recheck GSC links once the report finishes processing.
3. Keep spam/link-seller domains rejected; pursue only editorial, topically relevant prospects from real SERPs.
4. Continue expanding pages that already have GSC impressions, especially `freelance cold outreach`, `web design leads`, and `exclusive web design leads`.
