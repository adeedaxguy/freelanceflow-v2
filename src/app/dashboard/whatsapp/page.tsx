import { getServerSession } from "next-auth";
import { MessageCircle } from "lucide-react";
import BetaFeaturePage from "@/components/dashboard/BetaFeaturePage";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function WhatsAppPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  const hasMetaToken = Boolean(process.env.WHATSAPP_ACCESS_TOKEN);
  const hasPhoneId = Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID);
  const hasVerifyToken = Boolean(process.env.WHATSAPP_VERIFY_TOKEN);
  const hasTwilioFallback = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);

  return (
    <BetaFeaturePage
      icon={MessageCircle}
      eyebrow="WhatsApp outreach"
      title="WhatsApp messaging is coming soon"
      description="A controlled WhatsApp workflow for leads that have suitable public mobile or WhatsApp contact routes. This remains gated until templates, consent, provider setup, opt-outs, and sender reputation are fully tested."
      isAdmin={isAdmin}
      userHighlights={[
        "Users will not see unfinished WhatsApp send buttons or bulk-message tools.",
        "The planned workflow will prefer one-to-one, context-rich messages over risky bulk WhatsApp blasts.",
        "Local lead phone labels stay useful today, while WhatsApp sending waits for verified provider setup.",
      ]}
      adminSteps={[
        "Validate the lead-to-message journey, including when a number is safe to treat as WhatsApp-ready.",
        "Confirm template language, opt-out copy, sender identity, and message logging before any live release.",
        "Test provider webhooks and error states with admin accounts before exposing anything to regular users.",
        "Keep WhatsApp gated until daily caps, abuse prevention, and admin reporting are visible.",
      ]}
      adminChecks={[
        {
          label: "WhatsApp access token",
          ready: hasMetaToken,
          note: "Meta WhatsApp Cloud API token should be stored server-side only.",
        },
        {
          label: "WhatsApp phone number ID",
          ready: hasPhoneId,
          note: "Required for official WhatsApp Cloud API sends.",
        },
        {
          label: "Webhook verify token",
          ready: hasVerifyToken,
          note: "Needed before delivery, reply, and opt-out events can be trusted.",
        },
        {
          label: "Twilio fallback credentials",
          ready: hasTwilioFallback,
          note: "Optional fallback path if WhatsApp is routed through Twilio instead of Meta Cloud API.",
        },
      ]}
      primaryHref="/dashboard/local-leads"
      primaryLabel="Find leads with numbers"
      secondaryHref="/dashboard/softphone"
      secondaryLabel="View softphone beta"
    />
  );
}
