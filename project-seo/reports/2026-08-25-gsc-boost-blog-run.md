# iCloseLeads GSC Boost Blog Run - 2026-08-25

## Research basis

- GSC signal supplied by owner: `/blog/freelance-client-acquisition-system` is the strongest click page.
- GSC Insights signal supplied by owner: `/resources/google-maps-listing-pitch-for-freelancers` gained more impressions than usual.
- GSC Insights signal supplied by owner: `/blog/google-maps-prospecting-tool-for-agencies` had a sharp impression drop and needs support.
- Cached DataForSEO reports showed viable supporting terms around free leads, lead generation for freelancers, client acquisition software, and web design/local business lead workflows.
- Fresh Google/SERP review on 2026-08-25 showed competitor patterns around lead generation tools, Google Maps lead generation, Upwork/freelancer intent, and local lead qualification.

## Five boosted keyword targets

1. `free leads for freelancers`
2. `Google Maps leads for freelancers`
3. `Google Maps prospecting tool for agencies`
4. `Upwork leads for freelancers`
5. `600 free leads per week for web designers`

## Assets shipped

1. `/blog/free-leads-for-freelancers-qualification-workflow`
2. `/blog/google-maps-listing-pitch-examples-for-freelancers`
3. `/blog/agency-google-maps-prospecting-recovery-plan`
4. `/blog/upwork-leads-vs-direct-freelance-leads`
5. `/blog/600-free-leads-weekly-sprint-for-web-designers`

## SEO implementation

- Added five original, plagiarism-free static blog posts.
- Added direct-answer sections, FAQ-style headings, and product-led next actions.
- Added 4-5 in-article visual slots per post through the existing blog enhancement system.
- Added conversion funnels pointing readers into free lead search/signup.
- Added strategic internal links to the acquisition guide, Google Maps resources, free lead resources, local business use case, CRM, and web-designer page.
- Added all new URLs to `llms.txt` as the August 25 GSC boost cluster.
- Sitemap generation includes all five new blog URLs.

## QA

- `npm run type-check`: passed.
- `git diff --check`: passed.
- `npm run build`: passed.
- Local production smoke test: all five new blog URLs returned 200.
- Local sitemap smoke test: all five new URLs are present in `/sitemap.xml`.
- Local `llms.txt` smoke test: August 25 cluster present.

## Note

Local build emitted the known non-fatal `DATABASE_URL` warning while attempting optional Prisma blog reads. Static posts, sitemap, and local smoke tests still passed. Production/Vercel has the real database environment.
