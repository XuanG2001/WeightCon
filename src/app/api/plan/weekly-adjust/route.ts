import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { callTextModel, parseJsonFromLLM } from "@/lib/ai";

// ─── POST /api/plan/weekly-adjust ─────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const settings = await db.settings.findUnique({ where: { id: 1 } });
        if (!settings) {
            return NextResponse.json({ error: "设置未初始化" }, { status: 400 });
        }

        // Gather last 14 days of data
        const since = new Date();
        since.setDate(since.getDate() - 14);
        since.setHours(0, 0, 0, 0);

        const [weightEntries, meals, workouts] = await Promise.all([
            db.weightEntry.findMany({
                where: { date: { gte: since }, deletedAt: null, isPeriod: false },
                orderBy: { date: "asc" },
            }),
            db.meal.findMany({
                where: { dateTime: { gte: since }, deletedAt: null },
                orderBy: { dateTime: "asc" },
            }),
            db.workout.findMany({
                where: { dateTime: { gte: since }, deletedAt: null },
                orderBy: { dateTime: "asc" },
            }),
        ]);

        if (weightEntries.length < 2) {
            return NextResponse.json({ message: "体重数据不足，暂不校准" }, { status: 200 });
        }

        // Calculate actual weight change (non-period days only)
        const firstWeight = weightEntries[0].weightKg;
        const lastWeight = weightEntries[weightEntries.length - 1].weightKg;
        const actualWeightChangeDays =
            (weightEntries[weightEntries.length - 1].date.getTime() -
                weightEntries[0].date.getTime()) /
            (1000 * 60 * 60 * 24);
        const actualWeeklyChange = actualWeightChangeDays > 0
            ? (lastWeight - firstWeight) * 7 / actualWeightChangeDays
            : 0;

        // Estimate average daily net intake
        const totalCalIn = meals.reduce((s, m) => s + m.caloriesMid, 0);
        const totalCalOut = workouts.reduce((s, w) => s + w.calories, 0);
        const days = Math.max(1, actualWeightChangeDays);
        const avgDailyNetIntake = (totalCalIn - totalCalOut) / days;
        const avgDailyDeficit = settings.targetCalories - avgDailyNetIntake;

        // Target rate is -(weeklyGoalKg) per week (negative = weight loss)
        const targetWeeklyChange = -(settings.weeklyGoalKg ?? 0.8);
        const actualWeeklyChangeKg = actualWeeklyChange;

        // Check if actual loss rate is far from target
        const deviation = targetWeeklyChange !== 0
            ? actualWeeklyChangeKg / targetWeeklyChange
            : 1;

        let adjustmentKcal = 0;
        if (deviation < 0.7) {
            // Too slow – reduce calories by 100-200
            adjustmentKcal = -Math.min(200, Math.round((0.7 - deviation) * 500));
        } else if (deviation > 1.3) {
            // Too fast – increase calories by 100-200
            adjustmentKcal = Math.min(200, Math.round((deviation - 1.3) * 500));
        }

        // Hard cap ±200
        adjustmentKcal = Math.max(-200, Math.min(200, adjustmentKcal));

        const systemPrompt = `你是一名减脂管理AI，擅长用温暖、鼓励的语气向用户解释每周热量目标的微调原因，
控制在 60 字以内，不要机械重复数字，体现科学性的同时保持亲切感。`;

        const userPrompt = `近14天实际体重变化约 ${actualWeeklyChangeKg.toFixed(2)} kg/周，目标是 ${targetWeeklyChange} kg/周。
本周目标热量调整：${adjustmentKcal > 0 ? "+" : ""}${adjustmentKcal} kcal/天。
请用1-2句话解释这次调整的原因。`;

        const reasoning = await callTextModel(systemPrompt, userPrompt);

        // Apply adjustment to settings
        const newTarget = Math.round(settings.targetCalories + adjustmentKcal);
        await db.settings.update({
            where: { id: 1 },
            data: { targetCalories: newTarget },
        });

        return NextResponse.json({
            adjustmentKcal,
            newTargetCalories: newTarget,
            reasoning: reasoning.trim(),
            stats: {
                actualWeeklyChangeKg: actualWeeklyChangeKg.toFixed(2),
                targetWeeklyChangeKg: targetWeeklyChange,
                avgDailyDeficit: Math.round(avgDailyDeficit),
                deviation: deviation.toFixed(2),
            },
        });
    } catch (err) {
        console.error("[/api/plan/weekly-adjust]", err);
        return NextResponse.json({ error: "校准失败" }, { status: 500 });
    }
}
