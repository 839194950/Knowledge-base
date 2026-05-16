import { getAllMissingLinks } from "@/lib/markdown";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MissingLinksPage() {
  const missingLinks = await getAllMissingLinks();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/wiki" className="text-purple-600 hover:underline mb-4 inline-block">
          ← 返回 Wiki
        </Link>
        <h1 className="text-4xl font-bold tracking-tight mb-4">缺失概念列表</h1>
        <p className="text-gray-600">
          以下是 Wiki 中引用但尚未创建的概念页面。按引用次数排序。
        </p>
      </div>

      {missingLinks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl">太棒了！所有概念都已创建！🎉</p>
        </div>
      ) : (
        <div className="space-y-6">
          {missingLinks.map((link, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{link.title}</h3>
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">
                  {link.referencedIn.length} 次引用
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p className="mb-2 font-medium">在以下文章中被引用：</p>
                <ul className="list-disc pl-5 space-y-1">
                  {link.referencedIn.map((ref, refIndex) => (
                    <li key={refIndex}>
                      <Link
                        href={`/wiki/${encodeURIComponent(ref.slug)}`}
                        className="text-purple-600 hover:underline"
                      >
                        {ref.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          💡 提示：优先创建被多次引用的概念，这样可以快速完善知识网络！
        </p>
      </div>
    </div>
  );
}
