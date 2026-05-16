# 个人知识库系统实施计划

**Goal:** 基于 Karpathy 的 LLM Wiki 模式，构建一个带前端展示和搜索功能的个人知识库系统，支持 Obsidian 集成，可部署到 Vercel。

**Architecture:**
- 三层架构：Raw Sources（原始源）→ Wiki（AI 整理的知识库）→ Next.js 前端展示
- 本地 AI 处理内容，Git 版本控制，Vercel 部署
- Algolia 提供搜索功能，Soft 风格 UI 设计

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Algolia, react-markdown, Framer Motion

---

## 任务列表

### Task 1: 初始化项目目录结构

**Files:**
- Create: `raw/articles/`
- Create: `raw/papers/`
- Create: `raw/images/`
- Create: `raw/pdfs/`
- Create: `raw/audio/`
- Create: `raw/video/`
- Create: `wiki/entities/`
- Create: `wiki/concepts/`
- Create: `wiki/summaries/`
- Create: `wiki/index.md`
- Create: `wiki/log.md`

**Step 1: 创建目录结构**
```bash
mkdir -p raw/articles raw/papers raw/images raw/pdfs raw/audio raw/video
mkdir -p wiki/entities wiki/concepts wiki/summaries
```

**Step 2: 创建初始 wiki/index.md**
```markdown
# Wiki Index

## 概述
这是个人知识库的内容索引。

## 分类

### 实体页面
暂无

### 概念页面
暂无

### 摘要页面
暂无
```

**Step 3: 创建初始 wiki/log.md**
```markdown
# Change Log

## [2026-05-12] 初始化
- 创建知识库目录结构
- 初始化 index.md 和 log.md
```

---

### Task 2: 创建 AGENTS.md 规则文件

**Files:**
- Create: `AGENTS.md`

**Step 1: 编写完整的 AGENTS.md**

```markdown
# 知识库维护代理规则

## 角色定义

你是一位专业的知识库维护者（Knowledge Base Curator），负责管理和维护这个个人知识库系统。你的职责是确保知识被准确记录、妥善组织、持续更新，并且易于检索和理解。

## 核心原则

1. **知识复利原则** - 每次新增内容都应与现有知识建立连接，让知识库随时间变得更有价值
2. **保持一致** - 所有页面遵循统一的格式和风格
3. **双向链接优先** - 尽可能使用 [[Page Name]] 格式建立页面间的连接
4. **持久化存储** - 有价值的对话和分析应当被存回知识库，而不是消失在聊天历史中

## 目录结构规范

```
/
├── raw/                    # 原始源文件（不可变！只读不写）
│   ├── articles/          # 文章
│   ├── papers/            # 论文
│   ├── images/            # 图片
│   ├── pdfs/              # PDF 文件
│   ├── audio/             # 音频
│   └── video/             # 视频
├── wiki/                   # AI 生成的知识库（你拥有这个目录）
│   ├── entities/          # 实体页面（人物、项目、工具、概念等）
│   ├── concepts/          # 概念解释页面
│   ├── summaries/         # 源文件摘要
│   ├── index.md           # 内容索引（必须保持更新）
│   └── log.md             # 操作日志（必须保持更新）
└── AGENTS.md              # 本文件
```

## 页面格式规范

### YAML Frontmatter

所有 wiki 页面必须包含以下 frontmatter：

```markdown
---
title: 页面标题
created: 2026-05-12
updated: 2026-05-12
tags: [tag1, tag2]
sources: [源文件路径]
confidence: high/medium/low
---
```

### 双向链接

使用 `[[Page Name]]` 格式链接到其他 wiki 页面。

### 引用来源

使用 `^[source.md:12-34]` 格式引用具体来源位置。

## 工作流

### 1. Ingest - 摄入新源

**命令:** `/ingest <源文件路径>`

**步骤:**

1. **阅读源文件** - 仔细阅读 raw/ 目录下的源文件
2. **讨论要点** - 与用户讨论关键信息和重点
3. **创建摘要页** - 在 wiki/summaries/ 创建源文件的摘要
4. **更新实体页** - 识别并创建/更新相关的实体页面
5. **更新概念页** - 识别并创建/更新相关的概念页面
6. **建立交叉引用** - 在相关页面间建立双向链接
7. **更新 index.md** - 添加新页面到索引
8. **追加 log.md** - 记录本次 ingest 操作

### 2. Query - 查询知识库

**命令:** `/query <问题>`

**步骤:**

1. **读取 index.md** - 先查看索引了解有哪些页面
2. **检索相关页面** - 读取可能相关的 wiki 页面
3. **综合回答** - 基于知识库内容给出带引用的回答
4. **持久化（可选）** - 如果回答有价值，询问用户是否存为新页面

### 3. Lint - 健康检查

**命令:** `/lint`

**步骤:**

1. **检查一致性** - 查找页面间的矛盾
2. **检查过期信息** - 识别被新来源推翻的旧声明
3. **检查孤立页面** - 查找没有入站链接的页面
4. **检查缺失页面** - 识别被提及但不存在的概念
5. **检查缺失链接** - 寻找应该建立但未建立的交叉引用
6. **提供建议** - 给出改进建议和新的探索方向

## 页面类型指南

### 实体页面 (wiki/entities/)

格式：
- 名称和简短描述
- 关键属性/特性
- 相关概念链接
- 来源引用

### 概念页面 (wiki/concepts/)

格式：
- 定义
- 详细解释
- 相关概念
- 示例（如有）
- 来源引用

### 摘要页面 (wiki/summaries/)

格式：
- 源文件元数据
- 核心要点
- 关键引用
- 相关实体/概念链接

## 特殊文件维护

### index.md

必须维护的结构：
- 实体页面列表（带一句话摘要）
- 概念页面列表（带一句话摘要）
- 摘要页面列表（带一句话摘要）
- 按标签分类的索引

### log.md

必须追加的格式：
```markdown
## [YYYY-MM-DD] <操作类型> | <描述>
- 详细变更1
- 详细变更2
```

## 注意事项

1. **永远不要修改 raw/ 目录** - raw/ 是只读的源文件
2. **Wiki 是你的工作区** - 你可以自由修改 wiki/ 下的任何文件
3. **Git 是安全网** - 所有更改都在版本控制中，可以回滚
4. **优先问用户** - 不确定如何处理时，先询问用户偏好
5. **小步迭代** - 一次 ingest 只处理一个源文件，保持用户参与

---

祝你维护愉快！ 📚
```

---

### Task 3: 初始化 Next.js 项目

**Files:**
- Create: `package.json`
- Create: `next.config.js`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `.gitignore`

**Step 1: 创建 package.json**

```json
{
  "name": "personal-knowledge-base",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "15.0.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "react-markdown": "^9.0.1",
    "remark-gfm": "^4.0.0",
    "remark-breaks": "^4.0.0",
    "rehype-raw": "^7.0.0",
    "rehype-shiki": "^0.2.4",
    "framer-motion": "^11.0.0",
    "algoliasearch": "^5.0.0",
    "react-instantsearch": "^7.0.0",
    "date-fns": "^3.0.0",
    "gray-matter": "^4.0.3"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "15.0.0"
  }
}
```

**Step 2: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{"name": "next"}],
    "paths": {"@/*": ["./src/*"]}
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Step 3: 创建 next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;
```

**Step 4: 创建 tailwind.config.ts**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

**Step 5: 创建 postcss.config.js**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Step 6: 创建 .gitignore**

```
# Dependencies
node_modules/

# Build
.next/
out/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*
```

---

### Task 4: 创建 Next.js 基础结构和样式

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `src/lib/utils.ts`
- Create: `src/lib/markdown.ts`

**Step 1: 创建 src/app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #fafafa;
  --foreground: #171717;
  --card: #ffffff;
  --card-foreground: #171717;
  --muted: #f5f5f5;
  --muted-foreground: #737373;
  --border: #e5e5e5;
  --accent: #262626;
  --accent-foreground: #ffffff;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
    --card: #171717;
    --card-foreground: #ededed;
    --muted: #262626;
    --muted-foreground: #a3a3a3;
    --border: #262626;
    --accent: #ffffff;
    --accent-foreground: #000000;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: var(--font-sans);
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

**Step 2: 创建 src/app/layout.tsx**

```tsx
import type { Metadata } from "next";
import { Inter, Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const serif = Noto_Serif_SC({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "个人知识库",
  description: "基于 LLM Wiki 模式的个人知识管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${sans.variable} ${serif.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

**Step 3: 创建 src/app/page.tsx**

```tsx
import Link from "next/link";
import { getAllWikiPages } from "@/lib/markdown";

export default async function Home() {
  const pages = await getAllWikiPages();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            个人知识库
          </h1>
          <p className="text-muted-foreground text-lg">
            基于 LLM Wiki 模式的知识管理系统
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid gap-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">最新内容</h2>
            <div className="grid gap-4">
              {pages.slice(0, 10).map((page) => (
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
          </section>
        </div>
      </main>

      <footer className="border-t border-border mt-24">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center text-muted-foreground text-sm">
          <p>Built with Next.js & LLM Wiki</p>
        </div>
      </footer>
    </div>
  );
}
```

**Step 4: 创建 src/lib/utils.ts**

```typescript
export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
```

**Step 5: 创建 src/lib/markdown.ts**

```typescript
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

const WIKI_DIR = path.join(process.cwd(), "wiki");

export interface WikiPage {
  slug: string;
  title: string;
  description: string;
  content: string;
  created: string;
  updated: string;
  tags: string[];
  sources: string[];
}

export async function getAllWikiPages(): Promise<WikiPage[]> {
  const pages: WikiPage[] = [];

  async function walk(dir: string, baseSlug = "") {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath, `${baseSlug}/${entry.name}`);
      } else if (entry.name.endsWith(".md") && entry.name !== "index.md" && entry.name !== "log.md") {
        const slug = `${baseSlug}/${entry.name.replace(".md", "")}`.replace(/^\//, "");
        const page = await getWikiPageBySlug(slug);
        if (page) pages.push(page);
      }
    }
  }

  await walk(WIKI_DIR);
  return pages.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
}

export async function getWikiPageBySlug(slug: string): Promise<WikiPage | null> {
  const filePath = path.join(WIKI_DIR, `${slug}.md`);

  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    return {
      slug,
      title: data.title || slug.split("/").pop() || slug,
      description: content.split("\n").find((l) => l.trim()) || "",
      content,
      created: data.created || new Date().toISOString().split("T")[0],
      updated: data.updated || new Date().toISOString().split("T")[0],
      tags: data.tags || [],
      sources: data.sources || [],
    };
  } catch {
    return null;
  }
}
```

---

### Task 5: 创建 Markdown 渲染组件和 Wiki 页面

**Files:**
- Create: `src/components/MarkdownRenderer.tsx`
- Create: `src/app/wiki/[slug]/page.tsx`
- Create: `src/components/Header.tsx`
- Create: `src/components/Footer.tsx`

**Step 1: 创建 src/components/Header.tsx**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold tracking-tight">
            知识库
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm transition-colors ${
                pathname === "/" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              首页
            </Link>
            <Link
              href="/search"
              className={`text-sm transition-colors ${
                pathname === "/search" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              搜索
            </Link>
            <Link
              href="/tags"
              className={`text-sm transition-colors ${
                pathname === "/tags" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              标签
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
```

**Step 2: 创建 src/components/Footer.tsx**

```tsx
export default function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-4xl mx-auto px-6 py-8 text-center text-muted-foreground text-sm">
        <p>个人知识库 · Powered by LLM Wiki</p>
      </div>
    </footer>
  );
}
```

**Step 3: 创建 src/components/MarkdownRenderer.tsx**

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-stone dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="text-3xl font-bold mt-8 mb-4 tracking-tight" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-2xl font-semibold mt-6 mb-3 tracking-tight" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-xl font-medium mt-5 mb-2" {...props} />
          ),
          p: ({ ...props }) => (
            <p className="leading-7 mb-4" {...props} />
          ),
          ul: ({ ...props }) => (
            <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />
          ),
          li: ({ ...props }) => (
            <li className="leading-7" {...props} />
          ),
          blockquote: ({ ...props }) => (
            <blockquote className="border-l-4 border-muted pl-4 py-1 my-4 text-muted-foreground" {...props} />
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm my-4">
                <code className={className} {...props}>{children}</code>
              </pre>
            ) : (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>{children}</code>
            );
          },
          a: ({ ...props }) => (
            <a className="text-foreground underline underline-offset-4 hover:text-accent transition-colors" {...props} />
          ),
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse" {...props} />
            </div>
          ),
          th: ({ ...props }) => (
            <th className="border border-border px-4 py-2 bg-muted text-left font-medium" {...props} />
          ),
          td: ({ ...props }) => (
            <td className="border border-border px-4 py-2" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
```

**Step 4: 更新 src/app/layout.tsx，集成 Header 和 Footer**

修改 layout.tsx，引入 Header 和 Footer：

```tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ... 在 return 中:
return (
  <html lang="zh-CN">
    <body className={`${sans.variable} ${serif.variable} antialiased min-h-screen flex flex-col`}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </body>
  </html>
);
```

**Step 5: 创建 src/app/wiki/[slug]/page.tsx**

```tsx
import { notFound } from "next/navigation";
import { getWikiPageBySlug } from "@/lib/markdown";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function WikiPage({ params }: { params: { slug: string } }) {
  const page = await getWikiPageBySlug(params.slug);

  if (!page) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
      <header className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground">首页</Link>
          <span>·</span>
          <span>{params.slug}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">{page.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>创建于 {formatDate(page.created)}</span>
          {page.updated !== page.created && <span>更新于 {formatDate(page.updated)}</span>}
        </div>
        {page.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {page.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags?tag=${tag}`}
                className="px-3 py-1 bg-muted rounded-full text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      <div className="border-t border-border pt-8">
        <MarkdownRenderer content={page.content} />
      </div>

      {page.sources.length > 0 && (
        <div className="mt-12 pt-8 border-t border-border">
          <h2 className="text-lg font-semibold mb-4">来源</h2>
          <ul className="text-muted-foreground text-sm">
            {page.sources.map((source, idx) => (
              <li key={idx}>{source}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
```

---

### Task 6: 创建搜索页面和标签页面

**Files:**
- Create: `src/app/search/page.tsx`
- Create: `src/app/tags/page.tsx`
- Create: `src/components/SearchBar.tsx`

**Step 1: 创建 src/components/SearchBar.tsx**

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索知识库..."
          className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-accent text-accent-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          搜索
        </button>
      </div>
    </form>
  );
}
```

**Step 2: 创建 src/app/search/page.tsx**

```tsx
import { getAllWikiPages } from "@/lib/markdown";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const pages = await getAllWikiPages();
  const query = searchParams.q || "";

  const filteredPages = query
    ? pages.filter((page) =>
        page.title.toLowerCase().includes(query.toLowerCase()) ||
        page.content.toLowerCase().includes(query.toLowerCase()) ||
        page.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight mb-8">搜索</h1>

      <div className="mb-12">
        <SearchBar />
      </div>

      {query && (
        <div className="mb-6">
          <p className="text-muted-foreground">
            搜索 "{query}" 找到 {filteredPages.length} 个结果
          </p>
        </div>
      )}

      {filteredPages.length > 0 && (
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
              {page.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {page.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-muted rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {query && filteredPages.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>没有找到相关结果</p>
        </div>
      )}
    </div>
  );
}
```

**Step 3: 创建 src/app/tags/page.tsx**

```tsx
import { getAllWikiPages } from "@/lib/markdown";
import Link from "next/link";

export default async function TagsPage({ searchParams }: { searchParams: { tag?: string } }) {
  const pages = await getAllWikiPages();
  const selectedTag = searchParams.tag;

  const allTags = Array.from(new Set(pages.flatMap((page) => page.tags))).sort();

  const filteredPages = selectedTag
    ? pages.filter((page) => page.tags.includes(selectedTag))
    : [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight mb-8">标签</h1>

      <div className="mb-12">
        <h2 className="text-lg font-semibold mb-4">所有标签</h2>
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
      </div>

      {selectedTag && (
        <div>
          <h2 className="text-lg font-semibold mb-4">
            包含 #{selectedTag} 的页面 ({filteredPages.length})
          </h2>
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
        </div>
      )}
    </div>
  );
}
```

---

### Task 7: 创建 README.md 文档

**Files:**
- Create: `README.md`

**Step 1: 编写完整的 README.md**

```markdown
# 个人知识库系统

基于 Karpathy 的 LLM Wiki 模式构建的个人知识管理系统，拥有美观的前端展示、强大的搜索功能、天然的 Obsidian 集成，支持一键部署到 Vercel。

## ✨ 特性

- 📚 **LLM Wiki 架构** - 原始源 + AI 整理的知识库 + 规则定义三层结构
- 🎨 **Soft 风格 UI** - 柔和奢华的设计风格，优质的排版体验
- 🔍 **智能搜索** - 快速搜索所有内容
- 🏷️ **标签系统** - 灵活的内容分类
- 🔗 **双向链接** - 支持 Obsidian 风格的 [[Page Name]] 链接
- 📝 **Obsidian 集成** - 直接用 Obsidian 打开 wiki 目录进行编辑
- 🚀 **Vercel 部署** - 一键部署，持续集成

## 📁 目录结构

```
个人知识库网站/
├── raw/                    # 原始源文件（不可变）
│   ├── articles/          # 文章
│   ├── papers/            # 论文
│   ├── images/            # 图片
│   ├── pdfs/              # PDF
│   ├── audio/             # 音频
│   └── video/             # 视频
├── wiki/                   # AI 生成的知识库
│   ├── entities/          # 实体页面
│   ├── concepts/          # 概念页面
│   ├── summaries/         # 摘要页面
│   ├── index.md           # 内容索引
│   └── log.md             # 操作日志
├── src/                    # Next.js 前端
│   ├── app/               # App Router
│   ├── components/        # 组件
│   └── lib/               # 工具库
├── AGENTS.md              # AI 规则文件（核心！）
└── README.md              # 本文件
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 本地开发

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看效果。

### 3. 构建生产版本

```bash
npm run build
npm start
```

### 4. 部署到 Vercel

1. 将代码推送到 GitHub 仓库
2. 在 Vercel 中导入仓库
3. 一键部署！

## 📖 使用指南

### 添加新内容

1. 将原始文件放入 `raw/` 对应目录
2. 使用 `/ingest <文件路径>` 命令让 AI 处理
3. AI 会自动创建摘要、更新实体/概念页面、建立交叉引用

### 查询知识库

使用 `/query <你的问题>` 命令向知识库提问。

### 健康检查

使用 `/lint` 命令检查知识库的一致性和完整性。

### Obsidian 使用

1. 打开 Obsidian
2. 选择 "打开文件夹作为 vault"
3. 选择本项目的 `wiki/` 目录
4. 开始编辑！

## 🤖 AI 命令

- `/ingest <源文件路径>` - 处理新源文件，更新知识库
- `/query <问题>` - 基于知识库回答问题
- `/lint` - 健康检查和维护

## 🛠️ 技术栈

- **框架**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS, Framer Motion
- **Markdown**: react-markdown, remark, rehype
- **搜索**: 本地搜索（可选 Algolia）
- **部署**: Vercel

## 📝 注意事项

- 永远不要手动修改 `raw/` 目录外的源文件
- `wiki/` 目录由 AI 维护，但你也可以手动编辑
- 所有内容都在 Git 版本控制中，可随时回滚
- Obsidian vault 路径设为 `wiki/` 目录

## 📄 许可证

MIT

## 🙏 致谢

- [Andrej Karpathy 的 LLM Wiki 理念](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
```

---

### Task 8: 安装依赖并测试

**Files:**
- Run: npm install
- Run: npm run dev

**Step 1: 安装依赖**

```bash
npm install
```

**Step 2: 启动开发服务器**

```bash
npm run dev
```

---

## 总结

本计划涵盖了从目录结构初始化到完整功能实现的所有步骤。按照此计划执行后，你将拥有一个功能完整、设计精美的个人知识库系统！

**预计任务数：8 个主要任务，每个包含 2-5 个小步骤**
