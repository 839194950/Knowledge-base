"use client";

import Link from "next/link";
import type { WikiPage } from "@/lib/markdown";

interface ArticleCardsProps {
  articles: WikiPage[];
}

export default function ArticleCards({ articles }: ArticleCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <Link
          key={article.slug}
          href={`/wiki/${article.slug}`}
          className="block p-6 border border-gray-200 rounded-xl bg-white hover:border-purple-300 hover:shadow-md transition-all"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {article.title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {article.description}
          </p>
          
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{article.outLinks.length + article.inLinks.length} 个链接</span>
            {article.tags.length > 0 && (
              <span>#{article.tags[0]}</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
