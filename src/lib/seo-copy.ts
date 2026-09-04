const BRAND_SUFFIX = " | iCloseLeads";

function trimAtWord(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;

  const shortened = normalized.slice(0, maxLength + 1);
  const lastSpace = shortened.lastIndexOf(" ");
  return shortened.slice(0, lastSpace > maxLength * 0.65 ? lastSpace : maxLength).trim();
}

export function seoTitle(value: string) {
  const unbranded = value
    .replace(/\s*[|\-–—]\s*iCloseLeads(?:\s+Blog)?\s*$/i, "")
    .trim();
  return `${trimAtWord(unbranded, 64 - BRAND_SUFFIX.length)}${BRAND_SUFFIX}`;
}

export function seoDescription(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= 155) return normalized;
  return `${trimAtWord(normalized, 154).replace(/[,:;\-–—]+$/, "")}.`;
}
