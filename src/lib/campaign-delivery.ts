import { createHash } from "node:crypto";

export const CAMPAIGN_DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function campaignContentHash(subject: string, message: string) {
  return createHash("sha256")
    .update(`${normalize(subject)}\n${normalize(message)}`)
    .digest("hex")
    .slice(0, 32);
}

type CampaignRecord = {
  value: string;
  updatedAt: Date;
};

export function hasRecentMatchingCampaign(
  records: CampaignRecord[],
  subject: string,
  message: string,
  now = new Date(),
) {
  const contentHash = campaignContentHash(subject, message);
  const normalizedSubject = normalize(subject);

  return records.some((record) => {
    if (now.getTime() - record.updatedAt.getTime() > CAMPAIGN_DUPLICATE_WINDOW_MS) return false;

    try {
      const previous = JSON.parse(record.value) as { contentHash?: string; subject?: string };
      return previous.contentHash === contentHash
        || (typeof previous.subject === "string" && normalize(previous.subject) === normalizedSubject);
    } catch {
      return false;
    }
  });
}
