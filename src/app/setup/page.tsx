"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    ChevronRight,
    ChevronLeft,
    User,
    Target,
    Dumbbell,
    CheckCircle,
    Loader2,
} from "lucide-react";

// ─── Step types ────────────────────────────────────────────────────────────

interface FormData {
    // Step 1 – Body info
    currentWeightKg: string;
    heightCm: string;
    ageYears: string;
    gender: string;
    unitPreference: string;
    // Step 2 – Goal
    targetWeightKg: string;
    weeklyGoalKg: string;
    targetDate: string;
    // Step 3 – Activity
    activityLevel: string;
}

const INITIAL: FormData = {
    currentWeightKg: "",
    heightCm: "",
    ageYears: "",
    gender: "prefer_not_to_say",
    unitPreference: "kg",
    targetWeightKg: "",
    weeklyGoalKg: "0.5",
    targetDate: "",
    activityLevel: "moderate",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const genderOptions = [
    { value: "male", label: "男" },
    { value: "female", label: "女" },
    { value: "prefer_not_to_say", label: "不想说" },
];

const activityOptions = [
    { value: "sedentary", label: "久坐", sub: "几乎不运动" },
    { value: "light", label: "轻度", sub: "每周 1-3 天轻运动" },
    { value: "moderate", label: "中度", sub: "每周 3-5 天运动" },
    { value: "active", label: "积极", sub: "每周 6-7 天高强度" },
    { value: "very_active", label: "高强度", sub: "体力劳动或双次训练" },
];

const weeklyGoalOptions = [
    { value: "0.25", label: "0.25 kg", sub: "舒缓，适合轻松维持" },
    { value: "0.5", label: "0.5 kg", sub: "推荐，稳健可持续" },
    { value: "0.75", label: "0.75 kg", sub: "加速，需较高自律" },
    { value: "1.0", label: "1.0 kg", sub: "激进，需医生评估" },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function SetupPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<FormData>(INITIAL);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const set = (key: keyof FormData, value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    /** date string YYYY-MM-DD → weeks from today */
    const weeksFromDate = (dateStr: string) => {
        const msPerWeek = 7 * 24 * 60 * 60 * 1000;
        return (new Date(dateStr).getTime() - Date.now()) / msPerWeek;
    };

    /** weeks from today → date string YYYY-MM-DD */
    const dateFromWeeks = (weeks: number) => {
        const d = new Date();
        d.setDate(d.getDate() + Math.round(weeks * 7));
        return d.toISOString().split("T")[0];
    };

    /** Called when user picks a weekly rate → auto-set target date */
    const handleRatePick = (rate: string) => {
        const delta =
            parseFloat(form.currentWeightKg || "0") - parseFloat(form.targetWeightKg || "0");
        const rateNum = parseFloat(rate);
        if (delta > 0 && rateNum > 0) {
            setForm((prev) => ({
                ...prev,
                weeklyGoalKg: rate,
                targetDate: dateFromWeeks(delta / rateNum),
            }));
        } else {
            set("weeklyGoalKg", rate);
        }
    };

    /** Called when user picks a target date → auto-calc required rate */
    const handleDatePick = (dateStr: string) => {
        const delta =
            parseFloat(form.currentWeightKg || "0") - parseFloat(form.targetWeightKg || "0");
        const weeks = weeksFromDate(dateStr);
        if (delta > 0 && weeks > 0) {
            const requiredRate = delta / weeks;
            setForm((prev) => ({
                ...prev,
                targetDate: dateStr,
                weeklyGoalKg: requiredRate.toFixed(2),
            }));
        } else {
            set("targetDate", dateStr);
        }
    };

    const steps = [
        {
            title: "基本身体信息",
            icon: User,
            description: "用于精准计算你的基础代谢率（BMR）",
        },
        {
            title: "目标设定",
            icon: Target,
            description: "设定目标体重和完成时间，两者可互相推算",
        },
        {
            title: "活动水平",
            icon: Dumbbell,
            description: "日常活动量决定你的总热量消耗（TDEE）",
        },
    ];


    const handleFinish = async () => {
        setSubmitting(true);
        setError("");
        try {
            const res = await fetch("/api/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    isSetup: true,
                    currentWeightKg: parseFloat(form.currentWeightKg),
                    startWeightKg: parseFloat(form.currentWeightKg),
                    heightCm: parseFloat(form.heightCm),
                    ageYears: parseInt(form.ageYears, 10),
                    gender: form.gender,
                    unitPreference: form.unitPreference,
                    targetWeightKg: parseFloat(form.targetWeightKg),
                    weeklyGoalKg: parseFloat(form.weeklyGoalKg),
                    targetDate: form.targetDate ? new Date(form.targetDate).toISOString() : undefined,
                    activityLevel: form.activityLevel,
                }),
            });
            if (!res.ok) throw new Error("保存失败");
            router.push("/");
            router.refresh();
        } catch (e) {
            setError("保存失败，请重试");
            setSubmitting(false);
        }
    };

    const canNext = [
        form.currentWeightKg && form.heightCm && form.ageYears,
        form.targetWeightKg,
        true,
    ][step];

    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm">
                {/* Logo + Headline */}
                <div className="text-center mb-8">
                    <div className="text-4xl mb-2">🌿</div>
                    <h1 className="text-2xl font-bold text-foreground">欢迎使用 WeightCon</h1>
                    <p className="text-sm text-muted-foreground mt-1">只需 3 步，开启你的减脂计划</p>
                </div>

                {/* Progress dots */}
                <div className="flex justify-center gap-2 mb-8">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-primary" : i < step ? "w-2 bg-primary/40" : "w-2 bg-border"
                                }`}
                        />
                    ))}
                </div>

                {/* Card */}
                <div className="bg-card border rounded-3xl p-6 shadow-sm">
                    {/* Step header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                            {(() => {
                                const Icon = steps[step].icon;
                                return <Icon className="w-5 h-5 text-primary" />;
                            })()}
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">第 {step + 1} / 3 步</p>
                            <h2 className="text-base font-bold">{steps[step].title}</h2>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-5">{steps[step].description}</p>

                    {/* ── Step 0: Body Info ── */}
                    {step === 0 && (
                        <div className="space-y-4">
                            {/* Unit toggle */}
                            <div className="flex gap-2">
                                {["kg", "jin"].map((u) => (
                                    <button
                                        key={u}
                                        onClick={() => set("unitPreference", u)}
                                        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${form.unitPreference === u
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-accent/40 text-muted-foreground hover:bg-accent"
                                            }`}
                                    >
                                        {u === "kg" ? "公斤 (kg)" : "斤"}
                                    </button>
                                ))}
                            </div>

                            <NumberField
                                label={`当前体重（${form.unitPreference}）`}
                                value={form.currentWeightKg}
                                onChange={(v) => set("currentWeightKg", v)}
                                placeholder={form.unitPreference === "kg" ? "如：70" : "如：140"}
                                step="0.1"
                            />
                            <NumberField
                                label="身高（cm）"
                                value={form.heightCm}
                                onChange={(v) => set("heightCm", v)}
                                placeholder="如：168"
                            />
                            <NumberField
                                label="年龄"
                                value={form.ageYears}
                                onChange={(v) => set("ageYears", v)}
                                placeholder="如：25"
                                step="1"
                            />

                            {/* Gender */}
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                                    性别
                                </label>
                                <div className="flex gap-2">
                                    {genderOptions.map((g) => (
                                        <button
                                            key={g.value}
                                            onClick={() => set("gender", g.value)}
                                            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${form.gender === g.value
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-accent/40 text-muted-foreground hover:bg-accent"
                                                }`}
                                        >
                                            {g.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Step 1: Goal ── */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <NumberField
                                label={`目标体重（${form.unitPreference}）`}
                                value={form.targetWeightKg}
                                onChange={(v) => set("targetWeightKg", v)}
                                placeholder={form.unitPreference === "kg" ? "如：60" : "如：120"}
                                step="0.1"
                            />

                            {/* ── Date picker: pick date → compute rate ── */}
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                                    希望完成时间（选日期 → 自动算每周速率）
                                </label>
                                <input
                                    type="date"
                                    value={form.targetDate}
                                    min={new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]}
                                    onChange={(e) => handleDatePick(e.target.value)}
                                    className="w-full bg-accent/30 rounded-2xl px-4 py-3 text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                />
                            </div>

                            {/* ── Computed rate display ── */}
                            {form.targetDate && form.targetWeightKg && form.currentWeightKg && (
                                <div className="bg-primary/8 rounded-2xl px-4 py-3 text-sm flex items-center justify-between">
                                    <span className="text-muted-foreground">需要每周减少</span>
                                    <span className="font-bold text-primary text-base">
                                        {parseFloat(form.weeklyGoalKg) > 1.0
                                            ? <span className="text-orange-500">⚠️ {parseFloat(form.weeklyGoalKg).toFixed(2)} kg（偏激）</span>
                                            : `${parseFloat(form.weeklyGoalKg).toFixed(2)} kg`}
                                    </span>
                                </div>
                            )}

                            {/* ── Rate presets: pick rate → compute date ── */}
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                                    或者按标准速度选择（自动算完成日期）
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {weeklyGoalOptions.map((o) => (
                                        <button
                                            key={o.value}
                                            onClick={() => handleRatePick(o.value)}
                                            className={`p-3 rounded-2xl text-left transition-all active:scale-95 ${form.weeklyGoalKg === o.value
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-accent/40 hover:bg-accent"
                                                }`}
                                        >
                                            <div className="text-sm font-semibold">{o.label}</div>
                                            <div
                                                className={`text-[10px] mt-0.5 ${form.weeklyGoalKg === o.value
                                                        ? "text-primary-foreground/70"
                                                        : "text-muted-foreground"
                                                    }`}
                                            >
                                                {o.sub}
                                            </div>
                                            {form.targetDate && form.targetWeightKg && form.weeklyGoalKg === o.value && (
                                                <div className={`text-[10px] mt-1 font-medium ${form.weeklyGoalKg === o.value ? "text-primary-foreground" : "text-primary"}`}>
                                                    约 {new Date(form.targetDate).toLocaleDateString("zh-CN", { year: "numeric", month: "long" })}完成
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Activity ── */}
                    {step === 2 && (
                        <div className="space-y-2">
                            {activityOptions.map((a) => (
                                <button
                                    key={a.value}
                                    onClick={() => set("activityLevel", a.value)}
                                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all text-left ${form.activityLevel === a.value
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-accent/40 hover:bg-accent"
                                        }`}
                                >
                                    <div>
                                        <div className="text-sm font-semibold">{a.label}</div>
                                        <div
                                            className={`text-xs ${form.activityLevel === a.value ? "text-primary-foreground/70" : "text-muted-foreground"
                                                }`}
                                        >
                                            {a.sub}
                                        </div>
                                    </div>
                                    {form.activityLevel === a.value && (
                                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <p className="mt-4 text-sm text-destructive text-center">{error}</p>
                    )}
                </div>

                {/* Nav buttons */}
                <div className="flex gap-3 mt-6">
                    {step > 0 && (
                        <Button
                            variant="outline"
                            className="flex-1 rounded-2xl h-12"
                            onClick={() => setStep((s) => s - 1)}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            上一步
                        </Button>
                    )}

                    {step < 2 ? (
                        <Button
                            className="flex-1 rounded-2xl h-12 shadow-md shadow-primary/20"
                            disabled={!canNext}
                            onClick={() => setStep((s) => s + 1)}
                        >
                            下一步
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    ) : (
                        <Button
                            className="flex-1 rounded-2xl h-12 shadow-md shadow-primary/20"
                            onClick={handleFinish}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    保存中...
                                </>
                            ) : (
                                <>
                                    开始使用 🌿
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </main>
    );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function NumberField({
    label,
    value,
    onChange,
    placeholder,
    step = "0.1",
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    step?: string;
}) {
    return (
        <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
            <input
                type="number"
                inputMode="decimal"
                value={value}
                step={step}
                min={0}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-accent/30 rounded-2xl px-4 py-3 text-foreground text-base placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
        </div>
    );
}
