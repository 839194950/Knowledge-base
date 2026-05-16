import Link from "next/link";

export default async function MissingConceptPage({
  params,
}: {
  params: { name: string };
}) {
  const conceptName = decodeURIComponent(params.name);

  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <div className="mb-8">
        <Link href="/wiki" className="text-purple-600 hover:underline mb-4 inline-block">
          ← 返回 Wiki
        </Link>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
        <div className="text-yellow-600 text-6xl mb-4">📚</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          概念尚未收录
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          <span className="font-semibold text-yellow-700">{conceptName}</span>
        </p>
        <p className="text-gray-500 mb-8">
          这个概念在知识库中被引用，但尚未创建专门的页面。
        </p>

        <div className="space-y-4">
          <Link
            href="/wiki/missing"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            查看所有缺失概念
          </Link>
        </div>
      </div>

      <div className="mt-8 text-gray-400 text-sm">
        <p>💡 提示：你可以建议创建这个概念页面！</p>
      </div>
    </div>
  );
}
