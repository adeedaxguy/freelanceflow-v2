import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — iCloseLeads",
  description: "iCloseLeads Privacy Policy. Learn how we collect, use, and protect your personal data in compliance with GDPR.",
};

export default function PrivacyPage() {
  const lastUpdated = "January 1, 2025";
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-24">
          <h1 className="text-4xl font-extrabold text-foreground mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground mb-12">Last updated: {lastUpdated}</p>

          <div className="space-y-10 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">1. Introduction</h2>
              <p>iCloseLeads, Inc. (&quot;iCloseLeads,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your personal information and your right to privacy. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you use our service at icloseleads.com.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">2. Information We Collect</h2>
              <p className="mb-3">We collect information you provide directly:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Account registration data (name, email, password)</li>
                <li>Profile information (niche, bio, hourly rate, portfolio URL)</li>
                <li>Email content you create and send through our platform</li>
                <li>Contact form submissions</li>
              </ul>
              <p className="mt-3">We also collect automatically: IP address, browser type, device information, pages visited, and usage analytics.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">3. Legal Basis for Processing (GDPR)</h2>
              <p>Under GDPR, we process your personal data on the following legal bases:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong className="text-foreground">Contract performance:</strong> Processing necessary to provide our services</li>
                <li><strong className="text-foreground">Legitimate interests:</strong> Improving our platform and preventing fraud</li>
                <li><strong className="text-foreground">Consent:</strong> Marketing communications (opt-in only)</li>
                <li><strong className="text-foreground">Legal obligation:</strong> Compliance with applicable laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">4. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide and maintain our service</li>
                <li>Process and deliver emails on your behalf</li>
                <li>Improve and personalize your experience</li>
                <li>Send transactional and service communications</li>
                <li>Detect and prevent fraud and abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">5. Data Retention</h2>
              <p>We retain your personal data for as long as your account is active. Upon account deletion, we delete your personal data within 30 days, except where retention is required by law.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">6. Your Rights (GDPR)</h2>
              <p>If you are in the EEA/UK, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request erasure of your data</li>
                <li>Object to processing</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p className="mt-2">To exercise these rights, email us at privacy@icloseleads.com.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">7. Third-Party Services</h2>
              <p>We use trusted third-party services for contact enrichment, AI proposal generation, authentication, analytics, infrastructure, and email-related workflows. Each service has its own privacy policy and data processing agreement where applicable.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">8. Cookies</h2>
              <p>We use strictly necessary cookies for authentication and session management. We do not use advertising or tracking cookies.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">9. Contact</h2>
              <p>For privacy-related questions, contact our Data Protection Officer at privacy@icloseleads.com or write to: iCloseLeads, Inc., 123 Market Street, San Francisco, CA 94105.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
