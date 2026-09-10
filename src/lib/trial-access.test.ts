jest.mock("@/lib/usage", () => ({ getUsageStats: jest.fn() }));
import { getUsageStats } from "@/lib/usage";
import { getTrialAccessError } from "@/lib/trial-access";

describe("trial access guard", () => {
  afterEach(() => jest.resetAllMocks());
  it.each(["free", "pro", "agency"])("allows an active %s account even when lead credits are exhausted", async plan => {
    (getUsageStats as jest.Mock).mockResolvedValue({ plan, remaining: 0, trialExpired: false });
    expect(await getTrialAccessError("user")).toBeNull();
  });
  it("blocks expired trials with an actionable upgrade error", async () => {
    (getUsageStats as jest.Mock).mockResolvedValue({ plan: "free", trialExpired: true });
    expect(await getTrialAccessError("user")).toMatchObject({ status: 403, code: "TRIAL_EXPIRED", upgrade: true });
  });
  it("fails closed when usage cannot be checked", async () => {
    (getUsageStats as jest.Mock).mockRejectedValue(new Error("database unavailable"));
    expect(await getTrialAccessError("user")).toMatchObject({ status: 503, code: "USAGE_UNAVAILABLE" });
  });
  it("does not give missing accounts a fresh trial", async () => {
    (getUsageStats as jest.Mock).mockResolvedValue(null);
    expect(await getTrialAccessError("user")).toMatchObject({ status: 404 });
  });
});
