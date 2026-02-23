import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { callTextModel, parseJsonFromLLM } from "@/lib/ai";

// ─── PATCH /api/meals/revise ───────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { mealId, portionAdjust, oilAdjust } = body as {
            mealId: number;
            portionAdjust?: "small" | "normal" | "large";
            oilAdjust?: "light" | "normal" | "oily" | "unknown";
        };

        const original = await db.meal.findUnique({ where: { id: mealId } });
        if (!original) {
            return NextResponse.json({ error: "餐食记录不存在" }, { status: 404 });
        }

        const portionDesc =
            portionAdjust === "small" ? "比正常份量偏少约20-30%"
                : portionAdjust === "large" ? "比正常份量偏多约20-30%"
                    : "份量正常";

        const oilDesc =
            oilAdjust === "light" ? "清淡少油"
                : oilAdjust === "oily" ? "重油"
                    : "用油正常";

        const systemPrompt = `你是专业营养师，请根据用户的纠偏信息修正餐食的热量估算区间和营养素区间。
输出格式（纯 JSON，不要有其他文字）：
{
  "total_calories_range": [最低, 最高],
  "total_protein_range": [最低g, 最高g],
  "confidence": "high|medium|low",
  "notes": ["修正说明"]
}`;

        const userPrompt = `原始餐食：${original.aiSummary}
原始热量区间：${original.caloriesMin}-${original.caloriesMax} kcal
用户纠偏：${portionDesc}；${oilDesc}
请调整热量和蛋白质估算区间。`;

        const raw = await callTextModel(systemPrompt, userPrompt);

        let revised: {
            total_calories_range: [number, number];
            total_protein_range?: [number, number];
            confidence: "high" | "medium" | "low";
            notes: string[];
        };

        try {
            revised = parseJsonFromLLM(raw);
        } catch {
            return NextResponse.json(
                { error: "AI纠偏格式解析失败", raw },
                { status: 502 }
            );
        }

        const calMin = revised.total_calories_range[0];
        const calMax = revised.total_calories_range[1];
        const calMid = Math.round((calMin + calMax) / 2);

        const protMin = revised.total_protein_range?.[0] ?? original.proteinMin;
        const protMax = revised.total_protein_range?.[1] ?? original.proteinMax;
        const protMid = Math.round((protMin + protMax) / 2);

        const updated = await db.meal.update({
            where: { id: mealId },
            data: {
                caloriesMin: calMin,
                caloriesMax: calMax,
                caloriesMid: calMid,
                proteinMin: protMin,
                proteinMax: protMax,
                proteinMid: protMid,
                portionAdjust: portionAdjust ?? original.portionAdjust,
                oilAdjust: oilAdjust ?? original.oilAdjust,
                confidence: revised.confidence,
                notes: JSON.stringify(revised.notes ?? []),
            },
        });

        return NextResponse.json({ meal: updated, revised });
    } catch (err) {
        console.error("[/api/meals/revise]", err);
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
    }
}
