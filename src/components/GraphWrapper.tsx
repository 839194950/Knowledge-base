"use client";

import dynamic from "next/dynamic";
import { getGraphData } from "@/lib/markdown";
import { useEffect, useState } from "react";
import type { GraphData } from "@/lib/markdown";

// 动态导入图谱组件，关闭SSR
const KnowledgeGraph = dynamic(() => import("./KnowledgeGraph"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-card text-muted-foreground">
      加载图谱中...
    </div>
  ),
});

interface GraphWrapperProps {
  initialData: GraphData;
}

export default function GraphWrapper({ initialData }: GraphWrapperProps) {
  const [data, setData] = useState(initialData);

  return <KnowledgeGraph data={data} />;
}
