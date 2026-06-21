type Theme = {
  accent: string;
  accent2: string;
  glow: string;
  label: string;
  motif: "local" | "contact" | "jobs" | "outreach" | "pipeline" | "search" | "signals";
};

const THEMES: Record<string, Theme> = {
  contact: { accent: "#A855F7", accent2: "#13D8A8", glow: "#7C3AED", label: "Decision Path", motif: "contact" },
  local: { accent: "#13D8A8", accent2: "#FACC15", glow: "#0F766E", label: "Local Signal", motif: "local" },
  jobs: { accent: "#60A5FA", accent2: "#A855F7", glow: "#2563EB", label: "Fresh Lead", motif: "jobs" },
  outreach: { accent: "#F472B6", accent2: "#8B5CF6", glow: "#BE185D", label: "Pitch Ready", motif: "outreach" },
  pipeline: { accent: "#34D399", accent2: "#60A5FA", glow: "#047857", label: "Pipeline", motif: "pipeline" },
  search: { accent: "#FACC15", accent2: "#13D8A8", glow: "#A16207", label: "Search Intent", motif: "search" },
  signals: { accent: "#8B5CF6", accent2: "#13D8A8", glow: "#6D28D9", label: "Growth System", motif: "signals" },
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function titleFromSlug(slug: string) {
  return slug
    .replace(/\.svg$/i, "")
    .replace(/-\d{10,}$/i, "")
    .split("-")
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function inferCategory(title: string, slug: string) {
  const key = `${title} ${slug}`.toLowerCase();
  if (/owner|decision|contact|phone|email|mobile|whatsapp/.test(key)) return "Decision Makers";
  if (/local|business|maps|google|website|web-design|no-website|outdated|seo-consultants/.test(key)) return "Local Business";
  if (/remote|job|live|meta|ads/.test(key)) return "Remote Jobs";
  if (/proposal|outreach|email|cold|template/.test(key)) return "Outreach";
  if (/crm|pipeline|saved|follow/.test(key)) return "CRM";
  if (/search|generative|keyword|rank|geo/.test(key)) return "SEO";
  if (/tool|software/.test(key)) return "Tools";
  return "Strategy";
}

function wrapText(text: string, maxLineLength = 31, maxLines = 3) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLineLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
    if (lines.length === maxLines) break;
  }

  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    lines[maxLines - 1] = `${(lines[maxLines - 1] ?? "").replace(/[,.]$/, "")}...`;
  }
  return lines;
}

function inferTheme(title: string, category: string, slug: string): Theme {
  const key = `${title} ${category} ${slug}`.toLowerCase();
  if (/owner|decision|contact|phone|email|mobile|whatsapp/.test(key)) return THEMES.contact!;
  if (/local|business|maps|google|seo|website|web design|agency|lead qualification|enrichment/.test(key)) return THEMES.local!;
  if (/remote|job|meta|ads|live/.test(key)) return THEMES.jobs!;
  if (/proposal|outreach|email|template|cold/.test(key)) return THEMES.outreach!;
  if (/crm|saved|pipeline|follow/.test(key)) return THEMES.pipeline!;
  if (/search|generative|engine|keyword|rank|geo/.test(key)) return THEMES.search!;
  return THEMES.signals!;
}

function motif(theme: Theme) {
  switch (theme.motif) {
    case "contact":
      return `
        <rect x="745" y="118" width="300" height="378" rx="34" fill="#121127" stroke="${theme.accent}" stroke-opacity=".42"/>
        <circle cx="895" cy="218" r="58" fill="${theme.accent}" fill-opacity=".18" stroke="${theme.accent}" stroke-opacity=".75"/>
        <circle cx="895" cy="202" r="22" fill="${theme.accent2}" fill-opacity=".9"/>
        <path d="M842 274c18-35 88-35 106 0" stroke="${theme.accent2}" stroke-width="16" stroke-linecap="round"/>
        <rect x="794" y="332" width="202" height="16" rx="8" fill="#fff" opacity=".22"/>
        <rect x="794" y="378" width="158" height="16" rx="8" fill="${theme.accent2}" opacity=".58"/>
        <rect x="794" y="424" width="184" height="16" rx="8" fill="#fff" opacity=".16"/>
        <path d="M710 402c-88-14-136-56-144-126" stroke="${theme.accent2}" stroke-width="8" stroke-linecap="round" stroke-dasharray="18 18"/>
        <circle cx="562" cy="268" r="22" fill="${theme.accent2}"/>
      `;
    case "local":
      return `
        <path d="M710 126h328c20 0 36 16 36 36v278c0 20-16 36-36 36H710c-20 0-36-16-36-36V162c0-20 16-36 36-36Z" fill="#111225" stroke="${theme.accent}" stroke-opacity=".44"/>
        <path d="M704 196h340M704 286h340M704 376h340M788 154v300M896 154v300M1004 154v300" stroke="#fff" stroke-opacity=".08" stroke-width="3"/>
        <path d="M858 230c0 54-64 104-64 104s-64-50-64-104a64 64 0 0 1 128 0Z" fill="${theme.accent}" fill-opacity=".92"/>
        <circle cx="794" cy="230" r="23" fill="#061713"/>
        <path d="M972 336c0 44-52 85-52 85s-52-41-52-85a52 52 0 0 1 104 0Z" fill="${theme.accent2}" fill-opacity=".9"/>
        <circle cx="920" cy="336" r="18" fill="#14110A"/>
      `;
    case "jobs":
      return `
        <rect x="690" y="116" width="355" height="86" rx="24" fill="#111225" stroke="${theme.accent}" stroke-opacity=".44"/>
        <rect x="690" y="236" width="355" height="86" rx="24" fill="#111225" stroke="${theme.accent2}" stroke-opacity=".35"/>
        <rect x="690" y="356" width="355" height="86" rx="24" fill="#111225" stroke="#fff" stroke-opacity=".13"/>
        <circle cx="736" cy="159" r="15" fill="${theme.accent}"/>
        <circle cx="736" cy="279" r="15" fill="${theme.accent2}"/>
        <circle cx="736" cy="399" r="15" fill="${theme.accent}" opacity=".45"/>
        <rect x="772" y="145" width="194" height="12" rx="6" fill="#fff" opacity=".24"/>
        <rect x="772" y="169" width="134" height="10" rx="5" fill="${theme.accent}" opacity=".55"/>
        <rect x="772" y="265" width="218" height="12" rx="6" fill="#fff" opacity=".22"/>
        <rect x="772" y="289" width="158" height="10" rx="5" fill="${theme.accent2}" opacity=".5"/>
        <rect x="772" y="385" width="178" height="12" rx="6" fill="#fff" opacity=".18"/>
        <rect x="772" y="409" width="120" height="10" rx="5" fill="#fff" opacity=".13"/>
      `;
    case "outreach":
      return `
        <rect x="702" y="134" width="348" height="282" rx="30" fill="#111225" stroke="${theme.accent}" stroke-opacity=".42"/>
        <path d="M737 202l139 96 139-96" stroke="${theme.accent2}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M737 202h278v164H737V202Z" stroke="#fff" stroke-opacity=".16" stroke-width="10" stroke-linejoin="round"/>
        <rect x="748" y="458" width="160" height="18" rx="9" fill="${theme.accent}" opacity=".62"/>
        <rect x="928" y="458" width="88" height="18" rx="9" fill="#fff" opacity=".16"/>
        <path d="M650 156l23 12 12 23 12-23 23-12-23-12-12-23-12 23-23 12Z" fill="${theme.accent2}"/>
      `;
    case "pipeline":
      return `
        <rect x="682" y="124" width="116" height="330" rx="28" fill="#111225" stroke="${theme.accent}" stroke-opacity=".4"/>
        <rect x="820" y="124" width="116" height="330" rx="28" fill="#111225" stroke="${theme.accent2}" stroke-opacity=".35"/>
        <rect x="958" y="124" width="116" height="330" rx="28" fill="#111225" stroke="#fff" stroke-opacity=".14"/>
        <rect x="710" y="178" width="60" height="18" rx="9" fill="${theme.accent}" opacity=".85"/>
        <rect x="710" y="238" width="54" height="18" rx="9" fill="#fff" opacity=".18"/>
        <rect x="848" y="208" width="60" height="18" rx="9" fill="${theme.accent2}" opacity=".85"/>
        <rect x="848" y="300" width="48" height="18" rx="9" fill="#fff" opacity=".18"/>
        <rect x="986" y="178" width="60" height="18" rx="9" fill="#fff" opacity=".22"/>
        <rect x="986" y="268" width="56" height="18" rx="9" fill="${theme.accent}" opacity=".48"/>
      `;
    case "search":
      return `
        <circle cx="844" cy="264" r="118" fill="#111225" stroke="${theme.accent}" stroke-opacity=".55" stroke-width="10"/>
        <path d="M928 348l108 108" stroke="${theme.accent2}" stroke-width="22" stroke-linecap="round"/>
        <circle cx="844" cy="264" r="54" fill="${theme.accent}" fill-opacity=".18"/>
        <path d="M704 162l22 12 12 22 12-22 22-12-22-12-12-22-12 22-22 12ZM1016 164l18 10 10 18 10-18 18-10-18-10-10-18-10 18-18 10Z" fill="${theme.accent2}"/>
        <path d="M742 430c98 36 204 25 308-34" stroke="#fff" stroke-opacity=".16" stroke-width="8" stroke-linecap="round"/>
      `;
    default:
      return `
        <path d="M700 420c88-170 170-244 342-298" stroke="${theme.accent}" stroke-width="16" stroke-linecap="round" stroke-dasharray="2 34"/>
        <circle cx="730" cy="386" r="44" fill="${theme.accent}" fill-opacity=".9"/>
        <circle cx="862" cy="274" r="52" fill="${theme.accent2}" fill-opacity=".9"/>
        <circle cx="1018" cy="158" r="40" fill="#fff" fill-opacity=".18"/>
        <rect x="704" y="452" width="344" height="18" rx="9" fill="#fff" opacity=".16"/>
        <rect x="704" y="492" width="234" height="18" rx="9" fill="${theme.accent2}" opacity=".5"/>
      `;
  }
}

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug).replace(/\.svg$/i, "");
  const title = titleFromSlug(slug);
  const category = inferCategory(title, slug);
  const theme = inferTheme(title, category, slug);
  const titleLines = wrapText(title);
  const safeCategoryCaps = escapeXml(category.toUpperCase());
  const safeLabel = escapeXml(theme.label);
  const safeTitleLines = titleLines.map(escapeXml);

  const titleSvg = safeTitleLines
    .map((line, index) => `<text x="86" y="${226 + index * 68}" fill="#F8F7FF" font-size="54" font-family="Inter, Arial, sans-serif" font-weight="850" letter-spacing="0">${line}</text>`)
    .join("");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#090716"/>
      <stop offset="0.5" stop-color="#111126"/>
      <stop offset="1" stop-color="#031B19"/>
    </linearGradient>
    <linearGradient id="brand" x1="74" y1="74" x2="1126" y2="556" gradientUnits="userSpaceOnUse">
      <stop stop-color="${theme.accent}"/>
      <stop offset="1" stop-color="${theme.accent2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(910 150) rotate(130) scale(510 650)">
      <stop stop-color="${theme.glow}" stop-opacity=".42"/>
      <stop offset=".58" stop-color="${theme.accent2}" stop-opacity=".12"/>
      <stop offset="1" stop-color="#02030A" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.35" fill="#FFFFFF" opacity=".13"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="630" fill="url(#dots)" opacity=".52"/>
  <rect x="62" y="62" width="1076" height="506" rx="38" stroke="url(#brand)" stroke-opacity=".44"/>
  <path d="M86 516h352" stroke="url(#brand)" stroke-width="12" stroke-linecap="round"/>
  <path d="M86 548h230" stroke="#FFFFFF" stroke-opacity=".16" stroke-width="10" stroke-linecap="round"/>
  <rect x="86" y="104" width="${Math.min(320, 92 + category.length * 10)}" height="42" rx="21" fill="${theme.accent}" fill-opacity=".16" stroke="${theme.accent}" stroke-opacity=".52"/>
  <text x="110" y="132" fill="${theme.accent2}" font-size="18" font-family="Inter, Arial, sans-serif" font-weight="850" letter-spacing="1.6">${safeCategoryCaps}</text>
  <text x="86" y="178" fill="#A7A0C7" font-size="24" font-family="Inter, Arial, sans-serif" font-weight="700">${safeLabel}</text>
  ${titleSvg}
  ${motif(theme)}
  <text x="948" y="546" fill="#F8F7FF" font-size="23" font-family="Inter, Arial, sans-serif" font-weight="850">iCloseLeads</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
