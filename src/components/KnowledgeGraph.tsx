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

    try {
      // 清空现有内容
      d3.select(svgRef.current).selectAll("*").remove();

      const svg = d3.select(svgRef.current);
      const container = containerRef.current.getBoundingClientRect();
      const width = container.width;
      const height = container.height;

      svg
        .attr("width", "100%")
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("background-color", "#ffffff")
        .style("cursor", "grab");

      // 创建总容器用于缩放平移
      const gContainer = svg.append("g");

      // 1. 初始化缩放行为 (无限画布)
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 5])
        .on("zoom", (event) => {
          gContainer.attr("transform", event.transform);
        });

      svg.call(zoom);

      // 计算节点度（连接数）
      const degreeMap = new Map<string, number>();
      data.nodes.forEach(node => {
        degreeMap.set(node.id, 0);
      });
      data.links.forEach(link => {
        degreeMap.set(link.source, (degreeMap.get(link.source) || 0) + 1);
        degreeMap.set(link.target, (degreeMap.get(link.target) || 0) + 1);
      });

      // 交互函数
      const handleMouseOver = (event: any, d: any) => {
        const neighbors = new Set([d.id]);
        data.links.forEach(l => {
          if ((l.source as any).id === d.id) neighbors.add((l.target as any).id);
          if ((l.target as any).id === d.id) neighbors.add((l.source as any).id);
        });

        const colors: Record<number, string> = {
          0: "#9980ff", // index
          1: "#4a90d9", // 人物与工具
          2: "#e57373", // 核心概念
          3: "#81c784", // 资料存档
          4: "#ffb74d", // 关于本站
          5: "#64b5f6", // 投资理财
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
          0: "#9980ff", // index
          1: "#4a90d9", // 人物与工具
          2: "#e57373", // 核心概念
          3: "#81c784", // 资料存档
          4: "#ffb74d", // 关于本站
          5: "#64b5f6", // 投资理财
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

      // 2. 物理模拟器 (紧凑但有呼吸感)
      const simulation = d3.forceSimulation<any>(data.nodes)
        .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(160))
        .force("charge", d3.forceManyBody().strength(-550))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(60))
        .alphaDecay(0.03);

    // 3. 绘制元素
    const link = gContainer.append("g")
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("class", "link")
      .attr("stroke", "#b8b8b8")
      .attr("stroke-opacity", 0.8)
      .attr("stroke-width", 1.5);

    const node = gContainer.append("g")
      .selectAll("circle")
      .data(data.nodes)
      .join("circle")
      .attr("class", "node")
      .attr("r", (d: any) => {
        const count = degreeMap.get(d.id) || 0;
        if (d.id === "index") return 18; // index 节点更大
        return count > 4 ? 14 : (count > 1 ? 10 : 7);
      })
      .attr("fill", (d: any) => {
        const colors: Record<number, string> = {
          0: "#9980ff", // index
          1: "#4a90d9", // 人物与工具
          2: "#e57373", // 核心概念
          3: "#81c784", // 资料存档
          4: "#ffb74d", // 关于本站
          5: "#64b5f6", // 投资理财
        };
        return colors[d.group] || "#4a4a4a";
      })
      .style("cursor", "pointer")
      .call((d3.drag() as any)
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .on("click", (event, d: any) => {
        event.stopPropagation();
        router.push(`/wiki/${d.id}`);
      });

    const label = gContainer.append("g")
      .selectAll("text")
      .data(data.nodes)
      .join("text")
      .attr("class", "label")
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

    // 暴露重置函数到 window，或者通过 ref 暴露
    (window as any).resetToIndex = function() {
      const targetNode = data.nodes.find(n => n.id === "index");
      if (!targetNode) return;

      const curWidth = width;
      const curHeight = height;
      const scale = 1.2;

      const translateX = curWidth / 2 - (targetNode as any).x * scale;
      const translateY = curHeight / 2 - (targetNode as any).y * scale;

      svg.transition()
        .duration(800)
        .ease(d3.easeCubicInOut)
        .call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(scale));
    };

    const handleResize = () => {
      if (!containerRef.current) return;
      const newContainer = containerRef.current.getBoundingClientRect();
      simulation.force("center", d3.forceCenter(newContainer.width / 2, newContainer.height / 2));
      simulation.alpha(0.3).restart();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    } catch (error) {
      console.error("KnowledgeGraph rendering error:", error);
      // 如果出错，至少显示一个简单的占位符
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove();
        d3.select(svgRef.current)
          .append("text")
          .attr("x", 50)
          .attr("y", 50)
          .text("知识图谱加载失败，请刷新页面重试")
          .attr("fill", "#666")
          .attr("font-size", 14);
      }
    }
  }, [data, router]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
      
      {/* 控制按钮 */}
      <div className="absolute bottom-5 right-5 flex flex-col gap-2.5">
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
