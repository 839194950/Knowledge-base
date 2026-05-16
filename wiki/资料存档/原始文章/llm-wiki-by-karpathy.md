---
title: LLM Wiki - Andrej Karpathy
created: 2026-05-12T00:00:00.000Z
updated: 2026-05-12T00:00:00.000Z
categories:
  - 资料存档
  - 原始文章
categoryPath: 资料存档/原始文章
tags:
  - LLM Wiki
  - 知识管理
  - Andrej Karpathy
sources:
  - raw/articles/llm-wiki-by-karpathy.md
confidence: high
---

# LLM Wiki - Andrej Karpathy

## 概述

LLM Wiki 是 [[人物与工具/重要人物/Andrej Karpathy]] 提出的一种使用 LLM 构建个人知识库的模式。该模式与传统 RAG 不同，强调知识的持续积累和结构化组织。

## 核心思想

### 传统 RAG 的问题
- LLM 在每次查询时都从零开始重新发现知识
- 没有知识积累
- 需要每次都检索和拼凑相关片段

### LLM Wiki 的解决方案
- LLM 增量构建并维护持久化的 wiki
- 结构化、相互链接的 Markdown 文件集合
- 知识只需编译一次，然后保持最新，而不是每次查询都重新推导
- Wiki 是一个持久的、复利的人工制品

## 三层架构

1. **Raw sources** - 原始源文件，不可变
2. **The wiki** - LLM 生成的 Markdown 文件，LLM 完全拥有这一层
3. **The schema** - 定义工作流程和规范的配置文件（如 AGENTS.md）

## 三个核心操作

### Ingest（摄入）
处理新源文件，更新 wiki、实体页面、概念页面、索引和日志。

### Query（查询）
基于 wiki 内容回答问题，好的答案可以存回 wiki。

### Lint（检查）
健康检查：查找矛盾、过期声明、孤立页面、缺失概念、缺失交叉引用等。

## 索引和日志

### index.md
内容导向的目录，按类别组织。

### log.md
按时间顺序的操作记录。

## 应用场景

- 个人目标追踪、健康管理、自我提升
- 研究：深入研究某个主题
- 读书：构建人物、主题、情节的丰富 wiki
- 团队/企业：内部知识库
- 竞争分析、尽职调查、旅行规划、课程笔记、爱好研究

## 社区贡献

- **[[人物与工具/LLM Wiki 工具/NEXUS]]** - 多代理记忆系统
- **[[人物与工具/LLM Wiki 工具/llmwiki]]** - CLI 工具，超过 1K GitHub stars
- **[[人物与工具/LLM Wiki 工具/SeekLink]]** - 行级锚定检索工具
- **[[人物与工具/LLM Wiki 工具/Keel]]** - Mac 应用
- **[[人物与工具/LLM Wiki 工具/scaffy]]** - 项目启动工具

## 相关概念

- [[核心概念/LLM Wiki 基础/LLM Wiki]]
- [[核心概念/LLM Wiki 基础/LLM Wiki 三层架构]]
- [[核心概念/LLM Wiki 基础/LLM Wiki 操作流程]]
- [[人物与工具/重要人物/Andrej Karpathy]]
- [[人物与工具/笔记工具/Obsidian]]
- [[核心概念/AI 技术/RAG]]
