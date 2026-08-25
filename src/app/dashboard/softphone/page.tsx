import { getServerSession } from "next-auth";
import { PhoneCall } from "lucide-react";
import BetaFeaturePage from "@/components/dashboard/BetaFeaturePage";
import SoftphoneClient from "@/components/dashboard/SoftphoneClient";
import { authOptions } from "@/lib/auth";
import { isSoftphoneAllowed } from "@/lib/telephony";

export const dynamic = "force-dynamic";

export default async function SoftphonePage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";
  const isAllowed = isSoftphoneAllowed(session?.user?.role, session?.user?.plan);

  if (isAllowed) return <SoftphoneClient isAdmin={isAdmin} />;

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
      adminSteps={[]}
      adminChecks={[]}
      primaryHref="/dashboard/local-leads"
      primaryLabel="Find callable leads"
      secondaryHref="/dashboard/saved-leads"
      secondaryLabel="Review saved leads"
    />
  );
}
