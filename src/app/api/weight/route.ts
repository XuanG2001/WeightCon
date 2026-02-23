import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ─── GET /api/weight?month=YYYY-MM ────────────────────────────────────────

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month"); // e.g. "2026-02"

    let where = {};
    if (month) {
        const [year, mon] = month.split("-").map(Number);
        const start = new Date(year, mon - 1, 1);
        const end = new Date(year, mon, 0, 23, 59, 59);
        where = { date: { gte: start, lte: end }, deletedAt: null };
    } else {
        where = { deletedAt: null };
    }

    const entries = await db.weightEntry.findMany({
        where,
        orderBy: { date: "asc" },
    });

    return NextResponse.json({ entries });
}

// ─── POST /api/weight ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { weightKg, weightJin, date, isPeriod = false } = body as {
            weightKg?: number;
            weightJin?: number;
            date?: string;
            isPeriod?: boolean;
        };

        const kg = weightKg ?? (weightJin ? weightJin / 2 : undefined);
        if (kg === undefined || isNaN(kg)) {
            return NextResponse.json({ error: "请提供有效的体重数值" }, { status: 400 });
        }

        const entryDate = date ? new Date(date) : new Date();
        entryDate.setHours(0, 0, 0, 0);

        const entry = await db.weightEntry.upsert({
            where: { date: entryDate },
            update: { weightKg: kg, weightJinRaw: weightJin ?? null, isPeriod, deletedAt: null },
            create: {
                date: entryDate,
                weightKg: kg,
                weightJinRaw: weightJin ?? null,
                isPeriod,
            },
        });

        return NextResponse.json({ entry }, { status: 201 });
    } catch (err) {
        console.error("[/api/weight POST]", err);
        return NextResponse.json({ error: "保存失败" }, { status: 500 });
    }
}

// ─── DELETE /api/weight ───────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json() as { id: number };
        const entry = await db.weightEntry.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return NextResponse.json({ entry });
    } catch (err) {
        console.error("[/api/weight DELETE]", err);
        return NextResponse.json({ error: "删除失败" }, { status: 500 });
    }
}
