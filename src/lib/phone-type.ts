export type PhoneLineType = "mobile" | "landline" | "toll_free" | "service" | "business" | "unknown";

export type PhoneTypeInfo = {
  type: PhoneLineType;
  label: string;
  shortLabel: string;
  confidence: "high" | "medium" | "low";
};

const DEFAULT_PHONE_TYPE: PhoneTypeInfo = {
  type: "business",
  label: "Business phone",
  shortLabel: "Business",
  confidence: "low",
};

function normalizeCountry(country?: string | null) {
  const c = (country ?? "").trim().toLowerCase();
  if (!c) return "";
  if (/\b(united kingdom|great britain|england|scotland|wales|northern ireland|uk|gb|gbr)\b/.test(c)) return "uk";
  if (/\b(united states|united states of america|usa|u\.s\.a\.|us)\b/.test(c)) return "us";
  if (/\b(canada|ca)\b/.test(c)) return "ca";
  if (/\b(australia|au)\b/.test(c)) return "au";
  return c;
}

function digitsOnly(phone: string) {
  return phone.replace(/\D/g, "");
}

function startsWithAny(value: string, prefixes: string[]) {
  return prefixes.some(prefix => value.startsWith(prefix));
}

export function getPhoneTypeInfo(phone?: string | null, country?: string | null): PhoneTypeInfo {
  const raw = (phone ?? "").trim();
  if (!raw) {
    return {
      type: "unknown",
      label: "No phone type",
      shortLabel: "Unknown",
      confidence: "low",
    };
  }

  const digits = digitsOnly(raw);
  const local = digits.replace(/^00/, "");
  const region = normalizeCountry(country);

  const nanp = local.length === 11 && local.startsWith("1") ? local.slice(1) : local;
  if ((region === "us" || region === "ca" || local.startsWith("1")) && nanp.length === 10) {
    if (startsWithAny(nanp, ["800", "822", "833", "844", "855", "866", "877", "888"])) {
      return { type: "toll_free", label: "Toll-free line", shortLabel: "Toll-free", confidence: "high" };
    }

    return DEFAULT_PHONE_TYPE;
  }

  const uk = local.startsWith("44") ? `0${local.slice(2)}` : local;
  if (region === "uk" || local.startsWith("44") || raw.trim().startsWith("0")) {
    if (startsWithAny(uk, ["0800", "0808"])) {
      return { type: "toll_free", label: "UK freephone line", shortLabel: "Freephone", confidence: "high" };
    }
    if (startsWithAny(uk, ["084", "087", "09"])) {
      return { type: "service", label: "UK service number", shortLabel: "Service", confidence: "high" };
    }
    if (uk.startsWith("07")) {
      return { type: "mobile", label: "Likely mobile number", shortLabel: "Mobile", confidence: "high" };
    }
    if (startsWithAny(uk, ["01", "02", "03"])) {
      return { type: "landline", label: "Likely landline", shortLabel: "Landline", confidence: "high" };
    }
  }

  const au = local.startsWith("61") ? `0${local.slice(2)}` : local;
  if (region === "au" || local.startsWith("61")) {
    if (startsWithAny(au, ["1800", "1300"])) {
      return { type: "toll_free", label: "AU shared-cost/freephone line", shortLabel: "Service", confidence: "high" };
    }
    if (au.startsWith("04")) {
      return { type: "mobile", label: "Likely mobile number", shortLabel: "Mobile", confidence: "high" };
    }
    if (startsWithAny(au, ["02", "03", "07", "08"])) {
      return { type: "landline", label: "Likely landline", shortLabel: "Landline", confidence: "high" };
    }
  }

  return DEFAULT_PHONE_TYPE;
}

export function getPhoneTypeTone(type: PhoneLineType) {
  if (type === "mobile") return "border-accent/30 bg-accent/10 text-accent";
  if (type === "landline") return "border-sky-500/30 bg-sky-500/10 text-sky-300";
  if (type === "toll_free") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (type === "service") return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
  return "border-border bg-muted/40 text-muted-foreground";
}
