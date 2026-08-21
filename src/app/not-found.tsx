import Link from "next/link";
import { Home, Search, Zap, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          {/* Animated 404 */}
          <div className="relative mb-10 inline-block">
            <div className="text-[160px] font-extrabold text-foreground/5 leading-none select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-2xl shadow-primary/30">
                <Zap className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-foreground mb-4">
            Page Not Found
          </h1>
          <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
            Looks like this page packed up and found a better client. Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-light text-white rounded-xl font-semibold transition-colors"
            >
              <Home className="w-4 h-4" /> Back to Home
            </Link>
            <Link
              href="/auth?mode=signup&intent=dashboard&source=404"
              className="inline-flex items-center gap-2 px-6 py-3 bg-surface border border-border hover:border-primary/30 text-foreground rounded-xl font-semibold transition-all"
            >
              <Search className="w-4 h-4" /> Create Free Account
            </Link>
          </div>

          <div className="mt-16 p-6 rounded-2xl bg-surface border border-border text-left">
            <p className="text-sm font-semibold text-foreground mb-3">You might be looking for:</p>
            <ul className="space-y-2">
              {[
                { label: "Find freelance leads", href: "/auth?mode=signup&intent=freelance-leads&source=404" },
                { label: "Generate AI proposals", href: "/features/ai-proposals" },
                { label: "View pricing plans", href: "/pricing" },
                { label: "Read the blog", href: "/blog" },
                { label: "Contact support", href: "/contact" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary-light transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3 rotate-180" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
