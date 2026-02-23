"use client";

import { House, List, TrendingUp, Target } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: "/", label: "今天", icon: House },
        { href: "/log", label: "记录", icon: List },
        { href: "/trends", label: "趋势", icon: TrendingUp },
        { href: "/plan", label: "计划", icon: Target },
    ];

    return (
        <nav className="fixed bottom-0 w-full max-w-md bg-background/80 backdrop-blur-xl border-t border-border pb-safe z-50">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground font-medium"
                                }`}
                        >
                            <Icon className={`w-6 h-6 mb-1 ${isActive ? "fill-primary/10" : ""}`} />
                            <span className="text-[10px]">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
