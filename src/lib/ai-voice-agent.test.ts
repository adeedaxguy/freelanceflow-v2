import {
  createVoiceAgentState,
  generateVoiceAgentTurn,
  initialAgentMessage,
  isOptOut,
  parseVoiceAgentState,
  serializeVoiceAgentState,
} from "./ai-voice-agent";

const state = createVoiceAgentState({
  companyName: "Northstar Dental",
  contactName: "Alex",
  campaignContext: "whether the practice wants more local appointment enquiries",
  consentBasis: "The business asked to receive a call through its public enquiry form.",
});

describe("AI voice agent safeguards", () => {
  it("recognizes spoken and keypad opt-outs", () => {
    expect(isOptOut("Please remove me from your list")).toBe(true);
    expect(isOptOut("", "9")).toBe(true);
    expect(isOptOut("Call me later", "1")).toBe(false);
  });

  it("discloses that the caller is AI and acts for Adnan", () => {
    const message = initialAgentMessage(state);
    expect(message).toContain("AI assistant");
    expect(message).toContain("on behalf of Adnan");
    expect(message).toContain("press 9");
  });

  it("round-trips valid state and rejects unrelated notes", () => {
    expect(parseVoiceAgentState(serializeVoiceAgentState(state))?.companyName).toBe("Northstar Dental");
    expect(parseVoiceAgentState("not-json")).toBeNull();
    expect(parseVoiceAgentState('{"version":1}')).toBeNull();
  });

  it("ends cleanly when a prospect is not interested", async () => {
    const turn = await generateVoiceAgentTurn(state, "No thanks, I am not interested", null);
    expect(turn.endCall).toBe(true);
    expect(turn.outcome).toBe("NOT_INTERESTED");
  });

  it("captures a callback preference without an AI key", async () => {
    const callback = await generateVoiceAgentTurn(state, "I am busy, call back later", null);
    expect(callback.stage).toBe("CALLBACK");
    expect(callback.endCall).toBe(false);
    const scheduled = await generateVoiceAgentTurn({ ...state, stage: "CALLBACK" }, "Tomorrow morning", null);
    expect(scheduled.outcome).toBe("FOLLOW_UP");
    expect(scheduled.endCall).toBe(true);
  });
});
