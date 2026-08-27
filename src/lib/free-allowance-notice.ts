export const FREE_ALLOWANCE_NOTICE_ID = "free-trial-600-three-days-v1";
export const FREE_ALLOWANCE_NOTICE_SUBJECT = "Your iCloseLeads 3-day trial includes 600 lead results";
export const FREE_ALLOWANCE_NOTICE_BATCH_SIZE = 20;

export function freeAllowanceNoticeKey(userId: string) {
  return `account_notice:${FREE_ALLOWANCE_NOTICE_ID}:${userId}`;
}

export function freeAllowanceNoticeContent() {
  return {
    subject: FREE_ALLOWANCE_NOTICE_SUBJECT,
    title: "Your 3-day trial allowance is active",
    lines: [
      "We're writing to confirm a change to your iCloseLeads account.",
      "<strong>Your trial includes up to 600 lead results for three days.</strong> The trial begins when you create your account; existing accounts receive a three-day rollout window.",
      "No action is required to start. After the trial ends, choose Pro or Agency through secure Stripe checkout to continue finding new leads.",
      '<a href="https://icloseleads.com/dashboard" style="color:#9f67ff;font-weight:700;">View your current usage</a>',
      "The iCloseLeads team",
    ],
  };
}
