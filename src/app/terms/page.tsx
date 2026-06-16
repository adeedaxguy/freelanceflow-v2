import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service — iCloseLeads",
  description: "iCloseLeads Terms of Service. Read our terms of use, acceptable use policy, and service agreement.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-24">
          <h1 className="text-4xl font-extrabold text-foreground mb-3">Terms of Service</h1>
          <p className="text-muted-foreground mb-12">Last updated: January 1, 2025</p>

          <div className="space-y-10 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using iCloseLeads (the &quot;Service&quot;), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">2. Service Description</h2>
              <p>iCloseLeads provides AI-powered lead discovery and email outreach tools for freelancers. The Service includes lead discovery, AI proposal generation, Gmail compose workflows, optional direct email connections, and outreach tracking.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">3. User Accounts</h2>
              <p>You are responsible for maintaining the security of your account. You must not share your credentials or allow unauthorized access. You must be at least 18 years old to use this Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">4. Acceptable Use Policy</h2>
              <p className="mb-2">You agree NOT to use iCloseLeads to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Send unsolicited bulk commercial email (spam)</li>
                <li>Harass, threaten, or harm recipients</li>
                <li>Violate any applicable law including CAN-SPAM, GDPR, or CASL</li>
                <li>Misrepresent your identity or impersonate others</li>
                <li>Scrape or harvest data in ways that violate Hunter.io&apos;s terms</li>
                <li>Send emails with false headers or misleading subject lines</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">5. Email Compliance</h2>
              <p>You are solely responsible for ensuring your outreach complies with applicable anti-spam laws. All commercial emails must include your real contact information and an unsubscribe mechanism.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">6. Subscription and Billing</h2>
              <p>Paid subscriptions are billed monthly or annually. We reserve the right to change pricing with 30 days notice. Free plan features may change at any time. Paid plans include a 14-day money-back guarantee.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">7. Intellectual Property</h2>
              <p>The iCloseLeads platform, its original content, features, and functionality are owned by iCloseLeads, Inc. Content you create (proposals, email copy) remains your intellectual property.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">8. Limitation of Liability</h2>
              <p>iCloseLeads shall not be liable for any indirect, incidental, special, consequential, or punitive damages. Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">9. Termination</h2>
              <p>We may terminate or suspend access immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, third parties, or the Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">10. Governing Law</h2>
              <p>These Terms shall be governed by the laws of the State of California, without regard to its conflict of law provisions.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">11. Data and Attribution</h2>
              <p>Lead discovery may use public records, open datasets, and licensed third-party data providers. Some location and business profile data may include contributions from OpenStreetMap contributors and is available under the Open Database License. Additional provider attribution may apply where required by the underlying data license or API terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">12. Contact</h2>
              <p>Questions about these Terms? Contact us at legal@icloseleads.com.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
