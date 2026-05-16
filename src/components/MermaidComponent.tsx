"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidComponentProps {
  code: string;
}

export default function MermaidComponent({ code }: MermaidComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current || !code.trim()) {
      setLoading(false);
      return;
    }

    const renderMermaid = async () => {
      try {
        setLoading(true);
        setError(null);
        
        await mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "loose",
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: "linear",
          },
          themeVariables: {
            primaryColor: "#6b21a8",
            primaryTextColor: "#1f2937",
            primaryBorderColor: "#374151",
            lineColor: "#374151",
            secondaryColor: "#f3f4f6",
            tertiaryColor: "#f97316",
          },
        });

        const uniqueId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const result = await mermaid.render(uniqueId, code);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = result.svg;
        }
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "渲染失败";
        setError(errorMsg);
        console.error("Mermaid rendering error:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      renderMermaid();
    }, 50);

    return () => {
      clearTimeout(timer);
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [code]);

  if (error) {
    return (
      <div className="text-red-500 text-sm p-4 bg-red-50 rounded-lg">
        <p className="font-medium">Mermaid 渲染错误:</p>
        <pre className="mt-2 whitespace-pre-wrap font-mono text-xs">{error}</pre>
        <p className="mt-2 text-gray-600">原始代码:</p>
        <pre className="mt-1 whitespace-pre-wrap font-mono text-xs bg-white p-2 rounded border border-gray-200">{code}</pre>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[150px] bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="text-sm text-gray-500">渲染中...</span>
        </div>
      </div>
    );
  }

  if (!code.trim()) {
    return (
      <div className="flex items-center justify-center min-h-[100px] bg-gray-50 text-gray-400 text-sm">
        无图表内容
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="mermaid-container overflow-x-auto"
      style={{ minHeight: "100px" }}
    />
  );
}