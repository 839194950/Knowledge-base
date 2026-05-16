"use client";

import { useCallback, useRef, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";
import Link from "next/link";
import type { GraphData } from "@/lib/markdown";

interface GraphViewerProps {
  data: GraphData;
}

export default function GraphViewer({ data }: GraphViewerProps) {
  const fgRef = useRef<any>();

  // 给不同组分配颜色
  const groupColors: Record<number, string> = {
    0: "#9CA3AF", // 其他 - 灰色
    1: "#3B82F6", // 实体 - 蓝色
    2: "#10B981", // 概念 - 绿色
    3: "#F59E0B", // 摘要 - 琥珀色
  };

  // 点击节点跳转
  const handleNodeClick = useCallback((node: any) => {
    window.location.href = `/wiki/${node.id}`;
  }, []);

  useEffect(() => {
    // 自动适应画布
    if (fgRef.current) {
      fgRef.current.zoomToFit(400, 60);
    }
  }, [data]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeColor={(node: any) => groupColors[node.group] || "#9CA3AF"}
        nodeLabel={(node: any) => node.title}
        nodeRelSize={6}
        linkWidth={1.5}
        linkColor={() => "#CBD5E1"}
        onNodeClick={handleNodeClick}
        cooldownTicks={100}
        backgroundColor="transparent"
        nodeCanvasObject={(node: any, ctx: any, globalScale: any) => {
          const label = node.title;
          const fontSize = 12 / globalScale;
          
          ctx.font = `${fontSize}px sans-serif`;
          ctx.fillStyle = groupColors[node.group] || "#9CA3AF";
          ctx.beginPath();
          ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
          ctx.fill();

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#1F2937";
          ctx.fillText(label, node.x, node.y - 8);
        }}
        nodePointerAreaPaint={(node: any, color: any, ctx: any) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 12, 0, 2 * Math.PI);
          ctx.fill();
        }}
      />
    </div>
  );
}