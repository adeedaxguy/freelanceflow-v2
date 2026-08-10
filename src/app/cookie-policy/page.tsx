import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Cookie Policy — iCloseLeads",
  description: "iCloseLeads Cookie Policy. Learn about the cookies we use, why we use them, and how to control your cookie preferences.",
  alternates: { canonical: "https://icloseleads.com/cookie-policy" },
};

export default function CookiePolicyPage() {
  const lastUpdated = "January 1, 2025";
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-24">
          <h1 className="text-4xl font-extrabold text-foreground mb-3">Cookie Policy</h1>
          <p className="text-muted-foreground mb-12">Last updated: {lastUpdated}</p>

          <div className="space-y-10 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">1. What Are Cookies?</h2>
              <p>Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work efficiently, to remember your preferences, and to provide information to website owners. Cookies do not contain personally identifiable information on their own, but they may be linked to personal data we hold about you.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">2. How We Use Cookies</h2>
              <p className="mb-4">iCloseLeads uses cookies for the following purposes:</p>
              <div className="space-y-4">
                {[
                  {
                    name: "Strictly Necessary Cookies",
                    description: "These cookies are essential for the website to function properly. They include session management, authentication tokens, and security cookies. You cannot opt out of these cookies as they are required to use our service.",
                    examples: ["next-auth.session-token", "next-auth.csrf-token", "__Secure-next-auth.session-token"],
                    canOptOut: false,
                  },
                  {
                    name: "Preference Cookies",
                    description: "These cookies remember your settings and preferences to give you a better experience. For example, they remember your theme preference (dark/light mode).",
                    examples: ["ff_theme"],
                    canOptOut: true,
                  },
                  {
                    name: "Analytics Cookies",
                    description: "We use analytics cookies to understand how visitors interact with our website. This data is aggregated and anonymous — it helps us improve the product. We use privacy-friendly analytics that do not share data with third parties.",
                    examples: ["_ga", "_gid", "ff_analytics"],
                    canOptOut: true,
                  },
                  {
                    name: "Marketing Cookies",
                    description: "We may use marketing cookies to measure the effectiveness of our marketing campaigns and to deliver relevant advertisements. We do not use advertising networks that build cross-site tracking profiles.",
                    examples: ["_fbp", "ttclid"],
                    canOptOut: true,
                  },
                ].map(({ name, description, examples, canOptOut }) => (
                  <div key={name} className="p-5 rounded-xl bg-surface border border-border">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${
                        canOptOut
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                      }`}>
                        {canOptOut ? "Optional" : "Required"}
                      </span>
                    </div>
                    <p className="text-sm mb-3">{description}</p>
                    <p className="text-xs text-muted-foreground/70">
                      Examples: <code className="font-mono">{examples.join(", ")}</code>
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">3. Third-Party Cookies</h2>
              <p className="mb-4">Some cookies on our platform are set by third-party services we use. These include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Stripe</strong> — Payment processing cookies for secure transactions</li>
                <li><strong className="text-foreground">Google Analytics</strong> — Aggregated, anonymized analytics (IP anonymization enabled)</li>
                <li><strong className="text-foreground">Resend</strong> — Email delivery tracking (open/click events)</li>
              </ul>
              <p className="mt-4">These third-party services have their own privacy policies. We encourage you to read them.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">4. Cookie Retention Periods</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 font-semibold text-foreground">Cookie</th>
                      <th className="text-left py-2 pr-4 font-semibold text-foreground">Type</th>
                      <th className="text-left py-2 font-semibold text-foreground">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {[
                      ["Session token", "Necessary", "30 days"],
                      ["CSRF token", "Necessary", "Session"],
                      ["Theme preference", "Preference", "1 year"],
                      ["Analytics", "Analytics", "2 years"],
                      ["Stripe", "Necessary", "Session"],
                    ].map(([name, type, duration]) => (
                      <tr key={name}>
                        <td className="py-2 pr-4 font-mono text-xs">{name}</td>
                        <td className="py-2 pr-4">{type}</td>
                        <td className="py-2">{duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">5. How to Control Cookies</h2>
              <p className="mb-4">You have several options to control cookies:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Cookie banner</strong> — When you first visit our site, you can accept or decline optional cookies via our consent banner.</li>
                <li><strong className="text-foreground">Browser settings</strong> — Most browsers allow you to block or delete cookies. Blocking all cookies may affect your ability to log in and use the platform.</li>
                <li><strong className="text-foreground">Opt-out tools</strong> — For Google Analytics, use the <a href="https://tools.google.com/dlpage/gaoptout" className="text-primary-light hover:underline" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">6. Your Rights</h2>
              <p>Under GDPR and CCPA, you have the right to access, delete, or restrict the processing of personal data associated with cookies. To exercise these rights, contact us at <a href="mailto:privacy@icloseleads.com" className="text-primary-light hover:underline">privacy@icloseleads.com</a>.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">7. Changes to This Policy</h2>
              <p>We may update this Cookie Policy from time to time. We will notify you of significant changes by updating the &quot;Last updated&quot; date above and, where appropriate, by displaying a notice on our website.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">8. Contact</h2>
              <p>For questions about this Cookie Policy, contact our Data Protection Officer at <a href="mailto:privacy@icloseleads.com" className="text-primary-light hover:underline">privacy@icloseleads.com</a>.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
