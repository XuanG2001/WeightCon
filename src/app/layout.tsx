import { ReactNode } from "react";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-background text-foreground selection:bg-primary/20 min-h-[100dvh]">
        <div className="max-w-md mx-auto bg-background min-h-screen relative shadow-2xl border-x border-border/40">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
