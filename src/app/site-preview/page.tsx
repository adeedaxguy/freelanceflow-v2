import type { Metadata } from "next";
import {
  CheckCircle,
  Clock,
  ExternalLink,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Website Preview",
  description: "A private website concept preview.",
  robots: {
    index: false,
    follow: false,
  },
};

type SearchParams = {
  company?: string | string[];
  category?: string | string[];
  location?: string | string[];
  address?: string | string[];
  phone?: string | string[];
  website?: string | string[];
  maps?: string | string[];
  pitch?: string | string[];
  status?: string | string[];
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function clean(value: string | string[] | undefined, fallback = "") {
  const next = (firstParam(value) ?? "").replace(/\s+/g, " ").trim();
  return (next || fallback).slice(0, 220);
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

function servicePlan(category: string, status: string) {
  const text = `${category} ${status}`.toLowerCase();

  if (text.includes("auto") || text.includes("car") || text.includes("body")) {
    return [
      ["Collision and repair enquiries", "Make it easy for drivers to request a quote, share photos, and book the next step."],
      ["Insurance-friendly trust", "Show reviews, certifications, location details, and clear service options."],
      ["Local search pages", "Help nearby customers find the shop for high-intent searches."],
    ];
  }

  if (text.includes("clean")) {
    return [
      ["Quote requests", "Turn search traffic into estimate requests for homes, offices, and repeat cleaning plans."],
      ["Service area pages", "Build dedicated pages for the neighborhoods customers already search in."],
      ["Recurring booking flow", "Make monthly and weekly cleaning packages simple to understand."],
    ];
  }

  if (text.includes("restaurant") || text.includes("cafe") || text.includes("food")) {
    return [
      ["Menu and ordering path", "Put the menu, directions, and call-to-action in front of hungry visitors fast."],
      ["Local discovery", "Use photos, reviews, and location content to stand out in nearby searches."],
      ["Event enquiries", "Capture catering, private dining, and group booking opportunities."],
    ];
  }

  if (text.includes("salon") || text.includes("spa") || text.includes("barber")) {
    return [
      ["Appointment-ready pages", "Make services, prices, and booking actions clear on mobile."],
      ["Style proof", "Show reviews, gallery highlights, and service expertise in one clean path."],
      ["Local SEO structure", "Help nearby customers find the business for specific treatments and styles."],
    ];
  }

  return [
    ["Mobile-first website", "Give local customers a fast page that is easy to read, call, and trust."],
    ["Quote and contact flow", "Move visitors from interest to enquiry with fewer clicks."],
    ["Local SEO foundation", "Structure pages around services, location, reviews, and the next action."],
  ];
}

export default function SitePreviewPage({ searchParams }: { searchParams?: SearchParams }) {
  const company = clean(searchParams?.company, "Local Business");
  const category = clean(searchParams?.category, "Local service");
  const location = clean(searchParams?.location, "Your area");
  const address = clean(searchParams?.address);
  const phone = clean(searchParams?.phone);
  const maps = safeHttpUrl(searchParams?.maps);
  const website = safeHttpUrl(searchParams?.website);
  const pitch = clean(
    searchParams?.pitch,
    "A sharper website can turn local searches into calls, quote requests, and booked work.",
  );
  const services = servicePlan(category, clean(searchParams?.status, "unknown"));
  const callLink = telHref(phone);

  return (
    <main className="min-h-screen bg-[#071014] text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_25%_20%,rgba(132,80,255,0.35),transparent_42%),radial-gradient(circle_at_75%_10%,rgba(35,220,190,0.28),transparent_35%)]" />
        <div className="relative mx-auto flex min-h-[760px] max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-200">{category}</p>
              <p className="mt-1 text-sm text-white/55">{location}</p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/70">
              Website concept preview
            </div>
          </header>

          <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm font-bold text-amber-200">
                <Star className="h-4 w-4 fill-amber-200" />
                Built for local search, calls, and trust
              </div>
              <h1 className="max-w-4xl text-5xl font-black leading-[0.96] tracking-tight sm:text-7xl lg:text-8xl">
                {company}
                <span className="block bg-gradient-to-r from-cyan-200 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
                  made easier to choose.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-xl leading-9 text-white/72">{pitch}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {callLink && (
                  <a
                    href={callLink}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-6 py-4 text-lg font-black text-slate-950 transition hover:bg-cyan-200"
                  >
                    <Phone className="h-5 w-5" />
                    Call {phone}
                  </a>
                )}
                {maps && (
                  <a
                    href={maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-lg font-bold text-white transition hover:bg-white/10"
                  >
                    <MapPin className="h-5 w-5" />
                    Get directions
                  </a>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-4 shadow-2xl backdrop-blur">
              <div className="rounded-[1.5rem] border border-white/10 bg-[#0b1220] p-5">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">Live service snapshot</p>
                    <h2 className="mt-2 text-2xl font-black">{company}</h2>
                  </div>
                  <Sparkles className="h-8 w-8 text-cyan-200" />
                </div>
                <div className="grid gap-3 py-5">
                  {services.map(([title, description]) => (
                    <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-emerald-300" />
                        <h3 className="font-black">{title}</h3>
                      </div>
                      <p className="text-sm leading-6 text-white/62">{description}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">Contact</p>
                  <div className="mt-3 space-y-2 text-white/72">
                    {address && <p>{address}</p>}
                    {phone && <p>{phone}</p>}
                    {website && (
                      <a href={website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-cyan-200 hover:underline">
                        Current website <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.035]">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-8 sm:grid-cols-3 sm:px-8 lg:px-10">
          {[
            ["Fast on mobile", "Built around short attention spans and tap-to-call behavior."],
            ["Clear proof", "Reviews, service detail, and direct contact actions stay visible."],
            ["Local intent", "Pages and calls-to-action match how nearby customers search."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <ShieldCheck className="mb-4 h-6 w-6 text-emerald-300" />
              <h2 className="text-xl font-black">{title}</h2>
              <p className="mt-2 leading-7 text-white/60">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-r from-purple-500/18 via-cyan-400/14 to-emerald-400/12 p-8 text-center sm:p-12">
          <Clock className="mx-auto mb-5 h-8 w-8 text-cyan-200" />
          <h2 className="text-3xl font-black sm:text-5xl">Ready to turn more visitors into enquiries?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/70">
            A focused local website gives customers confidence before they call, message, book, or request a quote.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {callLink && (
              <a href={callLink} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-slate-950">
                <Phone className="h-5 w-5" />
                Call today
              </a>
            )}
            {maps && (
              <a href={maps} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-6 py-4 font-bold text-white">
                <MapPin className="h-5 w-5" />
                View location
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
