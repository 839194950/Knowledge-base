"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previousPathname, setPreviousPathname] = useState(pathname);

  useEffect(() => {
    if (pathname !== previousPathname) {
      setIsLoading(true);
      setProgress(0);
      setPreviousPathname(pathname);

      const startTime = Date.now();
      const duration = 1000; // 1秒完成动画

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        setProgress(newProgress);

        if (newProgress < 100) {
          requestAnimationFrame(animate);
        } else {
          setTimeout(() => {
            setIsLoading(false);
            setProgress(0);
          }, 150);
        }
      };

      animate();
    }
  }, [pathname, previousPathname]);

  return (
    <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-50">
      {/* 加载进度条 */}
      <div
        className={`h-0.5 bg-accent transition-all duration-300 ${
          isLoading ? "opacity-100" : "opacity-0"
        }`}
        style={{ width: `${progress}%` }}
      />
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <img src="/favicon.svg" alt="蒸鱼图标" className="w-14 h-14" />
            蒸鱼知识库
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm transition-colors ${
                pathname === "/"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              首页
            </Link>
            <Link
              href="/wiki"
              className={`text-sm transition-colors ${
                pathname.startsWith("/wiki") && pathname !== "/wiki"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              知识库
            </Link>
            <Link
              href="/tags"
              className={`text-sm transition-colors ${
                pathname === "/tags"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              标签
            </Link>
            <Link
              href="/graph"
              className={`text-sm transition-colors ${
                pathname === "/graph"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              知识图谱
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
