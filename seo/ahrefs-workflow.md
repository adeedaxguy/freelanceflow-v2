# Ahrefs Workflow For iCloseLeads

Use Ahrefs as the prioritisation engine, not just a dashboard. Every export should answer: which page should we improve, which page should we create, or which backlink should we chase?

## Weekly Ahrefs Routine

### 1. Organic Keywords

Tool path: Ahrefs Site Explorer -> `icloseleads.com` -> Organic keywords.

Export filters:

- Country: United States, United Kingdom, Canada. Run one country at a time.
- Position: 4 to 50.
- KD: 0 to 45.
- Include terms: `lead`, `leads`, `freelance`, `client`, `web design`, `website`, `remote`, `cold outreach`, `proposal`, `business owner`, `decision maker`.
- Exclude obvious unrelated brand confusion unless reviewing entity issues.

Save as:

- `seo/data/ahrefs-organic-keywords-us.csv`
- `seo/data/ahrefs-organic-keywords-uk.csv`
- `seo/data/ahrefs-organic-keywords-ca.csv`

Score it:

```bash
npm run seo:score-ahrefs -- seo/data/ahrefs-organic-keywords-us.csv seo/reports/ahrefs-keyword-priorities-us.md
```

### 2. Top Pages

Tool path: Ahrefs Site Explorer -> Top pages.

Use this to find pages earning impressions, links, or organic traffic. Compare against the sitemap and decide:

- Refresh the page if it ranks 4 to 20.
- Add supporting content if it ranks 21 to 50.
- Add internal links if the page is already the right target but underpowered.
- Merge or redirect only if there are clear duplicates.

Save as:

- `seo/data/ahrefs-top-pages.csv`

### 3. Content Gap

Tool path: Ahrefs Site Explorer -> Content gap.

Initial competitor seed list:

- `fullenrich.com` for enrichment and contact data positioning.
- `apollo.io` for broad sales intelligence language.
- `hunter.io` for email finder intent.
- `clay.com` for AI lead enrichment language.
- `uplead.com` for B2B lead data intent.
- `solidgigs.com` for freelancer lead positioning.

Use the export to find missing pages, but keep iCloseLeads narrower and sharper: freelancers and agencies who need leads they can pitch today.

Save as:

- `seo/data/ahrefs-content-gap.csv`

### 4. Backlinks And Link Intersect

Tool paths:

- Backlink profile -> Backlinks.
- Backlink profile -> Broken backlinks.
- Link intersect.

Create targets in `seo/backlinks/` only when there is a real angle:

- Freelancer tools list.
- Web design resources.
- Agency lead generation resources.
- Cold email templates.
- Remote work/freelance directories.
- Founder/product build directories.

Do not chase spam directories, paid link farms, or irrelevant coupon pages.

## Decision Rules

| Ahrefs Signal | Action |
| --- | --- |
| Position 4 to 10, relevant page | Rewrite title/meta, improve intro, add FAQ/PAA answers, add 5 internal links |
| Position 11 to 20, relevant page | Refresh page deeply and add one supporting post |
| Position 21 to 50, clear intent | Create supporting content and link to the money page |
| KD under 20, volume over 50, product fit | Fast-track content or landing page |
| High backlinks to competitor resource | Build a better resource and outreach list |
| Brand confusion query | Defend entity clarity, do not create off-brand pages |

## Output Standard

Every Ahrefs session should produce one of these:

- Updated `seo/reports/*`.
- A content brief in `seo/content-briefs/`.
- A backlink target list in `seo/backlinks/`.
- A specific production change in the app.

If no action comes out, the Ahrefs session was not useful.
