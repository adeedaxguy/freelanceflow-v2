# SEO Data Exports

Put private SEO exports here while analysing them locally.

Recommended filenames:

- `ahrefs-organic-keywords-us.csv`
- `ahrefs-organic-keywords-uk.csv`
- `ahrefs-organic-keywords-ca.csv`
- `ahrefs-top-pages.csv`
- `ahrefs-content-gap.csv`
- `ahrefs-backlinks.csv`
- `gsc-performance-queries.csv`
- `gsc-performance-pages.csv`

CSV, TSV, XLS, XLSX, ZIP, and `raw/` files in this folder are gitignored. Do not commit private exports, paid tool data, or client-sensitive data.

Run:

```bash
npm run seo:score-ahrefs -- seo/data/ahrefs-organic-keywords-us.csv seo/reports/ahrefs-keyword-priorities-us.md
```
