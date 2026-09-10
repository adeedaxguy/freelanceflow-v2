export const FREE_ALLOWANCE_NOTICE_ID = "free-trial-600-three-days-v1";
export const FREE_ALLOWANCE_NOTICE_SUBJECT = "Your iCloseLeads 3-day trial includes 600 lead results";
export const FREE_ALLOWANCE_NOTICE_BATCH_SIZE = 20;

export function freeAllowanceNoticeKey(userId: string) {
  return `account_notice:${FREE_ALLOWANCE_NOTICE_ID}:${userId}`;
}

export function freeAllowanceNoticeContent() {
  return {
    subject: FREE_ALLOWANCE_NOTICE_SUBJECT,
    title: "Your trial allowance and ongoing access",
    lines: [
      "We're writing to confirm a change to your iCloseLeads account.",
      "<strong>Your trial includes up to 600 shared lead results for 72 hours from registration.</strong> Older accounts received a one-time rollout window ending September 1, 2026; this notice does not restart it.",
      "Check your dashboard for your deadline. After expiry, choose Pro ($10/month) or Agency ($15/month) through Stripe for new searches, AI tools, and outreach. Saved work remains available. No card or automatic charge for the trial.",
      '<a href="https://icloseleads.com/dashboard" style="color:#9f67ff;font-weight:700;">View your current usage</a>',
      "The iCloseLeads team",
    ],
  };
}
