import { getServerSession } from "next-auth";
import { PhoneCall } from "lucide-react";
import BetaFeaturePage from "@/components/dashboard/BetaFeaturePage";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SoftphonePage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  const hasTwilioCore = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
  const hasVoiceApp = Boolean(process.env.TWILIO_TWIML_APP_SID);
  const hasCallerNumber = Boolean(process.env.TWILIO_PHONE_NUMBER);

  return (
    <BetaFeaturePage
      icon={PhoneCall}
      eyebrow="Calling workspace"
      title="Softphone is coming soon"
      description="A built-in calling desk for local leads, owner follow-up, and saved lead outreach. This stays admin-only until number purchase, consent, call logs, recording rules, and usage limits are production-safe."
      isAdmin={isAdmin}
      userHighlights={[
        "Call controls are not exposed to users yet, so nobody can place unfinished or untracked calls.",
        "The planned flow will let users call qualified local leads directly from iCloseLeads once the provider setup is fully verified.",
        "Until then, users can still open Google Maps, copy phone numbers, save leads, and prepare outreach safely.",
      ]}
      adminSteps={[
        "Review the call flow from local lead to saved lead to call attempt, including where call notes and outcomes should be stored.",
        "Confirm Twilio credentials, purchased number behavior, caller ID rules, and rate limits before enabling real calls.",
        "Test the user experience with non-production numbers first, then add call outcome logging and compliance copy.",
        "Keep the public release disabled until call attempts, errors, and billing state are visible in admin analytics.",
      ]}
      adminChecks={[
        {
          label: "Twilio core credentials",
          ready: hasTwilioCore,
          note: "Requires account SID and auth token in server environment variables.",
        },
        {
          label: "Voice application",
          ready: hasVoiceApp,
          note: "A TwiML app or equivalent voice application must be configured before browser calls can be tested.",
        },
        {
          label: "Caller number",
          ready: hasCallerNumber,
          note: "A verified or purchased caller number is required before live lead calling is enabled.",
        },
      ]}
      primaryHref="/dashboard/local-leads"
      primaryLabel="Find callable leads"
      secondaryHref="/dashboard/saved-leads"
      secondaryLabel="Review saved leads"
    />
  );
}
