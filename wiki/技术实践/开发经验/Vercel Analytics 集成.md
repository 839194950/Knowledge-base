---
title: Vercel 官方工具集成
created: 2026-05-16
updated: 2026-05-16
categories: [技术实践, 开发经验]
categoryPath: "技术实践/开发经验"
tags: [Vercel, Analytics, Speed Insights, Next.js]
sources: []
confidence: high
---

# Vercel 官方工具集成

## 概述

Vercel 提供了两个官方的分析工具：

- **Vercel Analytics** - 网络流量分析工具，用于追踪访问者、页面浏览量、热门页面、引荐来源等数据
- **Vercel Speed Insights** - 网站性能监控工具，用于测量和分析网站的加载性能

## Vercel Analytics 集成

### 1. 安装依赖包

```bash
npm i @vercel/analytics
```

### 2. 在根布局中添加组件

在 `src/app/layout.tsx` 中：

```tsx
import { Analytics } from '@vercel/analytics/next';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
```

### 3. 在 Vercel 控制台启用功能

部署后，在 Vercel 项目控制台的 Analytics 标签页中点击 Enable 按钮启用 Web Analytics。

### Vercel Analytics 主要功能

- 📊 访问者和页面浏览量统计
- 🎯 热门页面和引荐来源分析
- 👥 用户人口统计数据
- ⚡ 性能指标监控（FCP、LCP、CLS、INP 等）
- 🔧 自定义事件追踪（Pro/Enterprise 计划）

---

## Vercel Speed Insights 集成

### 1. 安装依赖包

```bash
npm i @vercel/speed-insights
```

### 2. 在根布局中添加组件

在 `src/app/layout.tsx` 中：

```tsx
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 3. 在 Vercel 控制台启用功能

部署后，在 Vercel 项目控制台的 Speed Insights 标签页中启用功能。

### Vercel Speed Insights 主要功能

- 🚀 Core Web Vitals 监控（LCP、INP、CLS）
- 📈 性能趋势分析
- 📱 设备和地区性能对比
- 🔍 性能问题诊断
- 💡 优化建议

## 相关页面

- [[技术实践/开发经验/Next.js App Router 路由状态保持问题修复]]
