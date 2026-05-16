"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { searchInIndex } from "@/lib/search";
import type { SearchablePage, SearchableCategory, SearchIndex } from "@/lib/markdown";

interface SearchBarProps {
  searchIndex: SearchIndex;
}

export default function SearchBar({ searchIndex }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ pages: SearchablePage[], categories: SearchableCategory[] }>({ pages: [], categories: [] });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 搜索逻辑
  useEffect(() => {
    if (!query.trim()) {
      setResults({ pages: [], categories: [] });
      return;
    }

    const searchResults = searchInIndex(searchIndex, query);

    setResults({
      pages: searchResults.pages.slice(0, 10), // 限制显示10个
      categories: searchResults.categories
    });
  }, [query, searchIndex]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="搜索文章或分类..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-shadow"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </div>
      </div>

      {isOpen && (results.pages.length > 0 || results.categories.length > 0) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {results.categories.length > 0 && (
            <div className="border-b border-gray-100 p-2">
              <div className="text-xs text-gray-500 px-2 py-1 uppercase tracking-wider">分类</div>
              {results.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/wiki/${category.path}`}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 hover:bg-gray-50 rounded-md"
                >
                  <div className="text-sm font-medium text-gray-900">
                    📁 {category.name}
                    <span className="text-gray-400 text-xs ml-1">({category.articleCount})</span>
                  </div>
                  <div className="text-xs text-gray-500">{category.path}</div>
                </Link>
              ))}
            </div>
          )}

          {results.pages.length > 0 && (
            <div className="p-2">
              <div className="text-xs text-gray-500 px-2 py-1 uppercase tracking-wider">文章</div>
              {results.pages.map((page) => (
                <Link
                  key={page.id}
                  href={`/wiki/${page.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 hover:bg-gray-50 rounded-md"
                >
                  <div className="text-sm font-medium text-gray-900">{page.title}</div>
                  {page.categoryName && (
                    <div className="text-xs text-gray-500">{page.categoryName}</div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
