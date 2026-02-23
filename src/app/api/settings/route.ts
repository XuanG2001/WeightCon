import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/** Mifflin-St Jeor BMR × activity multiplier → TDEE */
function calcTDEE(
    weightKg: number,
    heightCm: number,
    ageYears: number,
    gender: string,
    activityLevel: string
): number {
    const bmr =
        10 * weightKg + 6.25 * heightCm - 5 * ageYears + (gender === "male" ? 5 : -161);
    const multipliers: Record<string, number> = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
    };
    return Math.round(bmr * (multipliers[activityLevel] ?? 1.55));
}

export async function GET() {
    const settings = await db.settings.upsert({
        where: { id: 1 },
        create: {},
        update: {},
    });
    return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
    const body = await req.json();

    // Auto-calculate targetCalories from TDEE - deficit if body metrics are provided
    let { targetCalories } = body;
    if (!targetCalories && body.startWeightKg && body.heightCm && body.ageYears) {
        const tdee = calcTDEE(
            body.startWeightKg,
            body.heightCm,
            body.ageYears,
            body.gender ?? "prefer_not_to_say",
            body.activityLevel ?? "moderate"
        );
        const weeklyGoal = body.weeklyGoalKg ?? 0.5;
        const dailyDeficit = (weeklyGoal * 7700) / 7;
        targetCalories = Math.max(1200, Math.min(2500, tdee - Math.min(500, dailyDeficit)));
    }

    const settings = await db.settings.upsert({
        where: { id: 1 },
        create: { ...body, ...(targetCalories ? { targetCalories } : {}) },
        update: { ...body, ...(targetCalories ? { targetCalories } : {}) },
    });
    return NextResponse.json({ settings });
}
