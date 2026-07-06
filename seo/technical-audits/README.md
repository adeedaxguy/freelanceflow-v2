# Technical SEO Audit Notes

Use this folder for crawl findings, PageSpeed notes, indexation checks, and Search Console issue reviews.

## Standing Checks

- `https://icloseleads.com/sitemap.xml` returns public marketing, feature, use-case, tool, and blog URLs.
- `https://icloseleads.com/robots.txt` blocks private app surfaces and allows public pages.
- Public pages have unique titles and descriptions.
- Blog posts have internal links, outbound citations where helpful, author/date/read time, and featured images.
- Dashboard, admin, auth, and API routes stay out of index.
- GA4 loads once and SPA route changes are tracked.
- Canonical domain is `https://icloseleads.com`.
- Mobile first viewport has no excessive spacing, clipped headings, or hidden CTAs.

## PageSpeed Priority

Fix in this order:

1. Largest image or hero rendering issue.
2. Unused JavaScript or heavy client components on public pages.
3. Layout shift from images without stable dimensions.
4. Font loading and excessive visual effects.
5. Accessibility and contrast issues.

Record before/after URLs and dates in this folder.
