import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, Scale } from "lucide-react";

export default function TrendsPage() {
    return (
        <main className="min-h-screen pb-24 px-4 pt-6 bg-background">
            <h1 className="text-xl font-bold mb-6">数据趋势</h1>

            {/* 核心指标预测 */}
            <section className="grid grid-cols-2 gap-3 mb-6">
                <Card className="rounded-2xl shadow-sm border-0 bg-primary/10">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2 text-primary">
                            <Scale className="w-4 h-4" />
                            <span className="text-sm font-medium">预计达成</span>
                        </div>
                        <p className="text-xl font-bold text-foreground">10月15日</p>
                        <p className="text-xs text-muted-foreground mt-1">按近14天趋势推算</p>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm border-0 bg-secondary">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2 text-foreground/70">
                            <TrendingDown className="w-4 h-4" />
                            <span className="text-sm font-medium">本周目标</span>
                        </div>
                        <p className="text-xl font-bold text-foreground">0.6 - 0.8<span className="text-sm font-normal ml-1">kg</span></p>
                        <p className="text-xs text-muted-foreground mt-1">建议稳步下降</p>
                    </CardContent>
                </Card>
            </section>

            {/* 图表占位区 (实际开发中接入 Recharts) */}
            <section className="space-y-4">
                <Card className="rounded-2xl shadow-sm border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">体重趋势 (7日均线)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-48 w-full bg-accent/20 rounded-xl flex items-center justify-center border border-dashed border-border">
                            <span className="text-sm text-muted-foreground">图表区: 散点与平滑曲线</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">热量摄入与消耗</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-48 w-full bg-accent/20 rounded-xl flex items-center justify-center border border-dashed border-border">
                            <span className="text-sm text-muted-foreground">图表区: 柱状图或面积图</span>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </main>
    );
}
