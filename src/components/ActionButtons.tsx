"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Flame, X, Loader2, Camera, ImagePlus } from "lucide-react";

interface PreviewImage {
    dataUrl: string; // full data URL shown in <img>
    base64: string;  // pure base64 string sent to API
}

function fileToBase64(file: File): Promise<PreviewImage> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result as string;
            // strip the "data:image/xxx;base64," prefix before sending to backend
            const base64 = dataUrl.split(",")[1];
            resolve({ dataUrl, base64 });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function ActionButtons() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [text, setText] = useState("");
    const [images, setImages] = useState<PreviewImage[]>([]);
    const [mealType, setMealType] = useState<string>("lunch");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        // Limit to 3 images
        const toProcess = files.slice(0, 3 - images.length);
        const results = await Promise.all(toProcess.map(fileToBase64));
        setImages((prev) => [...prev, ...results].slice(0, 3));
        // Reset input so the same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeImage = (idx: number) => {
        setImages((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setText("");
        setImages([]);
        setMessage(null);
    };

    const handleSubmit = async () => {
        if (!text.trim() && images.length === 0) return;
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch("/api/meals/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userText: text,
                    mealType,
                    images: images.map((img) => img.base64),
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setMessage({ type: "error", text: "分析失败：" + (data.error || "未知后端错误") });
            } else {
                setMessage({
                    type: "success",
                    text: `✅ 记录成功！\n识别为：${data.meal.aiSummary}\n热量估算：${data.meal.caloriesMid} kcal`,
                });
                setTimeout(() => handleClose(), 3000);
            }
        } catch {
            setMessage({ type: "error", text: "网络错误，无法连接后端接口" });
        } finally {
            setLoading(false);
        }
    };

    const mealTypes = [
        { value: "breakfast", label: "早餐" },
        { value: "lunch", label: "午餐" },
        { value: "dinner", label: "晚餐" },
        { value: "snack", label: "零食" },
    ];

    const canSubmit = (text.trim().length > 0 || images.length > 0) && !loading;

    return (
        <>
            {/* 入口按钮 */}
            <section className="mt-8 grid grid-cols-2 gap-4">
                <Button
                    className="h-14 rounded-2xl text-base shadow-sm font-medium"
                    variant="default"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus className="w-5 h-5 mr-2" />
                    记录餐食
                </Button>
                <Button
                    className="h-14 rounded-2xl text-base shadow-sm font-medium bg-card text-foreground hover:bg-accent border"
                    variant="outline"
                >
                    <Flame className="w-5 h-5 mr-2 text-orange-500" />
                    记录运动
                </Button>
            </section>

            {/* 隐藏的 input[file] */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
            />

            {/* 餐食记录弹窗 */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={(e) => e.target === e.currentTarget && handleClose()}
                >
                    <div className="bg-background w-full max-w-sm rounded-t-[2.5rem] sm:rounded-[2rem] p-6 shadow-2xl relative border animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-250">
                        {/* 拖拽指示条 */}
                        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4 sm:hidden" />

                        {/* 关闭按钮 */}
                        <button
                            onClick={handleClose}
                            className="absolute right-5 top-5 p-2 bg-accent/50 text-muted-foreground hover:text-foreground rounded-full active:scale-90 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <h3 className="text-lg font-bold mb-4">记录餐食</h3>

                        {/* 餐别选择 */}
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                            {mealTypes.map((t) => (
                                <button
                                    key={t.value}
                                    onClick={() => setMealType(t.value)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all active:scale-95 ${mealType === t.value
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "bg-accent/40 text-muted-foreground hover:bg-accent"
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* 照片预览区 */}
                        {images.length > 0 && (
                            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative flex-shrink-0">
                                        <img
                                            src={img.dataUrl}
                                            alt={`餐食照片 ${idx + 1}`}
                                            className="w-20 h-20 object-cover rounded-2xl border-2 border-primary/20"
                                        />
                                        <button
                                            onClick={() => removeImage(idx)}
                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-all"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 文字输入 */}
                        <textarea
                            className="w-full bg-accent/30 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-24"
                            placeholder={images.length > 0 ? "可以补充描述（可选）..." : "例如：一碗米饭、一份番茄炒蛋..."}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />

                        {/* 上传照片按钮 */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={images.length >= 3}
                            className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-primary/30 text-primary/60 text-sm font-medium hover:border-primary/60 hover:text-primary hover:bg-primary/5 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ImagePlus className="w-4 h-4" />
                            {images.length === 0
                                ? "添加照片（GLM-4.6V 视觉识别）"
                                : images.length < 3
                                    ? `再添加一张（${images.length}/3）`
                                    : "最多 3 张"}
                        </button>

                        {/* 结果消息 */}
                        {message && (
                            <div
                                className={`mt-3 p-3 rounded-xl text-sm whitespace-pre-wrap ${message.type === "error"
                                        ? "bg-destructive/10 text-destructive"
                                        : "bg-primary/10 text-primary"
                                    }`}
                            >
                                {message.text}
                            </div>
                        )}

                        {/* 提交按钮 */}
                        <Button
                            className="w-full rounded-2xl h-12 mt-4 text-base shadow-md shadow-primary/20"
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    {images.length > 0 ? "GLM-4.6V 识别中..." : "AI 分析中..."}
                                </>
                            ) : (
                                <>
                                    <Camera className="w-5 h-5 mr-2" />
                                    {images.length > 0 ? "视觉识别并保存" : "AI 分析并保存"}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}
