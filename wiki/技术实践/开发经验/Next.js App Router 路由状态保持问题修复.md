---
title: Next.js App Router 路由状态保持问题修复
created: 2026-05-16
updated: 2026-05-16
categories: [技术实践, 开发经验]
categoryPath: "技术实践/开发经验"
tags: [Next.js, React, App Router, 路由, 前端开发, 状态管理]
sources: []
confidence: high
---

# Next.js App Router 路由状态保持问题修复

## 问题描述

在开发个人知识库网站时，遇到了一个典型的用户体验问题：

**现象：**
- 在左侧目录树中点击切换不同的文章页面时
- 左侧目录树会瞬间滚动到顶部
- 文件夹的展开/折叠状态会重置回初始状态
- 整个页面体验非常不流畅

**期望效果：**
- 点击文章链接时，只有右侧内容区域改变
- 左侧目录树的滚动位置保持不变
- 文件夹的展开/折叠状态保持不变

## 根因分析

### 初步排查

一开始我把问题归结于组件状态管理问题：
1. 尝试在 `localStorage` 中保存和恢复滚动位置
2. 优化状态初始化逻辑，避免重复设置
3. 使用全局单例模式保持状态稳定

但这些尝试都没有完全解决问题，仍然存在闪烁和状态重置的现象。

### 真正的根因

深入分析后发现，问题的根源在于 **Next.js App Router 的页面结构设计**：

**原有的路由结构：**
```
src/app/
├── wiki/
│   ├── page.tsx          # /wiki 页面
│   └── [...slug]/
│       └── page.tsx      # /wiki/xxx 页面
```

**问题所在：**
- `/wiki/page.tsx` 和 `/wiki/[...slug]/page.tsx` 是两个**独立的页面组件**
- 每次路由变化（例如从 `/wiki/a` 到 `/wiki/b`）时，Next.js 会**卸载当前页面组件并重新挂载新的页面组件**
- 尽管使用了全局单例状态，但组件的重新挂载导致所有 UI 状态（包括滚动位置）都被重置

## 解决方案

### 核心思路

利用 Next.js App Router 的 **Layout 机制**：Layout 在同一路由组内的页面切换时不会被重新挂载。

### 文件结构调整

创建 `wiki/layout.tsx`，将主要组件移到 Layout 中：

```
src/app/
├── wiki/
│   ├── layout.tsx       # ✨ 新增：Wiki Layout，保持组件挂载
│   ├── page.tsx         # 简化：只返回 null
│   └── [...slug]/
│       └── page.tsx     # 简化：只返回 null
```

### 代码实现

**1. 创建 `wiki/layout.tsx`**

```typescript
import { getAllWikiData } from "@/lib/markdown";
import WikiObsidianClient from "@/components/WikiObsidianClient";

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
```

**2. 简化页面组件**

`wiki/page.tsx` 和 `wiki/[...slug]/page.tsx` 现在只返回 null：

```typescript
// wiki/page.tsx
export default function WikiIndex() {
  return null;
}

// wiki/[...slug]/page.tsx
export default function WikiPage() {
  return null;
}
```

**3. 优化状态管理**

在 `WikiObsidianClient` 组件中，使用全局单例模式确保状态只初始化一次：

```typescript
// 全局单例状态
let globalState: {
  expandedPaths: Set<string>;
  initialized: boolean;
} | null = null;

// 初始化全局状态
const getOrCreateGlobalState = (defaultPaths: Set<string>) => {
  if (globalState) {
    return globalState.expandedPaths;
  }

  // ... 初始化逻辑
  
  return paths;
};
```

## 效果验证

修复后的效果：

✅ **滚动位置保持** - 左侧目录树的滚动位置在页面切换时完全保持不变  
✅ **展开状态保持** - 文件夹的展开/折叠状态保持不变  
✅ **内容即时更新** - 只有右侧内容区域会更新  
✅ **流畅无闪烁** - 整个体验非常流畅，没有闪烁或跳变  

## 经验教训

### 1. 不要盲目尝试修复

遇到问题时，不要盲目尝试各种"可能的"解决方案：
- 一开始我尝试了多种状态管理技巧，但都没有触达问题本质
- 应该先**停下来，系统性地分析问题根因**

### 2. 理解框架的工作原理

Next.js App Router 的核心机制：
- **Page 组件** - 每个路由对应独立页面，路由变化时重新挂载
- **Layout 组件** - 同一路由组内共享，路由变化时保持挂载
- **理解这些机制是解决问题的关键**

### 3. 使用正确的工具解决问题

对于这种路由相关的状态保持问题：
- ❌ 不要试图用复杂的状态管理技巧绕过框架机制
- ✅ 应该利用框架提供的 Layout 等特性来解决问题

### 4. 架构设计的重要性

这个问题反映了架构设计的重要性：
- 一开始的设计把组件放在 Page 级别，导致路由变化时重新挂载
- 将组件提升到 Layout 级别，就自然解决了状态保持问题

## 相关技术

- [[Next.js]] - React 全栈框架
- [[React]] - UI 构建库
- [[App Router]] - Next.js 13+ 的路由系统
- [[前端开发]] - 前端开发相关知识

## 参考资料

- [Next.js Layouts 官方文档](https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates)
- [Next.js Routing 官方文档](https://nextjs.org/docs/app/building-your-application/routing)
