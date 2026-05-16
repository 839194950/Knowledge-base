"use client";

import { memo } from "react";
import SearchBar from "./SearchBar";
import CategoryTree from "./CategoryTree";
import type { CategoryNode, SearchIndex } from "@/lib/markdown";

interface SidebarProps {
  categoryTree: CategoryNode;
  searchIndex: SearchIndex;
  selectedPath: string | null;
  onSelect: (path: string, type: "category" | "article") => void;
  expandedPaths: Set<string>;
  toggleExpand: (path: string) => void;
}

const Sidebar = memo(function Sidebar({
  categoryTree,
  searchIndex,
  selectedPath,
  onSelect,
  expandedPaths,
  toggleExpand,
}: SidebarProps) {
  return (
    <div className="flex flex-col h-full">
      {/* 搜索框区域 */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <SearchBar searchIndex={searchIndex} />
      </div>

      {/* 文件夹树区域 */}
      <div className="flex-1 overflow-y-auto" style={{ contain: 'strict' }}>
        <CategoryTree
          tree={categoryTree}
          selectedPath={selectedPath}
          onSelect={onSelect}
          expandedPaths={expandedPaths}
          toggleExpand={toggleExpand}
        />
      </div>
    </div>
  );
});

export default Sidebar;
