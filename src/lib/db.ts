import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient() {
    let adapter: PrismaLibSql;

    if (process.env.TURSO_DATABASE_URL) {
        // Production: use Turso cloud database
        adapter = new PrismaLibSql({
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN,
        });
    } else {
        // Development: use local SQLite file
        const dbPath = path.resolve(process.cwd(), "dev.db");
        adapter = new PrismaLibSql({ url: `file:${dbPath}` });
    }

    return new PrismaClient({
        adapter,
        log:
            process.env.NODE_ENV === "development"
                ? ["error", "warn"]
                : ["error"],
    });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = db;
}
