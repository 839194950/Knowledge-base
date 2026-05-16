import { getAllWikiPages } from "@/lib/markdown";
import Footer from "@/components/Footer";
import Link from "next/link";

export default async function TagsPage({
  searchParams,
}: {
  searchParams: { tag?: string };
}) {
  const pages = await getAllWikiPages();
  const selectedTag = searchParams.tag;

  const allTags = Array.from(new Set(pages.flatMap((page) => page.tags))).sort();

  const filteredPages = selectedTag
    ? pages.filter((page) => page.tags.includes(selectedTag))
    : [];

  return (
    <>
      <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight mb-8">标签</h1>

        <div className="mb-12">
          <h2 className="text-lg font-semibold mb-4">所有标签</h2>
          {allTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags?tag=${tag}`}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedTag === tag
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted hover:bg-accent/10"
                  }`}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">还没有标签</p>
          )}
        </div>

        {selectedTag && (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              包含 #{selectedTag} 的页面 ({filteredPages.length})
            </h2>
            {filteredPages.length > 0 ? (
              <div className="grid gap-4">
                {filteredPages.map((page) => (
                  <Link
                    key={page.slug}
                    href={`/wiki/${page.slug}`}
                    className="block p-6 border border-border rounded-lg bg-card hover:border-accent/50 transition-colors"
                  >
                    <h3 className="text-lg font-medium mb-1">{page.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {page.description}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">没有找到相关页面</p>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
