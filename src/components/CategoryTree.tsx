"use client";

import { Folder, FolderOpen, FileText } from "lucide-react";
import { memo } from "react";
import type { CategoryNode, WikiPage } from "@/lib/markdown";

interface CategoryTreeProps {
  tree: CategoryNode;
  selectedPath: string | null;
  onSelect: (path: string, type: "category" | "article") => void;
  expandedPaths: Set<string>;
  toggleExpand: (path: string) => void;
}

interface TreeNodeProps {
  node: CategoryNode;
  depth: number;
  selectedPath: string | null;
  onSelect: (path: string, type: "category" | "article") => void;
  expandedPaths: Set<string>;
  toggleExpand: (path: string) => void;
}

const TreeNode = memo(function TreeNode({ node, depth, selectedPath, onSelect, expandedPaths, toggleExpand }: TreeNodeProps) {
  const hasChildren = node.children.length > 0;
  const hasArticles = node.articles.length > 0;
  const isCategorySelected = selectedPath === node.path;
  // 根节点总是展开，其他节点检查 expandedPaths
  const isExpanded = !node.path ? true : expandedPaths.has(node.path);

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.path) {
      toggleExpand(node.path);
    }
  };

  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.path) {
      onSelect(node.path, "category");
    }
  };

  const handleArticleClick = (article: WikiPage) => {
    onSelect(article.slug, "article");
  };

  const indentStyle = { marginLeft: `${depth * 16}px` };

  // 根据深度确定分类的字体样式
  const getCategoryFontStyle = () => {
    if (depth === 0) return "text-lg font-semibold";
    if (depth === 1) return "text-base font-medium";
    return "text-sm font-medium";
  };

  const getCategoryIconSize = () => {
    if (depth === 0) return "w-5 h-5";
    if (depth === 1) return "w-4.5 h-4.5";
    return "w-4 h-4";
  };

  const getArticleFontStyle = () => {
    return "text-sm font-medium";
  };

  return (
    <div className="select-none" suppressHydrationWarning>
      {/* 分类节点 */}
      <div
        className={`
          flex items-center py-1.5 px-2 rounded
          ${isCategorySelected ? "bg-blue-100 text-blue-900" : "hover:bg-gray-100 text-gray-700"}
        `}
        style={indentStyle}
      >
        {/* 文件夹图标 - 点击只切换展开 */}
        <span 
          className="mr-2 flex-shrink-0 cursor-pointer"
          onClick={handleIconClick}
        >
          {isExpanded ? (
            <FolderOpen className={`${getCategoryIconSize()} text-yellow-600`} />
          ) : (
            <Folder className={`${getCategoryIconSize()} text-yellow-600`} />
          )}
        </span>

        {/* 分类名称 - 点击选择分类 */}
        <span 
          className={`truncate ${getCategoryFontStyle()} cursor-pointer`}
          onClick={handleNameClick}
        >
          {node.name}
        </span>

        {/* 数量（可选） */}
        {node.totalCount > 0 && (
          <span className="ml-2 text-xs text-gray-400 flex-shrink-0">
            {node.totalCount}
          </span>
        )}
      </div>

      {/* 子分类和文章列表 */}
      {isExpanded && (
        <>
          {/* 子分类 */}
          {hasChildren && (
            <div>
              {node.children.map((child) => (
                <TreeNode
                  key={child.path || child.name}
                  node={child}
                  depth={depth + 1}
                  selectedPath={selectedPath}
                  onSelect={onSelect}
                  expandedPaths={expandedPaths}
                  toggleExpand={toggleExpand}
                />
              ))}
            </div>
          )}

          {/* 文章列表 */}
          {hasArticles && (
            <div>
              {node.articles.map((article) => {
                const isArticleSelected = selectedPath === article.slug;
                return (
                  <div
                    key={article.slug}
                    className={`
                      flex items-center py-1.5 px-2 cursor-pointer rounded
                      ${isArticleSelected ? "bg-blue-100 text-blue-900" : "hover:bg-gray-100 text-gray-600"}
                    `}
                    style={{ marginLeft: `${(depth + 1) * 16}px` }}
                    onClick={() => handleArticleClick(article)}
                  >
                    <FileText className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
                    <span className={`truncate ${getArticleFontStyle()}`}>{article.title}</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
});

const CategoryTree = memo(function CategoryTree({
  tree,
  selectedPath,
  onSelect,
  expandedPaths,
  toggleExpand,
}: CategoryTreeProps) {
  return (
    <div className="py-2" suppressHydrationWarning>
      <TreeNode
        node={tree}
        depth={0}
        selectedPath={selectedPath}
        onSelect={onSelect}
        expandedPaths={expandedPaths}
        toggleExpand={toggleExpand}
      />
    </div>
  );
});

export default CategoryTree;
