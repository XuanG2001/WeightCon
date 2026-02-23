/**
 * Apply all Prisma migrations to Turso by executing the SQL files directly.
 * Run with: node scripts/migrate-turso.mjs
 */
import { createClient } from "@libsql/client";
import { readFileSync, readdirSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
    console.error("❌  TURSO_DATABASE_URL is not set");
    process.exit(1);
}

const client = createClient({ url, authToken });

const migrationsDir = resolve(__dirname, "../prisma/migrations");
const migrationFolders = readdirSync(migrationsDir)
    .filter((f) => !f.includes("."))
    .sort();

console.log(`Found ${migrationFolders.length} migrations to apply`);

for (const folder of migrationFolders) {
    const sqlPath = join(migrationsDir, folder, "migration.sql");
    const sql = readFileSync(sqlPath, "utf-8");
    const statements = sql
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);

    console.log(`\n▶ Applying: ${folder}`);
    for (const stmt of statements) {
        try {
            await client.execute(stmt + ";");
        } catch (err) {
            // Ignore "already exists" errors so we can re-run safely
            if (
                err.message?.includes("already exists") ||
                err.message?.includes("duplicate column")
            ) {
                console.log(`  ⚠️  Skipped (already applied): ${stmt.slice(0, 60)}...`);
            } else {
                throw err;
            }
        }
    }
    console.log(`  ✓ Done`);
}

console.log("\n✅ All migrations applied to Turso successfully!");
