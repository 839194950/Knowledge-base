"use client";

import Link from "next/link";
import type { CategoryNode } from "@/lib/markdown";

interface CategoryCardsProps {
  categories: CategoryNode[];
}

export default function CategoryCards({ categories }: CategoryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Link
          key={category.path}
          href={`/wiki/${category.path}`}
          className="block p-6 border border-gray-200 rounded-xl bg-white hover:border-purple-300 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {category.name}
            </h3>
            <span className="text-sm text-gray-500">
              {category.totalCount}
            </span>
          </div>
          
          {category.children.length > 0 && (
            <div className="text-sm text-gray-600 mb-2">
              {category.children.length} 个子分类
            </div>
          )}
          
          {category.articles.length > 0 && (
            <div className="text-sm text-gray-600">
              {category.articles.length} 篇文章
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
