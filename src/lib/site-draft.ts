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

export function getSiteDraftIdentity(data: SiteDraftData, creativeBrief = ""): SiteDraftIdentity {
  const text = `${data.company} ${data.category} ${creativeBrief}`.toLowerCase();
  const market = marketFromLocation(data.location);
  const common = baseIdentity(data);

  if (/\b(auto|car|body|collision|mechanic|garage|repair)\b/.test(text)) {
    return {
      ...common,
      primaryCta: data.phone ? "Request an estimate" : "Get an estimate",
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
      primaryCta: "Get a cleaning quote",
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

  if (/\b(cafe|coffee|restaurant|bakery|bake|bread|pastry|cake|food|pizza|bar|grill|diner|catering)\b/.test(text)) {
    const isBakery = /\b(bakery|bake|bread|pastry|cake|patisserie)\b/.test(text);
    return {
      ...common,
      eyebrow: `${isBakery ? "Bakery" : data.category} · ${market}`,
      primaryCta: isBakery ? "Order online" : "Book a table",
      secondaryCta: isBakery ? "Plan catering" : common.secondaryCta,
      segment: isBakery ? "bakery" : "food",
      logoLabel: isBakery ? "BAKE" : "LOCAL",
      accent: "#fb923c",
      accent2: "#fef08a",
      accentSoft: "rgba(251,146,60,0.2)",
      surface: "linear-gradient(135deg, rgba(67,20,7,0.94), rgba(120,53,15,0.72))",
      headline: isBakery
        ? `Small-batch baking with a big reason to visit ${data.company}.`
        : `Fresh local flavor from ${data.company}, easy to find and visit.`,
      subheadline: isBakery
        ? `Show ${market} what is fresh today, make online ordering effortless, and turn celebration cakes and catering into clear enquiries.`
        : `Menus, specials, photos, hours, reviews, and directions help ${market} customers decide faster.`,
      visualTitle: isBakery
        ? "Today’s bakes, celebration orders, and catering"
        : "Menu, photos, hours, and directions in one place",
      visualSubtitle: isBakery
        ? "A warm, photo-led storefront that lets customers browse, order, and enquire without hunting through social posts."
        : "Food photos, menu highlights, opening hours, and location actions are built for mobile guests.",
      pitchHook: isBakery
        ? "Lead with fresh products, online ordering, catering, and celebration enquiries."
        : "Sell menu clarity, local discovery, photo-led trust, and event enquiry capture.",
      services: isBakery
        ? [
            { title: "Today’s bakes", description: "Make breads, pastries, cakes, and seasonal favourites easy to browse from the first screen." },
            { title: "Order online", description: "Give regular customers a direct route to collection orders without a phone call." },
            { title: "Cakes and catering", description: "Capture date, size, flavour, and event details in a focused enquiry path." },
            { title: "Visit the bakery", description: "Keep opening hours, location, directions, and contact details close to every decision." },
          ]
        : [
            { title: "Menu and specials", description: "Make signature items, prices, and specials easy to scan before customers arrive." },
            { title: "Hours and directions", description: "Put location, opening hours, and map actions where mobile visitors expect them." },
            { title: "Photo-led trust", description: "Use a visual section for best sellers, atmosphere, and customer favorites." },
            { title: "Events and catering", description: "Capture private dining, catering, and group enquiries from visitors already interested." },
          ],
      proof: [
        { value: isBakery ? "Order" : "Menu", label: isBakery ? "ready from mobile" : "first layout" },
        { value: isBakery ? "Cakes" : "Photos", label: isBakery ? "enquiry path" : "built for appetite" },
        { value: market, label: "local discovery" },
      ],
      process: isBakery
        ? [
            { step: "01", title: "Choose a favourite", description: "Customers browse fresh bakes, seasonal items, and celebration options." },
            { step: "02", title: "Order or enquire", description: "The right form captures collection, cake, or catering details." },
            { step: "03", title: "Collect or visit", description: "Hours, directions, and order expectations stay clear." },
          ]
        : [
            { step: "01", title: "Browse menu", description: "Customers see signature items and specials quickly." },
            { step: "02", title: "Check hours", description: "The page removes friction around location and timing." },
            { step: "03", title: "Visit or enquire", description: "Directions, calls, and event enquiries are one tap away." },
          ],
      pages: isBakery ? ["Today’s bakes", "Celebration cakes", "Catering", "Visit"] : ["Menu", "Gallery", "Events", "Location"],
      trustBadges: isBakery ? ["Baked locally", "Order ready", "Catering enquiries"] : ["Menu ready", "Photo-led", "Local discovery"],
      testimonial: {
        quote: isBakery
          ? "I could see what looked good, place an order, and plan collection in minutes."
          : "I found the menu, checked the location, and knew exactly what to order.",
        name: "Nearby guest",
      },
    };
  }

  if (/\b(salon|barber|spa|nail|beauty|massage|stylist)\b/.test(text)) {
    return {
      ...common,
      primaryCta: "Book an appointment",
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
      primaryCta: data.phone ? "Request service" : "Get a quote",
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
      primaryCta: "Book an appointment",
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

  if (/\b(real estate|estate agent|realtor|property|homes|apartments|lettings|rentals|valuation)\b/.test(text)) {
    return {
      ...common,
      primaryCta: "Book a viewing",
      segment: "property",
      logoLabel: "PROPERTY",
      accent: "#0ea5e9",
      accent2: "#f59e0b",
      accentSoft: "rgba(14,165,233,0.18)",
      surface: "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,64,175,0.7))",
      headline: `${data.company} made easier to trust for local property decisions.`,
      subheadline: `Listings, valuations, area knowledge, viewing paths, and consultation routes help ${market} buyers, sellers, and landlords take the next step.`,
      visualTitle: "Listings, valuation requests, and local market proof",
      visualSubtitle: "A stronger property page can connect search intent to listings, advice, and a qualified enquiry.",
      pitchHook: "Sell listing pages, valuation CTAs, area guides, and property enquiry capture.",
      services: [
        { title: "Listing highlights", description: "Show featured homes, property types, viewing routes, and next steps clearly." },
        { title: "Valuation requests", description: "Capture seller or landlord enquiries with a focused valuation CTA." },
        { title: "Area guides", description: `Target neighbourhood and property searches around ${market}.` },
        { title: "Trust proof", description: "Use reviews, local knowledge, sale or letting process, and advisor proof." },
      ],
      proof: [
        { value: "Listings", label: "first proof" },
        { value: "Valuation", label: "lead path" },
        { value: market, label: "local market" },
      ],
      process: [
        { step: "01", title: "Browse or value", description: "Visitors choose between properties, valuations, or local advice." },
        { step: "02", title: "Check local proof", description: "Area knowledge and testimonials build confidence." },
        { step: "03", title: "Book enquiry", description: "The CTA captures the right context for a useful follow-up." },
      ],
      pages: ["Listings", "Valuations", "Area guides", "Contact"],
      trustBadges: ["Valuation ready", "Area-guide SEO", "Qualified enquiries"],
      testimonial: {
        quote: "The local advice and valuation path made the next step obvious.",
        name: "Local homeowner",
      },
    };
  }

  if (/\b(law|lawyer|attorney|accountant|consultant|insurance|advisor|financial)\b/.test(text)) {
    return {
      ...common,
      primaryCta: "Book a consultation",
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

  if (/\b(ecommerce|e-commerce|online store|shopify|product|collection|catalogue|catalog)\b/.test(text)) {
    return {
      ...common,
      primaryCta: "Shop the collection",
      segment: "retail",
      logoLabel: "SHOP",
      accent: "#fb7185",
      accent2: "#22d3ee",
      accentSoft: "rgba(251,113,133,0.18)",
      surface: "linear-gradient(135deg, rgba(76,5,25,0.94), rgba(8,47,73,0.72))",
      headline: `${data.company} made easier to browse, trust, and buy from.`,
      subheadline: `Collections, best sellers, product proof, offers, delivery cues, and enquiry paths help shoppers choose faster.`,
      visualTitle: "Collections and product proof customers can compare",
      visualSubtitle: "The page turns product interest into a buying, enquiry, or store-visit path.",
      pitchHook: "Sell collection structure, product-led SEO, trust proof, and conversion-focused buying paths.",
      services: [
        { title: "Collection architecture", description: "Present categories, best sellers, seasonal offers, and popular requests." },
        { title: "Product proof", description: "Use visual cards, reviews, guarantees, and delivery or pickup details." },
        { title: "Buying path", description: "Make buy, enquire, visit, or WhatsApp actions clear from mobile." },
        { title: "Search-ready pages", description: "Shape product and local-intent pages customers can actually find." },
      ],
      proof: [
        { value: "Products", label: "first story" },
        { value: "Trust", label: "buying proof" },
        { value: "Fast", label: "shopping path" },
      ],
      process: [
        { step: "01", title: "Browse collection", description: "Shoppers understand the range and best options quickly." },
        { step: "02", title: "Check trust", description: "Reviews, policies, and product proof reduce hesitation." },
        { step: "03", title: "Buy or enquire", description: "The page keeps the conversion route easy to use." },
      ],
      pages: ["Collections", "Best sellers", "Offers", "Contact"],
      trustBadges: ["Product-led", "Conversion ready", "Search structured"],
      testimonial: {
        quote: "I could see the products, trust the store, and ask before buying.",
        name: "Local shopper",
      },
    };
  }

  if (/\b(gym|fitness|yoga|pilates|trainer|martial|dance|studio)\b/.test(text)) {
    return {
      ...common,
      primaryCta: "Start a trial",
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

  if (/\b(school|course|training|academy|tutor|tuition|class|workshop|education|learning)\b/.test(text)) {
    return {
      ...common,
      primaryCta: "View classes",
      segment: "education",
      logoLabel: "LEARN",
      accent: "#6366f1",
      accent2: "#22c55e",
      accentSoft: "rgba(99,102,241,0.18)",
      surface: "linear-gradient(135deg, rgba(30,27,75,0.96), rgba(20,83,45,0.68))",
      headline: `${data.company} made easier to understand, compare, and enrol in.`,
      subheadline: `Programmes, outcomes, schedules, tutor proof, and enrolment CTAs help learners or parents choose with confidence.`,
      visualTitle: "Courses, outcomes, and enrolment in one path",
      visualSubtitle: "A clear education page helps visitors understand fit before they enquire.",
      pitchHook: "Sell programme pages, outcome proof, schedule clarity, and enrolment conversion.",
      services: [
        { title: "Programme cards", description: "Show courses, levels, outcomes, dates, and who each option is for." },
        { title: "Outcome proof", description: "Use testimonials, student results, tutor credentials, and learning goals." },
        { title: "Enrolment CTA", description: "Keep enquiry, trial class, and application actions visible." },
        { title: "Course SEO", description: `Target class, tutor, and training searches around ${market}.` },
      ],
      proof: [
        { value: "Courses", label: "clear options" },
        { value: "Outcomes", label: "proof path" },
        { value: market, label: "learning market" },
      ],
      process: [
        { step: "01", title: "Choose programme", description: "Visitors compare the right course or class quickly." },
        { step: "02", title: "Check outcomes", description: "Proof and credentials answer the trust question." },
        { step: "03", title: "Enrol or enquire", description: "The next step is visible without extra searching." },
      ],
      pages: ["Courses", "Outcomes", "Tutors", "Enrol"],
      trustBadges: ["Enrolment ready", "Outcome proof", "Course SEO"],
      testimonial: {
        quote: "The course options and next step were clear from the first page.",
        name: "Local learner",
      },
    };
  }

  if (/\b(event|events|wedding|venue|party|entertainment|music|photobooth|conference|birthday)\b/.test(text)) {
    return {
      ...common,
      primaryCta: "Check availability",
      segment: "events",
      logoLabel: "EVENT",
      accent: "#c084fc",
      accent2: "#f472b6",
      accentSoft: "rgba(192,132,252,0.18)",
      surface: "linear-gradient(135deg, rgba(49,46,129,0.96), rgba(131,24,67,0.72))",
      headline: `${data.company} made easier to book for the next big moment.`,
      subheadline: `Packages, gallery proof, dates, venue or service details, and booking prompts help event customers enquire faster.`,
      visualTitle: "Packages, photos, and booking confidence",
      visualSubtitle: "The page turns event interest into a clearer enquiry with fewer questions.",
      pitchHook: "Sell package clarity, event gallery proof, date-led CTAs, and booking enquiry capture.",
      services: [
        { title: "Package cards", description: "Show event types, inclusions, guest fit, and starting options clearly." },
        { title: "Gallery proof", description: "Use visuals, testimonials, and previous event cues to build confidence." },
        { title: "Availability path", description: "Make date checks, calls, and enquiry forms easy to start." },
        { title: "Event SEO", description: `Target event, venue, and booking searches around ${market}.` },
      ],
      proof: [
        { value: "Packages", label: "easy compare" },
        { value: "Gallery", label: "event proof" },
        { value: market, label: "booking market" },
      ],
      process: [
        { step: "01", title: "Pick event type", description: "Visitors find the package or occasion that matches their need." },
        { step: "02", title: "Check proof", description: "Visual proof and reviews make the booking feel safer." },
        { step: "03", title: "Request date", description: "The page collects event date, location, and contact details." },
      ],
      pages: ["Packages", "Gallery", "Availability", "Book"],
      trustBadges: ["Booking ready", "Gallery proof", "Date-led CTA"],
      testimonial: {
        quote: "The packages made it easy to ask about our date.",
        name: "Event customer",
      },
    };
  }

  if (/\b(hotel|travel|tour|tourism|stay|guesthouse|airbnb|holiday|vacation)\b/.test(text)) {
    return {
      ...common,
      primaryCta: "Check availability",
      segment: "travel",
      logoLabel: "STAY",
      accent: "#38bdf8",
      accent2: "#34d399",
      accentSoft: "rgba(56,189,248,0.18)",
      surface: "linear-gradient(135deg, rgba(8,47,73,0.96), rgba(20,83,45,0.7))",
      headline: `${data.company} made easier to imagine, trust, and book.`,
      subheadline: `Rooms, experiences, location cues, reviews, offers, and booking routes help travellers choose with less uncertainty.`,
      visualTitle: "The stay, experience, and booking path in one place",
      visualSubtitle: "A stronger travel page shows the feeling and the practical details together.",
      pitchHook: "Sell visual storytelling, booking prompts, local experience pages, and trust-led travel SEO.",
      services: [
        { title: "Experience sections", description: "Show rooms, stays, tours, offers, or local highlights with clear context." },
        { title: "Booking prompts", description: "Make availability, calls, and enquiry routes easy to find." },
        { title: "Location proof", description: "Use maps, nearby attractions, reviews, and practical visit details." },
        { title: "Travel SEO", description: `Target stay, tour, and destination searches around ${market}.` },
      ],
      proof: [
        { value: "Visuals", label: "first impression" },
        { value: "Book", label: "clear path" },
        { value: market, label: "destination cue" },
      ],
      process: [
        { step: "01", title: "See the stay", description: "Visitors understand the experience visually and practically." },
        { step: "02", title: "Check details", description: "Location, reviews, and options reduce uncertainty." },
        { step: "03", title: "Book or ask", description: "The CTA starts the right travel enquiry quickly." },
      ],
      pages: ["Rooms", "Experiences", "Location", "Book"],
      trustBadges: ["Booking ready", "Location proof", "Travel SEO"],
      testimonial: {
        quote: "I could picture the stay and knew how to ask about dates.",
        name: "Traveller",
      },
    };
  }

  if (/\b(retail|shop|store|boutique|florist|jewelry|jewellery|pet|groom|fashion)\b/.test(text)) {
    return {
      ...common,
      primaryCta: "Browse the collection",
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
      primaryCta: "View selected work",
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
