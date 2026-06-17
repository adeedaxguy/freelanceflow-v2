import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUTPUT_DIR = join(process.cwd(), "public", "blog-images");

const posts = [
  ["ai-lead-generation-for-freelancers-2026", "AI Lead Generation for Freelancers in 2026", "Lead Generation"],
  ["best-crm-for-freelancers-2025", "Why Every Freelancer Needs a CRM", "Tools"],
  ["how-to-write-winning-freelance-proposals-2025", "How to Write Winning Freelance Proposals in 2025", "Proposals"],
  ["find-local-businesses-without-website", "How to Find Local Businesses Without a Website", "Local Business"],
  ["most-profitable-freelance-niches-2025", "10 Most Profitable Freelance Niches in 2025", "Freelance Business"],
  ["how-seo-consultants-find-local-clients-using-lead-tools", "How SEO Consultants Find Local Clients Using Lead Tools", "For Industries"],
  ["cold-email-templates-freelancers-2025", "Cold Email Templates for Freelancers That Get Responses", "Outreach"],
  ["lead-generation-for-freelancers-complete-guide", "The Complete Guide to Lead Generation for Freelancers", "Lead Generation"],
  ["how-to-find-freelance-clients-2025", "How to Find Freelance Clients in 2025", "Client Acquisition"],
  ["most-profitable-freelance-niches-2025-income", "Most Profitable Freelance Niches With Income Ranges", "Freelance Business"],
  ["lead-generation-freelancers-complete-guide-2025", "Lead Generation for Freelancers: The Complete 2025 Guide", "Lead Generation"],
  ["how-to-find-freelance-clients-2025-methods", "How to Find Freelance Clients in 2025", "Client Acquisition"],
  ["best-crm-for-high-ticket-closing-in-2026-compared-1780943583090", "Best CRM for High-Ticket Closing in 2026", "Comparisons"],
  ["best-crm-for-high-ticket-closing-in-2026-compared-1780943521022", "Best CRM for High-Ticket Closing in 2026", "Comparisons"],
  ["best-crm-for-high-ticket-closing-in-2026-compared-1780943504559", "Best CRM for High-Ticket Closing in 2026", "Comparisons"],
  ["best-crm-for-high-ticket-closing-in-2026-compared", "Best CRM for High-Ticket Closing in 2026", "Comparisons"],
  ["how-to-find-freelance-clients-without-cold-calling-in-2025", "How to Find Freelance Clients Without Cold Calling", "Lead Generation"],
  ["how-to-find-high-paying-clients-2025", "How to Find High-Paying Clients in 2025", "Strategy"],
  ["cold-email-templates-that-get-responses", "Cold Email Templates That Actually Get Responses", "Templates"],
  ["best-niches-for-freelancers-2025", "The Best Niches for Freelancers in 2025", "Growth"],
  ["how-to-price-freelance-services", "How to Price Your Freelance Services", "Growth"],
  ["freelance-pipeline-30-day-system", "Building a Freelance Pipeline: The 30-Day System", "Strategy"],
  ["how-to-write-winning-freelance-proposal", "How to Write a Freelance Proposal That Wins Every Time", "Templates"],
  ["web-designers-find-local-business-clients-2026", "How Web Designers Can Find Local Business Clients in 2026", "Lead Generation"],
  ["predictable-freelance-pipeline", "Building a Predictable Freelance Pipeline", "Strategy"],
  ["default", "Freelance Growth Playbook", "iCloseLeads Blog"],
];

const palettes = [
  { a: "#8B5CF6", b: "#13D8A8", c: "#FFD166" },
  { a: "#22D3EE", b: "#A855F7", c: "#00E5A0" },
  { a: "#F59E0B", b: "#8B5CF6", c: "#22D3EE" },
  { a: "#00E5A0", b: "#5B7CFA", c: "#F472B6" },
  { a: "#C084FC", b: "#2DD4BF", c: "#FDE68A" },
];

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wrapText(text, maxLength) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxLength && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

function svgFor(slug, title, category, index) {
  const palette = palettes[index % palettes.length];
  const titleLines = wrapText(title, 31);
  const titleSvg = titleLines
    .map((line, i) => `<text x="90" y="${258 + i * 70}" fill="#F8F7FF" font-size="58" font-family="Inter, Arial, sans-serif" font-weight="800" letter-spacing="0">${escapeXml(line)}</text>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0B0718"/>
      <stop offset="0.48" stop-color="#111126"/>
      <stop offset="1" stop-color="#031B19"/>
    </linearGradient>
    <linearGradient id="brand" x1="80" y1="80" x2="1120" y2="560" gradientUnits="userSpaceOnUse">
      <stop stop-color="${palette.a}"/>
      <stop offset="1" stop-color="${palette.b}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(915 150) rotate(122) scale(470 620)">
      <stop stop-color="${palette.a}" stop-opacity="0.42"/>
      <stop offset="0.54" stop-color="${palette.b}" stop-opacity="0.13"/>
      <stop offset="1" stop-color="#02030A" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" width="34" height="34" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.4" fill="#FFFFFF" opacity="0.14"/>
    </pattern>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="22" stdDeviation="34" flood-color="#000000" flood-opacity="0.32"/>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="630" fill="url(#dots)" opacity="0.55"/>
  <path d="M768 70H1078C1101.2 70 1120 88.8 1120 112V418C1120 441.2 1101.2 460 1078 460H768C744.8 460 726 441.2 726 418V112C726 88.8 744.8 70 768 70Z" fill="#121127" stroke="url(#brand)" stroke-opacity="0.45" filter="url(#softShadow)"/>
  <path d="M773 142H1073" stroke="${palette.c}" stroke-opacity="0.65" stroke-width="10" stroke-linecap="round"/>
  <path d="M773 202H1010" stroke="${palette.a}" stroke-opacity="0.38" stroke-width="10" stroke-linecap="round"/>
  <path d="M773 262H1044" stroke="${palette.b}" stroke-opacity="0.42" stroke-width="10" stroke-linecap="round"/>
  <path d="M773 322H964" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="10" stroke-linecap="round"/>
  <circle cx="1038" cy="376" r="42" fill="url(#brand)" opacity="0.92"/>
  <path d="M1038 350L1044.6 369.4L1065 376L1044.6 382.6L1038 402L1031.4 382.6L1011 376L1031.4 369.4L1038 350Z" fill="#FFFFFF"/>

  <rect x="72" y="72" width="1056" height="486" rx="34" stroke="url(#brand)" stroke-opacity="0.4"/>
  <rect x="90" y="104" width="214" height="42" rx="21" fill="${palette.a}" fill-opacity="0.16" stroke="${palette.a}" stroke-opacity="0.55"/>
  <text x="114" y="132" fill="${palette.c}" font-size="18" font-family="Inter, Arial, sans-serif" font-weight="800" letter-spacing="1.5">${escapeXml(category.toUpperCase())}</text>
  <text x="90" y="190" fill="#9B95B8" font-size="24" font-family="Inter, Arial, sans-serif" font-weight="700">iCloseLeads Blog</text>
  ${titleSvg}
  <text x="90" y="548" fill="#A7A0C7" font-size="22" font-family="Inter, Arial, sans-serif" font-weight="600">Freelance lead generation, AI proposals, and pipeline growth</text>
  <text x="956" y="548" fill="#FFFFFF" font-size="24" font-family="Inter, Arial, sans-serif" font-weight="800">iCloseLeads</text>
</svg>
`;
}

mkdirSync(OUTPUT_DIR, { recursive: true });
posts.forEach(([slug, title, category], index) => {
  writeFileSync(join(OUTPUT_DIR, `${slug}.svg`), svgFor(slug, title, category, index), "utf8");
});

console.log(`Generated ${posts.length} blog images in ${OUTPUT_DIR}`);
