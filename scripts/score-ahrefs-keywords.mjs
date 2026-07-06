#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const DEFAULT_INPUT = "seo/data/ahrefs-organic-keywords.csv";
const DEFAULT_OUTPUT = "seo/reports/ahrefs-keyword-priorities.md";

const args = process.argv.slice(2);
const wantsHelp = args.includes("--help") || args.includes("-h");

if (wantsHelp) {
  console.log(`
Usage:
  npm run seo:score-ahrefs -- [input.csv] [output.md]

Default input:
  ${DEFAULT_INPUT}

Default output:
  ${DEFAULT_OUTPUT}

Export from Ahrefs Site Explorer > Organic keywords, then save the CSV in seo/data/.
The script accepts common Ahrefs columns such as Keyword, Position, Volume, KD,
Traffic, URL, Country, and SERP features.
`);
  process.exit(0);
}

const inputPath = args[0] ?? DEFAULT_INPUT;
const outputPath = args[1] ?? DEFAULT_OUTPUT;

if (!existsSync(inputPath)) {
  console.error(`Missing Ahrefs export: ${inputPath}`);
  console.error("Export Organic keywords from Ahrefs and save it there, or pass a CSV path.");
  process.exit(1);
}

function run() {
  const csv = readFileSync(inputPath, "utf8");
  const rows = parseCsv(csv).filter((row) => row.some((cell) => cell.trim()));

  if (rows.length < 2) {
    console.error("The Ahrefs export has no keyword rows.");
    process.exit(1);
  }

  const headers = rows[0];
  const records = rows.slice(1).map((cells) => toRecord(headers, cells));
  const scored = records
    .map(scoreKeyword)
    .filter((item) => item.keyword)
    .sort((a, b) => b.score - a.score);

  const report = renderReport(scored, inputPath);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, report);

  console.log(`Wrote ${outputPath}`);
  console.log(`Scored ${scored.length} Ahrefs keywords.`);
}

function parseCsv(text) {
  const parsed = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      parsed.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field);
  parsed.push(row);
  return parsed;
}

function toRecord(headers, cells) {
  return headers.reduce((record, header, index) => {
    record[normaliseHeader(header)] = cells[index]?.trim() ?? "";
    return record;
  }, {});
}

function normaliseHeader(header) {
  return header.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function pick(record, names) {
  for (const name of names) {
    const value = record[normaliseHeader(name)];
    if (value !== undefined && value !== "") return value;
  }
  return "";
}

function numberValue(value) {
  if (!value) return null;
  const cleaned = String(value).replace(/[$,%+]/g, "").replace(/,/g, "").trim();
  if (!cleaned || cleaned === "-") return null;
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function scoreKeyword(record) {
  const keyword = pick(record, ["Keyword", "Keywords", "Query"]);
  const url = pick(record, ["URL", "Current URL", "Page URL", "Landing page"]);
  const position = numberValue(pick(record, ["Position", "Current position", "Pos.", "Organic position"]));
  const volume = numberValue(pick(record, ["Volume", "Search volume"]));
  const kd = numberValue(pick(record, ["KD", "Keyword Difficulty", "Keyword difficulty"]));
  const traffic = numberValue(pick(record, ["Traffic", "Organic traffic"]));
  const country = pick(record, ["Country", "Database"]);
  const serpFeatures = pick(record, ["SERP features", "Features"]);

  const intent = classifyIntent(keyword);
  const brandIssue = isBrandConfusion(keyword);
  const score =
    intent.score +
    positionScore(position) +
    keywordDifficultyScore(kd) +
    volumeScore(volume) +
    trafficScore(traffic) +
    urlFitScore(url) +
    serpFeatureScore(serpFeatures) -
    (brandIssue ? 24 : 0);

  return {
    keyword,
    score: Math.max(0, Math.round(score)),
    position,
    volume,
    kd,
    traffic,
    url,
    country,
    serpFeatures,
    target: brandIssue ? "/" : intent.target,
    cluster: brandIssue ? "Brand entity defense" : intent.cluster,
    action: actionFor({ position, url, brandIssue, intent }),
    note: brandIssue ? "Brand-confusion query. Defend, but do not build a content cluster around the wrong brand." : intent.note,
  };
}

const INTENTS = [
  {
    cluster: "Web design leads",
    target: "/use-cases/local-business-leads",
    score: 36,
    terms: ["web design leads", "website design leads", "leads for web design", "get web design leads", "exclusive web design leads", "website design prospect"],
    note: "Highest observed GSC demand and strong match to local business lead discovery.",
  },
  {
    cluster: "Freelance client acquisition",
    target: "/features/lead-discovery",
    score: 34,
    terms: ["freelance lead generation", "freelance client acquisition", "find freelance clients", "client acquisition software", "lead generation software for freelancers"],
    note: "Core platform category. Build authority with product-led pages and comparison content.",
  },
  {
    cluster: "Cold outreach",
    target: "/features/email-outreach",
    score: 30,
    terms: ["freelance cold outreach", "cold email for freelancers", "cold outreach", "outreach leads", "client outreach"],
    note: "Connect lead discovery to Gmail-ready outreach and safe follow-up workflows.",
  },
  {
    cluster: "Remote job leads",
    target: "/use-cases/remote-job-leads",
    score: 30,
    terms: ["remote job leads", "remote leads", "remoteleads", "remote freelance jobs", "remote contract jobs"],
    note: "Product differentiator. Prioritise freshness, contact filters, and niche matching.",
  },
  {
    cluster: "Local business leads",
    target: "/use-cases/local-business-leads",
    score: 30,
    terms: ["local business leads", "businesses without websites", "outdated website leads", "find local businesses", "small business leads"],
    note: "Strong commercial intent for agencies, web designers, SEO consultants, and local service sellers.",
  },
  {
    cluster: "Decision maker finder",
    target: "/features/lead-discovery",
    score: 24,
    terms: ["decision maker finder", "find business owner", "owner name", "business owner email", "business owner phone"],
    note: "Needs careful credibility language because public owner data varies by country and business type.",
  },
  {
    cluster: "AI proposals",
    target: "/features/ai-proposals",
    score: 22,
    terms: ["ai proposal generator", "freelance proposal generator", "proposal template", "write proposal"],
    note: "Useful mid-funnel support content that can convert visitors already looking for leads.",
  },
  {
    cluster: "iCloseLeads brand",
    target: "/",
    score: 20,
    terms: ["icloseleads", "i close leads"],
    note: "Defend brand search and reinforce entity clarity.",
  },
];

run();

function classifyIntent(keyword) {
  const lower = keyword.toLowerCase();
  let best = {
    cluster: "General SEO",
    target: "/blog",
    score: 8,
    note: "Review manually and decide whether it deserves a page, refresh, or internal link.",
  };

  for (const intent of INTENTS) {
    if (intent.terms.some((term) => lower.includes(term))) {
      if (intent.score > best.score) best = intent;
    }
  }

  const commercialBoosts = ["software", "tool", "best", "lead", "leads", "clients", "finder", "generator", "template"];
  const boost = commercialBoosts.filter((term) => lower.includes(term)).length * 2;
  return { ...best, score: best.score + boost };
}

function isBrandConfusion(keyword) {
  const lower = keyword.toLowerCase().trim();
  if (lower === "iclose" || lower === "icloser") return true;
  return lower.includes("iclose crm") || lower.includes("icloser");
}

function positionScore(position) {
  if (position == null) return 6;
  if (position <= 3) return 12;
  if (position <= 10) return 28;
  if (position <= 20) return 30;
  if (position <= 50) return 20;
  if (position <= 100) return 10;
  return 4;
}

function keywordDifficultyScore(kd) {
  if (kd == null) return 8;
  if (kd <= 10) return 22;
  if (kd <= 25) return 18;
  if (kd <= 45) return 12;
  if (kd <= 65) return 6;
  return 2;
}

function volumeScore(volume) {
  if (volume == null || volume <= 0) return 2;
  return Math.min(16, Math.log10(volume + 1) * 6);
}

function trafficScore(traffic) {
  if (traffic == null || traffic <= 0) return 0;
  return Math.min(8, Math.log10(traffic + 1) * 4);
}

function urlFitScore(url) {
  if (!url) return 0;
  if (url.includes("/features/") || url.includes("/use-cases/")) return 10;
  if (url.includes("/blog/")) return 8;
  if (url.includes("/tools/")) return 7;
  if (url === "https://icloseleads.com/" || url.endsWith("icloseleads.com/")) return 6;
  if (url.includes("/dashboard") || url.includes("/admin") || url.includes("/auth")) return -14;
  return 4;
}

function serpFeatureScore(features) {
  const lower = features.toLowerCase();
  let score = 0;
  if (lower.includes("featured snippet")) score += 5;
  if (lower.includes("people also ask")) score += 4;
  if (lower.includes("sitelinks")) score += 2;
  return score;
}

function actionFor({ position, url, brandIssue, intent }) {
  if (brandIssue) return "Defend brand clarity; avoid building around the wrong brand.";
  if (!url) return `Assign or create ${intent.target}.`;
  if (position != null && position <= 3) return "Defend CTR with stronger title, meta, schema, and internal links.";
  if (position != null && position <= 20) return "Refresh the ranking page, add internal links, and answer PAA-style questions.";
  if (position != null && position <= 50) return "Build supporting content and link it into the target page.";
  return "Validate intent before creating content.";
}

function renderReport(items, sourcePath) {
  const now = new Date().toISOString().slice(0, 10);
  const topItems = items.slice(0, 50);
  const quickWins = items.filter((item) => item.position != null && item.position > 3 && item.position <= 20).slice(0, 20);
  const clusters = clusterSummary(items);

  return `# Ahrefs Keyword Priority Report

Generated: ${now}

Source export: \`${sourcePath}\`

## How To Use This

1. Work the Quick Wins first. These are keywords already near page one or on page two.
2. Use the Target Page column to decide whether to refresh an existing page or create supporting content.
3. Re-run this script after every Ahrefs export so prioritisation stays data-led.
4. Treat brand-confusion queries such as "iclose" and "icloser" as defensive SEO only.

## Cluster Summary

| Cluster | Keywords | Best Position | Top Score |
| --- | ---: | ---: | ---: |
${clusters.map((cluster) => `| ${escapeCell(cluster.cluster)} | ${cluster.count} | ${formatNumber(cluster.bestPosition)} | ${cluster.topScore} |`).join("\n")}

## Quick Wins

| Score | Keyword | Pos. | KD | Vol. | Target Page | Action |
| ---: | --- | ---: | ---: | ---: | --- | --- |
${quickWins.map(rowLine).join("\n")}

## Top Opportunities

| Score | Keyword | Pos. | KD | Vol. | Target Page | Action |
| ---: | --- | ---: | ---: | ---: | --- | --- |
${topItems.map(rowLine).join("\n")}

## Notes

- Score blends business intent, current position, keyword difficulty, volume, traffic, URL fit, and SERP features.
- Ahrefs should guide priorities, but final page decisions still need product judgment and Search Console validation.
- Keep raw exports private. The repo ignores CSV/XLS files inside \`seo/data/\`.
`;
}

function clusterSummary(items) {
  const map = new Map();
  for (const item of items) {
    const existing = map.get(item.cluster) ?? {
      cluster: item.cluster,
      count: 0,
      bestPosition: null,
      topScore: 0,
    };
    existing.count += 1;
    existing.topScore = Math.max(existing.topScore, item.score);
    if (item.position != null) {
      existing.bestPosition =
        existing.bestPosition == null ? item.position : Math.min(existing.bestPosition, item.position);
    }
    map.set(item.cluster, existing);
  }
  return [...map.values()].sort((a, b) => b.topScore - a.topScore);
}

function rowLine(item) {
  return `| ${item.score} | ${escapeCell(item.keyword)} | ${formatNumber(item.position)} | ${formatNumber(item.kd)} | ${formatNumber(item.volume)} | ${escapeCell(item.target)} | ${escapeCell(item.action)} |`;
}

function formatNumber(value) {
  return value == null ? "" : String(value);
}

function escapeCell(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}
