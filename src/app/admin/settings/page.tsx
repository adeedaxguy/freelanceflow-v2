export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import AdminSettingsClient from "./AdminSettingsClient";

async function getSettings() {
  try {
    const rows = await prisma.platformSetting.findMany({ orderBy: { key: "asc" } });
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return map;
  } catch {
    return {};
  }
}

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return <AdminSettingsClient initialSettings={settings} />;
}
