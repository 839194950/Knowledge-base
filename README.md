# 个人知识库系统

基于 Karpathy 的 LLM Wiki 模式构建的个人知识管理系统，拥有美观的前端展示、强大的搜索功能、天然的 Obsidian 集成，支持一键部署到 Vercel。

## ✨ 特性

- 📚 **LLM Wiki 架构** - 原始源 + AI 整理的知识库 + 规则定义三层结构
- 🎨 **Soft 风格 UI** - 柔和奢华的设计风格，优质的排版体验
- 🗂️ **灵活分类体系** - 支持自定义分类，任意层级嵌套
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
│   ├── [自定义分类]/       # 灵活的分类体系（如：关于本站/）
│   │   ├── _category.md   # 分类介绍页面
│   │   └── 文章.md
│   ├── 人物与工具/        # 实体页面（人物、项目、工具等）
│   ├── 核心概念/          # 概念页面
│   ├── 资料存档/          # 摘要页面（保留旧版）
│   ├── index.md           # 内容索引
│   └── log.md            # 操作日志
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

### 整理和分类文章

1. 使用 `/classify` 命令整理未分类或需要重新分类的内容
2. AI 会分析内容并建议创建新分类或归入现有分类
3. 确认分类方案后，AI 会自动组织文章结构

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

| 命令 | 功能 |
|------|------|
| `/fetch <URL> [类型]` | 从网络获取内容并保存到 `raw/` 目录 |
| `/ingest <源文件路径>` | 处理新源文件，智能分类并整理到知识库 |
| `/ingest-all` | 批量处理所有未处理的新内容 |
| `/ingest-status` | 查看哪些文件已处理，哪些还没处理 |
| `/classify` | 整理未分类文章，创建或更新分类体系 |
| `/query <问题>` | 基于知识库智能回答问题 |
| `/lint` | 健康检查和维护知识库 |

### `/fetch <URL> [类型]` 详细说明

**功能**：抓取网页、视频等内容，保存到 `raw/` 目录

**工作流程**：
1. **识别内容类型**：根据 URL 或用户指定的类型确定处理方式
2. **获取内容**：
   - **网页/文章**：使用 WebFetch 抓取
     - 自动识别并提取文章中的所有图片链接
     - 将图片下载到 `raw/images/文章标题/` 目录（按文章分组）
     - 使用 AI 视觉分析图片内容，生成详细描述
     - 将图片描述自然地融入文章内容中
     - 使用 Obsidian wiki 图片链接格式：`![[图片文件名]]`
   - **视频**（优先级 Fallback 机制）：
     - **第一阶段（快速抓取）**：首先调用 video-fetcher (yt-dlp-mcp) 的 `ytdlp_download_transcript` 工具获取字幕（优先尝试中文 'zh-Hans'，失败尝试英文 'en'）。如果成功获取到有效文字内容，直接跳转至"保存步骤"。同时调用 `ytdlp_get_video_metadata` 获取视频元数据（标题、UP主等）。
     - **第二阶段（本地转录切换）**：若第一阶段返回空内容、报错或提示"未找到字幕"，**禁止报错**，立即自动切换并调用 video-transcriber (video-transcriber-mcp) 的 `transcribe_video` 工具进行本地转录。
       - 调用参数：
         - `url`: 视频链接
         - `model`: "medium"
         - `language`: "auto"
         - 环境变量：`USE_GPU: true`、`WHISPER_MODEL: medium`、`WHISPER_CACHE_DIR: D:/AI_Models/whisper`
     - **视频视觉理解**：对视频进行关键帧分析（不保存截图），使用 AI 视觉理解视频内容，将视觉理解结果与字幕/转录内容合并
3. **生成文件名**：
   - 视频文件：使用 `[UP主] - [视频标题].txt` 格式，清理非法字符（\ / : * ? " < > |）
   - 其他文件：根据内容标题生成
   - 图片文件：保持原始扩展名，清理非法字符，确保文件名唯一
4. **保存文件**：按以下格式组织内容并保存到对应目录：
   ```
   标题: {title}
   UP主: {uploader}
   链接: {url}
   提取方式: {yt-dlp-mcp 或 video-transcriber}
   内容: {transcript}
   ```
5. **保存到对应目录**：
   - 网页文章 → `raw/articles/`
   - 论文 → `raw/papers/`
   - 视频 → `raw/video/`
   - 播客/音频 → `raw/audio/`
   - 图片 → `raw/images/文章标题/`（按文章分组）
6. **询问用户**：保存成功后，询问"内容已存至 D 盘模型驱动的本地库，是否立即执行 /ingest 处理？"

**参数说明**：
- `<URL>`：要获取的链接（必填）
- `[类型]`：可选，指定内容类型（article/paper/video/audio）

**示例**：
```
/fetch https://example.com/article
/fetch https://youtube.com/watch?v=xxx video
```

**视频处理说明**：
- 采用"先云端检索、后本地转录"的复合逻辑
- 第一阶段优先尝试使用 yt-dlp 快速获取已有字幕
- 若云端无字幕，自动降级到使用 video-transcriber + Whisper 本地转录
- 使用 medium 模型 + GPU 加速，确保转录质量和速度
- 对视频进行关键帧视觉理解（不保存截图）

**图片处理说明**：
- 网页中的图片会自动下载到 `raw/images/文章标题/` 目录
- 使用 AI 视觉分析图片内容并生成描述
- 图片描述会融入文章内容，帮助 AI 更好地理解
- 使用 Obsidian wiki 图片链接格式：`![[图片文件名]]`
- /ingest 时会将图片信息作为内容的一部分一起分析

## 🗂️ 分类体系

### 自定义分类

支持灵活的自定义分类体系，可以创建任意深度的嵌套分类：

```
wiki/
├── 知识管理/           # 示例分类
│   ├── _category.md    # 分类介绍页面
│   ├── 文章1.md
│   └── 子分类/
│       └── 文章2.md
├── 编程/
│   └── ...
└── ...
```

### 保留分类

- `人物与工具/` - 实体页面（人物、项目、工具等）
- `核心概念/` - 概念解释页面
- `资料存档/` - 源文件摘要（保留旧版结构）

### 分类页面格式

每个分类可以有一个 `_category.md` 介绍页面：

```yaml
---
title: 分类名称
description: 分类的简短描述
created: 2026-05-12
---

关于这个分类的详细介绍...
```

## 📝 Wiki 页面格式

所有 wiki 页面必须包含 YAML frontmatter：

```yaml
---
title: 页面标题
created: 2026-05-12
updated: 2026-05-12
categories: [分类1, 分类2]
categoryPath: "分类路径/子分类"
tags: [标签1, 标签2]
sources: [raw/articles/source.md]
confidence: high
---

页面内容...
```

## 🛠️ 技术栈

- **框架**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS, Framer Motion
- **Markdown**: react-markdown, remark, rehype
- **搜索**: 本地搜索（可选 Algolia）
- **部署**: Vercel

## 📝 注意事项

- 永远不要手动修改 `raw/` 目录（原始源文件只读）
- `wiki/` 目录由 AI 维护，但你也可以手动编辑
- 所有内容都在 Git 版本控制中，可随时回滚
- Obsidian vault 路径设为 `wiki/` 目录
- 优先使用自定义分类体系，entities/concepts/summaries 作为保留分类

## 📄 许可证

MIT

## 🙏 致谢

- [Andrej Karpathy 的 LLM Wiki 理念](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
