---
title: SeekLink
created: 2026-05-12T00:00:00.000Z
updated: 2026-05-15
categories:
  - 人物与工具
  - LLM Wiki 工具
categoryPath: 人物与工具/LLM Wiki 工具
tags:
  - 工具
  - 检索
sources:
  - raw/articles/llm-wiki-by-karpathy.md
confidence: high
diagramized: true
diagramizedAt: 2026-05-15
---

# SeekLink

## 概述

SeekLink 是一个针对大型 Markdown Wiki 的行级锚定本地检索工具，由 simonsysun 构建！它让你能精确找到 Wiki 中的具体内容！

**简单来说：SeekLink = 精确到行的 Wiki 内容定位器！**

## 什么是 SeekLink？

SeekLink 专门解决大型 Wiki 的一个痛点问题：**编辑前需要读取确切的行，而不是整个文件！**

### 核心特点

| 特点 | 说明 |
|------|------|
| **行级定位** | 精确到具体行号 |
| **本地运行** | 完全本地，速度快 |
| **简单接口** | 子进程调用容易 |
| **JSON输出** | 结构化输出 |

### 经典比喻

想象一下：
- 大型 Wiki = 一套百科全书（几十本书）
- 传统方式 = 每次要读整本书
- **SeekLink = 直接翻到第几页第几行！**

## 解决的问题

大型 Wiki 有什么问题？

### 问题场景

假设你有几百篇 Wiki 笔记，你想编辑某个具体内容：
- 读整个文件 → 太慢，浪费 Token
- 只需要那几行 → 但不知道在哪
- **SeekLink 帮你解决！**

### 具体痛点

对于大型 Wiki，编辑前需要读取确切的行，而不是整个文件，这成为瓶颈！

## 使用示例

SeekLink 用起来很简单！让我们看几个例子！

### 1. 建立索引

```bash
seeklink index --vault ./wiki
```

这会为你的 Wiki 建立索引！

### 2. 搜索内容

```bash
seeklink search "why SQLite for search?" --vault ./wiki --json
```

搜索相关内容，返回 JSON 格式！

### 3. 获取具体行

```bash
seeklink get decisions/search.md:42 -C 20 --vault ./wiki
```

获取 `decisions/search.md` 文件的第 42 行，以及前后 20 行上下文！

## 核心特性详解

### 1. 简单的子进程接口

- 作为子进程调用
- 简单易用
- 集成方便

### 2. JSON 标准输出

- 结构化输出
- 程序容易处理
- JSON 格式

### 3. 完全本地运行

- 不需要联网
- 速度快
- 隐私安全
- 数据不离开设备

## 与 LLM Wiki 的关系

在 [[核心概念/LLM Wiki 基础/LLM Wiki]] 模式中：

- **The Wiki** = 你的知识库
- **SeekLink** = 精确定位内容的工具
- **让 LLM 能快速找到需要的内容！**

### 为什么 SeekLink 重要？

当你的 Wiki 变大时：
- 文件数量多
- 单个文件也大
- 读整个文件 → 慢，费 Token
- **SeekLink = 精确获取需要的部分！**

## 适用场景

SeekLink 适合这些场景：

| 场景 | 为什么适合 |
|------|-----------|
| **大型 Wiki** | 文件多且大 |
| **AI编辑** | 需要精确定位内容 |
| **自动脚本** | 程序调用方便 |
| **团队协作** | 统一的定位方式 |

## 与其他工具的配合

SeekLink 可以和其他 LLM Wiki 工具配合使用：
- [[人物与工具/LLM Wiki 工具/llmwiki]] - CLI 工具
- [[人物与工具/LLM Wiki 工具/qmd]] - 搜索工具
- **一起用，效果更好！**

## 相关概念

- [[核心概念/LLM Wiki 基础/LLM Wiki]] - LLM Wiki 模式
- [[核心概念/LLM Wiki 基础/LLM Wiki 三层架构]] - 三层架构
- [[人物与工具/LLM Wiki 工具/llmwiki]] - CLI工具
- [[人物与工具/LLM Wiki 工具/qmd]] - 搜索工具

## 总结

SeekLink 是一个强大的行级定位工具，特别适合大型 Wiki！有了它，你可以快速、精确地找到需要的内容！

**当你的 Wiki 变大时，SeekLink 会是你的好帮手！**
