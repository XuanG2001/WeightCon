import { Card, CardContent } from "@/components/ui/card";
import { Utensils, Flame } from "lucide-react";

export default function LogPage() {
    return (
        <main className="min-h-screen pb-24 px-4 pt-6 bg-background">
            {/* 顶部日期切换 */}
            <section className="flex justify-between items-center mb-6 sticky top-0 bg-background/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 shadow-sm border-b">
                <h1 className="text-xl font-bold flex-1">详细记录</h1>
                <div className="flex gap-2">
                    <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center text-sm font-medium text-accent-foreground cursor-pointer">二</div>
                    <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center text-sm font-medium text-accent-foreground cursor-pointer">三</div>
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-medium text-primary-foreground shadow-sm cursor-pointer ring-2 ring-primary/20 ring-offset-2">今</div>
                </div>
            </section>

            {/* 历史记录时间线 */}
            <section className="space-y-4">
                <div className="flex gap-4 items-start relative before:absolute before:inset-0 before:left-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-border">
                    <div className="flex-none bg-background rounded-full p-1 z-10 shrink-0 shadow-sm border">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><Utensils className="w-4 h-4 text-primary" /></div>
                    </div>
                    <div className="flex-1 pb-6">
                        <Card className="rounded-2xl shadow-sm border bg-card">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-semibold text-foreground">早餐</span>
                                    <span className="text-sm font-bold text-primary">350 kcal</span>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-16 h-16 bg-accent/40 rounded-xl overflow-hidden shrink-0"></div>
                                    <div className="flex flex-col justify-center">
                                        <p className="text-sm">全麦面包 + 牛奶的文字描述</p>
                                        <p className="text-xs text-muted-foreground mt-1">300-400 kcal · 置信度: 高</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex gap-4 items-start relative before:absolute before:inset-0 before:left-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-border">
                    <div className="flex-none bg-background rounded-full p-1 z-10 shrink-0 shadow-sm border">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center"><Flame className="w-4 h-4 text-orange-500" /></div>
                    </div>
                    <div className="flex-1 pb-6">
                        <Card className="rounded-2xl shadow-sm border bg-card">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm font-semibold text-foreground">户外跑步</span>
                                        <p className="text-xs text-muted-foreground mt-1">30 分钟 · 来源: Apple Watch</p>
                                    </div>
                                    <span className="text-sm font-bold text-orange-500">-280 kcal</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
        </main>
    );
}
