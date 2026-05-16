"use client";

import Link from "next/link";

interface ContentAreaProps {
  children?: React.ReactNode;
  breadcrumb?: { name: string; href?: string }[];
}

export default function ContentArea({ children, breadcrumb }: ContentAreaProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 面包屑导航 */}
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="px-3 md:px-6 py-2 md:py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <ol className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm text-gray-500">
          {breadcrumb.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <span className="mx-1 md:mx-2 text-gray-400">/</span>}
              {item.href ? (
                <Link href={item.href} className="hover:text-gray-700 hover:underline">
                  {item.name}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{item.name}</span>
              )}
            </li>
          ))}
          </ol>
        </nav>
      )}

      {/* 内容区域 - 直接渲染，无闪烁 */}
      <div className="flex-1 overflow-y-auto relative flex flex-col">
        <div className="flex-1 flex flex-col">
          {children ? children : <EmptyState />}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-gray-500">
      <div className="text-6xl mb-4">📚</div>
      <h2 className="text-xl font-medium mb-2">请从左侧选择一个页面</h2>
      <p className="text-sm">浏览文件夹树来查看你的知识库内容</p>
    </div>
  );
}
