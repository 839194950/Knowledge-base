"use client";

import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import CategoryCards from "@/components/CategoryCards";
import type { WikiPage, GraphData, CategoryNode, SearchIndex } from "@/lib/markdown";

interface WikiClientProps {
  pages: WikiPage[];
  graphData: GraphData;
  categoryTree: CategoryNode;
  searchIndex: SearchIndex;
}

export default function WikiClient({ pages, categoryTree, searchIndex }: WikiClientProps) {
  // 计算总连接数
  let totalLinks = 0;
  for (const page of pages) {
    totalLinks += page.outLinks.length;
  }

  return (
    <div className="max-w-full md:max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 animate-fade-in">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-1 md:mb-2">知识库</h1>
        <p className="text-muted-foreground text-base md:text-lg">
          共 {pages.length} 个页面 · {totalLinks} 个连接
        </p>
      </header>

      {/* 搜索栏 */}
      <div className="mb-6 md:mb-8">
        <SearchBar searchIndex={searchIndex} />
      </div>

      {/* 分类卡片 */}
      <section className="mb-8 md:mb-12">
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-700">分类浏览</h2>
        <CategoryCards categories={categoryTree.children} />
      </section>
    </div>
  );
}
