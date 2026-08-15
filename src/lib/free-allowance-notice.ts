export const FREE_ALLOWANCE_NOTICE_ID = "free-plan-600-weekly-v1";
export const FREE_ALLOWANCE_NOTICE_SUBJECT = "Your iCloseLeads Free plan now includes 600 leads per week";
export const FREE_ALLOWANCE_NOTICE_BATCH_SIZE = 20;

export function freeAllowanceNoticeKey(userId: string) {
  return `account_notice:${FREE_ALLOWANCE_NOTICE_ID}:${userId}`;
}

export function freeAllowanceNoticeContent() {
  return {
    subject: FREE_ALLOWANCE_NOTICE_SUBJECT,
    title: "Your Free plan allowance has been updated",
    lines: [
      "We're writing to confirm a change to your iCloseLeads account.",
      "<strong>Your Free plan now includes up to 600 lead results per week.</strong> Your allowance resets automatically every seven days.",
      "No action is required, and your account remains free.",
      '<a href="https://icloseleads.com/dashboard" style="color:#9f67ff;font-weight:700;">View your current usage</a>',
      "The iCloseLeads team",
    ],
  };
}
