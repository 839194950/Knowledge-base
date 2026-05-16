"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import WikiLayout from "./WikiLayout";
import Sidebar from "./Sidebar";
import ContentArea from "./ContentArea";
import ArticleView from "./ArticleView";
import CategoryView from "./CategoryView";
import type { WikiPage, CategoryNode, SearchIndex } from "@/lib/markdown";

interface WikiObsidianClientProps {
  pages: WikiPage[];
  categoryTree: CategoryNode;
  searchIndex: SearchIndex;
  initialSlug?: string;
  children?: React.ReactNode;
}

// LocalStorage key
const EXPANDED_PATHS_KEY = "wiki-expanded-paths";

// ============================================
// 全局单例状态 - 只在第一次初始化时设置
// ============================================
let globalState: {
  expandedPaths: Set<string>;
  initialized: boolean;
} | null = null;

// 辅助函数：收集默认展开路径
const collectDefaultExpandedPaths = (tree: CategoryNode, depth: number = 0): Set<string> => {
  const paths = new Set<string>();
  if (depth <= 2 && tree.path && (tree.children.length > 0 || tree.articles.length > 0)) {
    paths.add(tree.path);
  }
  tree.children.forEach((child) => {
    const childPaths = collectDefaultExpandedPaths(child, depth + 1);
    childPaths.forEach((p) => paths.add(p));
  });
  return paths;
};

// 从 localStorage 加载
const loadFromStorage = (): string[] | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(EXPANDED_PATHS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load expanded paths:", e);
  }
  return null;
};

// 保存到 localStorage
const saveToStorage = (paths: Set<string>) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EXPANDED_PATHS_KEY, JSON.stringify(Array.from(paths)));
  } catch (e) {
    console.error("Failed to save expanded paths:", e);
  }
};

// 初始化全局状态
const getOrCreateGlobalState = (defaultPaths: Set<string>) => {
  if (globalState) {
    return globalState.expandedPaths;
  }

  let paths: Set<string>;
  const stored = loadFromStorage();
  if (stored && stored.length > 0) {
    paths = new Set(stored);
  } else {
    paths = defaultPaths;
  }

  globalState = {
    expandedPaths: paths,
    initialized: true,
  };

  return paths;
};

// 从 pathname 获取 slug
const getSlugFromPathname = (pathname: string): string | null => {
  const match = pathname.match(/^\/wiki\/(.*)$/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }
  return null;
};

export default function WikiObsidianClient({
  pages,
  categoryTree,
  searchIndex,
  initialSlug,
  children,
}: WikiObsidianClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  // 创建 slug 到页面的映射
  const pageMap = useMemo(() => {
    const map = new Map<string, WikiPage>();
    pages.forEach((page) => {
      map.set(page.slug, page);
    });
    return map;
  }, [pages]);

  // 直接从 URL 获取当前选中路径
  const selectedPath = useMemo(() => {
    return getSlugFromPathname(pathname) || null;
  }, [pathname]);

  // 获取默认展开路径
  const defaultPaths = useMemo(() => collectDefaultExpandedPaths(categoryTree), [categoryTree]);

  // 状态只初始化一次
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => {
    return getOrCreateGlobalState(defaultPaths);
  });

  // 切换文件夹展开/折叠
  const toggleExpand = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      // 更新全局状态并保存
      if (globalState) {
        globalState.expandedPaths = next;
      }
      saveToStorage(next);
      return next;
    });
  }, []);

  // 查找分类
  const findCategory = (tree: CategoryNode, path: string): CategoryNode | null => {
    if (tree.path === path) return tree;
    for (const child of tree.children) {
      const found = findCategory(child, path);
      if (found) return found;
    }
    return null;
  };

  // 处理选择 - 只做路由导航
  const handleSelect = useCallback((path: string, type: "category" | "article") => {
    router.push(`/wiki/${encodeURIComponent(path)}`);
  }, [router]);

  // 生成面包屑
  const breadcrumb = useMemo(() => {
    if (!selectedPath) return undefined;
    const parts = selectedPath.split("/").filter(Boolean);
    return [
      { name: "知识库", href: "/wiki" },
      ...parts.map((part, index) => ({
        name: part,
        href: `/wiki/${encodeURIComponent(parts.slice(0, index + 1).join("/"))}`,
      })),
    ];
  }, [selectedPath]);

  // 渲染内容
  const renderContent = () => {
    // 忽略 children，因为我们已经在内部处理
    if (!selectedPath) return null;

    const page = pageMap.get(selectedPath);
    if (page) {
      return <ArticleView page={page} allPages={pages} />;
    }

    const category = findCategory(categoryTree, selectedPath);
    if (category) {
      return (
        <CategoryView
          category={category}
          onSelectArticle={(article) => handleSelect(article.slug, "article")}
          onSelectCategory={(cat) => handleSelect(cat.path, "category")}
        />
      );
    }

    return null;
  };

  // 检查是否是缺失页面（应该显示 children）
  const isMissingPage = useMemo(() => {
    return selectedPath === "missing" || selectedPath?.startsWith("missing/concept/");
  }, [selectedPath]);

  return (
    <WikiLayout
      sidebar={
        <Sidebar
          categoryTree={categoryTree}
          searchIndex={searchIndex}
          selectedPath={selectedPath}
          onSelect={handleSelect}
          expandedPaths={expandedPaths}
          toggleExpand={toggleExpand}
        />
      }
      content={
        <ContentArea breadcrumb={breadcrumb}>
          {isMissingPage ? children : renderContent()}
        </ContentArea>
      }
    />
  );
}
