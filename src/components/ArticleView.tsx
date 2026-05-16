"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { formatDate } from "@/lib/utils";
import type { WikiPage } from "@/lib/markdown";

const MarkdownRenderer = dynamic(() => import("./MarkdownRenderer"), {
  ssr: false,
});

interface ArticleViewProps {
  page: WikiPage;
  allPages: WikiPage[];
}

export default function ArticleView({ page, allPages }: ArticleViewProps) {
  const outLinkPages = allPages.filter(p => page.outLinks.includes(p.slug));
  const inLinkPages = allPages.filter(p => page.inLinks.includes(p.slug));

  return (
    <article className="max-w-full md:max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 md:mb-4">{page.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-muted-foreground">
          <span>创建于 {formatDate(page.created)}</span>
          {page.updated !== page.created && (
            <span>更新于 {formatDate(page.updated)}</span>
          )}
        </div>
        {page.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 md:gap-3 mt-3 md:mt-4">
            {page.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags?tag=${tag}`}
                className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200 rounded-xl text-xs md:text-sm font-medium hover:from-purple-100 hover:to-pink-100 hover:text-purple-900 hover:border-purple-300 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
              >
                # {tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      <div className="border-t border-gray-200 pt-6 md:pt-8">
        <MarkdownRenderer content={page.content} />
      </div>

      {(outLinkPages.length > 0 || inLinkPages.length > 0) && (
        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-200">
          <div className="grid gap-6 md:gap-8 md:grid-cols-2">
            {outLinkPages.length > 0 && (
              <section>
                <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">提到</h2>
                <ul className="space-y-1.5 md:space-y-2">
                  {outLinkPages.map((linkedPage) => (
                    <li key={linkedPage.slug}>
                      <Link
                        href={`/wiki/${linkedPage.slug}`}
                        className="text-purple-600 hover:text-purple-800 underline underline-offset-2 transition-colors text-sm"
                      >
                        {linkedPage.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            
            {inLinkPages.length > 0 && (
              <section>
                <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">被提及</h2>
                <ul className="space-y-1.5 md:space-y-2">
                  {inLinkPages.map((linkedPage) => (
                    <li key={linkedPage.slug}>
                      <Link
                        href={`/wiki/${linkedPage.slug}`}
                        className="text-purple-600 hover:text-purple-800 underline underline-offset-2 transition-colors text-sm"
                      >
                        {linkedPage.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      )}

      {page.sources.length > 0 && (
        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-200">
          <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">来源</h2>
          <ul className="text-xs md:text-sm">
            {page.sources.map((source, idx) => {
              const encodedPath = source
                .split("/")
                .map((part) => encodeURIComponent(part))
                .join("/");
              
              return (
                <li key={idx}>
                  <Link
                    href={`/${encodedPath}`}
                    className="text-purple-600 hover:text-purple-800 underline underline-offset-2 transition-colors"
                  >
                    {source}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </article>
  );
}