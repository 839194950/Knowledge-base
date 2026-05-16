import { getWikiIndexPage } from "@/lib/markdown";
import MarkdownRenderer from "@/components/MarkdownRenderer";

export default async function Home() {
  const indexPage = await getWikiIndexPage();
  
  if (!indexPage) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-6">Wiki Index</h1>
          <p className="mb-4">加载失败，请访问 /wiki</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <MarkdownRenderer content={indexPage.content} />
      </div>
    </div>
  );
}
