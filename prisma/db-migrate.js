/**
 * FreelanceFlow — SQLite column sync script
 * Run with: node prisma/db-migrate.js
 *
 * Adds any columns that are in the Prisma schema but missing from the DB.
 * Safe to run multiple times (skips already-existing columns).
 */

const path = require("path");
const Database = require("better-sqlite3");

const DB_PATH = path.join(__dirname, "dev.db");

const COLUMNS = {
  Lead: [
    { name: "phone",          type: "TEXT" },
    { name: "confidence",     type: "INTEGER" },
    { name: "qualityScore", type: "INTEGER" },
    { name: "bestMatchScore", type: "INTEGER" },
    { name: "title",        type: "TEXT" },
    { name: "sourceUrl",    type: "TEXT" },
    { name: "source",       type: "TEXT" },
    { name: "notes",        type: "TEXT" },
    { name: "isManual",      type: "INTEGER DEFAULT 0" },
  ],
  User: [
    { name: "suspended",       type: "INTEGER DEFAULT 0" },
    { name: "plan",            type: "TEXT DEFAULT 'free'" },
    { name: "expertise",       type: "TEXT" },
    { name: "referralSource",  type: "TEXT" },
    { name: "weeklyLeads",     type: "INTEGER DEFAULT 0" },
    { name: "weeklyLeadReset", type: "TEXT" },
    { name: "portfolioLinks",  type: "TEXT" },
  ],
};

try {
  const db = new Database(DB_PATH);

  db.exec(`
    CREATE TABLE IF NOT EXISTS "Template" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT,
      "name" TEXT NOT NULL,
      "niche" TEXT,
      "subject" TEXT NOT NULL,
      "body" TEXT NOT NULL,
      "isDefault" INTEGER DEFAULT 0,
      "createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS "Template_userId_idx" ON "Template"("userId");
    CREATE INDEX IF NOT EXISTS "Template_isDefault_idx" ON "Template"("isDefault");

    CREATE TABLE IF NOT EXISTS "ContactSubmission" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "resolved" INTEGER DEFAULT 0,
      "createdAt" TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS "ContactSubmission_resolved_idx" ON "ContactSubmission"("resolved");
  `);

  for (const [table, cols] of Object.entries(COLUMNS)) {
    const existing = db.pragma(`table_info(${table})`).map((r) => r.name);
    for (const col of cols) {
      if (!existing.includes(col.name)) {
        db.exec(`ALTER TABLE ${col.name === col.name ? table : table} ADD COLUMN "${col.name}" ${col.type}`);
        console.log(`✓ Added ${table}.${col.name}`);
      } else {
        console.log(`· Skipped ${table}.${col.name} (exists)`);
      }
    }
  }

  db.close();
  console.log("\n✅ DB sync complete.");
} catch (err) {
  console.error("❌ DB sync failed:", err.message);
  process.exit(1);
}
