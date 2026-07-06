# iCloseLeads SEO Strategy

Last updated: 2026-07-07

## Product Positioning

iCloseLeads is a lead generation and outreach platform for freelancers, solo agencies, and small service teams. The product should rank for problems where the user already has buying intent:

- Find remote job leads by niche.
- Find local businesses that need websites, SEO, ads, branding, booking flows, POS, or modernisation.
- Find owner and decision-maker paths for local business outreach.
- Turn the lead into a researched pitch, Gmail-ready draft, saved CRM record, and follow-up workflow.

## Primary SEO Markets

- United States
- United Kingdom
- Canada
- English-speaking freelance and agency markets where remote work and local business outreach are common.

## Conversion Goals

1. Free signup.
2. First lead search.
3. Saved lead.
4. AI proposal or Gmail-ready outreach.
5. Repeat search or upgrade to Agency.

## Money Keywords

| Cluster | Primary Keywords | Target Page |
| --- | --- | --- |
| Web design leads | web design leads, website design leads, leads for web design, exclusive web design leads | `/use-cases/local-business-leads` |
| Freelance lead generation | freelance lead generation software, client acquisition software for freelancers, find freelance clients | `/features/lead-discovery` |
| Local business leads | businesses without websites, outdated website leads, local business leads, small business leads | `/use-cases/local-business-leads` |
| Remote job leads | remote job leads, remote freelance jobs, remote contract jobs, remote leads | `/use-cases/remote-job-leads` |
| Cold outreach | freelance cold outreach, cold email for freelancers, client outreach software | `/features/email-outreach` |
| AI proposals | AI proposal generator, freelance proposal generator, cold email proposal template | `/features/ai-proposals` |
| Decision makers | find business owner, decision maker finder, business owner email, business owner phone | `/features/lead-discovery` and dashboard feature content |

## Brand Entity Guardrail

Search Console is showing queries like `iclose` and `icloser`. These are not the same brand. Treat them as defensive entity SEO:

- Use `iCloseLeads` consistently in titles, meta, headings, schema, footer, and social profiles.
- Do not build a content cluster around unrelated brand names.
- Add clarifying copy only where natural, such as "iCloseLeads is a lead generation platform for freelancers and agencies."
- Build branded backlinks with the exact `iCloseLeads` name.

## Content Standards

Every SEO page or blog post should include:

- One clear primary keyword and one search-intent promise.
- A specific use case tied to freelancer or agency revenue.
- Screenshots, product examples, or concrete workflow steps where possible.
- Internal links to the matching feature, use case, pricing, and at least two relevant blog posts.
- Useful outbound citations to credible sources only when they genuinely support the claim.
- A short CTA that asks for a free signup or first search, not a generic newsletter ask.

## Technical Standards

- Keep `/dashboard`, `/admin`, `/api`, and `/auth` out of index.
- Keep public marketing, feature, use-case, tool, blog, and comparison pages indexable.
- Sitemap should include public feature/use-case/blog pages and exclude hidden duplicate blog slugs.
- GA4 and Search Console must be checked after every production change.
- Ahrefs exports should be saved privately in `seo/data/` and converted into action with `npm run seo:score-ahrefs`.

## Backlink Positioning

Best angles for earned links:

- Free lead calculator.
- Research-backed posts on web design leads, freelance client acquisition, and businesses without websites.
- Data-led posts from anonymised lead searches, such as local business website gap snapshots.
- Practical templates: cold email scripts, 30-second call scripts, proposal frameworks.
- Founder-led build notes around safe outreach and finding real buyer signals.
