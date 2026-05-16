"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface WikiLayoutProps {
  sidebar: React.ReactNode;
  content: React.ReactNode;
  defaultSidebarWidth?: number;
  minSidebarWidth?: number;
  maxSidebarWidth?: number;
}

export default function WikiLayout({
  sidebar,
  content,
  defaultSidebarWidth = 300,
  minSidebarWidth = 200,
  maxSidebarWidth = 500,
}: WikiLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(defaultSidebarWidth);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // 处理拖拽开始
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    isDraggingRef.current = true;
  }, []);

  // 处理拖拽移动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;
      
      const clampedWidth = Math.max(
        minSidebarWidth,
        Math.min(maxSidebarWidth, newWidth)
      );
      
      setSidebarWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      isDraggingRef.current = false;
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, minSidebarWidth, maxSidebarWidth]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* 移动端菜单按钮 */}
      <div className="md:hidden flex items-center p-4 border-b">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <span className="ml-4 font-medium">知识库</span>
      </div>

      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* 移动端遮罩 */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* 左侧边栏 */}
        <aside
          className={`
            bg-gray-50 border-r border-gray-200 overflow-hidden
            md:block
            ${isMobileMenuOpen ? "fixed inset-y-0 left-0 z-50 w-80" : "hidden md:block"}
          `}
          style={{ width: isMobileMenuOpen ? "auto" : sidebarWidth }}
        >
          {sidebar}
        </aside>

        {/* 分隔条 - 仅桌面端显示 */}
        <div
          className={`
            hidden md:block w-1 cursor-col-resize
            ${isDragging ? "bg-blue-400" : "bg-gray-200 hover:bg-gray-300"}
            transition-colors duration-150
          `}
          onMouseDown={handleMouseDown}
        />

        {/* 右侧内容区 */}
        <main className="flex-1 overflow-hidden">
          {content}
        </main>
      </div>
    </div>
  );
}
