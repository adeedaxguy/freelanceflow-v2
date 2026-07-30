import { isValidElement, type CSSProperties, type ReactNode } from "react";
import {
  ArrowRight,
  Award,
  CheckCircle,
  Clock,
  Image as ImageIcon,
  Layers,
  MapPin,
  MessageCircle,
  MousePointerClick,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react";
import {
  businessInitials,
  getSiteDraftIdentity,
  marketFromLocation,
} from "@/lib/site-draft";
import {
  resolveDesignVariation,
  type DesignComposition,
  type DesignTemplate,
  variationToOptionPatch,
} from "@/lib/site-design";
import SitePreviewPdfActions from "@/components/SitePreviewPdfActions";

export type SitePreviewSearchParams = {
  company?: string | string[];
  category?: string | string[];
  location?: string | string[];
  address?: string | string[];
  phone?: string | string[];
  website?: string | string[];
  maps?: string | string[];
  pitch?: string | string[];
  status?: string | string[];
  style?: string | string[];
  theme?: string | string[];
  sections?: string | string[];
  images?: string | string[];
  contentDepth?: string | string[];
  conversionGoal?: string | string[];
  layout?: string | string[];
  prompt?: string | string[];
  variation?: string | string[];
  headline?: string | string[];
  subheadline?: string | string[];
  cta?: string | string[];
  accent?: string | string[];
  client?: string | string[];
  print?: string | string[];
};

type PreviewData = {
  company: string;
  category: string;
  location: string;
  address: string;
  phone: string;
  maps: string;
  website: string;
  pitch: string;
  status: string;
};

type PreviewOptions = {
  style: "professional" | "premium" | "bold" | "friendly" | "minimal" | "creative";
  theme: "dark" | "light";
  sections: number;
  images: "abstract" | "gallery" | "before-after" | "none";
  contentDepth: "short" | "balanced" | "detailed";
  conversionGoal: "calls" | "quotes" | "bookings" | "visits";
  layout: "conversion" | "editorial" | "showcase";
};

function promptIncludes(prompt: string, terms: string[]) {
  const normalized = prompt.toLowerCase();
  return terms.some(term => normalized.includes(term));
}

function inferPreviewOptionsFromPrompt(prompt: string, current: PreviewOptions): PreviewOptions {
  if (!prompt) return current;
  const next = { ...current };

  if (promptIncludes(prompt, ["luxury", "premium", "high end", "high-end", "expensive", "elegant", "exclusive"])) {
    next.style = "premium";
    next.layout = "showcase";
    next.sections = Math.max(next.sections, 9);
    next.contentDepth = "detailed";
  }
  if (promptIncludes(prompt, ["bold", "loud", "energetic", "stand out", "punchy", "strong contrast"])) {
    next.style = "bold";
    next.layout = "conversion";
  }
  if (promptIncludes(prompt, ["creative", "funky", "playful", "colourful", "colorful", "different", "memorable"])) {
    next.style = "creative";
    next.images = "gallery";
  }
  if (promptIncludes(prompt, ["friendly", "family", "neighbourhood", "neighborhood", "warm", "local feel", "approachable"])) {
    next.style = "friendly";
  }
  if (promptIncludes(prompt, ["minimal", "simple", "clean", "fast", "no clutter", "straight to the point"])) {
    next.style = "minimal";
    next.sections = 5;
    next.contentDepth = "short";
    next.layout = "conversion";
  }
  if (promptIncludes(prompt, ["serious", "professional", "trust", "credible", "corporate", "established"])) {
    next.style = "professional";
  }

  if (promptIncludes(prompt, ["light", "white", "bright", "airy"])) next.theme = "light";
  if (promptIncludes(prompt, ["dark", "black", "midnight", "premium dark"])) next.theme = "dark";

  if (promptIncludes(prompt, ["before after", "before-and-after", "transformation", "case study", "proof"])) next.images = "before-after";
  if (promptIncludes(prompt, ["gallery", "photos", "photo", "images", "portfolio", "show work"])) next.images = "gallery";
  if (promptIncludes(prompt, ["no images", "text only", "text-first"])) next.images = "none";
  if (promptIncludes(prompt, ["brand visuals", "abstract", "graphic"])) next.images = "abstract";

  if (promptIncludes(prompt, ["call", "phone", "ring", "tap to call"])) next.conversionGoal = "calls";
  if (promptIncludes(prompt, ["quote", "estimate", "enquiry", "inquiry", "lead form"])) next.conversionGoal = "quotes";
  if (promptIncludes(prompt, ["book", "booking", "appointment", "schedule"])) next.conversionGoal = "bookings";
  if (promptIncludes(prompt, ["visit", "walk in", "directions", "store", "shop"])) next.conversionGoal = "visits";

  if (promptIncludes(prompt, ["story", "editorial", "brand story", "magazine"])) next.layout = "editorial";
  if (promptIncludes(prompt, ["showcase", "visual", "portfolio", "gallery-led"])) next.layout = "showcase";
  if (promptIncludes(prompt, ["conversion", "sales", "landing page", "lead gen", "cta"])) next.layout = "conversion";

  if (promptIncludes(prompt, ["full", "complete", "long", "detailed", "all sections"])) {
    next.sections = 11;
    next.contentDepth = "detailed";
  }
  if (promptIncludes(prompt, ["balanced", "not too long", "medium"])) {
    next.sections = 7;
    next.contentDepth = "balanced";
  }

  return next;
}

const GOAL_COPY: Record<PreviewOptions["conversionGoal"], { primary: string; secondary: string; section: string }> = {
  calls: {
    primary: "Call now",
    secondary: "Phone-first conversion",
    section: "Every important section keeps the phone path obvious for people ready to act now.",
  },
  quotes: {
    primary: "Request a quote",
    secondary: "Quote-ready enquiry flow",
    section: "The page frames the service clearly, then moves visitors into a confident quote request.",
  },
  bookings: {
    primary: "Book an appointment",
    secondary: "Booking-led experience",
    section: "The structure helps customers understand the offer and choose a time or next step.",
  },
  visits: {
    primary: "Get directions",
    secondary: "Local visit path",
    section: "Location, hours, map actions, and trust proof stay close to the surface.",
  },
};

const STYLE_MOOD: Record<PreviewOptions["style"], { rhythm: string; detail: string; shape: string }> = {
  professional: {
    rhythm: "Trust-first",
    detail: "Clear offer, proof, and service categories for serious buyers.",
    shape: "rounded-[1.5rem]",
  },
  premium: {
    rhythm: "High-value",
    detail: "More editorial space, stronger confidence cues, and a calmer buying path.",
    shape: "rounded-[2.25rem]",
  },
  bold: {
    rhythm: "Action-led",
    detail: "Sharper contrast, faster CTA rhythm, and stronger offer blocks.",
    shape: "rounded-[1.25rem]",
  },
  friendly: {
    rhythm: "Neighbourhood",
    detail: "Warm language, approachable proof, and a human local-service tone.",
    shape: "rounded-[2rem]",
  },
  minimal: {
    rhythm: "Clean and fast",
    detail: "Low-friction scanning with only the details needed to enquire.",
    shape: "rounded-2xl",
  },
  creative: {
    rhythm: "Memorable",
    detail: "More personality and visual motion while keeping the service path obvious.",
    shape: "rounded-[2.5rem]",
  },
};

type PreviewBlueprint = {
  id: string;
  sourceTemplate: DesignTemplate;
  label: string;
  heroVisual: "estimate" | "menu" | "booking" | "credentials" | "portfolio" | "checklist" | "packages";
  serviceTitle: string;
  serviceCopy: string;
  visualEyebrow: string;
  trustTitle: string;
  processTitle: string;
  pagesTitle: string;
  ctaTitle: string;
  order: Array<"services" | "visual" | "trust" | "process" | "pages" | "local" | "details" | "questions" | "expanded-copy">;
};

function compositionForBlueprint(id: PreviewBlueprint["id"], fallback: DesignComposition): DesignComposition {
  if (id === "auto-estimate" || id === "trade-emergency") return "action-board";
  if (id === "menu-visit" || id === "retail-showcase" || id === "ecommerce-showroom") return "catalog-grid";
  if (id === "creative-portfolio") return "visual-first";
  if (id === "real-estate-listings") return "listing-led";
  if (["beauty-booking", "clinic-trust", "fitness-membership", "education-course", "event-booking", "travel-booking"].includes(id)) {
    return "booking-led";
  }
  if (["professional-consult", "founder-story", "editorial-craft"].includes(id)) return "editorial-offset";
  if (id === "minimal-direct") return "centered-story";
  return fallback;
}

function templateFromBusiness(text: string, fallback: DesignTemplate): PreviewBlueprint["id"] {
  const value = text.toLowerCase();
  if (/\b(auto|car|body|collision|mechanic|garage|repair|tire|tyre|detailing|mot)\b/.test(value)) return "auto-estimate";
  if (/\b(clean|maid|janitorial|housekeeping|carpet|pressure washing)\b/.test(value)) return "cleaning-plan";
  if (/\b(cafe|coffee|restaurant|bakery|food|pizza|bar|grill|diner|catering|takeaway|takeout)\b/.test(value)) return "menu-visit";
  if (/\b(salon|barber|spa|nail|beauty|massage|stylist|lashes|brows|makeup)\b/.test(value)) return "beauty-booking";
  if (/\b(plumb|electric|roof|handyman|hvac|landscap|painter|locksmith|contractor|builder|construction)\b/.test(value)) return "trade-emergency";
  if (/\b(dentist|dental|doctor|clinic|medical|physio|therapy|chiropractor|optician|veterinary|vet)\b/.test(value)) return "clinic-trust";
  if (/\b(law|lawyer|attorney|accountant|consultant|insurance|advisor|financial)\b/.test(value)) return "professional-consult";
  if (/\b(gym|fitness|yoga|pilates|trainer|martial|dance|studio)\b/.test(value)) return "fitness-membership";
  if (/\b(retail|shop|store|boutique|florist|jewelry|jewellery|pet|groom|fashion)\b/.test(value)) return "retail-showcase";
  if (/\b(photo|photography|creative|design|agency|marketing|tattoo|artist|portfolio)\b/.test(value)) return "creative-portfolio";
  if (/\b(real estate|estate agent|realtor|property|homes|apartment|lettings|rental|valuation)\b/.test(value)) return "real-estate-listings";
  if (/\b(ecommerce|e-commerce|online store|shopify|product|collection|catalogue|catalog)\b/.test(value)) return "ecommerce-showroom";
  if (/\b(school|course|training|academy|tutor|tuition|class|workshop|education|learning)\b/.test(value)) return "education-course";
  if (/\b(event|wedding|venue|party|entertainment|music|photobooth|conference|birthday)\b/.test(value)) return "event-booking";
  if (/\b(hotel|travel|tour|tourism|stay|guesthouse|airbnb|holiday|vacation)\b/.test(value)) return "travel-booking";

  if (fallback === "boutique-booking") return "beauty-booking";
  if (fallback === "urgent-repair") return "trade-emergency";
  if (fallback === "neighborhood-commerce") return "menu-visit";
  if (fallback === "visual-proof") return "creative-portfolio";
  if (fallback === "consult-authority") return "professional-consult";
  if (fallback === "modern-productized") return "retail-showcase";
  if (fallback === "restaurant-menu") return "menu-visit";
  if (fallback === "clinic-care") return "clinic-trust";
  if (fallback === "real-estate-listings") return "real-estate-listings";
  if (fallback === "ecommerce-showroom") return "ecommerce-showroom";
  if (fallback === "education-course") return "education-course";
  if (fallback === "event-booking") return "event-booking";
  if (fallback === "fitness-membership") return "fitness-membership";
  if (fallback === "legal-trust") return "professional-consult";
  if (fallback === "finance-advisory") return "professional-consult";
  if (fallback === "minimal-direct") return "minimal-direct";
  if (fallback === "founder-story") return "founder-story";
  if (fallback === "editorial-craft") return "editorial-craft";
  return "local-authority";
}

function getPreviewBlueprint(data: PreviewData, prompt: string, template: DesignTemplate): PreviewBlueprint {
  const id = templateFromBusiness(`${data.company} ${data.category} ${prompt}`, template);
  const market = marketFromLocation(data.location);
  const base: Record<string, PreviewBlueprint> = {
    "auto-estimate": {
      id,
      sourceTemplate: "urgent-repair",
      label: "Estimate-first auto layout",
      heroVisual: "estimate",
      serviceTitle: "Estimate, repair, and visit paths built for drivers",
      serviceCopy: `${data.company} should make photos, estimates, insurance questions, directions, and urgent phone calls easy to start from mobile.`,
      visualEyebrow: "Repair proof",
      trustTitle: "Confidence before the vehicle comes in",
      processTitle: "From damage photo to booked repair",
      pagesTitle: "Repair pages customers already search",
      ctaTitle: `Ready to make ${data.company} easier to call?`,
      order: ["services", "visual", "process", "trust", "details", "pages", "questions", "local", "expanded-copy"],
    },
    "cleaning-plan": {
      id,
      sourceTemplate: "founder-story",
      label: "Recurring-service cleaning layout",
      heroVisual: "checklist",
      serviceTitle: "Turn one cleaning enquiry into repeat work",
      serviceCopy: `${data.company} needs service packages, rooms or property types, recurring plans, reviews, and quote requests close together.`,
      visualEyebrow: "Cleaning plan",
      trustTitle: "Proof that makes inviting the team easier",
      processTitle: "From property details to booked clean",
      pagesTitle: "Cleaning services and service areas",
      ctaTitle: `Help ${market} customers request a cleaner quote`,
      order: ["services", "process", "visual", "trust", "pages", "details", "questions", "local", "expanded-copy"],
    },
    "menu-visit": {
      id,
      sourceTemplate: "neighborhood-commerce",
      label: "Menu and visit layout",
      heroVisual: "menu",
      serviceTitle: "Menu, hours, photos, and visit intent in one flow",
      serviceCopy: `${data.company} should help guests see what to order, when to visit, where to go, and what makes the place worth choosing.`,
      visualEyebrow: "Menu-led discovery",
      trustTitle: "Make the visit feel worth it",
      processTitle: "From menu browse to directions",
      pagesTitle: "Food, events, menu, and location pages",
      ctaTitle: `Bring more local guests to ${data.company}`,
      order: ["visual", "services", "local", "trust", "process", "pages", "questions", "details", "expanded-copy"],
    },
    "beauty-booking": {
      id,
      sourceTemplate: "boutique-booking",
      label: "Appointment and gallery layout",
      heroVisual: "booking",
      serviceTitle: "Services, style proof, and bookings without friction",
      serviceCopy: `${data.company} should make treatments, portfolio proof, timing, reviews, and appointment CTAs feel polished and easy.`,
      visualEyebrow: "Booking experience",
      trustTitle: "Style proof before the appointment",
      processTitle: "From service choice to booked slot",
      pagesTitle: "Treatment, team, gallery, and booking pages",
      ctaTitle: `Make ${data.company} feel easier to book`,
      order: ["visual", "services", "trust", "process", "pages", "details", "questions", "local", "expanded-copy"],
    },
    "trade-emergency": {
      id,
      sourceTemplate: "urgent-repair",
      label: "Emergency trade layout",
      heroVisual: "estimate",
      serviceTitle: "Urgent calls and quote requests for high-intent jobs",
      serviceCopy: `${data.company} should make emergency help, service areas, licence proof, job photos, and phone actions visible immediately.`,
      visualEyebrow: "Urgent job flow",
      trustTitle: "Trust signals before someone opens the door",
      processTitle: "From problem to booked work",
      pagesTitle: "Emergency, repair, installation, and area pages",
      ctaTitle: `Make ${data.company} the obvious call in ${market}`,
      order: ["services", "process", "trust", "visual", "pages", "details", "questions", "local", "expanded-copy"],
    },
    "clinic-trust": {
      id,
      sourceTemplate: "consult-authority",
      label: "Clinic trust layout",
      heroVisual: "credentials",
      serviceTitle: "Care, credentials, and booking confidence",
      serviceCopy: `${data.company} should show services, practitioner trust, insurance or eligibility cues, reviews, and booking routes without clutter.`,
      visualEyebrow: "Care pathway",
      trustTitle: "Credentials and reassurance before booking",
      processTitle: "From symptom or need to appointment",
      pagesTitle: "Care, treatments, practitioners, and location pages",
      ctaTitle: `Help patients choose ${data.company} with confidence`,
      order: ["trust", "services", "process", "details", "visual", "pages", "questions", "local", "expanded-copy"],
    },
    "professional-consult": {
      id,
      sourceTemplate: "consult-authority",
      label: "Consultation authority layout",
      heroVisual: "credentials",
      serviceTitle: "Expertise, outcomes, and consultation paths",
      serviceCopy: `${data.company} needs a calm authority page with credentials, service fit, proof, and a consultation CTA that feels serious.`,
      visualEyebrow: "Consultation-ready",
      trustTitle: "Authority before the enquiry",
      processTitle: "From problem to qualified consultation",
      pagesTitle: "Services, industries, proof, and contact pages",
      ctaTitle: `Position ${data.company} as the safer expert choice`,
      order: ["trust", "services", "expanded-copy", "process", "pages", "details", "questions", "visual", "local"],
    },
    "fitness-membership": {
      id,
      sourceTemplate: "modern-productized",
      label: "Membership and schedule layout",
      heroVisual: "packages",
      serviceTitle: "Programs, schedule, and membership paths",
      serviceCopy: `${data.company} should make classes, trainers, membership options, timetable cues, and first-session CTAs easy to scan.`,
      visualEyebrow: "Program paths",
      trustTitle: "Motivation before the first visit",
      processTitle: "From goal to first session",
      pagesTitle: "Programs, classes, pricing, and trainer pages",
      ctaTitle: `Help ${market} customers start with ${data.company}`,
      order: ["services", "visual", "process", "local", "trust", "pages", "questions", "details", "expanded-copy"],
    },
    "retail-showcase": {
      id,
      sourceTemplate: "modern-productized",
      label: "Product showcase layout",
      heroVisual: "portfolio",
      serviceTitle: "Products, categories, visits, and local shopping intent",
      serviceCopy: `${data.company} should highlight what is available, why customers should visit, how to enquire, and what makes the shop different.`,
      visualEyebrow: "Product story",
      trustTitle: "Reasons to choose the shop",
      processTitle: "From browse to visit or enquiry",
      pagesTitle: "Collections, services, offers, and location pages",
      ctaTitle: `Turn more local browsers into ${data.company} customers`,
      order: ["visual", "services", "local", "pages", "trust", "process", "questions", "details", "expanded-copy"],
    },
    "real-estate-listings": {
      id,
      sourceTemplate: "real-estate-listings",
      label: "Listing and valuation layout",
      heroVisual: "portfolio",
      serviceTitle: "Listings, valuations, neighbourhood trust, and enquiry paths",
      serviceCopy: `${data.company} should make available properties, valuation requests, local market knowledge, and consultation routes feel clear from the first screen.`,
      visualEyebrow: "Property proof",
      trustTitle: "Local property confidence before the enquiry",
      processTitle: "From neighbourhood search to qualified viewing",
      pagesTitle: "Listings, valuations, areas, and advice pages",
      ctaTitle: `Help ${market} property searches turn into enquiries`,
      order: ["visual", "local", "services", "trust", "process", "pages", "questions", "details", "expanded-copy"],
    },
    "ecommerce-showroom": {
      id,
      sourceTemplate: "ecommerce-showroom",
      label: "Collection showroom layout",
      heroVisual: "portfolio",
      serviceTitle: "Collections, product proof, offers, and buying intent",
      serviceCopy: `${data.company} should show what is available, why it is worth choosing, how to enquire or buy, and what makes the product range different.`,
      visualEyebrow: "Product discovery",
      trustTitle: "Reasons to buy before the basket",
      processTitle: "From browse to buy or enquire",
      pagesTitle: "Collections, best sellers, offers, and policies",
      ctaTitle: `Make ${data.company} easier to browse and buy from`,
      order: ["visual", "services", "trust", "pages", "process", "questions", "details", "expanded-copy", "local"],
    },
    "education-course": {
      id,
      sourceTemplate: "education-course",
      label: "Course enrolment layout",
      heroVisual: "packages",
      serviceTitle: "Programmes, outcomes, dates, and enrolment actions",
      serviceCopy: `${data.company} should make courses, outcomes, schedules, who each programme fits, and enrolment routes easy for students or parents to compare.`,
      visualEyebrow: "Learning paths",
      trustTitle: "Proof before someone enrols",
      processTitle: "From course fit to enrolment",
      pagesTitle: "Courses, outcomes, tutors, and enrolment pages",
      ctaTitle: `Help learners choose ${data.company} with confidence`,
      order: ["services", "process", "trust", "visual", "pages", "questions", "details", "local", "expanded-copy"],
    },
    "event-booking": {
      id,
      sourceTemplate: "event-booking",
      label: "Event booking layout",
      heroVisual: "booking",
      serviceTitle: "Packages, dates, gallery proof, and booking prompts",
      serviceCopy: `${data.company} should make event packages, availability cues, visual proof, guest experience, and enquiry routes feel exciting but easy to act on.`,
      visualEyebrow: "Event proof",
      trustTitle: "Confidence before the date is booked",
      processTitle: "From occasion to confirmed enquiry",
      pagesTitle: "Packages, gallery, venues, and booking pages",
      ctaTitle: `Make ${data.company} easier to book for the next event`,
      order: ["visual", "services", "process", "trust", "pages", "questions", "details", "expanded-copy", "local"],
    },
    "travel-booking": {
      id,
      sourceTemplate: "visual-proof",
      label: "Travel and stay layout",
      heroVisual: "portfolio",
      serviceTitle: "Rooms, experiences, trust, and booking paths",
      serviceCopy: `${data.company} should make the place or trip feel real through visuals, location cues, availability prompts, reviews, and clear booking actions.`,
      visualEyebrow: "Stay and experience",
      trustTitle: "Trust before someone books the trip",
      processTitle: "From destination interest to booking enquiry",
      pagesTitle: "Rooms, experiences, offers, and location pages",
      ctaTitle: `Help travellers choose ${data.company}`,
      order: ["visual", "local", "services", "trust", "process", "pages", "questions", "details", "expanded-copy"],
    },
    "creative-portfolio": {
      id,
      sourceTemplate: "visual-proof",
      label: "Portfolio proof layout",
      heroVisual: "portfolio",
      serviceTitle: "Work proof, packages, and enquiry clarity",
      serviceCopy: `${data.company} should lead with taste, outcomes, portfolio proof, packages, and an enquiry CTA that feels intentional.`,
      visualEyebrow: "Portfolio proof",
      trustTitle: "Proof before the enquiry",
      processTitle: "From creative fit to project enquiry",
      pagesTitle: "Portfolio, packages, process, and contact pages",
      ctaTitle: `Make ${data.company} easier to trust creatively`,
      order: ["visual", "trust", "services", "process", "pages", "expanded-copy", "questions", "details", "local"],
    },
    "minimal-direct": {
      id,
      sourceTemplate: "minimal-direct",
      label: "Minimal direct layout",
      heroVisual: "checklist",
      serviceTitle: "Only the details customers need to act",
      serviceCopy: `${data.company} can use a stripped-back structure that makes service fit, proof, phone, and quote path obvious.`,
      visualEyebrow: "Fast scan",
      trustTitle: "Small proof, clear action",
      processTitle: "From first screen to next step",
      pagesTitle: "Service, proof, location, and contact",
      ctaTitle: `Make ${data.company} faster to understand`,
      order: ["services", "details", "trust", "process", "questions", "local", "visual", "pages", "expanded-copy"],
    },
    "founder-story": {
      id,
      sourceTemplate: "founder-story",
      label: "Owner-led story layout",
      heroVisual: "credentials",
      serviceTitle: "Human trust with clear service paths",
      serviceCopy: `${data.company} should feel local, reachable, and owner-led while still making the service and CTA clear.`,
      visualEyebrow: "Owner-led trust",
      trustTitle: "A more human reason to call",
      processTitle: "From local story to enquiry",
      pagesTitle: "About, services, proof, and contact",
      ctaTitle: `Help customers feel they know ${data.company}`,
      order: ["trust", "services", "visual", "process", "details", "pages", "questions", "local", "expanded-copy"],
    },
    "editorial-craft": {
      id,
      sourceTemplate: "editorial-craft",
      label: "Editorial craft layout",
      heroVisual: "portfolio",
      serviceTitle: "A story-led page with enough structure to sell",
      serviceCopy: `${data.company} can feel more crafted and memorable without hiding the services, proof, or enquiry path.`,
      visualEyebrow: "Craft and story",
      trustTitle: "A sharper reason to remember the business",
      processTitle: "From brand story to enquiry",
      pagesTitle: "Story, services, work, and contact",
      ctaTitle: `Make ${data.company} feel distinctive`,
      order: ["visual", "expanded-copy", "services", "trust", "process", "pages", "questions", "details", "local"],
    },
    "local-authority": {
      id,
      sourceTemplate: "local-authority",
      label: "Local authority layout",
      heroVisual: "checklist",
      serviceTitle: "Services, trust, and contact paths customers can scan",
      serviceCopy: `${data.company} should make the offer obvious, prove trust quickly, and help local customers take the next step.`,
      visualEyebrow: "Local proof",
      trustTitle: "Confidence before contact",
      processTitle: "From local search to enquiry",
      pagesTitle: "Services, proof, location, and contact",
      ctaTitle: `Make ${data.company} easier to choose`,
      order: ["services", "trust", "visual", "process", "pages", "details", "questions", "local", "expanded-copy"],
    },
  };

  return base[id] ?? base["local-authority"]!;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function clean(value: string | string[] | undefined, fallback = "") {
  const next = (firstParam(value) ?? "").replace(/\s+/g, " ").trim();
  return (next || fallback).slice(0, 280);
}

function option<T extends string>(value: string | string[] | undefined, allowed: readonly T[], fallback: T): T {
  const next = clean(value) as T;
  return allowed.includes(next) ? next : fallback;
}

function sectionCount(value: string | string[] | undefined, fallback = 7) {
  const next = Number.parseInt(clean(value), 10);
  if (!Number.isFinite(next)) return fallback;
  return Math.max(5, Math.min(11, next));
}

function hasExplicitParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.some(item => item.trim().length > 0);
  return typeof value === "string" && value.trim().length > 0;
}

function safeHttpUrl(value: string | string[] | undefined) {
  try {
    const url = new URL(clean(value));
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function telHref(phone: string) {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return cleaned ? `tel:${cleaned}` : "";
}

function panelClass(isLight: boolean) {
  return isLight
    ? "border-slate-200 bg-white shadow-[0_22px_70px_rgba(15,23,42,0.10)]"
    : "border-white/10 bg-white/[0.045]";
}

function mutedClass(isLight: boolean) {
  return isLight ? "text-slate-600" : "text-white/64";
}

const SEGMENT_IMAGES: Record<string, string[]> = {
  auto: [
    "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1632823471565-1ecdf5c298bb?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=1000&q=80",
  ],
  cleaning: [
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=1000&q=80",
  ],
  food: [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1000&q=80",
  ],
  bakery: [
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=1100&q=82",
    "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=1100&q=82",
    "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1100&q=82",
  ],
  beauty: [
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80",
  ],
  trade: [
    "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=80",
  ],
  clinic: [
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&w=1000&q=80",
  ],
  professional: [
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1000&q=80",
  ],
  property: [
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80",
  ],
  fitness: [
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1000&q=80",
  ],
  retail: [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1000&q=80",
  ],
  education: [
    "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80",
  ],
  events: [
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1000&q=80",
  ],
  travel: [
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80",
  ],
  creative: [
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80",
  ],
  local: [
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80",
  ],
};

const FALLBACK_SEGMENT_IMAGES = SEGMENT_IMAGES.local ?? [
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
];

function segmentImage(segment: string, index = 0) {
  const images = SEGMENT_IMAGES[segment] ?? FALLBACK_SEGMENT_IMAGES;
  return images[index % images.length]!;
}

function imageBackground(segment: string, index: number, overlay: string) {
  return `${overlay}, url("${segmentImage(segment, index)}")`;
}

function printStyles(isLight: boolean) {
  return `
    .site-preview-menu-visit > section:first-of-type {
      background-position: center;
      background-size: cover;
    }

    .site-preview-menu-visit .site-preview-hero-decoration {
      display: none;
    }

    .site-preview-menu-visit .site-preview-hero {
      max-width: 100%;
      min-height: min(920px, 100vh);
      padding-left: clamp(1.25rem, 6vw, 7rem);
      padding-right: clamp(1.25rem, 6vw, 7rem);
    }

    .site-preview-menu-visit .site-preview-hero-grid {
      display: flex;
      max-width: 1480px;
      width: 100%;
      margin: 0 auto;
      align-items: flex-end;
      padding-top: clamp(5rem, 12vh, 9rem);
      padding-bottom: clamp(2rem, 7vh, 5rem);
    }

    .site-preview-menu-visit .site-preview-hero-grid > div:first-child {
      max-width: 820px;
      order: 1;
    }

    .site-preview-menu-visit .site-preview-hero-visual {
      display: none;
    }

    .site-preview-menu-visit .site-preview-hero h1 {
      font-family: Georgia, "Times New Roman", serif;
      font-weight: 500;
      font-size: clamp(3.4rem, 7vw, 7.8rem);
      line-height: 0.94;
      letter-spacing: -0.035em;
      color: white;
      text-wrap: balance;
    }

    .site-preview-menu-visit .site-preview-hero-grid > div:first-child > p {
      max-width: 700px;
      color: rgba(255,255,255,0.82);
      font-size: clamp(1.1rem, 1.5vw, 1.35rem);
    }

    .site-preview-menu-visit .site-preview-hero header {
      max-width: 1480px;
      width: 100%;
      margin: 0 auto;
      color: white;
    }

    .site-preview-menu-visit .site-preview-hero header > div:last-child {
      border-color: rgba(255,255,255,0.34);
      background: rgba(15,23,42,0.35);
      color: white;
      backdrop-filter: blur(16px);
    }

    .site-preview-menu-visit .site-preview-hero nav {
      border-color: rgba(255,255,255,0.22);
      background: rgba(15,23,42,0.28);
      backdrop-filter: blur(16px);
    }

    .site-preview-menu-visit .site-preview-signal-grid {
      max-width: 1480px;
      width: 100%;
      margin-left: auto;
      margin-right: auto;
      border-color: rgba(255,255,255,0.18);
      background: rgba(15,23,42,0.56);
      color: white;
      backdrop-filter: blur(18px);
      box-shadow: none;
    }

    .site-preview-menu-visit .site-preview-signal-grid > div {
      border-color: rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.07);
    }

    .site-preview-menu-visit .site-preview-signal-grid p:first-of-type {
      color: rgba(255,255,255,0.52);
    }

    @media (max-width: 767px) {
      .site-preview-menu-visit .site-preview-hero {
        min-height: 820px;
      }

      .site-preview-menu-visit .site-preview-hero-grid {
        padding-top: 6rem;
      }

      .site-preview-menu-visit .site-preview-hero h1 {
        font-size: clamp(3.15rem, 15vw, 5.5rem);
      }
    }

    @page {
      size: 1440px 11200px;
      margin: 0;
    }

    @media print {
      * {
        box-sizing: border-box !important;
      }

      html {
        background: ${isLight ? "#f8fafc" : "#070b12"} !important;
        width: 1440px !important;
        min-width: 1440px !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      body {
        background: ${isLight ? "#f8fafc" : "#070b12"} !important;
        margin: 0 !important;
        overflow: visible !important;
        width: 1440px !important;
        min-width: 1440px !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .no-print {
        display: none !important;
      }

      .site-preview-root {
        display: block !important;
        min-height: auto !important;
        width: 1440px !important;
        min-width: 1440px !important;
        max-width: 1440px !important;
        overflow: visible !important;
        padding-bottom: 0 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .site-preview-root * {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .site-preview-root section {
        position: relative !important;
        overflow: visible !important;
      }

      .site-preview-print-nav {
        display: flex !important;
      }

      .site-preview-root .mx-auto {
        margin-left: auto !important;
        margin-right: auto !important;
      }

      .site-preview-root .max-w-7xl {
        max-width: 1240px !important;
      }

      .site-preview-hero {
        min-height: 760px !important;
        padding-top: 32px !important;
        padding-bottom: 44px !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      .site-preview-hero-grid {
        display: grid !important;
        flex: none !important;
        grid-template-columns: minmax(0, 1.04fr) minmax(420px, 0.96fr) !important;
        align-items: start !important;
        gap: 44px !important;
        padding-top: 54px !important;
        padding-bottom: 44px !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      .site-preview-hero-grid h1 {
        font-size: 66px !important;
        line-height: 1.04 !important;
        letter-spacing: 0 !important;
      }

      .site-preview-hero-grid p {
        font-size: 16px !important;
        line-height: 1.55 !important;
      }

      .site-preview-hero-visual {
        display: block !important;
      }

      .site-preview-signal-grid {
        margin-bottom: 0 !important;
      }

      .site-preview-root section > .mx-auto:not(.site-preview-hero) {
        padding-top: 44px !important;
        padding-bottom: 44px !important;
      }

      .site-preview-root h2 {
        font-size: 42px !important;
        line-height: 1.08 !important;
      }

      .site-preview-root h3 {
        line-height: 1.16 !important;
      }

      .site-preview-root article,
      .site-preview-root blockquote,
      .site-preview-root .rounded-\\[2rem\\],
      .site-preview-root .rounded-3xl {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      a {
        text-decoration: none !important;
      }

      img,
      svg {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    }
  `;
}

function HeadingBlock({
  eyebrow,
  title,
  copy,
  isLight,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  isLight: boolean;
}) {
  return (
    <div className="mb-8 max-w-3xl">
      <p className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: "var(--site-accent)" }}>
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">{title}</h2>
      <p className={`mt-4 text-lg leading-8 ${mutedClass(isLight)}`}>{copy}</p>
    </div>
  );
}

function visualStoryText(
  blueprint: PreviewBlueprint,
  data: PreviewData,
  identity: ReturnType<typeof getSiteDraftIdentity>,
) {
  switch (blueprint.heroVisual) {
    case "estimate":
      return {
        title: "Proof, estimates, and next steps in one view",
        copy: `${data.company} can show urgent service fit, repair proof, quote paths, and contact details before customers start comparing alternatives.`,
      };
    case "menu":
      return {
        title: "Menu, atmosphere, hours, and directions working together",
        copy: `${data.company} should let guests see what is worth trying, when to visit, and how to get there without digging through separate pages.`,
      };
    case "booking":
      return {
        title: "A visual booking path customers can trust",
        copy: `${data.company} can pair service menus with result proof, reviews, and booking prompts so appointments feel easy to choose.`,
      };
    case "credentials":
      return {
        title: "Credentials and proof before the enquiry",
        copy: `${data.company} should make expertise, service fit, reviews, and consultation or appointment routes feel calm and credible.`,
      };
    case "portfolio":
      return {
        title: "Work examples that make the offer tangible",
        copy: `${data.company} can use visual proof, categories, packages, and outcome-led copy to help customers understand the value quickly.`,
      };
    case "packages":
      return {
        title: "Packages customers can compare before enquiring",
        copy: `${data.company} should make programs, plans, or service tiers easy to understand before someone books or asks a question.`,
      };
    case "checklist":
    default:
      return {
        title: "A simple proof path for quick decisions",
        copy: `${data.company} should make services, trust proof, local details, and the next action clear enough to understand in seconds.`,
      };
  }
}

function VisualStory({
  data,
  options,
  identity,
  initials,
  isLight,
  blueprint,
}: {
  data: PreviewData;
  options: PreviewOptions;
  identity: ReturnType<typeof getSiteDraftIdentity>;
  initials: string;
  isLight: boolean;
  blueprint: PreviewBlueprint;
}) {
  const story = visualStoryText(blueprint, data, identity);

  if (options.images === "none") {
    return (
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className={`rounded-[2rem] border p-7 sm:p-9 ${panelClass(isLight)}`}>
          <ImageIcon className="mb-4 h-8 w-8" style={{ color: identity.accent }} />
          <h2 className="text-3xl font-black">{story.title}</h2>
          <p className={`mt-3 max-w-3xl text-lg leading-8 ${mutedClass(isLight)}`}>
            {story.copy}
          </p>
        </div>
      </section>
    );
  }

  if (options.images === "before-after") {
    return (
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <HeadingBlock
          eyebrow={blueprint.visualEyebrow}
          title={story.title}
          copy={story.copy}
          isLight={isLight}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            { label: "Harder to choose", items: ["Services are harder to compare", "Contact details can get missed", "Little proof appears before the call"] },
            { label: "Easier to call", items: ["Services are clear in seconds", "Phone and quote path stay visible", "Proof and local trust are structured"] },
          ].map((column, index) => (
            <article key={column.label} className={`rounded-[2rem] border p-6 ${panelClass(isLight)}`}>
              <p className="text-sm font-black uppercase tracking-[0.18em]" style={{ color: index === 0 ? identity.accent2 : identity.accent }}>
                {column.label}
              </p>
              <div className="mt-5 space-y-3">
                {column.items.map(item => (
                  <div key={item} className={`rounded-2xl border p-4 ${isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/[0.04]"}`}>
                    <p className="font-bold">{item}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (options.images === "gallery") {
    return (
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <HeadingBlock
          eyebrow={blueprint.visualEyebrow}
          title={story.title}
          copy={story.copy}
          isLight={isLight}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {identity.services.map((service, index) => (
            <article key={service.title} className={`min-h-[240px] overflow-hidden rounded-[2rem] border ${panelClass(isLight)}`}>
              <div
                className="h-36 bg-cover bg-center"
                style={{
                  backgroundImage: imageBackground(
                    identity.segment,
                    index + 1,
                    `linear-gradient(180deg, rgba(2,6,23,0.10), rgba(2,6,23,0.62))`,
                  ),
                }}
              />
              <div className="p-5">
                <p className="text-lg font-black">{service.title}</p>
                <p className={`mt-2 text-sm leading-6 ${mutedClass(isLight)}`}>{service.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
      <div className={`grid gap-6 overflow-hidden rounded-[2rem] border p-5 sm:p-7 lg:grid-cols-[0.95fr_1.05fr] ${panelClass(isLight)}`}>
        <div className="p-2 sm:p-4">
          <p className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: identity.accent }}>
            {blueprint.visualEyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">{story.title}</h2>
          <p className={`mt-4 text-lg leading-8 ${mutedClass(isLight)}`}>{story.copy}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {identity.trustBadges.map(badge => (
              <span key={badge} className={`rounded-full border px-3 py-2 text-sm font-bold ${isLight ? "border-slate-200 bg-slate-50 text-slate-700" : "border-white/10 bg-white/[0.05] text-white/70"}`}>
                {badge}
              </span>
            ))}
          </div>
        </div>
        <div className="relative min-h-[330px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b1220] p-5">
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background: `radial-gradient(circle at 22% 20%, ${identity.accentSoft}, transparent 34%), radial-gradient(circle at 88% 8%, ${identity.accent2}44, transparent 28%)`,
            }}
          />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <div
                className="grid h-16 w-16 place-items-center rounded-3xl text-xl font-black text-slate-950"
                style={{ background: `linear-gradient(135deg, ${identity.accent}, ${identity.accent2})` }}
              >
                {initials}
              </div>
              <Star className="h-8 w-8 fill-current" style={{ color: identity.accent2 }} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">{data.category}</p>
              <h3 className="mt-3 max-w-sm text-4xl font-black leading-tight text-white">{data.company}</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroPreviewVisual({
  data,
  identity,
  initials,
  isLight,
  blueprint,
  variationBadge,
}: {
  data: PreviewData;
  identity: ReturnType<typeof getSiteDraftIdentity> & {
    accent: string;
    accent2: string;
    accentSoft: string;
    surface: string;
  };
  initials: string;
  isLight: boolean;
  blueprint: PreviewBlueprint;
  variationBadge: string;
}) {
  const visualCards: Record<PreviewBlueprint["heroVisual"], Array<{ label: string; value: string }>> = {
    estimate: [
      { label: "Fast start", value: "Photo / job details" },
      { label: "Proof", value: identity.trustBadges[0] ?? "Local proof" },
      { label: "Next step", value: "Call or request quote" },
    ],
    menu: [
      { label: "Menu", value: identity.pages[0] ?? "Best sellers" },
      { label: "Visit", value: marketFromLocation(data.location) },
      { label: "Guests", value: "Hours + directions" },
    ],
    booking: [
      { label: "Choose", value: identity.pages[0] ?? "Service" },
      { label: "Trust", value: "Gallery + reviews" },
      { label: "Book", value: "Appointment CTA" },
    ],
    credentials: [
      { label: "Fit", value: identity.pages[0] ?? "Services" },
      { label: "Authority", value: identity.trustBadges[0] ?? "Credentials" },
      { label: "Enquiry", value: "Consultation path" },
    ],
    portfolio: [
      { label: "Work", value: identity.pages[0] ?? "Portfolio" },
      { label: "Style", value: variationBadge },
      { label: "Enquiry", value: "Project fit" },
    ],
    checklist: [
      { label: "Service", value: identity.pages[0] ?? "Services" },
      { label: "Proof", value: identity.trustBadges[0] ?? "Trust" },
      { label: "Action", value: "Clear next step" },
    ],
    packages: [
      { label: "Option 1", value: identity.pages[0] ?? "Starter" },
      { label: "Option 2", value: identity.pages[1] ?? "Growth" },
      { label: "Action", value: "Book / enquire" },
    ],
  };

  const cards = visualCards[blueprint.heroVisual];
  const showMosaic = blueprint.heroVisual === "portfolio" || blueprint.heroVisual === "menu";

  return (
    <div className="site-preview-hero-visual relative block">
      <div
        className="absolute -inset-5 rounded-[2.5rem] opacity-60 blur-2xl"
        style={{ background: `linear-gradient(135deg, ${identity.accentSoft}, ${identity.accent2}22)` }}
      />
      <div className={`relative overflow-hidden rounded-[2rem] border shadow-2xl ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-[#0b1220]"}`}>
        <div
          className="relative min-h-[340px] bg-cover bg-center p-4 sm:min-h-[440px] sm:p-5"
          style={{
            backgroundImage: imageBackground(
              identity.segment,
              0,
              "linear-gradient(180deg, rgba(2,6,23,0.08), rgba(2,6,23,0.84))",
            ),
          }}
        >
          <div className={`flex h-full min-h-[310px] flex-col sm:min-h-[400px] ${showMosaic ? "justify-between" : "justify-end"}`}>
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-black text-slate-950">
                {blueprint.label}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/65 px-3 py-2 text-sm font-black text-white backdrop-blur">
                <Star className="h-4 w-4 fill-current" style={{ color: identity.accent2 }} />
                {variationBadge}
              </span>
            </div>

            {showMosaic && (
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(index => (
                  <div
                    key={index}
                    className="h-24 rounded-2xl border border-white/15 bg-cover bg-center shadow-xl"
                    style={{
                      backgroundImage: imageBackground(
                        identity.segment,
                        index,
                        "linear-gradient(180deg, rgba(2,6,23,0.05), rgba(2,6,23,0.42))",
                      ),
                    }}
                  />
                ))}
              </div>
            )}

            <div className="rounded-[1.5rem] border border-white/15 bg-slate-950/72 p-4 text-white backdrop-blur-md sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">{blueprint.visualEyebrow}</p>
                  <h2 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">{data.company}</h2>
                </div>
                <div
                  className="hidden h-14 w-14 place-items-center rounded-2xl text-base font-black text-slate-950 sm:grid"
                  style={{ background: `linear-gradient(135deg, ${identity.accent}, ${identity.accent2})` }}
                >
                  {initials}
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {cards.map(card => (
                  <div key={card.label} className="rounded-2xl border border-white/10 bg-white/[0.08] p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">{card.label}</p>
                    <p className="mt-1 text-sm font-black leading-5 text-white">{card.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className={`grid gap-3 p-4 ${isLight ? "bg-white" : "bg-[#0b1220]"}`}>
          {identity.services.slice(0, 3).map(service => (
            <div key={service.title} className={`flex items-start gap-3 rounded-2xl border p-3 ${isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/[0.04]"}`}>
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: identity.accent }} />
              <div>
                <h3 className="font-black">{service.title}</h3>
                <p className={`mt-1 text-sm leading-6 ${mutedClass(isLight)}`}>{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SitePreviewContent({ searchParams }: { searchParams?: SitePreviewSearchParams }) {
  const company = clean(searchParams?.company, "Local Business");
  const category = clean(searchParams?.category, "Local service");
  const location = clean(searchParams?.location, "Your area");
  const address = clean(searchParams?.address);
  const phone = clean(searchParams?.phone);
  const maps = safeHttpUrl(searchParams?.maps);
  const website = safeHttpUrl(searchParams?.website);
  const pitch = clean(searchParams?.pitch);
  const designPrompt = clean(searchParams?.prompt);
  const customHeadline = clean(searchParams?.headline);
  const customSubheadline = clean(searchParams?.subheadline);
  const customCta = clean(searchParams?.cta);
  const requestedAccent = clean(searchParams?.accent);
  const customAccent = /^#[0-9a-f]{6}$/i.test(requestedAccent) ? requestedAccent : "";
  const variation = resolveDesignVariation({
    variationId: clean(searchParams?.variation),
    prompt: designPrompt,
    company,
    category,
    location,
  });
  const variationPatch = variationToOptionPatch(variation);
  const data: PreviewData = {
    company,
    category,
    location,
    address,
    phone,
    maps,
    website,
    pitch,
    status: clean(searchParams?.status, "unknown"),
  };

  const baseOptions: PreviewOptions = {
    style: option(searchParams?.style, ["professional", "premium", "bold", "friendly", "minimal", "creative"] as const, variationPatch.style),
    theme: option(searchParams?.theme, ["dark", "light"] as const, variationPatch.theme),
    sections: sectionCount(searchParams?.sections, Number.parseInt(variationPatch.sections, 10)),
    images: option(searchParams?.images, ["abstract", "gallery", "before-after", "none"] as const, variationPatch.images),
    contentDepth: option(searchParams?.contentDepth, ["short", "balanced", "detailed"] as const, variationPatch.contentDepth),
    conversionGoal: option(searchParams?.conversionGoal, ["calls", "quotes", "bookings", "visits"] as const, variationPatch.conversionGoal),
    layout: option(searchParams?.layout, ["conversion", "editorial", "showcase"] as const, variationPatch.layout),
  };
  const inferredOptions = inferPreviewOptionsFromPrompt(designPrompt, baseOptions);
  const options: PreviewOptions = {
    ...inferredOptions,
    style: hasExplicitParam(searchParams?.style) ? baseOptions.style : inferredOptions.style,
    theme: hasExplicitParam(searchParams?.theme) ? baseOptions.theme : inferredOptions.theme,
    sections: hasExplicitParam(searchParams?.sections) ? baseOptions.sections : inferredOptions.sections,
    images: hasExplicitParam(searchParams?.images) ? baseOptions.images : inferredOptions.images,
    contentDepth: hasExplicitParam(searchParams?.contentDepth) ? baseOptions.contentDepth : inferredOptions.contentDepth,
    conversionGoal: hasExplicitParam(searchParams?.conversionGoal) ? baseOptions.conversionGoal : inferredOptions.conversionGoal,
    layout: hasExplicitParam(searchParams?.layout) ? baseOptions.layout : inferredOptions.layout,
  };

  const baseIdentity = getSiteDraftIdentity(data, designPrompt);
  const identity = {
    ...baseIdentity,
    headline: customHeadline || baseIdentity.headline,
    subheadline: customSubheadline || baseIdentity.subheadline,
    primaryCta: customCta || baseIdentity.primaryCta,
    accent: customAccent || variation.palette.accent,
    accent2: variation.palette.accent2,
    accentSoft: customAccent ? `${customAccent}2e` : variation.palette.accentSoft,
    surface: `linear-gradient(135deg, ${variation.palette.previewSurface}, ${variation.palette.previewBackground})`,
  };
  const displayCategory = identity.segment === "bakery" ? "Bakery" : category;
  const displayData = displayCategory === category ? data : { ...data, category: displayCategory };
  const initials = businessInitials(company);
  const market = marketFromLocation(location);
  const baseBlueprint = getPreviewBlueprint(displayData, designPrompt, variation.template);
  const blueprint = identity.segment === "bakery"
    ? {
        ...baseBlueprint,
        label: "Bakery storefront",
        serviceTitle: "Fresh bakes, online ordering, and celebration enquiries",
        serviceCopy: `${company} should make today's products irresistible, collection simple, and larger cake or catering orders easy to start.`,
        visualEyebrow: "Fresh from the bakery",
        trustTitle: "Give customers a reason to order before they arrive",
        processTitle: "From today's counter to confirmed collection",
        pagesTitle: "Products, celebration cakes, catering, and visiting",
        ctaTitle: `Make ${company} the bakery ${market} remembers`,
      }
    : baseBlueprint;
  const callLink = telHref(phone);
  const heroPitch = identity.subheadline;
  const isLight = options.theme === "light";
  const styleMood = STYLE_MOOD[options.style];
  const goalCopy = GOAL_COPY[options.conversionGoal];
  const primaryCta = customCta || identity.primaryCta || goalCopy.primary;
  const autoPrint = clean(searchParams?.print).toLowerCase() === "1";
  const isClientPreview = clean(searchParams?.client).toLowerCase() === "1";
  const composition = compositionForBlueprint(blueprint.id, variation.composition);
  const heroGrid = composition === "centered-story"
    ? "lg:grid-cols-1"
    : composition === "editorial-offset"
      ? "lg:grid-cols-[1.18fr_0.82fr]"
      : composition === "visual-first"
        ? "lg:grid-cols-[0.92fr_1.08fr]"
        : composition === "catalog-grid"
          ? "lg:grid-cols-[0.82fr_1.18fr]"
          : composition === "booking-led"
            ? "lg:grid-cols-[1fr_1fr]"
            : composition === "listing-led"
              ? "lg:grid-cols-[0.88fr_1.12fr]"
              : composition === "action-board"
                ? "lg:grid-cols-[1.15fr_0.85fr]"
                : options.layout === "editorial"
                  ? "lg:grid-cols-[0.88fr_1.12fr]"
                  : options.layout === "showcase"
                    ? "lg:grid-cols-[0.95fr_1.05fr]"
                    : "lg:grid-cols-[1.04fr_0.96fr]";
  const heroTextClass = composition === "centered-story"
    ? "mx-auto max-w-5xl text-center"
    : composition === "visual-first" || composition === "catalog-grid"
      ? "lg:order-2"
      : composition === "editorial-offset"
        ? "lg:pr-12"
        : "";
  const heroVisualClass = composition === "centered-story"
    ? "mx-auto w-full max-w-5xl"
    : composition === "visual-first" || composition === "catalog-grid"
      ? "lg:order-1"
      : "";
  const usesGridTexture = composition === "authority-split" || composition === "action-board" || composition === "listing-led";
  const serviceLimit = options.contentDepth === "short" ? 3 : identity.services.length;
  const processLimit = options.contentDepth === "detailed" ? identity.process.length : Math.min(3, identity.process.length);
  const middleBudget = Math.max(3, options.sections - 2);

  const themeVars = {
    "--site-accent": identity.accent,
    "--site-accent-2": identity.accent2,
    "--site-accent-soft": identity.accentSoft,
    "--site-preview-bg": variation.palette.previewBackground,
    "--site-preview-surface": variation.palette.previewSurface,
  } as CSSProperties;

  const middleSections: ReactNode[] = [
    <section key="services" id="services" className={isLight ? "border-y border-slate-200 bg-white" : "border-y border-white/10 bg-white/[0.035]"}>
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <HeadingBlock
          eyebrow="Services made clear"
          title={blueprint.serviceTitle}
          copy={blueprint.serviceCopy}
          isLight={isLight}
        />
        <div className="grid gap-4 lg:grid-cols-4">
          {identity.services.slice(0, serviceLimit).map(service => (
            <article key={service.title} className={`min-h-[230px] rounded-3xl border p-5 ${panelClass(isLight)}`}>
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl" style={{ background: identity.accentSoft }}>
                <Award className="h-6 w-6" style={{ color: identity.accent }} />
              </div>
              <h3 className="text-xl font-black">{service.title}</h3>
              <p className={`mt-3 leading-7 ${mutedClass(isLight)}`}>{service.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>,

    <VisualStory
      key="visual"
      data={displayData}
      options={options}
      identity={identity}
      initials={initials}
      isLight={isLight}
      blueprint={blueprint}
    />,

    <section key="trust" className="mx-auto grid max-w-7xl gap-6 px-5 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
      <div className={`rounded-[2rem] border p-6 sm:p-8 ${panelClass(isLight)}`}>
        <MessageCircle className="mb-5 h-8 w-8" style={{ color: identity.accent }} />
        <p className={`text-sm font-black uppercase tracking-[0.2em] ${isLight ? "text-slate-500" : "text-white/45"}`}>
          Customer confidence
        </p>
        <blockquote className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
          "{identity.testimonial.quote}"
        </blockquote>
        <p className={`mt-5 font-bold ${mutedClass(isLight)}`}>{identity.testimonial.name}</p>
      </div>
      <div className={`rounded-[2rem] border p-6 sm:p-8 ${panelClass(isLight)}`}>
        <p className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: identity.accent }}>
          {blueprint.visualEyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-black sm:text-5xl">{blueprint.trustTitle}</h2>
        <p className={`mt-4 text-lg leading-8 ${mutedClass(isLight)}`}>{identity.visualSubtitle}</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {[...identity.trustBadges, goalCopy.secondary].map(badge => (
            <span key={badge} className={`rounded-full border px-3 py-2 text-sm font-bold ${isLight ? "border-slate-200 bg-slate-50 text-slate-700" : "border-white/10 bg-white/[0.05] text-white/70"}`}>
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>,

    <section key="process" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
      <HeadingBlock
        eyebrow="Simple conversion path"
        title={blueprint.processTitle}
        copy={`A cleaner path helps ${company} turn local attention into action without making customers hunt for the next step.`}
        isLight={isLight}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {identity.process.slice(0, processLimit).map(item => (
          <div key={item.step} className={`min-h-[220px] rounded-3xl border p-5 ${panelClass(isLight)}`}>
            <p className="text-sm font-black" style={{ color: identity.accent }}>{item.step}</p>
            <h3 className="mt-3 text-xl font-black">{item.title}</h3>
            <p className={`mt-3 text-sm leading-6 ${mutedClass(isLight)}`}>{item.description}</p>
          </div>
        ))}
      </div>
    </section>,

    <section key="pages" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
      <div className={`rounded-[2rem] border p-6 sm:p-8 ${panelClass(isLight)}`}>
        <Layers className="mb-5 h-8 w-8" style={{ color: identity.accent }} />
        <p className={`text-sm font-black uppercase tracking-[0.18em] ${isLight ? "text-slate-500" : "text-white/45"}`}>
          Service shortcuts
        </p>
        <h2 className="mt-3 text-3xl font-black sm:text-5xl">{blueprint.pagesTitle}</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {identity.pages.map(page => (
            <span key={page} className="rounded-full px-4 py-2 text-sm font-black text-slate-950" style={{ background: identity.accent }}>
              {page}
            </span>
          ))}
        </div>
      </div>
    </section>,

    <section key="local" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
      <div className={`grid gap-4 rounded-[2rem] border p-6 sm:p-8 lg:grid-cols-3 ${panelClass(isLight)}`}>
        {identity.proof.map(item => (
          <div key={`${item.value}-${item.label}`} className={`rounded-3xl border p-5 ${isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/[0.055]"}`}>
            <p className="text-3xl font-black" style={{ color: identity.accent }}>{item.value}</p>
            <p className={`mt-2 text-sm leading-5 ${mutedClass(isLight)}`}>{item.label}</p>
          </div>
        ))}
      </div>
    </section>,

    <section key="details" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
      <div className={`rounded-[2rem] border p-6 sm:p-8 ${panelClass(isLight)}`}>
        <ShieldCheck className="mb-5 h-8 w-8" style={{ color: identity.accent }} />
        <h2 className="text-3xl font-black sm:text-5xl">Local details stay close to the sale</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[address || market, phone || "Phone CTA ready", website ? "Existing website reviewed" : "Website gap visible"].map(item => (
            <div key={item} className={`rounded-2xl border p-4 font-bold ${isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/[0.04]"}`}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>,

    <section key="expanded-copy" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
      <div className={`rounded-[2rem] border p-6 sm:p-8 ${panelClass(isLight)}`}>
        <MousePointerClick className="mb-5 h-8 w-8" style={{ color: identity.accent }} />
        <h2 className="text-3xl font-black sm:text-5xl">Why customers should choose {company}</h2>
        <p className={`mt-4 max-w-4xl text-lg leading-8 ${mutedClass(isLight)}`}>
          Customers comparing {displayCategory.toLowerCase()} options in {market} need quick proof, plain service descriptions, a visible phone path, and enough local confidence to stop searching and call.
        </p>
      </div>
    </section>,

    <section key="questions" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
      <HeadingBlock
        eyebrow="Decision support"
        title="Answer the questions that slow down enquiries"
        copy={`A stronger ${displayCategory.toLowerCase()} homepage can answer practical buying questions before the customer reaches the phone.`}
        isLight={isLight}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          ["How quickly can someone get help?", goalCopy.section],
          ["What should customers ask for?", `${identity.pages.slice(0, 3).join(", ")} are easy starting points for a clear first conversation.`],
          ["Why trust this business?", `${identity.trustBadges.slice(0, 2).join(" and ")} give customers confidence before they call.`],
        ].map(([question, answer]) => (
          <div key={question} className={`min-h-[210px] rounded-3xl border p-5 ${panelClass(isLight)}`}>
            <h3 className="text-xl font-black">{question}</h3>
            <p className={`mt-3 text-sm leading-7 ${mutedClass(isLight)}`}>{answer}</p>
          </div>
        ))}
      </div>
    </section>,
  ];
  const orderedMiddleSections = blueprint.order
    .map(sectionKey => middleSections.find(section => isValidElement(section) && section.key === sectionKey))
    .filter(Boolean);

  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: printStyles(isLight) }} />
    <SitePreviewPdfActions
      autoPrint={autoPrint}
      pdfTitle={`${company} homepage`}
      showActions={!autoPrint && !isClientPreview}
    />
    <main className={`site-preview-root site-preview-${composition} site-preview-${blueprint.id} min-h-screen pb-20 sm:pb-0 ${isLight ? "bg-[#f8fafc] text-slate-950" : "bg-[#070b12] text-white"}`} style={themeVars}>
      <section
        className="relative overflow-hidden"
        style={blueprint.id === "menu-visit"
          ? {
              backgroundImage: imageBackground(
                identity.segment,
                0,
                "linear-gradient(90deg, rgba(18,10,5,0.88) 0%, rgba(18,10,5,0.62) 52%, rgba(18,10,5,0.28) 100%)",
              ),
            }
          : undefined}
      >
        {usesGridTexture ? (
          <div className={`site-preview-hero-decoration absolute inset-0 ${isLight ? "bg-[linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)]" : "bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)]"} bg-[size:54px_54px]`} />
        ) : (
          <div className={`site-preview-hero-decoration absolute inset-0 ${isLight ? "bg-[linear-gradient(145deg,#ffffff_0%,#f8fafc_48%,#eef2ff_100%)]" : "bg-[linear-gradient(145deg,#070b12_0%,#0d1424_52%,#080b13_100%)]"}`} />
        )}
        <div
          className="site-preview-hero-decoration absolute inset-x-0 top-0 h-[560px] opacity-90"
          style={{
            background: `radial-gradient(circle at 18% 18%, ${identity.accentSoft}, transparent 34%), radial-gradient(circle at 78% 4%, ${identity.accent2}33, transparent 30%)`,
          }}
        />
        <div className="site-preview-hero-decoration absolute bottom-0 left-1/2 h-80 w-[80vw] -translate-x-1/2 rounded-full blur-3xl" style={{ background: identity.accentSoft }} />

        <div className="site-preview-hero relative mx-auto flex max-w-7xl flex-col px-5 py-6 sm:px-8 lg:min-h-[690px] lg:px-10">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="grid h-12 w-12 place-items-center rounded-2xl font-black text-slate-950 shadow-2xl"
                style={{ background: `linear-gradient(135deg, ${identity.accent}, ${identity.accent2})` }}
              >
                {initials}
              </div>
              <div>
                <p className="text-lg font-black leading-none">{company}</p>
                <p className={`mt-1 text-xs font-bold uppercase tracking-[0.2em] ${isLight ? "text-slate-500" : "text-white/45"}`}>
                  {displayCategory}
                </p>
              </div>
            </div>
            <nav className={`site-preview-print-nav hidden items-center gap-1 rounded-full border p-1 md:flex ${isLight ? "border-slate-950 bg-slate-950 shadow-lg" : "border-white/10 bg-white/5"}`}>
              {identity.pages.slice(0, 3).map(page => (
                <a
                  key={page}
                  href="#services"
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${isLight ? "text-white hover:bg-white/10" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
                >
                  {page}
                </a>
              ))}
            </nav>
            <div className={`hidden items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold sm:flex ${isLight ? "border-slate-950 bg-white text-slate-700" : "border-white/10 bg-white/5 text-white/70"}`}>
              {phone ? <Phone className="h-4 w-4" style={{ color: identity.accent }} /> : <MapPin className="h-4 w-4" style={{ color: identity.accent }} />}
              {phone || market}
            </div>
          </header>

          <div className={`site-preview-hero-grid grid flex-1 items-center gap-8 py-8 sm:py-10 lg:gap-12 lg:py-12 ${heroGrid}`}>
            <div className={heroTextClass}>
              <div className="mb-6 flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${isLight ? "border-slate-200 bg-white text-slate-700" : "border-white/10 bg-white/[0.07] text-white/75"}`}>
                  <MapPin className="h-4 w-4" style={{ color: identity.accent }} />
                  Serving {market}
                </span>
                <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${isLight ? "border-slate-200 bg-white text-slate-700" : "border-white/10 bg-white/[0.07] text-white/75"}`}>
                  <Star className="h-4 w-4 fill-current" style={{ color: identity.accent2 }} />
                  {blueprint.label}
                </span>
              </div>
              <h1 className={`max-w-4xl break-words text-4xl leading-[1.03] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl ${composition === "editorial-offset" ? "[font-family:Georgia,serif] font-semibold" : "font-black"} ${composition === "centered-story" ? "mx-auto" : ""}`}>
                {identity.headline}
              </h1>
              <p className={`mt-6 max-w-2xl text-xl leading-9 ${mutedClass(isLight)} ${composition === "centered-story" ? "mx-auto" : ""}`}>{heroPitch}</p>

              <div className={`mt-8 flex flex-col gap-3 sm:flex-row ${composition === "centered-story" ? "justify-center" : ""}`}>
                {(callLink || options.conversionGoal !== "calls") && (
                  <a
                    href={options.conversionGoal === "visits" && maps ? maps : callLink || "#services"}
                    target={options.conversionGoal === "visits" && maps ? "_blank" : undefined}
                    rel={options.conversionGoal === "visits" && maps ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-lg font-black text-slate-950 transition hover:scale-[1.01]"
                    style={{ background: `linear-gradient(135deg, ${identity.accent}, ${identity.accent2})` }}
                  >
                    {options.conversionGoal === "visits" ? <MapPin className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
                    {primaryCta}
                  </a>
                )}
                {maps && options.conversionGoal !== "visits" && (
                  <a
                    href={maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-6 py-4 text-lg font-bold transition ${isLight ? "border-slate-200 bg-white text-slate-900 hover:bg-slate-50" : "border-white/15 bg-white/5 text-white hover:bg-white/10"}`}
                  >
                    <MapPin className="h-5 w-5" />
                    {identity.secondaryCta}
                  </a>
                )}
              </div>

              <div className={`mt-8 grid max-w-2xl gap-3 sm:grid-cols-3 ${composition === "centered-story" ? "mx-auto" : ""}`}>
                {identity.proof.map(item => (
                  <div key={`${item.value}-${item.label}`} className={`rounded-3xl border p-4 ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-white/[0.055]"}`}>
                    <p className="text-2xl font-black" style={{ color: identity.accent }}>{item.value}</p>
                    <p className={`mt-1 text-sm leading-5 ${mutedClass(isLight)}`}>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={heroVisualClass}>
              <HeroPreviewVisual
                data={displayData}
                identity={identity}
                initials={initials}
                isLight={isLight}
                blueprint={blueprint}
                variationBadge={variation.badge}
              />
            </div>
          </div>

          <div className={`site-preview-signal-grid mb-8 grid gap-3 rounded-[2rem] border p-3 sm:grid-cols-3 ${isLight ? "border-slate-200 bg-white/90 shadow-[0_18px_60px_rgba(15,23,42,0.08)]" : "border-white/10 bg-white/[0.055]"}`}>
            {[
              { label: phone ? "Call direct" : "Quick enquiry", value: phone || primaryCta, icon: Phone },
              { label: "Local area", value: address || market, icon: MapPin },
              { label: "Popular service", value: identity.pages[0] ?? category, icon: CheckCircle },
            ].map(item => (
              <div key={item.label} className={`${styleMood.shape} border p-4 ${isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-black/15"}`}>
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" style={{ color: identity.accent }} />
                  <p className={`text-xs font-black uppercase tracking-[0.18em] ${isLight ? "text-slate-500" : "text-white/42"}`}>{item.label}</p>
                </div>
                <p className="mt-2 text-base font-black leading-6">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {orderedMiddleSections.slice(0, middleBudget)}

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
        <div
          className={`overflow-hidden rounded-[2rem] border p-8 text-center sm:p-12 ${isLight ? "border-slate-200 bg-white" : "border-white/10"}`}
          style={{ background: isLight ? "white" : `linear-gradient(135deg, ${identity.accentSoft}, rgba(255,255,255,0.045))` }}
        >
          <Clock className="mx-auto mb-5 h-8 w-8" style={{ color: identity.accent }} />
          <h2 className="text-3xl font-black sm:text-5xl">{blueprint.ctaTitle}</h2>
          <p className={`mx-auto mt-4 max-w-2xl text-lg leading-8 ${mutedClass(isLight)}`}>
            {company} is easy to reach, easy to understand, and ready for customers who want a clear next step.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {(callLink || options.conversionGoal !== "calls") && (
              <a
                href={options.conversionGoal === "visits" && maps ? maps : callLink || "#services"}
                target={options.conversionGoal === "visits" && maps ? "_blank" : undefined}
                rel={options.conversionGoal === "visits" && maps ? "noopener noreferrer" : undefined}
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 font-black text-slate-950"
                style={{ background: `linear-gradient(135deg, ${identity.accent}, ${identity.accent2})` }}
              >
                {primaryCta}
                <ArrowRight className="h-5 w-5" />
              </a>
            )}
            {maps && (
              <a href={maps} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-6 py-4 font-bold ${isLight ? "border-slate-200 bg-slate-50 text-slate-900" : "border-white/15 text-white"}`}>
                <MapPin className="h-5 w-5" />
                View location
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
    </>
  );
}

export default function SitePreviewPageContent(props: { searchParams?: SitePreviewSearchParams }) {
  return <SitePreviewContent {...props} />;
}
