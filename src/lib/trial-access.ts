import { getUsageStats } from "@/lib/usage";

export const TRIAL_EXPIRED_MESSAGE = "Your 3-day trial has ended. Choose Pro or Agency to continue searches, AI tools, and outreach. Your saved work remains available.";

// Check the persisted account, never a client-supplied plan or a new rolling deadline.
export async function getTrialAccessError(userId: string) {
  try {
    const usage = await getUsageStats(userId);
    if (!usage) return { status: 404, error: "Account not found.", code: "ACCOUNT_NOT_FOUND" };
    if (usage.trialExpired) {
      return { status: 403, error: TRIAL_EXPIRED_MESSAGE, code: "TRIAL_EXPIRED", trialExpired: true, upgrade: true };
    }
    return null;
  } catch {
    return { status: 503, error: "We could not verify your plan. Please try again shortly.", code: "USAGE_UNAVAILABLE" };
  }
}
