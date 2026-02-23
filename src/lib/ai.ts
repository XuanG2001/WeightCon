import OpenAI from "openai";

if (!process.env.SILICONFLOW_API_KEY) {
    console.warn(
        "[ai.ts] SILICONFLOW_API_KEY is not set. AI calls will fail. Please add it to .env.local"
    );
}

const client = new OpenAI({
    apiKey: process.env.SILICONFLOW_API_KEY ?? "sk-placeholder",
    baseURL: process.env.SILICONFLOW_BASE_URL ?? "https://api.siliconflow.cn/v1",
});

/** Vision model for meal photo understanding */
const VISION_MODEL = "Pro/moonshotai/Kimi-K2.5";

/** Text model for advice, summary, calibration */
const TEXT_MODEL = "Pro/deepseek-ai/DeepSeek-V3.2";

/**
 * Call the vision model with optional images and a text prompt.
 * Returns the raw assistant message string.
 */
export async function callVisionModel(
    textPrompt: string,
    imageBase64List: string[] = []
): Promise<string> {
    const imageContent = imageBase64List.map((b64) => ({
        type: "image_url" as const,
        image_url: {
            // SiliconFlow supports base64 images via data URIs
            url: b64.startsWith("data:") ? b64 : `data:image/jpeg;base64,${b64}`,
        },
    }));

    const userContent =
        imageContent.length > 0
            ? [...imageContent, { type: "text" as const, text: textPrompt }]
            : [{ type: "text" as const, text: textPrompt }];

    const response = await client.chat.completions.create({
        model: VISION_MODEL,
        messages: [
            {
                role: "system",
                content:
                    "你是一个专业的营养师和食物热量分析专家。请严格按照系统要求的 JSON 格式输出，不要额外输出任何解释文字。",
            },
            {
                role: "user",
                content: userContent,
            },
        ],
        max_tokens: 1024,
    });

    return response.choices[0]?.message?.content ?? "";
}

/**
 * Call the text model with a prompt.
 * Returns the raw assistant message string.
 */
export async function callTextModel(
    systemPrompt: string,
    userPrompt: string
): Promise<string> {
    const response = await client.chat.completions.create({
        model: TEXT_MODEL,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        max_tokens: 512,
    });

    return response.choices[0]?.message?.content ?? "";
}

/**
 * Safely parse a JSON string from an LLM response.
 * Strips markdown code fences and GLM-4.6V reasoning box tags.
 */
export function parseJsonFromLLM<T>(raw: string): T {
    const cleaned = raw
        // Strip GLM-4.6V <|begin_of_box|>...<|end_of_box|> wrapper
        .replace(/<\|begin_of_box\|>/gi, "")
        .replace(/<\|end_of_box\|>/gi, "")
        // Strip markdown code fences
        .replace(/^```(?:json)?[\r\n]*/i, "")
        .replace(/```[\r\n]*$/i, "")
        // Strip any other <|...|> special tokens
        .replace(/<\|[^|]*\|>/g, "")
        .trim();
    return JSON.parse(cleaned) as T;
}

