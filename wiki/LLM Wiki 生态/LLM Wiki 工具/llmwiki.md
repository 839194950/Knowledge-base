---
title: llmwiki
created: 2026-05-12T00:00:00.000Z
updated: 2026-05-16
categories:
  - LLM Wiki 生态
  - LLM Wiki 工具
categoryPath: LLM Wiki 生态/LLM Wiki 工具
tags:
  - 项目
  - 工具
sources:
  - raw/articles/llm-wiki-by-karpathy.md
confidence: high
diagramized: true
diagramizedAt: 2026-05-15
---

# llmwiki

## 概述

llmwiki 是一个基于 [[LLM Wiki 生态/LLM Wiki 基础/LLM Wiki]] 模式的 CLI（命令行）工具，由 ethanj 构建，GitHub 上已经有超过 1000 颗星！它是 LLM Wiki 模式的一个强大实现！

**简单来说：llmwiki = 用命令行就能用的完整 LLM Wiki！**

## 什么是 llmwiki？

llmwiki 是一个功能丰富的 CLI 工具，让你可以在命令行中使用 LLM Wiki 模式！它非常受社区欢迎！

### 核心亮点

| 特点 | 说明 |
|------|------|
| **CLI工具** | 命令行界面，灵活高效 |
| **社区热门** | 超过 1K GitHub stars |
| **功能完整** | 实现了 LLM Wiki 的所有核心功能 |
| **高度可配置** | 类型化 schema，自定义程度高 |

### 形象比喻

想象一下：
- llmwiki = 一个专业的内容工厂
- 你给它原材料
- 它给你高质量的结构化内容
- 自动标注来源，检查一致性！

## 主要功能详解

llmwiki 有很多强大的功能！让我们逐个了解！

### 1. 编译审查功能

```
compile --review
```

这个功能很重要！
- 生成的页面在保存前让你审查
- 你可以批准
- 也可以拒绝
- 不会直接覆盖，安全可控！

### 2. 声明级别的来源标注

这是 llmwiki 的特色功能！

```markdown
^[paper.md:42-58]
```

- 标注具体来源位置
- 精确到行号
- 可追溯
- 可信度高！

### 3. 类型化 Schema 和页面种类

- 定义不同类型的页面
- 种子页面模板
- 结构化内容
- 灵活可扩展！

### 4. 置信度和矛盾元数据

- 置信度标记
- 自动发现矛盾
- 质量有保障
- 问题能预警！

### 5. 多种源文件 Ingest

llmwiki 支持多种格式：
- 图片
- PDF
- 转录（音频/视频转文字）
- 多种来源都能处理！

### 6. BM25 重排序的分块检索

- 分块检索
- BM25 重排序
- 相关度更高
- 搜索更准确！

### 7. 多种导出格式

llmwiki 可以导出多种格式：

| 格式 | 用途 |
|------|------|
| **llms.txt** | 适合给 LLM 阅读的格式 |
| **JSON-LD** | 结构化数据格式 |
| **GraphML** | 图格式，适合可视化 |
| **Marp** | 幻灯片格式（[[笔记与知识管理/笔记工具/Marp]]） |

### 8. MCP 工具

- 支持 MCP（Model Context Protocol）
- 作为 AI 工具使用
- 无缝集成！

### 9. 对话会话 Ingest

- Claude 对话
- Codex 对话
- Cursor 会话
- 都能变成知识！

## 典型工作流程

用 llmwiki 工作是这样的：

1. **Ingest 新源** → 添加新资料
2. **Compile 生成** → 生成 Wiki 页面
3. **Review 审查** → `compile --review` 看一下
4. **Approve 批准** → 确认没问题
5. **Export 导出** → 需要的话导出成其他格式

## 与 LLM Wiki 的关系

llmwiki 完美实现了 [[LLM Wiki 生态/LLM Wiki 基础/LLM Wiki]] 模式！

在 [[LLM Wiki 生态/LLM Wiki 基础/LLM Wiki 三层架构]] 中：
- **Raw Sources** = llmwiki 处理的原始文件
- **The Wiki** = llmwiki 编译生成的页面
- **The Schema** = llmwiki 的配置和规则

## 为什么 llmwiki 受欢迎？

- **简单易用** - CLI 工具，上手快
- **功能强大** - 满足各种需求
- **社区活跃** - 超过 1K stars
- **持续更新** - 不断改进

## 相关概念

- [[LLM Wiki 生态/LLM Wiki 基础/LLM Wiki]] - LLM Wiki 模式
- [[LLM Wiki 生态/LLM Wiki 基础/LLM Wiki 三层架构]] - 三层架构
- [[LLM Wiki 生态/LLM Wiki 基础/LLM Wiki 操作流程]] - 操作流程
- [[笔记与知识管理/笔记工具/Marp]] - Marp 幻灯片工具
- [[LLM Wiki 生态/LLM Wiki 工具/Keel]] - Mac 应用
- [[LLM Wiki 生态/LLM Wiki 工具/qmd]] - 搜索工具

## 总结

llmwiki 是一个非常棒的 LLM Wiki 实现！功能丰富，社区欢迎，是想尝试 LLM Wiki 模式的好选择！

**试试 llmwiki，用命令行管理你的知识库！**
