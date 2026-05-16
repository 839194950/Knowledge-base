---
title: NEXUS
created: 2026-05-12T00:00:00.000Z
updated: 2026-05-16
categories:
  - LLM Wiki 生态
  - LLM Wiki 工具
categoryPath: LLM Wiki 生态/LLM Wiki 工具
tags:
  - 项目
  - 人工智能
sources:
  - raw/articles/llm-wiki-by-karpathy.md
confidence: high
diagramized: true
diagramizedAt: 2026-05-15
---

# NEXUS

## 概述

NEXUS 是一个基于 [[LLM Wiki 生态/LLM Wiki 基础/LLM Wiki]] 模式的多代理记忆系统，由 lrdeoliveira 构建！它是 LLM Wiki 模式的一个完整和复杂的实现！

**简单来说：NEXUS = 6个AI代理 + LLM Wiki + 一堆工具！**

## 什么是 NEXUS？

NEXUS 是一个先进的 AI 代理系统，它完美实现了 LLM Wiki 模式，让多个 AI 代理可以协同工作，共同维护和使用一个知识系统！

### 核心特点

| 特点 | 说明 |
|------|------|
| **多代理** | 6个AI代理协同工作 |
| **完整三层架构** | 完全实现了 LLM Wiki 的三层 |
| **GraphRAG** | 图增强的检索 |
| **类型化 Schema** | 结构化的规则定义 |
| **Skill系统** | 代理有多种技能 |
| **MCP集成** | 支持多种工具 |

### 经典比喻

想象一下：
- NEXUS = 一个AI团队
- 6个代理 = 6个员工
- LLM Wiki = 公司知识库
- 他们一起协作，知识不断积累！

## 技术栈详解

NEXUS 使用了一系列先进的技术！

### 1. AI 代理

- **6个AI代理**，各自有不同的职责
- 运行在 **VPS（虚拟专用服务器）** 上
- 全天候在线，持续工作

### 2. 核心组件

| 组件 | 用途 |
|------|------|
| **Weaviate** | 向量数据库，存储向量 |
| **Ollama** | 本地运行 LLM |
| **Wiki.js** | Wiki 界面 |
| **GraphRAG** | 图RAG，知识关联更强 |
| **类型化 Schema** | 结构化的规则定义 |

### 3. 技能系统

- **Skills system** - 代理可以使用多种技能
- **Session logging** - 记录会话历史
- **OpenRouter 压缩** - 优化token使用

### 4. MCP 工具集成

NEXUS 集成了多个 MCP 服务器：

| 工具 | 用途 |
|------|------|
| **Brave Search** | 网页搜索 |
| **Tavily** | 另一个搜索工具 |
| **YouTube** | 视频相关 |
| **Apify** | 网页爬取 |
| **MiniMax** | AI模型 |
| **Slack** | 消息通知 |
| **qmd** | 另一个工具 |

## 完全实现 LLM Wiki 三层架构

NEXUS 完美实现了 [[LLM Wiki 生态/LLM Wiki 基础/LLM Wiki 三层架构]]！

### 1. Raw Sources（原始来源）

- **32个不可变源文件**
- 保持原始，不修改
- 真实的来源

### 2. The Wiki（知识库）

- **LLM生成的Markdown页面**
- 结构化的知识
- 相互关联的页面
- 持续更新和进化

### 3. The Schema（规则）

- **CLAUDE.md / SOUL.md**
- 定义代理的身份
- 定义工作流程
- 定义如何工作

## 核心洞见

NEXUS 完美体现了这个重要的观点：

> **"The wiki is a persistent, compounding artifact. The cross-references are already there. The contradictions have already been flagged. The synthesis already reflects everything you've read."**

翻译过来就是：

> **"Wiki是一个持久的、复利的人工制品。交叉引用已经存在了。矛盾已经被标记出来了。综合结果已经反映了你读过的所有内容。"**

### 这意味着什么？

这改变了我们思考AI记忆的方式！

**传统方式：**
- 每次查询，重新检索资料
- 没有积累
- 每次都从零开始

**NEXUS方式（LLM Wiki）：**
- 知识已经在Wiki中了
- 关联已经建立
- 矛盾已经标记
- **知识是复利的！**

## NEXUS 的工作方式

### 多代理协作

6个代理协同工作：
- 有的负责处理新资料
- 有的负责回答问题
- 有的负责检查一致性
- 共同维护Wiki

### 工作流程示例

1. **有新资料** → 进入 Raw Sources
2. **AI处理** → 生成和更新 Wiki
3. **建立关联** → 自动发现连接
4. **回答问题** → 基于完整 Wiki 回答
5. **持续进化** → 越来越聪明！

## 相关概念

- [[LLM Wiki 生态/LLM Wiki 基础/LLM Wiki]] - LLM Wiki 模式
- [[LLM Wiki 生态/LLM Wiki 基础/LLM Wiki 三层架构]] - 三层架构
- [[LLM Wiki 生态/LLM Wiki 基础/LLM Wiki 操作流程]] - 操作流程
- [[LLM Wiki 生态/LLM Wiki 工具/llmwiki]] - CLI工具
- [[LLM Wiki 生态/LLM Wiki 工具/Keel]] - Mac应用

## 总结

NEXUS 是一个非常棒的 LLM Wiki 完整实现！它展示了多代理 + LLM Wiki 的强大潜力！

**NEXUS = LLM Wiki 模式的未来！**
