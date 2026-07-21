# iCloseLeads Strict Ahrefs + GSC Resource Expansion Run

Date: 2026-07-22
Project: iCloseLeads
Domain: https://icloseleads.com
Deployment: https://freelanceflow-v2-2sq58g1yw-adnanaimanager-3376s-projects.vercel.app
Production alias: https://icloseleads.com
Vercel deployment ID: dpl_549rx18h2sMmBKc4rc6StTHnQHed

## Status

Completed 25 shipped SEO resource-page tasks after the required research gate.

Strict-gate note: Ahrefs/RankyTools was opened in Chrome and Site Explorer report pages loaded, but the workspace still displayed an "Inactive" banner on several views and Ahrefs Toolbar SERPs. Report data was treated as usable with limitation only where rows/overview loaded; toolbar metrics were not treated as fully reliable.

## Research Evidence

### Google Search Console

Chrome GSC Performance view showed:

- 21 clicks
- 665 impressions
- 3.2% CTR
- Average position 34
- Visible date range: 2026-06-11 to 2026-07-19

Priority visible query rows:

- freelance cold outreach: 0 clicks / 31 impressions
- web design leads: 0 clicks / 22 impressions
- aantal leads berekenen: 0 clicks / 21 impressions
- iclose: 0 clicks / 20 impressions
- icloser: 0 clicks / 19 impressions
- ai search optimisation small business: 0 clicks / 13 impressions
- exclusive web design leads: 0 clicks / 12 impressions
- ai search optimisation for small business: 0 clicks / 12 impressions
- leads for web designers: 0 clicks / 11 impressions

GSC Pages / indexing view showed 99 indexed URLs and 69 not indexed URLs, including 56 Discovered - currently not indexed URLs. Today's batch creates stronger internally discoverable resource targets for the highest visible search themes.

### Ahrefs / RankyTools

Ahrefs Site Explorer was used for overview, organic keywords, top pages, organic competitors, backlinks, referring domains, anchors, broken backlinks, and content gap attempts. The inactive-workspace banner remained visible, so row-level data remains limited and should be rerun after account status is fully active.

### Google SERP + Toolbar Review

Live Google SERPs were reviewed for:

- freelance cold outreach
- web design leads
- exclusive web design leads

Related-search and competitor patterns drove the page set: Reddit threads, Webleadr, LeadsCampus, Leadsify, broad cold outreach template pages, cold email examples, and lead list/buying-intent searches. The content angle is verification-first workflow content, not blind list-selling.

## 25 Completed Tasks

1. https://icloseleads.com/resources/web-design-leads-for-free-vs-verified
2. https://icloseleads.com/resources/freelance-cold-email-template
3. https://icloseleads.com/resources/cold-outreach-for-web-designers
4. https://icloseleads.com/resources/local-website-leads
5. https://icloseleads.com/resources/web-design-leads-list
6. https://icloseleads.com/resources/freelance-cold-outreach-examples
7. https://icloseleads.com/resources/cold-outreach-strategy-for-freelancers
8. https://icloseleads.com/resources/website-leads
9. https://icloseleads.com/resources/webleadr-alternative
10. https://icloseleads.com/resources/leadsify-leadscampus-alternative
11. https://icloseleads.com/resources/verified-web-design-leads
12. https://icloseleads.com/resources/web-design-lead-generation
13. https://icloseleads.com/resources/cold-email-freelance-reddit
14. https://icloseleads.com/resources/cold-outreach-examples
15. https://icloseleads.com/resources/best-web-design-leads
16. https://icloseleads.com/resources/buy-web-design-leads
17. https://icloseleads.com/resources/how-to-get-leads-for-website-development
18. https://icloseleads.com/resources/get-leads-for-marketing-agency
19. https://icloseleads.com/resources/freelance-cold-outreach-free
20. https://icloseleads.com/resources/freelance-cold-outreach-reddit
21. https://icloseleads.com/resources/web-design-leads-for-sale
22. https://icloseleads.com/resources/best-exclusive-web-design-leads
23. https://icloseleads.com/resources/freelance-cold-outreach-reviews
24. https://icloseleads.com/resources/web-design-leads-reddit
25. https://icloseleads.com/resources/web-design-leads-for-agencies

## Implementation

- Added 25 full resource objects to `src/data/resource-pages.ts`.
- Each page includes keyword targeting, intent summary, answer-first copy, steps, proof points, internal links, FAQ content, and qualification checks.
- All pages inherit the existing Article, FAQ, Breadcrumb, canonical, sitemap, and resource-page rendering stack.

## QA

- `npm run type-check`: passed.
- `npm run build`: passed. The known missing `DATABASE_URL` warning appeared during static generation but build exited 0.
- Local QA on representative URLs: passed.
- Vercel production deployment: passed.
- Live production QA: representative URLs returned 200 with canonical, JSON-LD schema, short-answer copy, and CTA copy present; sitemap includes the new URL batch.

## Backlink / Authority

No disavow was submitted and no paid/link-seller placement was pursued. The backlink policy remains: reject spam/link sellers/PBN-style links, monitor in Ahrefs/GSC, and only escalate to disavow when GSC/manual-action evidence or verified followed-link risk exists.

## Next Action

Request indexing/inspect the highest-priority resource URLs after Google recrawls, then rerun Ahrefs row-level backlink/refdomain/content-gap exports once the inactive-workspace warning is cleared.
