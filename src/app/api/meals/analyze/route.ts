import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { callVisionModel, callTextModel, parseJsonFromLLM } from "@/lib/ai";

// ─── Prompt Templates ──────────────────────────────────────────────────────

const VISION_SYSTEM_PROMPT = `你是一名专业的中国注册营养师，擅长精准识别中餐的食材和分量，并估算热量与三大宏量营养素。
请分析提供的餐食照片（若有）和文字描述，严格使用如下 JSON 结构输出，不要输出任何额外说明，不要使用 markdown 代码块：
{
  "summary": "食物简短摘要（字符串）",
  "items": [
    {
      "name": "食物名称",
      "calories_range": [最低kcal整数, 最高kcal整数],
      "protein_range": [最低g整数, 最高g整数],
      "carbs_range": [最低g整数, 最高g整数],
      "fat_range": [最低g整数, 最高g整数],
      "oiliness": "light 或 medium 或 heavy"
    }
  ],
  "total_calories_range": [总最低kcal整数, 总最高kcal整数],
  "total_protein_range": [总最低g整数, 总最高g整数],
  "total_carbs_range": [总最低g整数, 总最高g整数],
  "total_fat_range": [总最低g整数, 总最高g整数],
  "confidence": "high 或 medium 或 low",
  "notes": ["说明文字"]
}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LooseResult = Record<string, any>;

/** 
 * Normalize the (potentially inconsistently-keyed) LLM response into a 
 * standardized shape we can safely read from. 
 * GLM-4.6V sometimes ignores the English key schema and uses Chinese keys.
 */
function normalizeResult(raw: LooseResult) {
    // ── Helper: extract a numeric range from various possible formats ──
    const toRange = (
        val: unknown,
        fallback: [number, number] = [0, 0]
    ): [number, number] => {
        if (Array.isArray(val) && val.length >= 2) {
            return [Number(val[0]) || 0, Number(val[1]) || 0];
        }
        if (typeof val === "string") {
            // e.g. "500 - 600" or "500~600"
            const nums = val.match(/\d+/g);
            if (nums && nums.length >= 2) return [Number(nums[0]), Number(nums[1])];
            if (nums && nums.length === 1) return [Number(nums[0]), Number(nums[0])];
        }
        if (typeof val === "number") return [val, val];
        return fallback;
    };

    // ── Calories ──
    const calRange = toRange(
        raw.total_calories_range ??
        raw["热量区间（kcal）"] ??
        raw["总热量"] ??
        raw.calories_range ??
        raw.total_calories
    );

    // ── Protein ──
    const macros = raw["三大宏量营养素（g）"] ?? raw.macros ?? {};
    const protRange = toRange(
        raw.total_protein_range ??
        macros["蛋白质"] ??
        macros.protein ??
        raw["蛋白质"]
    );
    const carbRange = toRange(
        raw.total_carbs_range ??
        macros["碳水化合物"] ??
        macros.carbs ??
        raw["碳水化合物"]
    );
    const fatRange = toRange(
        raw.total_fat_range ??
        macros["脂肪"] ??
        macros.fat ??
        raw["脂肪"]
    );

    // ── Summary ──
    const summary: string =
        raw.summary ??
        raw["食物识别"] ??
        raw["餐食识别"] ??
        "AI 识别结果";

    // ── Confidence ──
    const confRaw: string =
        raw.confidence ??
        raw["置信度"] ??
        "medium";
    const confidence = confRaw.includes("高") || confRaw === "high"
        ? "high"
        : confRaw.includes("低") || confRaw === "low"
            ? "low"
            : "medium";

    // ── Notes ──
    const notes: string[] = Array.isArray(raw.notes)
        ? raw.notes
        : typeof raw.notes === "string"
            ? [raw.notes]
            : [];

    // ── Items ──
    const items = Array.isArray(raw.items)
        ? raw.items
        : [];

    return {
        summary,
        items,
        total_calories_range: calRange,
        total_protein_range: protRange,
        total_carbs_range: carbRange,
        total_fat_range: fatRange,
        confidence: confidence as "high" | "medium" | "low",
        notes,
    };
}

// ─── POST /api/meals/analyze ───────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            images = [],
            userText = "",
            mealType = "snack",
            dateTime,
        } = body as {
            images?: string[];
            userText?: string;
            mealType?: string;
            dateTime?: string;
        };

        const prompt = `用户描述：${userText || "（无文字描述，请仅根据照片分析）"}
餐别：${mealType}
请识别图中所有食物，估算热量区间（kcal）和三大宏量营养素（g），以及置信度。严格按照要求的 JSON 格式输出。`;

        let raw: string;
        if (images.length > 0) {
            raw = await callVisionModel(prompt, images);
        } else {
            raw = await callTextModel(VISION_SYSTEM_PROMPT, prompt);
        }

        let parsedRaw: LooseResult;
        try {
            parsedRaw = parseJsonFromLLM<LooseResult>(raw);
        } catch {
            return NextResponse.json(
                { error: "AI返回格式解析失败，请重试", raw },
                { status: 502 }
            );
        }

        const result = normalizeResult(parsedRaw);

        const [calMin, calMax] = result.total_calories_range;
        const calMid = Math.round((calMin + calMax) / 2);
        const [protMin, protMax] = result.total_protein_range;
        const protMid = Math.round((protMin + protMax) / 2);
        const [carbMin, carbMax] = result.total_carbs_range;
        const carbMid = Math.round((carbMin + carbMax) / 2);
        const [fatMin, fatMax] = result.total_fat_range;
        const fatMid = Math.round((fatMin + fatMax) / 2);

        const meal = await db.meal.create({
            data: {
                dateTime: dateTime ? new Date(dateTime) : new Date(),
                mealType,
                descriptionText: userText,
                photoPaths: JSON.stringify(images.map(() => "")),
                aiSummary: result.summary,
                caloriesMin: calMin,
                caloriesMax: calMax,
                caloriesMid: calMid,
                proteinMin: protMin,
                proteinMax: protMax,
                proteinMid: protMid,
                carbsMin: carbMin,
                carbsMax: carbMax,
                carbsMid: carbMid,
                fatMin: fatMin,
                fatMax: fatMax,
                fatMid: fatMid,
                confidence: result.confidence ?? "medium",
                notes: JSON.stringify(result.notes ?? []),
            },
        });

        return NextResponse.json({ meal, analysis: result }, { status: 201 });
    } catch (err) {
        console.error("[/api/meals/analyze]", err);
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
    }
}
