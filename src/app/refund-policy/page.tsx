import type { Metadata } from "next";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Refund Policy — iCloseLeads",
  description: "Read the iCloseLeads refund policy for paid monthly and annual subscriptions.",
};

export default function RefundPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <div className="mx-auto max-w-3xl px-4 py-24">
          <h1 className="mb-3 text-4xl font-extrabold text-foreground">Refund Policy</h1>
          <p className="mb-12 text-muted-foreground">Last updated: July 27, 2026</p>

          <div className="space-y-10 leading-relaxed text-muted-foreground">
            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">14-day money-back guarantee</h2>
              <p>
                Your first iCloseLeads paid subscription is eligible for a full refund when you
                request it within 14 calendar days of the original purchase.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">Renewals and usage-based services</h2>
              <p>
                Subscription renewals, phone numbers, calling credit, and other metered or
                usage-based services are not refundable once supplied or consumed, except where
                applicable law requires otherwise.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">How to request a refund</h2>
              <p>
                Email billing@icloseleads.com from the address on your account. Include the account
                email and transaction reference. Approved refunds are returned to the original
                payment method; processing time depends on the payment provider and your bank.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-foreground">Questions</h2>
              <p>Contact billing@icloseleads.com before purchasing if you need clarification.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
