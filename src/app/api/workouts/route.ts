import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { callTextModel } from "@/lib/ai";

// ─── Simple calorie estimator for exercise ────────────────────────────────

const MET: Record<string, number> = {
    run: 9.8,
    walk: 3.5,
    ride: 7.5,
    swim: 8.0,
    strength: 5.0,
    other: 5.0,
};

function estimateKcal(type: string, durationMin: number, intensity: string, weightKg: number): number {
    const met = MET[type] ?? 5.0;
    const intensityFactor = intensity === "low" ? 0.8 : intensity === "high" ? 1.2 : 1.0;
    return Math.round((met * intensityFactor * weightKg * durationMin) / 60);
}

// ─── GET /api/workouts?date=YYYY-MM-DD ────────────────────────────────────

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");

    let where = {};
    if (dateStr) {
        const start = new Date(dateStr);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateStr);
        end.setHours(23, 59, 59, 999);
        where = { dateTime: { gte: start, lte: end }, deletedAt: null };
    } else {
        where = { deletedAt: null };
    }

    const workouts = await db.workout.findMany({ where, orderBy: { dateTime: "desc" } });
    return NextResponse.json({ workouts });
}

// ─── POST /api/workouts ───────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            type = "other",
            durationMin,
            intensity = "medium",
            calories: manualKcal,
            source = "estimate",
            note = "",
            dateTime,
        } = body as {
            type?: string;
            durationMin?: number;
            intensity?: string;
            calories?: number;
            source?: string;
            note?: string;
            dateTime?: string;
        };

        let calories = manualKcal ?? 0;

        if (source === "estimate" && durationMin) {
            // Fetch current weight for estimation
            const settings = await db.settings.findUnique({ where: { id: 1 } });
            const latestWeight = await db.weightEntry.findFirst({
                where: { deletedAt: null },
                orderBy: { date: "desc" },
            });
            const weightKg = latestWeight?.weightKg ?? settings?.startWeightKg ?? 80;
            calories = estimateKcal(type, durationMin, intensity, weightKg);
        }

        const workout = await db.workout.create({
            data: {
                dateTime: dateTime ? new Date(dateTime) : new Date(),
                type,
                durationMin: durationMin ?? null,
                intensity: intensity ?? null,
                calories,
                source,
                note,
            },
        });

        return NextResponse.json({ workout }, { status: 201 });
    } catch (err) {
        console.error("[/api/workouts POST]", err);
        return NextResponse.json({ error: "保存运动记录失败" }, { status: 500 });
    }
}

// ─── PATCH /api/workouts (edit) ───────────────────────────────────────────

export async function PATCH(req: NextRequest) {
    try {
        const { id, ...data } = await req.json() as Record<string, unknown>;
        const workout = await db.workout.update({
            where: { id: id as number },
            data,
        });
        return NextResponse.json({ workout });
    } catch (err) {
        console.error("[/api/workouts PATCH]", err);
        return NextResponse.json({ error: "更新失败" }, { status: 500 });
    }
}

// ─── DELETE /api/workouts (soft delete) ───────────────────────────────────

export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json() as { id: number };
        const workout = await db.workout.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return NextResponse.json({ workout });
    } catch (err) {
        console.error("[/api/workouts DELETE]", err);
        return NextResponse.json({ error: "删除失败" }, { status: 500 });
    }
}
