import { getAllWikiData } from "@/lib/markdown";
import WikiObsidianClient from "@/components/WikiObsidianClient";

// 增量静态再生成：每 5 分钟重新验证
export const revalidate = 300;

export default async function WikiLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: { slug?: string[] };
}) {
  const { pages, categoryTree, searchIndex } = await getAllWikiData();

  let initialSlug: string | undefined;
  if (params?.slug) {
    initialSlug = params.slug
      .map(decodeURIComponent)
      .join("/")
      .replace(/\.md$/, "");
  }

  return (
    <WikiObsidianClient
      pages={pages}
      categoryTree={categoryTree}
      searchIndex={searchIndex}
      initialSlug={initialSlug}
    >
      {children}
    </WikiObsidianClient>
  );
}
