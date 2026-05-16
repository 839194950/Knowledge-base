"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as d3 from "d3";
import type { GraphData } from "@/lib/markdown";

interface KnowledgeGraphProps {
  data: GraphData;
}

export default function KnowledgeGraph({ data }: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data.nodes.length) return;

    // 清空现有内容
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const container = containerRef.current.getBoundingClientRect();
    const width = container.width || 800;
    const height = container.height || 600;

    // 设置 SVG 基本属性，背景完全透明！
    svg
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("cursor", "grab")
      .style("display", "block")
      .style("background-color", "transparent")
      .style("background", "none");

    // 创建主容器
    const gContainer = svg.append("g");

    // 计算节点度
    const degreeMap = new Map<string, number>();
    data.nodes.forEach(node => {
      degreeMap.set(node.id, 0);
    });
    data.links.forEach(link => {
      degreeMap.set(link.source, (degreeMap.get(link.source) || 0) + 1);
      degreeMap.set(link.target, (degreeMap.get(link.target) || 0) + 1);
    });

    // 先画连线（在底层）
    const link = gContainer
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke", "#b8b8b8")
      .attr("stroke-opacity", 0.8)
      .attr("stroke-width", 1.5);

    // 再画节点（在中间层）
    const node = gContainer
      .selectAll("circle")
      .data(data.nodes)
      .join("circle")
      .attr("r", (d: any) => {
        const count = degreeMap.get(d.id) || 0;
        if (d.id === "index") return 18;
        return count > 4 ? 14 : (count > 1 ? 10 : 7);
      })
      .attr("fill", (d: any) => {
        const colors: Record<number, string> = {
          0: "#9980ff",
          1: "#4a90d9",
          2: "#e57373",
          3: "#81c784",
          4: "#ffb74d",
          5: "#64b5f6",
        };
        return colors[d.group] || "#4a4a4a";
      })
      .style("cursor", "pointer");

    // 最后画标签（在顶层）
    const label = gContainer
      .selectAll("text")
      .data(data.nodes)
      .join("text")
      .text((d: any) => d.title || d.id)
      .attr("text-anchor", "middle")
      .attr("fill", "#4a4a4a")
      .attr("font-size", (d: any) => {
        const count = degreeMap.get(d.id) || 0;
        return count > 4 ? "16px" : (count > 1 ? "14px" : "12px");
      })
      .attr("font-family", "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif")
      .style("pointer-events", "none")
      .style("user-select", "none");

    // 缩放行为
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on("zoom", (event) => {
        gContainer.attr("transform", event.transform);
      });

    svg.call(zoom);

    // 拖拽函数
    const dragstarted = (event: any, d: any) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };

    const dragged = (event: any, d: any) => {
      d.fx = event.x;
      d.fy = event.y;
    };

    const dragended = (event: any, d: any) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    };

    // 交互函数
    const handleMouseOver = (event: any, d: any) => {
      const neighbors = new Set([d.id]);
      data.links.forEach(l => {
        if ((l.source as any).id === d.id) neighbors.add((l.target as any).id);
        if ((l.target as any).id === d.id) neighbors.add((l.source as any).id);
      });

      const colors: Record<number, string> = {
        0: "#9980ff",
        1: "#4a90d9",
        2: "#e57373",
        3: "#81c784",
        4: "#ffb74d",
        5: "#64b5f6",
      };

      node
        .attr("fill", (n: any) => neighbors.has(n.id) ? colors[n.group] || "#9980ff" : "#4a4a4a")
        .attr("opacity", (n: any) => neighbors.has(n.id) ? 1 : 0.05);
      
      link
        .attr("stroke", (l: any) => {
          return ((l.source as any).id === d.id || (l.target as any).id === d.id) ? "#9980ff" : "#b8b8b8";
        })
        .attr("stroke-width", (l: any) => {
          return ((l.source as any).id === d.id || (l.target as any).id === d.id) ? 2.5 : 1.5;
        })
        .attr("stroke-opacity", (l: any) => {
          return ((l.source as any).id === d.id || (l.target as any).id === d.id) ? 1 : 0.15;
        });
      
      label
        .attr("fill", (n: any) => neighbors.has(n.id) ? colors[n.group] || "#9980ff" : "#4a4a4a")
        .attr("font-weight", (n: any) => neighbors.has(n.id) ? "600" : "400")
        .attr("opacity", (n: any) => neighbors.has(n.id) ? 1 : 0.05);
    };

    const handleMouseOut = () => {
      const colors: Record<number, string> = {
        0: "#9980ff",
        1: "#4a90d9",
        2: "#e57373",
        3: "#81c784",
        4: "#ffb74d",
        5: "#64b5f6",
      };

      node
        .attr("fill", (d: any) => colors[d.group] || "#4a4a4a")
        .attr("opacity", 1);
      
      link
        .attr("stroke", "#b8b8b8")
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.8);
      
      label
        .attr("fill", (d: any) => colors[d.group] || "#4a4a4a")
        .attr("font-weight", "400")
        .attr("opacity", 1);
    };

    // 给节点添加交互
    node
      .call((d3.drag() as any)
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .on("click", (event: any, d: any) => {
        event.stopPropagation();
        router.push(`/wiki/${d.id}`);
      });

    // 模拟
    const simulation = d3.forceSimulation<any>(data.nodes)
      .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(160))
      .force("charge", d3.forceManyBody().strength(-550))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(60))
      .alphaDecay(0.03);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);
      
      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
      
      label
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => {
          const count = degreeMap.get(d.id) || 0;
          const r = count > 4 ? 14 : (count > 1 ? 10 : 7);
          return d.y + r + 10;
        });
    });

    // 重置函数
    (window as any).resetToIndex = function() {
      const targetNode = data.nodes.find(n => n.id === "index");
      if (!targetNode) return;

      const newContainer = containerRef.current!.getBoundingClientRect();
      const curWidth = newContainer.width || 800;
      const curHeight = newContainer.height || 600;
      const scale = 1.2;

      const translateX = curWidth / 2 - (targetNode as any).x * scale;
      const translateY = curHeight / 2 - (targetNode as any).y * scale;

      svg.transition()
        .duration(800)
        .ease(d3.easeCubicInOut)
        .call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(scale));
    };

    // 窗口 resize 处理
    const handleResize = () => {
      if (!containerRef.current) return;
      const newContainer = containerRef.current.getBoundingClientRect();
      const newWidth = newContainer.width || 800;
      const newHeight = newContainer.height || 600;
      
      svg.attr("viewBox", `0 0 ${newWidth} ${newHeight}`);
      simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2));
      simulation.alpha(0.3).restart();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);

  }, [data, router]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-white">
      <svg ref={svgRef} className="w-full h-full" />
      
      {/* 控制按钮 */}
      <div className="absolute bottom-5 right-5 flex flex-col gap-2.5 z-10">
        <button
          onClick={() => (window as any).resetToIndex?.()}
          className="bg-white/80 backdrop-blur border border-gray-200 px-4.5 py-2.5 rounded-lg cursor-pointer text-sm font-medium text-gray-700 shadow-lg transition-all hover:bg-white hover:border-purple-400 hover:text-purple-500 hover:-translate-y-0.5 hover:shadow-xl"
        >
          聚焦 Index 节点
        </button>
      </div>
    </div>
  );
}
