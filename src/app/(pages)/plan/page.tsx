import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, CheckCircle2, AlertCircle } from "lucide-react";

export default function PlanPage() {
    return (
        <main className="min-h-screen pb-24 px-4 pt-6 bg-background">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">减脂计划</h1>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Settings className="w-5 h-5 text-muted-foreground" />
                </Button>
            </div>

            {/* 本周 AI 校准卡片 */}
            <section className="mb-6">
                <Card className="rounded-2xl shadow-sm border border-primary/20 bg-primary/5">
                    <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                            <div className="bg-primary/20 p-2 rounded-full mt-1">
                                <AlertCircle className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-1">本周 TDEE 已微调</h3>
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    观察到你过去 14 天虽然一直保持热量缺口，但体重下降速度偏快。为了防止肌肉过度流失和暴食反弹，本周每日可吃卡路里上调 <span className="font-bold text-primary">+100 kcal</span>，放心吃饱！
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* 当前目标大盘 */}
            <section className="mb-8">
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">当前目标设定</h2>
                <Card className="rounded-2xl shadow-sm border bg-card">
                    <CardContent className="p-0 divide-y">
                        <div className="flex justify-between items-center p-4">
                            <span className="text-sm font-medium">起始体重</span>
                            <span className="font-semibold">100.0 kg</span>
                        </div>
                        <div className="flex justify-between items-center p-4">
                            <span className="text-sm font-medium text-primary">目标体重</span>
                            <span className="font-bold text-primary">80.0 kg</span>
                        </div>
                        <div className="flex justify-between items-center p-4">
                            <span className="text-sm font-medium">每日基准摄入 (未微调)</span>
                            <span className="font-semibold">1450 kcal</span>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* 本周任务打卡 */}
            <section>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">本周轻量任务</h2>
                <div className="space-y-3">
                    <div className="flex items-center justify-between bg-card p-4 rounded-2xl border shadow-sm">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            <span className="text-sm font-medium">记录体重 ≥ 3 次</span>
                        </div>
                        <span className="text-sm font-bold text-muted-foreground">1 / 3</span>
                    </div>

                    <div className="flex items-center justify-between bg-card p-4 rounded-2xl border shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground"></div>
                            <span className="text-sm font-medium">运动打卡 ≥ 3 次</span>
                        </div>
                        <span className="text-sm font-bold text-muted-foreground">0 / 3</span>
                    </div>

                    <div className="flex items-center justify-between bg-card p-4 rounded-2xl border shadow-sm">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            <span className="text-sm font-medium">记录饮食 ≥ 5 天</span>
                        </div>
                        <span className="text-sm font-bold text-muted-foreground">2 / 5</span>
                    </div>
                </div>
            </section>
        </main>
    );
}
