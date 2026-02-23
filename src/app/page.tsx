"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Droplet, Activity, Utensils, Loader2 } from "lucide-react";
import { ActionButtons } from "@/components/ActionButtons";

interface Settings {
  isSetup: boolean;
  targetCalories: number;
  startWeightKg: number;
  currentWeightKg: number;
  targetWeightKg: number;
}

interface MealSummary {
  caloriesMid: number;
}

export default function Home() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [todayIntake, setTodayIntake] = useState(0);
  const [todayBurn, setTodayBurn] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Load settings
        const sRes = await fetch("/api/settings");
        const { settings: s } = await sRes.json();

        if (!s.isSetup) {
          router.replace("/setup");
          return;
        }
        setSettings(s);

        // Load today's meals
        const today = new Date().toISOString().split("T")[0];
        const mRes = await fetch(`/api/meals?date=${today}`);
        const { meals } = await mRes.json();
        const intake = (meals as MealSummary[]).reduce(
          (acc: number, m: MealSummary) => acc + (m.caloriesMid ?? 0),
          0
        );
        setTodayIntake(Math.round(intake));

        // Load today's workouts
        const wRes = await fetch(`/api/workouts?date=${today}`);
        const { workouts } = await wRes.json();
        const burn = workouts.reduce(
          (acc: number, w: { calories: number }) => acc + (w.calories ?? 0),
          0
        );
        setTodayBurn(Math.round(burn));
      } catch {
        // silently ignore on first load
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  if (!settings) return null;

  const target = Math.round(settings.targetCalories);
  const balance = target + todayBurn - todayIntake;
  const balanceColor =
    balance >= 0 ? "text-primary" : "text-orange-500";

  return (
    <main className="min-h-screen pb-24 px-4 pt-6 bg-background">
      {/* 顶部仪表盘区 */}
      <section className="space-y-4">
        <div className="flex flex-col items-center justify-center p-6 bg-card rounded-3xl shadow-sm border">
          <h2 className="text-sm font-medium text-muted-foreground mb-1">今日余额</h2>
          <div className="flex items-baseline gap-1">
            <span className={`text-5xl font-bold ${balanceColor}`}>
              {Math.abs(balance)}
            </span>
            <span className={`text-xl font-semibold ${balanceColor}/80`}>kcal</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {balance >= 0 ? "还可以吃" : "今日赤字"}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="rounded-2xl shadow-sm border-0 bg-primary/5">
            <CardContent className="p-3 text-center">
              <p className="text-[10px] text-muted-foreground mb-1">目标</p>
              <p className="font-semibold text-foreground">{target}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm border-0 bg-secondary">
            <CardContent className="p-3 text-center">
              <p className="text-[10px] text-muted-foreground mb-1 flex items-center justify-center gap-1">
                <Utensils className="w-3 h-3" /> 已摄入
              </p>
              <p className="font-semibold text-foreground">{todayIntake}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm border-0 bg-accent/20">
            <CardContent className="p-3 text-center">
              <p className="text-[10px] text-muted-foreground mb-1 flex items-center justify-center gap-1">
                <Activity className="w-3 h-3" /> 已消耗
              </p>
              <p className="font-semibold text-foreground">{todayBurn}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 快捷饮水 */}
      <section className="mt-6 flex justify-between items-center bg-card p-4 rounded-2xl shadow-sm border">
        <span className="text-sm font-medium">饮水记录</span>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <button
              key={i}
              className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center text-accent-foreground hover:bg-accent hover:text-primary active:scale-90 transition-all duration-200"
            >
              <Droplet className="w-5 h-5" />
            </button>
          ))}
        </div>
      </section>

      {/* 操作入口 */}
      <ActionButtons />

      {/* 今日记录时间线 */}
      <section className="mt-10">
        <h3 className="text-base font-semibold mb-4 px-1">今日记录</h3>
        {todayIntake === 0 && todayBurn === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Utensils className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">今天还没有记录</p>
            <p className="text-xs mt-1">点击「记录餐食」开始吧！</p>
          </div>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            <p className="text-xs text-muted-foreground px-1">今日摄入 {todayIntake} kcal · 消耗 {todayBurn} kcal</p>
          </div>
        )}
      </section>
    </main>
  );
}
