import {
  FREE_ALLOWANCE_NOTICE_SUBJECT,
  freeAllowanceNoticeContent,
  freeAllowanceNoticeKey,
} from "./free-allowance-notice";

describe("Free allowance account notice", () => {
  it("is a factual account update without promotional copy", () => {
    const notice = freeAllowanceNoticeContent();
    const copy = `${notice.subject} ${notice.title} ${notice.lines.join(" ")}`.toLowerCase();

    expect(notice.subject).toBe(FREE_ALLOWANCE_NOTICE_SUBJECT);
    expect(copy).toContain("600 lead results per week");
    expect(copy).toContain("no action is required");
    expect(copy).not.toMatch(/unlock|limited-time|upgrade now|sale|discount|blog/);
  });

  it("creates a stable, per-account delivery key", () => {
    expect(freeAllowanceNoticeKey("user-123"))
      .toBe("account_notice:free-plan-600-weekly-v1:user-123");
  });
});
