export type SiteDraftData = {
  company: string;
  category: string;
  location: string;
  address?: string;
  phone?: string;
  website?: string;
  maps?: string;
  pitch?: string;
  status?: string;
};

export type SiteDraftIdentity = {
  segment: string;
  logoLabel: string;
  accent: string;
  accent2: string;
  accentSoft: string;
  surface: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryCta: string;
  secondaryCta: string;
  visualTitle: string;
  visualSubtitle: string;
  pitchHook: string;
  services: Array<{ title: string; description: string }>;
  proof: Array<{ value: string; label: string }>;
  process: Array<{ step: string; title: string; description: string }>;
  pages: string[];
  trustBadges: string[];
  testimonial: { quote: string; name: string };
};

const BUSINESS_STOP_WORDS = new Set(["the", "and", "&", "of", "llc", "ltd", "inc", "co", "company"]);

export function businessInitials(company: string) {
  const words = company
    .replace(/[^a-zA-Z0-9 '&-]/g, " ")
    .split(/\s+/)
    .map(word => word.trim())
    .filter(Boolean)
    .filter(word => !BUSINESS_STOP_WORDS.has(word.toLowerCase()));

  const source = words.length ? words : company.split(/\s+/).filter(Boolean);
  return source
    .slice(0, 2)
    .map(word => word[0])
    .join("")
    .toUpperCase() || "LB";
}

export function marketFromLocation(location: string) {
  const trimmed = location.replace(/\s+/g, " ").trim();
  if (!trimmed) return "your local area";

  const parts = trimmed
    .split(",")
    .map(part => part.replace(/\b\d{5}(?:-\d{4})?\b/g, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (parts.length >= 2) return `${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
  return parts[0] ?? trimmed;
}

function baseIdentity(data: SiteDraftData): Pick<SiteDraftIdentity,
  "eyebrow" | "primaryCta" | "secondaryCta" | "proof" | "trustBadges"
> {
  const market = marketFromLocation(data.location);
  return {
    eyebrow: `${market} ${data.category}`.trim(),
    primaryCta: data.phone ? "Call for a quote" : "Request a quote",
    secondaryCta: data.maps ? "Get directions" : "See services",
    proof: [
      { value: "Fast", label: "mobile experience" },
      { value: "Clear", label: "service path" },
      { value: "Local", label: "search ready" },
    ],
    trustBadges: ["Tap-to-call", "Quote focused", "Local SEO ready"],
  };
}

export function getSiteDraftIdentity(data: SiteDraftData): SiteDraftIdentity {
  const text = `${data.company} ${data.category}`.toLowerCase();
  const market = marketFromLocation(data.location);
  const common = baseIdentity(data);

  if (/\b(auto|car|body|collision|mechanic|garage|repair)\b/.test(text)) {
    return {
      ...common,
      segment: "auto",
      logoLabel: "AUTO",
      accent: "#38bdf8",
      accent2: "#facc15",
      accentSoft: "rgba(56,189,248,0.18)",
      surface: "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(12,74,110,0.72))",
      headline: `${data.company} repairs made simple from estimate to pickup.`,
      subheadline: `A sharp ${market} website built around repair estimates, photo requests, insurance confidence, reviews, and the fastest path to a phone call.`,
      visualTitle: "Estimate-first repair flow",
      visualSubtitle: "Quote requests, damage photos, reviews, directions, and phone calls all stay one tap away.",
      pitchHook: "Lead with a faster estimate flow, before-and-after proof, and high-intent local search pages.",
      services: [
        { title: "Photo estimate requests", description: "Let drivers send vehicle photos and request a repair estimate without waiting on a call." },
        { title: "Insurance-ready trust", description: "Show certifications, reviews, service steps, and repair categories in a clean proof section." },
        { title: "Local repair pages", description: `Target searches around collision repair, dent repair, and auto body work in ${market}.` },
        { title: "Pickup and directions", description: "Make the phone number, location, hours, and directions impossible to miss on mobile." },
      ],
      proof: [
        { value: "1 tap", label: "to request an estimate" },
        { value: "4", label: "repair intent sections" },
        { value: market, label: "local market focus" },
      ],
      process: [
        { step: "01", title: "Send photos", description: "Customers upload damage photos or call the shop from the hero." },
        { step: "02", title: "Get estimate", description: "The page explains the repair path and sets expectation before the visit." },
        { step: "03", title: "Book repair", description: "Directions, phone, and trust proof move the visitor to action." },
      ],
      pages: ["Collision repair", "Dent and paint", "Insurance claims", "Reviews"],
      trustBadges: ["Photo estimates", "Insurance friendly", "Local repair SEO"],
      testimonial: {
        quote: "They made the repair process feel clear before I even called.",
        name: "Local driver",
      },
    };
  }

  if (/\b(clean|maid|janitorial|housekeeping|carpet)\b/.test(text)) {
    return {
      ...common,
      segment: "cleaning",
      logoLabel: "CLEAN",
      accent: "#2dd4bf",
      accent2: "#60a5fa",
      accentSoft: "rgba(45,212,191,0.2)",
      surface: "linear-gradient(135deg, rgba(8,47,73,0.92), rgba(20,83,45,0.72))",
      headline: `${data.company} bookings made easier for busy homes and teams.`,
      subheadline: `A trust-first ${market} cleaning website with quick quote requests, recurring service packages, review proof, and clear service area pages.`,
      visualTitle: "Recurring booking system",
      visualSubtitle: "Visitors can choose a service, see trust proof, request a quote, and become repeat customers.",
      pitchHook: "Sell recurring bookings, local service pages, and a cleaner quote flow.",
      services: [
        { title: "Instant quote requests", description: "Capture home, office, move-out, and recurring cleaning enquiries from one simple form." },
        { title: "Service area pages", description: `Build pages for high-intent cleaning searches around ${market}.` },
        { title: "Recurring packages", description: "Present weekly, bi-weekly, and monthly cleaning plans without confusing customers." },
        { title: "Review-led proof", description: "Make trust signals, insurance notes, and before-after details easy to scan." },
      ],
      proof: [
        { value: "3", label: "booking paths" },
        { value: "Repeat", label: "service focus" },
        { value: market, label: "service area" },
      ],
      process: [
        { step: "01", title: "Pick service", description: "Visitors choose home, office, move-out, or recurring cleaning." },
        { step: "02", title: "Request quote", description: "The form captures timing, rooms, and contact details clearly." },
        { step: "03", title: "Book repeat work", description: "Packages turn one enquiry into predictable monthly revenue." },
      ],
      pages: ["Home cleaning", "Office cleaning", "Move-out cleaning", "Service areas"],
      trustBadges: ["Insured team", "Recurring plans", "Quote ready"],
      testimonial: {
        quote: "It was easy to see the services, trust the team, and request a cleaning slot.",
        name: "Local customer",
      },
    };
  }

  if (/\b(cafe|coffee|restaurant|bakery|food|pizza|bar|grill|diner)\b/.test(text)) {
    return {
      ...common,
      segment: "food",
      logoLabel: "LOCAL",
      accent: "#fb923c",
      accent2: "#fef08a",
      accentSoft: "rgba(251,146,60,0.2)",
      surface: "linear-gradient(135deg, rgba(67,20,7,0.94), rgba(120,53,15,0.72))",
      headline: `${data.company} turned into the easiest local choice for food lovers.`,
      subheadline: `A flavorful ${market} website focused on menus, directions, photos, hours, reviews, and event enquiries that customers can act on fast.`,
      visualTitle: "Menu-to-visit experience",
      visualSubtitle: "Food photos, menu highlights, opening hours, and location actions are built for mobile visitors.",
      pitchHook: "Sell menu clarity, local discovery, photo-led trust, and event enquiry capture.",
      services: [
        { title: "Menu and specials", description: "Make signature items, prices, and specials easy to scan before customers arrive." },
        { title: "Hours and directions", description: "Put location, opening hours, and map actions where mobile visitors expect them." },
        { title: "Photo-led trust", description: "Use a visual section for best sellers, atmosphere, and customer favorites." },
        { title: "Events and catering", description: "Capture private dining, catering, and group enquiries from visitors already interested." },
      ],
      proof: [
        { value: "Menu", label: "first layout" },
        { value: "Photos", label: "built for appetite" },
        { value: market, label: "local discovery" },
      ],
      process: [
        { step: "01", title: "Browse menu", description: "Customers see signature items and specials quickly." },
        { step: "02", title: "Check hours", description: "The page removes friction around location and timing." },
        { step: "03", title: "Visit or enquire", description: "Directions, calls, and event enquiries are one tap away." },
      ],
      pages: ["Menu", "Gallery", "Events", "Location"],
      trustBadges: ["Menu ready", "Photo-led", "Local discovery"],
      testimonial: {
        quote: "I found the menu, checked the location, and knew exactly what to order.",
        name: "Nearby guest",
      },
    };
  }

  if (/\b(salon|barber|spa|nail|beauty|massage|stylist)\b/.test(text)) {
    return {
      ...common,
      segment: "beauty",
      logoLabel: "STYLE",
      accent: "#f472b6",
      accent2: "#c084fc",
      accentSoft: "rgba(244,114,182,0.2)",
      surface: "linear-gradient(135deg, rgba(76,5,25,0.94), rgba(88,28,135,0.72))",
      headline: `${data.company} appointments made effortless and beautiful.`,
      subheadline: `A polished ${market} website with service menus, booking prompts, portfolio proof, reviews, and a mobile-first appointment path.`,
      visualTitle: "Booking-led style showcase",
      visualSubtitle: "The site sells the result visually, then makes appointment requests simple.",
      pitchHook: "Sell booking flow, portfolio sections, treatment pages, and review-led trust.",
      services: [
        { title: "Service menu pages", description: "Show treatments, pricing cues, duration, and best-fit customers clearly." },
        { title: "Appointment CTA", description: "Keep booking, call, and directions visible throughout the mobile journey." },
        { title: "Portfolio proof", description: "Use a gallery-ready section for transformations, styles, and client results." },
        { title: "Local beauty SEO", description: `Target searches for specific services in ${market}.` },
      ],
      proof: [
        { value: "Book", label: "first flow" },
        { value: "Gallery", label: "proof section" },
        { value: market, label: "local intent" },
      ],
      process: [
        { step: "01", title: "Choose service", description: "Visitors quickly understand treatments and fit." },
        { step: "02", title: "See proof", description: "Visual work and reviews build confidence before contact." },
        { step: "03", title: "Book slot", description: "The page pushes appointment actions without feeling pushy." },
      ],
      pages: ["Services", "Gallery", "Team", "Book"],
      trustBadges: ["Appointment ready", "Gallery proof", "Local beauty SEO"],
      testimonial: {
        quote: "The services were clear and the booking path felt effortless.",
        name: "Local client",
      },
    };
  }

  if (/\b(plumb|electric|roof|handyman|hvac|landscap|painter|locksmith|contractor)\b/.test(text)) {
    return {
      ...common,
      segment: "trade",
      logoLabel: "PRO",
      accent: "#facc15",
      accent2: "#38bdf8",
      accentSoft: "rgba(250,204,21,0.18)",
      surface: "linear-gradient(135deg, rgba(39,39,42,0.96), rgba(113,63,18,0.7))",
      headline: `${data.company} positioned as the fast, trusted choice for local jobs.`,
      subheadline: `A practical ${market} trade website with emergency calls, quote requests, trust proof, and service pages built for customers who need help now.`,
      visualTitle: "Emergency-to-quote flow",
      visualSubtitle: "Visitors can call, request a quote, verify trust, and find the exact service they need.",
      pitchHook: "Sell emergency intent, service-area SEO, and phone-first conversion.",
      services: [
        { title: "Emergency call path", description: "Put urgent phone actions and service availability where visitors need them." },
        { title: "Quote request form", description: "Capture photos, job type, postcode, and preferred timing in one flow." },
        { title: "Trust proof", description: "Show licence notes, reviews, guarantees, and completed job categories." },
        { title: "Service pages", description: `Target high-intent job searches across ${market}.` },
      ],
      proof: [
        { value: "Urgent", label: "call path" },
        { value: "Quote", label: "request flow" },
        { value: market, label: "service area" },
      ],
      process: [
        { step: "01", title: "Explain the job", description: "Customers select the problem and share the details." },
        { step: "02", title: "Get a response", description: "Phone and quote paths are clear on every screen." },
        { step: "03", title: "Book the work", description: "Trust proof helps turn the quote into a scheduled job." },
      ],
      pages: ["Emergency service", "Repairs", "Installations", "Service areas"],
      trustBadges: ["Phone-first", "Quote ready", "Service area SEO"],
      testimonial: {
        quote: "I could see what they handled and call without digging around.",
        name: "Local homeowner",
      },
    };
  }

  return {
    ...common,
    segment: "local",
    logoLabel: "LOCAL",
    accent: "#22d3ee",
    accent2: "#a78bfa",
    accentSoft: "rgba(34,211,238,0.18)",
    surface: "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(49,46,129,0.72))",
    headline: `${data.company} turned into a clearer path from search to enquiry.`,
    subheadline: `A modern ${market} website concept built around trust, service clarity, calls, quote requests, and the local searches customers already make.`,
    visualTitle: "Search-to-enquiry website",
    visualSubtitle: "A focused local page that helps visitors understand the offer and take the next step quickly.",
    pitchHook: "Sell speed, clearer services, local SEO, and an easier contact path.",
    services: [
      { title: "Service clarity", description: "Turn scattered details into a simple page customers can understand in seconds." },
      { title: "Contact-first layout", description: "Make phone, maps, quote requests, and next steps visible on mobile." },
      { title: "Local SEO structure", description: `Shape pages around services and searches in ${market}.` },
      { title: "Trust proof", description: "Use reviews, process, location details, and guarantees to reduce hesitation." },
    ],
    process: [
      { step: "01", title: "Understand the offer", description: "The page explains what the business does and who it helps." },
      { step: "02", title: "See proof", description: "Trust signals make the business feel safer to contact." },
      { step: "03", title: "Take action", description: "Visitors can call, get directions, or request a quote quickly." },
    ],
    pages: ["Services", "Reviews", "About", "Contact"],
    testimonial: {
      quote: "The business finally looked clear, credible, and easy to contact.",
      name: "Local customer",
    },
  };
}
