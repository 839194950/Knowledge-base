"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import Link from "next/link";
import { Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

let mermaidInitialized = false;

// 预处理 Mermaid 代码，转义常见的问题字符
function preprocessMermaidCode(code: string): string {
  let processed = code;
  
  // 处理 flowchart 或 graph 中的节点标签
  processed = processed.replace(
    /(\[.*?)(\[\[.*?\]\])(.*?\])/g,
    (match, before, inner, after) => {
      const escapedInner = inner.replace(/\[\[/g, '"').replace(/\]\]/g, '"');
      return before + escapedInner + after;
    }
  );
  
  // 如果有单独的 [[ 或 ]]，也进行转义
  processed = processed.replace(
    /(\[.*?)(\[\[)(.*?\])/g,
    (match, before, leftBracket, after) => {
      return before + '"' + after;
    }
  );
  
  processed = processed.replace(
    /(\[.*?)(\]\])(.*?\])/g,
    (match, before, rightBracket, after) => {
      return before + '"' + after;
    }
  );
  
  return processed;
}

function MermaidRenderer({ code }: { code: string }) {
  const [rendered, setRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    const mermaidId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    const render = async () => {
      try {
        if (!mermaidInitialized) {
          const mermaid = await import("mermaid");
          mermaid.default.initialize({
            startOnLoad: false,
            theme: "default",
            securityLevel: "loose",
            flowchart: {
              useMaxWidth: true,
              htmlLabels: true,
              curve: "linear",
            },
            themeVariables: {
              primaryColor: "#6b21a8",
              primaryTextColor: "#1f2937",
              primaryBorderColor: "#374151",
              lineColor: "#374151",
              secondaryColor: "#f3f4f6",
              tertiaryColor: "#f97316",
            },
          });
          mermaidInitialized = true;
        }

        const mermaid = await import("mermaid");
        
        if (!mounted) return;
        
        const processedCode = preprocessMermaidCode(code);
        
        const result = await mermaid.default.render(mermaidId, processedCode);
        
        if (mounted) {
          setSvgContent(result.svg);
          setRendered(true);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "渲染失败");
          setRendered(true);
          console.error("Mermaid render error:", err);
          console.error("Failed code:", code);
        }
      }
    };

    render();
    return () => { mounted = false; };
  }, [code]);

  if (!rendered) {
    return (
      <div className="my-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-200">
          <span className="text-xs font-medium text-gray-600 uppercase">mermaid</span>
        </div>
        <div className="bg-white p-4 min-h-[120px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="text-sm text-gray-500">渲染中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-200">
          <span className="text-xs font-medium text-gray-600 uppercase">mermaid</span>
        </div>
        <div className="bg-red-50 p-4">
          <div className="text-red-500">
            <p className="font-medium mb-2">Mermaid 渲染错误:</p>
            <pre className="text-sm whitespace-pre-wrap font-mono">{error}</pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-200">
        <span className="text-xs font-medium text-gray-600 uppercase">mermaid</span>
      </div>
      <div 
        className="bg-white p-4 overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: svgContent }} 
      />
    </div>
  );
}

export default function MarkdownRenderer({ content }: { content: string }) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getCodeContent = (children: any): string => {
    if (typeof children === "string") return children;
    if (Array.isArray(children)) {
      return children.map(getCodeContent).join("\n");
    }
    if (children && typeof children === "object") {
      if (typeof children.props?.children === "string") {
        return children.props.children;
      }
      if (Array.isArray(children.props?.children)) {
        return children.props.children.map(getCodeContent).join("\n");
      }
    }
    return "";
  };

  const isMermaidCode = (text: string): boolean => {
    const trimmed = text.trim();
    return trimmed.startsWith("graph") || 
           trimmed.startsWith("flowchart") || 
           trimmed.startsWith("sequenceDiagram") ||
           trimmed.startsWith("classDiagram") ||
           trimmed.startsWith("stateDiagram") ||
           trimmed.startsWith("pie") ||
           trimmed.startsWith("gantt") ||
           trimmed.startsWith("journey") ||
           trimmed.startsWith("mindmap") ||
           trimmed.startsWith("timeline");
  };

  return (
    <div className="prose prose-stone dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: (props) => (
            <h1
              className="text-4xl font-extrabold mt-10 mb-6 tracking-tight text-gray-900 border-b-2 border-purple-200 pb-3"
              {...props}
            />
          ),
          h2: (props) => (
            <h2
              className="text-2.5xl font-bold mt-9 mb-5 tracking-tight text-gray-800 pl-4 border-l-4 border-purple-400"
              {...props}
            />
          ),
          h3: (props) => (
            <h3
              className="text-xl font-semibold mt-7 mb-4 text-gray-700 flex items-center gap-2"
              {...props}
            >
              <span className="text-purple-500 font-bold">●</span>
              {props.children}
            </h3>
          ),
          h4: (props) => (
            <h4
              className="text-lg font-medium mt-6 mb-3 text-gray-600 italic"
              {...props}
            />
          ),
          p: (props) => <p className="leading-7 mb-4" {...props} />,
          ul: (props) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
          ol: (props) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
          li: (props) => <li className="leading-7" {...props} />,
          blockquote: (props) => (
            <blockquote className="border-l-4 border-purple-400 pl-4 italic text-gray-600 my-4" {...props} />
          ),
          hr: (props) => <hr className="border-gray-200 my-8" {...props} />,
          a: ({ href, children, ...props }) => {
            if (href?.includes("/wiki/missing/concept/")) {
              return (
                <Link
                  href={href}
                  className="text-yellow-600 underline underline-offset-2 hover:text-yellow-800 transition-colors border-b border-dashed border-yellow-300"
                  title="该概念页面尚未创建 - 点击查看详情"
                  {...props}
                >
                  {children}
                </Link>
              );
            }
            if (href?.startsWith("/wiki/")) {
              return (
                <Link
                  href={href}
                  className="text-purple-600 underline underline-offset-2 hover:text-purple-800 transition-colors"
                  {...props}
                >
                  {children}
                </Link>
              );
            }
            return (
              <a
                href={href}
                className="text-purple-600 underline underline-offset-2 hover:text-purple-800 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            );
          },
          table: (props) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border-collapse" {...props} />
            </div>
          ),
          thead: (props) => <thead className="bg-gray-50" {...props} />,
          tbody: (props) => <tbody className="divide-y divide-gray-200" {...props} />,
          tr: (props) => <tr className="hover:bg-gray-50 transition-colors" {...props} />,
          th: (props) => (
            <th
              className="px-4 py-3 text-left text-sm font-semibold border border-gray-200 bg-gray-50"
              {...props}
            />
          ),
          td: (props) => (
            <td className="px-4 py-3 text-sm border border-gray-200 align-top" {...props} />
          ),
          pre: ({ className, children, ...props }) => {
            const codeContent = getCodeContent(children);
            
            if (isMermaidCode(codeContent)) {
              return <MermaidRenderer code={codeContent} />;
            }

            let language = "text";
            if (children && typeof children === "object") {
              if (children.props?.className) {
                const match = children.props.className.match(/language-(\w+)/);
                if (match) {
                  language = match[1];
                }
              } else if (Array.isArray(children) && children[0]?.props?.className) {
                const match = children[0].props.className.match(/language-(\w+)/);
                if (match) {
                  language = match[1];
                }
              }
            }

            return (
              <div className="my-6 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
                <div className="flex items-center justify-between bg-gray-800 px-4 py-2.5 border-b border-gray-700">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    {language}
                  </span>
                  <button
                    onClick={() => copyToClipboard(codeContent)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    title="复制代码"
                  >
                    {copiedCode === codeContent ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-green-400">已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>复制</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <SyntaxHighlighter
                    language={language}
                    style={oneDark}
                    customStyle={{
                      margin: 0,
                      borderRadius: 0,
                      borderTopLeftRadius: 0,
                      borderTopRightRadius: 0,
                      fontSize: "14px",
                      lineHeight: "1.6",
                      padding: "16px",
                    }}
                    showLineNumbers={false}
                    wrapLines={true}
                    wrapLongLines={true}
                  >
                    {codeContent}
                  </SyntaxHighlighter>
                </div>
              </div>
            );
          },
          code: ({ node, className, children, ...props }) => {
            const parentTagName = node?.parent?.tagName;
            const isInline = !parentTagName || parentTagName !== "PRE";
            
            if (isInline) {
              return (
                <code
                  className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            
            return <code className={className} {...props}>{children}</code>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
