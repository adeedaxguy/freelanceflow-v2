"use client";
import Link from "next/link";
import { Twitter, Github, Linkedin, Mail } from "lucide-react";
import Logo from "./Logo";

const footerLinks = {
  Product: [
    { label: "Features",   href: "/features"   },
    { label: "Pricing",    href: "/pricing"     },
    { label: "Blog",       href: "/blog"        },
    { label: "Changelog",  href: "/changelog"   },
    { label: "Status",     href: "/status"      },
  ],
  Company: [
    { label: "About",      href: "/about"       },
    { label: "Careers",    href: "/careers"     },
    { label: "Press",      href: "/press"       },
    { label: "Contact",    href: "/contact"     },
    { label: "Affiliate",  href: "/affiliate"   },
  ],
  Legal: [
    { label: "Privacy Policy",   href: "/privacy"        },
    { label: "Terms of Service", href: "/terms"          },
    { label: "Cookie Policy",    href: "/cookie-policy"  },
    { label: "GDPR",             href: "/privacy#gdpr"   },
  ],
  Support: [
    { label: "Help Center",    href: "/help"     },
    { label: "Documentation",  href: "/help#api" },
    { label: "API Docs",       href: "/help#api" },
    { label: "Status",         href: "/status"   },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="mb-4">
              <Logo size="sm" href="/" />
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              The AI-powered client acquisition platform built for freelancers who mean business.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Twitter,  href: "https://twitter.com/icloseleads", label: "Twitter"  },
                { icon: Github,   href: "https://github.com/icloseleads",  label: "GitHub"   },
                { icon: Linkedin, href: "https://linkedin.com/company/icloseleads", label: "LinkedIn" },
                { icon: Mail,     href: "mailto:hello@icloseleads.com",     label: "Email"    },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary-light hover:border-primary/50 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-foreground font-semibold text-sm mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border-t border-border pt-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-foreground font-semibold mb-1">Stay in the loop</h3>
              <p className="text-muted-foreground text-sm">Weekly tips on freelance growth and client acquisition.</p>
            </div>
            <form className="flex gap-2 w-full sm:w-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 flex-1 sm:w-64"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} iCloseLeads, Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/cookie-policy" className="hover:text-foreground transition-colors">Cookies</Link>
            <span className="flex items-center gap-1">
              Made with <span className="text-red-400">♥</span> for freelancers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
