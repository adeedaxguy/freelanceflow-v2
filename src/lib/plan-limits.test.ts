import { FREE_TRIAL_DAYS, getFreeTrialWindow } from "@/lib/plan-limits";

describe("free trial window", () => {
  it("gives new users three days from signup", () => {
    const createdAt = new Date("2026-09-10T12:00:00.000Z");
    const trial = getFreeTrialWindow(createdAt);

    expect(trial.startsAt).toEqual(createdAt);
    expect(trial.endsAt).toEqual(new Date("2026-09-13T12:00:00.000Z"));
    expect((trial.endsAt.getTime() - trial.startsAt.getTime()) / 86_400_000).toBe(FREE_TRIAL_DAYS);
  });

  it("gives existing users the rollout grace window", () => {
    const trial = getFreeTrialWindow(new Date("2026-01-01T00:00:00.000Z"));

    expect(trial.startsAt).toEqual(new Date("2026-08-29T00:00:00.000Z"));
    expect(trial.endsAt).toEqual(new Date("2026-09-01T00:00:00.000Z"));
  });
});
