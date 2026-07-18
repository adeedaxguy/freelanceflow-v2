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
      headline: `Reliable ${data.category.toLowerCase()} in ${market}, without the runaround.`,
      subheadline: `Call ${data.company} for repairs, estimates, diagnostics, insurance-ready support, and clear next steps from a local team customers can reach fast.`,
      visualTitle: "Repair help that feels easy to start",
      visualSubtitle: "Services, estimates, reviews, directions, and phone calls stay clear from the first screen.",
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
      headline: `Reliable cleaning help in ${market}, booked without the back-and-forth.`,
      subheadline: `${data.company} makes home, office, move-out, and recurring cleaning simple to compare, quote, and schedule.`,
      visualTitle: "Cleaning services customers can choose quickly",
      visualSubtitle: "Service options, recurring plans, reviews, and quote requests are easy to scan on mobile.",
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
      headline: `Fresh local flavor from ${data.company}, easy to find and visit.`,
      subheadline: `Menus, specials, photos, hours, reviews, and directions help ${market} customers decide faster.`,
      visualTitle: "Menu, photos, hours, and directions in one place",
      visualSubtitle: "Food photos, menu highlights, opening hours, and location actions are built for mobile guests.",
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
      headline: `Book a polished local appointment with ${data.company}.`,
      subheadline: `Service menus, style proof, reviews, location details, and booking prompts help ${market} clients choose with confidence.`,
      visualTitle: "Services, proof, and booking made simple",
      visualSubtitle: "The page shows the result visually, then makes appointment requests simple.",
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
      headline: `Fast, trusted local help from ${data.company}.`,
      subheadline: `Emergency calls, quote requests, service details, and trust proof help ${market} customers get the right trade help quickly.`,
      visualTitle: "Emergency calls and quote requests made clear",
      visualSubtitle: "Customers can call, request a quote, verify trust, and find the exact service they need.",
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

  if (/\b(dentist|dental|doctor|clinic|medical|physio|therapy|chiropractor|optician|veterinary|vet)\b/.test(text)) {
    return {
      ...common,
      segment: "clinic",
      logoLabel: "CARE",
      accent: "#38bdf8",
      accent2: "#34d399",
      accentSoft: "rgba(56,189,248,0.18)",
      surface: "linear-gradient(135deg, rgba(8,47,73,0.94), rgba(20,83,45,0.7))",
      headline: `Clear local care from ${data.company}, easier to trust and book.`,
      subheadline: `Treatment information, practitioner trust, booking routes, insurance cues, and location details help ${market} patients choose with confidence.`,
      visualTitle: "Care pathways that feel calm and clear",
      visualSubtitle: "Patients can understand services, credentials, location, and the next appointment step without confusion.",
      pitchHook: "Sell trust-led service pages, practitioner proof, appointment flow, and local healthcare SEO.",
      services: [
        { title: "Treatment pages", description: "Explain common services, who they are for, and what patients should expect." },
        { title: "Appointment CTA", description: "Keep booking, calls, directions, and eligibility cues clear on every screen." },
        { title: "Practitioner trust", description: "Show credentials, care approach, reviews, and patient reassurance before contact." },
        { title: "Local care SEO", description: `Target treatment and clinic searches across ${market}.` },
      ],
      proof: [
        { value: "Care", label: "first structure" },
        { value: "Trust", label: "credential proof" },
        { value: market, label: "patient market" },
      ],
      process: [
        { step: "01", title: "Choose care", description: "Patients see the right service and understand fit quickly." },
        { step: "02", title: "Verify trust", description: "Credentials, reviews, and care details reduce hesitation." },
        { step: "03", title: "Book appointment", description: "The next step stays clear without overwhelming the patient." },
      ],
      pages: ["Treatments", "Practitioners", "Insurance", "Book"],
      trustBadges: ["Appointment ready", "Credential proof", "Local care SEO"],
      testimonial: {
        quote: "The information felt clear enough to book without calling around.",
        name: "Local patient",
      },
    };
  }

  if (/\b(law|lawyer|attorney|accountant|consultant|insurance|real estate|estate agent|advisor|financial)\b/.test(text)) {
    return {
      ...common,
      segment: "professional",
      logoLabel: "ADVISORY",
      accent: "#60a5fa",
      accent2: "#a78bfa",
      accentSoft: "rgba(96,165,250,0.18)",
      surface: "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.78))",
      headline: `${data.company} positioned as the safer expert choice in ${market}.`,
      subheadline: `Service fit, credentials, outcomes, consultation routes, and proof help serious buyers decide who to contact first.`,
      visualTitle: "Authority before the enquiry",
      visualSubtitle: "A calm page can show expertise, service fit, proof, and a consultation path without sounding salesy.",
      pitchHook: "Sell consultation-led positioning, authority pages, proof blocks, and qualified enquiry flow.",
      services: [
        { title: "Consultation path", description: "Help qualified visitors understand whether this is the right expert to contact." },
        { title: "Authority proof", description: "Present credentials, case context, sectors served, and serious trust cues." },
        { title: "Service fit pages", description: `Target specific advisory searches and local intent in ${market}.` },
        { title: "Lead quality", description: "Use forms and prompts that collect context before a consultation." },
      ],
      proof: [
        { value: "Expert", label: "positioning" },
        { value: "Fit", label: "qualified enquiry" },
        { value: market, label: "local authority" },
      ],
      process: [
        { step: "01", title: "Understand need", description: "Visitors identify the service or situation that matches their problem." },
        { step: "02", title: "Review proof", description: "Credentials and outcomes build confidence before the enquiry." },
        { step: "03", title: "Request consult", description: "The form captures enough context for a better first conversation." },
      ],
      pages: ["Services", "Industries", "Proof", "Consultation"],
      trustBadges: ["Consultation ready", "Authority proof", "Qualified enquiries"],
      testimonial: {
        quote: "The page made the firm feel serious and easy to contact.",
        name: "Local client",
      },
    };
  }

  if (/\b(gym|fitness|yoga|pilates|trainer|martial|dance|studio)\b/.test(text)) {
    return {
      ...common,
      segment: "fitness",
      logoLabel: "MOVE",
      accent: "#22c55e",
      accent2: "#facc15",
      accentSoft: "rgba(34,197,94,0.18)",
      surface: "linear-gradient(135deg, rgba(20,83,45,0.94), rgba(63,63,70,0.72))",
      headline: `Programs at ${data.company} made easier to join.`,
      subheadline: `Classes, memberships, trainers, schedule cues, and first-session actions help ${market} customers take the first step.`,
      visualTitle: "Programs, schedule, and first visit in one flow",
      visualSubtitle: "The page turns interest into a class booking, trial session, or membership enquiry.",
      pitchHook: "Sell class schedules, membership paths, trainer proof, and local fitness SEO.",
      services: [
        { title: "Program cards", description: "Show classes, training options, memberships, and who each path fits." },
        { title: "Trial session CTA", description: "Make the first visit or consultation easy to start from mobile." },
        { title: "Trainer proof", description: "Use instructor, transformation, and community proof to reduce hesitation." },
        { title: "Local fitness SEO", description: `Target class, trainer, and studio searches around ${market}.` },
      ],
      proof: [
        { value: "Trial", label: "first action" },
        { value: "Classes", label: "clear options" },
        { value: market, label: "local fitness" },
      ],
      process: [
        { step: "01", title: "Pick a goal", description: "Visitors choose the program or class that matches their goal." },
        { step: "02", title: "See schedule", description: "Class and timing cues reduce friction before contact." },
        { step: "03", title: "Start trial", description: "The CTA points to the first visit, class, or membership enquiry." },
      ],
      pages: ["Classes", "Memberships", "Trainers", "Schedule"],
      trustBadges: ["Trial ready", "Schedule led", "Community proof"],
      testimonial: {
        quote: "I could see the right class and how to start before visiting.",
        name: "Local member",
      },
    };
  }

  if (/\b(retail|shop|store|boutique|florist|jewelry|jewellery|pet|groom|fashion)\b/.test(text)) {
    return {
      ...common,
      segment: "retail",
      logoLabel: "SHOP",
      accent: "#fb7185",
      accent2: "#38bdf8",
      accentSoft: "rgba(251,113,133,0.18)",
      surface: "linear-gradient(135deg, rgba(76,5,25,0.94), rgba(30,64,175,0.65))",
      headline: `${data.company} made easier to browse, visit, and buy from locally.`,
      subheadline: `Collections, store details, offers, photos, directions, and enquiry routes help local shoppers choose before they arrive.`,
      visualTitle: "Products, offers, and visit intent together",
      visualSubtitle: "A stronger page can show what is available, why it matters, and how to visit or enquire.",
      pitchHook: "Sell collection pages, local product discovery, visit CTAs, and photo-led proof.",
      services: [
        { title: "Collection highlights", description: "Show categories, best sellers, seasonal items, and popular requests." },
        { title: "Visit path", description: "Make opening hours, directions, phone, and product enquiries obvious." },
        { title: "Photo-led proof", description: "Use product visuals and in-store cues to make the shop feel worth visiting." },
        { title: "Local retail SEO", description: `Target product and store searches across ${market}.` },
      ],
      proof: [
        { value: "Shop", label: "visit path" },
        { value: "Photos", label: "product proof" },
        { value: market, label: "local shoppers" },
      ],
      process: [
        { step: "01", title: "Browse category", description: "Customers see what the shop offers before calling or visiting." },
        { step: "02", title: "Check details", description: "Hours, location, and enquiry routes are easy to find." },
        { step: "03", title: "Visit or ask", description: "The page turns local interest into store visits or product enquiries." },
      ],
      pages: ["Collections", "Offers", "Gallery", "Visit"],
      trustBadges: ["Product-led", "Visit ready", "Local shopping SEO"],
      testimonial: {
        quote: "I could tell what they stocked and how to visit right away.",
        name: "Local shopper",
      },
    };
  }

  if (/\b(photo|photography|creative|design|agency|marketing|tattoo|artist|portfolio)\b/.test(text)) {
    return {
      ...common,
      segment: "creative",
      logoLabel: "WORK",
      accent: "#a78bfa",
      accent2: "#22d3ee",
      accentSoft: "rgba(167,139,250,0.18)",
      surface: "linear-gradient(135deg, rgba(49,46,129,0.96), rgba(8,47,73,0.72))",
      headline: `${data.company} made easier to judge by the work.`,
      subheadline: `Portfolio proof, service packages, process, outcomes, and enquiry prompts help prospects understand fit before contacting.`,
      visualTitle: "Portfolio proof before the enquiry",
      visualSubtitle: "A visual-led page can show taste, process, results, and the next step without feeling generic.",
      pitchHook: "Sell portfolio architecture, package clarity, project enquiry flow, and creative trust proof.",
      services: [
        { title: "Portfolio sections", description: "Show work examples, styles, project types, and proof in a stronger visual flow." },
        { title: "Package clarity", description: "Turn vague services into clear packages or project starting points." },
        { title: "Process proof", description: "Explain how enquiries become briefs, concepts, revisions, and deliverables." },
        { title: "Creative SEO", description: `Target project and service searches around ${market}.` },
      ],
      proof: [
        { value: "Work", label: "first proof" },
        { value: "Process", label: "clear path" },
        { value: market, label: "creative market" },
      ],
      process: [
        { step: "01", title: "Review work", description: "Visitors judge taste and fit before reading every detail." },
        { step: "02", title: "Choose package", description: "Services are framed around outcomes and project types." },
        { step: "03", title: "Send brief", description: "The enquiry path asks for useful project context." },
      ],
      pages: ["Portfolio", "Packages", "Process", "Contact"],
      trustBadges: ["Portfolio first", "Package clarity", "Brief ready"],
      testimonial: {
        quote: "I could understand the style and send an enquiry with confidence.",
        name: "Creative client",
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
    headline: `${data.company} made easier to trust, understand, and contact.`,
    subheadline: `A modern ${market} local business page built around clear services, trust proof, calls, quote requests, and the searches customers already make.`,
    visualTitle: "Services, proof, and contact details in one clear path",
    visualSubtitle: "A focused local page helps customers understand the offer and take the next step quickly.",
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
