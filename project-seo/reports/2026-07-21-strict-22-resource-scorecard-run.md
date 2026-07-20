# iCloseLeads Strict 20+ SEO Run - 2026-07-21

## Summary

Shipped count: `22`

This pass upgraded every resource URL with a visible buying-signal scorecard and matching HowTo schema. The update strengthens answer-engine visibility and conversion intent by helping searchers judge lead fit, proof quality, and risk before outreach.

No blog fallback was needed because the resource cluster had enough useful technical/content SEO work.

## Shipped work

- Added `getResourceSignalScorecard` to generate keyword-specific lead qualification guidance for each resource page.
- Added a visible `data-resource-signal-scorecard` section to every resource page.
- Added HowTo JSON-LD with three HowToStep entries per resource URL.
- Added CTA tracking via `source=resource-signal-scorecard`.
- Added a risk filter that rejects blind lists, scraped records, fake exclusivity claims, spammy sources, and unverifiable leads.

## Shipped task ledger

1. /resources/web-design-leads - added visible buying-signal scorecard, public-source risk filter, scorecard CTA tracking, and HowTo schema for "web design leads".
2. /resources/web-design-proposal-template - added visible buying-signal scorecard, public-source risk filter, scorecard CTA tracking, and HowTo schema for "web design proposal template".
3. /resources/businesses-without-websites - added visible buying-signal scorecard, public-source risk filter, scorecard CTA tracking, and HowTo schema for "businesses without websites".
4. /resources/freelance-cold-outreach - added visible buying-signal scorecard, public-source risk filter, scorecard CTA tracking, and HowTo schema for "freelance cold outreach".
5. /resources/local-business-leads-for-web-designers - added visible buying-signal scorecard, public-source risk filter, scorecard CTA tracking, and HowTo schema for "local business leads for web designers".
6. /resources/exclusive-web-design-leads - added visible buying-signal scorecard, public-source risk filter, scorecard CTA tracking, and HowTo schema for "exclusive web design leads".
7. /resources/outdated-website-leads - added visible buying-signal scorecard, public-source risk filter, scorecard CTA tracking, and HowTo schema for "outdated website leads".
8. /resources/remote-job-leads - added visible buying-signal scorecard, public-source risk filter, scorecard CTA tracking, and HowTo schema for "remote job leads".
9. /resources/remote-job-proposal-template - added visible buying-signal scorecard, public-source risk filter, scorecard CTA tracking, and HowTo schema for "remote job proposal template".
10. /resources/best-lead-generation-tools-for-freelancers - added visible buying-signal scorecard, public-source risk filter, scorecard CTA tracking, and HowTo schema for "best lead generation tools for freelancers".
11. /resources/cold-outreach-crm-for-freelancers - added visible buying-signal scorecard, public-source risk filter, scorecard CTA tracking, and HowTo schema for "cold outreach CRM for freelancers".
12. /resources/find-decision-maker-email-small-business - added visible buying-signal scorecard, public-source risk filter, scorecard CTA tracking, and HowTo schema for "find decision maker email small business".
13. /resources/freelance-client-acquisition-software - added visible buying-signal scorecard, public-source risk filter, scorecard CTA tracking, and HowTo schema for "freelance client acquisition software".
14. /resources/lead-generation-for-independent-contractors - added visible buying-signal scorecard, public-source risk filter, scorecard CTA tracking, and HowTo schema for "lead generation for independent contractors".
15. /resources/ai-consulting-clients - added visible buying-signal scorecard, public-source risk filter, scorecard CTA tracking, and HowTo schema for "ai consulting clients".
16. /resources/decision-maker-finder - added visible buying-signal scorecard, public-source risk filter, scorecard CTA tracking, and HowTo schema for "decision maker finder".
17. /resources/freelance-proposal-subject-lines - added visible buying-signal scorecard, public-source risk filter, scorecard CTA tracking, and HowTo schema for "freelance proposal subject lines".
18. /resources/ai-proposal-generator-for-freelancers - added visible buying-signal scorecard, public-source risk filter, scorecard CTA tracking, and HowTo schema for "AI proposal generator for freelancers".
19. /resources/freelance-client-acquisition - added visible buying-signal scorecard, public-source risk filter, scorecard CTA tracking, and HowTo schema for "freelance client acquisition".
20. /resources/proposal-follow-up-email - added visible buying-signal scorecard, public-source risk filter, scorecard CTA tracking, and HowTo schema for "proposal follow up email".
21. /resources/live-job-leads - added visible buying-signal scorecard, public-source risk filter, scorecard CTA tracking, and HowTo schema for "live job leads".
22. /resources/website-design-prospecting - added visible buying-signal scorecard, public-source risk filter, scorecard CTA tracking, and HowTo schema for "website design prospecting".

## QA

- Source QA passed for 22 resource URLs.
- `git diff --check` passed.
- `npm run type-check` passed.
- `npm run build` passed and generated 236 static pages.
- Build warning: the known optional Prisma blog query still warns when `DATABASE_URL` is unavailable during local static generation, but the build exits successfully.
- Vercel production deployment reached Ready.
- Deployment id: `dpl_2n3kwNXSNJDLLeb4TS269km5LEkg`
- Deployment URL: https://freelanceflow-v2-hgft1uwrl-adnanaimanager-3376s-projects.vercel.app
- Custom domain: https://icloseleads.com
- Custom-domain live QA passed on all 22 resource URLs plus sitemap.
- Raw Vercel URL is protected by Vercel SSO for this project, so the public canonical QA surface is `https://icloseleads.com`.

## Bad backlink and bad-source rule

Spam, scraped, PBN, link-seller, hacked, irrelevant, or unverifiable sources remain reject/monitor only. No outreach goes to those domains or sources. Disavow remains a last-resort action only for a manual action, clear security issue, or sustained followed manipulative-link risk.

## Next actions

1. Monitor GSC impressions and CTR for the resource cluster after the updated pages recrawl.
2. Watch signup starts from `source=resource-signal-scorecard`.
3. Compare engagement on pages that now have both activation plans and scorecards against pages that only have scorecards.
4. Keep backlink/source rejection logs separate from outreach prospects.
