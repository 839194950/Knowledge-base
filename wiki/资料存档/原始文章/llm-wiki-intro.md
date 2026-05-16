---
title: LLM Wiki 介绍
created: 2026-05-12T00:00:00.000Z
updated: 2026-05-12T00:00:00.000Z
categories:
  - 资料存档
  - 原始文章
categoryPath: 资料存档/原始文章
tags:
  - LLM Wiki
  - 入门
  - 知识管理
sources:
  - raw/articles/llm-wiki-intro.md
confidence: high
---

# LLM Wiki 介绍

## 概述
这是一个关于 [[核心概念/LLM Wiki 基础/LLM Wiki]] 模式的简化介绍文章。

## 什么是 LLM Wiki？
LLM Wiki 是 [[人物与工具/重要人物/Andrej Karpathy]] 提出的一种个人知识管理模式。它的核心思想是让 AI 来维护一个结构化的、相互链接的知识库，而不仅仅是做检索增强生成（[[核心概念/AI 技术/RAG]]）。

## 三层架构
1. **Raw Sources（原始源）** - 原始文件集合，不可变
2. **Wiki（知识库）** - AI 生成和维护的结构化 Markdown 文件
3. **Schema/AGENTS.md（规则）** - 定义 AI 如何工作的规则文件

详情参见：[[核心概念/LLM Wiki 基础/LLM Wiki 三层架构]]

## 为什么这样设计？
传统的 RAG 系统每次查询时都要重新从原始文件中检索信息，而 LLM Wiki 模式让知识持续积累和关联。每次添加新内容时，AI 都会把它整合到现有的知识网络中。

## 工作流
1. **Ingest（摄入）** - 添加新源文件，AI 处理并更新知识库
2. **Query（查询）** - 向知识库提问，AI 基于已有内容回答
3. **Lint（检查）** - 定期检查知识库的健康状态

详情参见：[[核心概念/LLM Wiki 基础/LLM Wiki 操作流程]]

## Obsidian 集成
因为 wiki 就是纯 Markdown 文件，你可以直接用 [[人物与工具/笔记工具/Obsidian]] 打开 wiki 目录作为 vault，享受 Graph View 等功能！
