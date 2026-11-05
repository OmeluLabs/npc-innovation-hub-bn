// src/config/ensureSchema.ts
//
// Additive, idempotent schema upgrades applied automatically at server start.
//
// Why this exists: startup uses sequelize.sync({ force: false }), which only
// creates tables that are missing - it never adds a new column to a table that
// already exists. On a hosted database that nobody runs one-off scripts
// against, columns added to a model after the table was first created would
// otherwise never appear, and every query touching them would fail.
//
// Every statement is ADD COLUMN IF NOT EXISTS: safe to run on every boot, a
// no-op once applied, and never drops, renames or rewrites existing data.
import sequelize from './database';

export const SCHEMA_UPGRADES: string[] = [
  // Member leadership tier (Co-Founder / Leader / Member), shown on the
  // public Members page and set by an admin.
  `ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "leadershipTier" VARCHAR(255) NOT NULL DEFAULT 'Member'`,
  `ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "leadershipTitle" VARCHAR(80)`,
  `ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER NOT NULL DEFAULT 0`,
  // Project tech stack tags and status, shown and filtered on the public
  // Projects page.
  `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "techStack" VARCHAR(255)[] NOT NULL DEFAULT ARRAY[]::VARCHAR(255)[]`,
  `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "status" VARCHAR(255) NOT NULL DEFAULT 'In Progress'`,
];

export async function ensureSchema(): Promise<void> {
  for (const statement of SCHEMA_UPGRADES) {
    await sequelize.query(statement);
  }
  console.log(`Schema upgrades verified (${SCHEMA_UPGRADES.length} statements).`);
}
