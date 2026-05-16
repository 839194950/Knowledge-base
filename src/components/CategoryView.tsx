"use client";

import Link from "next/link";
import { Folder, FileText } from "lucide-react";
import type { CategoryNode, WikiPage } from "@/lib/markdown";

interface CategoryViewProps {
  category: CategoryNode;
  onSelectArticle: (article: WikiPage) => void;
  onSelectCategory: (category: CategoryNode) => void;
}

export default function CategoryView({
  category,
  onSelectArticle,
  onSelectCategory,
}: CategoryViewProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {category.name}
        </h1>
        <p className="text-gray-500 text-lg">
          共 {category.totalCount} 个内容
        </p>
      </header>

      {category.children.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">子分类</h2>
          <div className="grid gap-3">
            {category.children.map((child) => (
              <div
                key={child.path || child.name}
                onClick={() => onSelectCategory(child)}
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <Folder className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{child.name}</div>
                  <div className="text-sm text-gray-500">{child.totalCount} 个内容</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {category.articles.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">文章</h2>
          <div className="grid gap-3">
            {category.articles.map((article) => (
              <div
                key={article.slug}
                onClick={() => onSelectArticle(article)}
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <FileText className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{article.title}</div>
                  {article.description && (
                    <div className="text-sm text-gray-500 mt-1">{article.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {category.children.length === 0 && category.articles.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          该分类下暂无内容
        </div>
      )}
    </div>
  );
}
