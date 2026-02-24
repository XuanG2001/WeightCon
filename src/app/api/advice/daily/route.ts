import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { callTextModel } from "@/lib/ai";

// ─── GET /api/advice/daily ────────────────────────────────────────────────
// Query params: date (YYYY-MM-DD)

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

    try {
        const start = new Date(dateStr);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateStr);
        end.setHours(23, 59, 59, 999);

        const [meals, workouts, settings] = await Promise.all([
            db.meal.findMany({ where: { dateTime: { gte: start, lte: end }, deletedAt: null } }),
            db.workout.findMany({ where: { dateTime: { gte: start, lte: end }, deletedAt: null } }),
            db.settings.findUnique({ where: { id: 1 } }),
        ]);

        let totalCalIn = 0, totalProtein = 0, totalCalOut = 0;
        for (const m of meals) { totalCalIn += m.caloriesMid; totalProtein += m.proteinMid; }
        for (const w of workouts) { totalCalOut += w.calories; }

        const budget = settings?.targetCalories ?? 1500;
        const balance = budget - totalCalIn + (settings?.includeWorkoutInBudget ? totalCalOut : 0);

        const systemPrompt = `你是一个减脂助手，根据用户今日的饮食和运动数据，给出 1-2 句简洁、正向的中文建议。
不要说"你应该"，直接给出有针对性的、可执行的建议。字数控制在 60 字以内。`;

        const userPrompt = `今日数据：已摄入热量 ${Math.round(totalCalIn)} kcal，蛋白质 ${Math.round(totalProtein)} g，
运动消耗 ${Math.round(totalCalOut)} kcal，目标预算 ${Math.round(budget)} kcal，当前余额 ${Math.round(balance)} kcal。
请给出建议。`;

        const advice = await callTextModel(systemPrompt, userPrompt);

        return NextResponse.json({
            advice: advice.trim(),
            stats: { totalCalIn, totalProtein, totalCalOut, budget, balance },
        });
    } catch (err) {
        console.error("[/api/advice/daily]", err);
        return NextResponse.json({ error: "生成建议失败" }, { status: 500 });
    }
}
