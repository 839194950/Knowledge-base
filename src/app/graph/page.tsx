import { getGraphData } from "@/lib/markdown";
import GraphWrapper from "@/components/GraphWrapper";
import Footer from "@/components/Footer";

export default async function GraphPage() {
  const graphData = await getGraphData();

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="px-6 py-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">知识图谱</h1>
          <p className="text-gray-600 mb-8">
            探索知识库中各页面之间的连接关系。点击节点可跳转到对应页面。
          </p>
          <div className="h-[calc(100vh-300px)] w-full rounded-lg border border-gray-200 bg-white overflow-hidden shadow-lg">
            <GraphWrapper initialData={graphData} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
