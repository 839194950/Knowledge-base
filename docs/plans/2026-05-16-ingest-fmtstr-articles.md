
# 格式化字符串漏洞文章 Ingest 实现计划

**Goal:** 将三篇格式化字符串漏洞相关的文章整理成百科全书级别的知识库内容，并建立适当的分类结构和链接关系。

**Architecture:** 创建一个新的分类目录"格式化字符串漏洞"，然后为每篇文章创建整理后的知识库页面，包括适当的链接和元数据。

**Tech Stack:** Markdown, Obsidian 链接格式

---

## Task 1: 分析现有分类结构并确认新分类路径

**Files:**
- 查看: `wiki/安全/CTF/pwn/`

**Step 1: 确认分类建议**
- 向用户建议分类路径：`安全/CTF/pwn/格式化字符串漏洞/`
- 等待用户确认

---

## Task 2: 创建新分类目录和分类介绍页面

**Files:**
- 创建: `wiki/安全/CTF/pwn/格式化字符串漏洞/_category.md`

**Step 1: 创建分类目录**
- 在 `wiki/安全/CTF/pwn/` 下创建 `格式化字符串漏洞` 目录

**Step 2: 创建分类介绍页面**
- 编写 `_category.md`，包含分类标题和描述
- 使用正确的 YAML frontmatter 格式

---

## Task 3: 处理第一篇文章 - 格式化字符串漏洞原理介绍

**Files:**
- 源文件: `raw/articles/ctf-wiki-fmtstr-intro.md`
- 创建: `wiki/安全/CTF/pwn/格式化字符串漏洞/格式化字符串漏洞原理介绍.md`

**Step 1: 深度阅读源文件**
- 理解文章内容结构和关键知识点

**Step 2: 按照百科全书质量标准重新组织内容**
- 创建符合知识结构规范的页面
- 添加适当的标题层级
- 使用简短段落
- 添加相关概念的内部链接（如：[[栈介绍]]、[[C语言函数调用栈（一）]]等）

**Step 3: 添加 YAML frontmatter**
- 包含分类信息、来源、创建日期等

---

## Task 4: 处理第二篇文章 - 格式化字符串漏洞利用

**Files:**
- 源文件: `raw/articles/ctf-wiki-fmtstr-exploit.md`
- 创建: `wiki/安全/CTF/pwn/格式化字符串漏洞/格式化字符串漏洞利用.md`

**Step 1: 深度阅读源文件**

**Step 2: 按照百科全书质量标准重新组织内容**
- 分章节介绍程序崩溃、泄露栈内存、泄露任意地址内存等技术
- 添加代码示例和详细说明
- 添加内部链接

**Step 3: 添加 YAML frontmatter**

---

## Task 5: 处理第三篇文章 - 格式化字符串漏洞例子

**Files:**
- 源文件: `raw/articles/ctf-wiki-fmtstr-example.md`
- 创建: `wiki/安全/CTF/pwn/格式化字符串漏洞/格式化字符串漏洞例子.md`

**Step 1: 深度阅读源文件**

**Step 2: 按照百科全书质量标准重新组织内容**
- 分章节介绍64位程序、GOT劫持、返回地址劫持、堆上的格式化字符串等例子
- 添加实用的示例代码
- 添加内部链接（如：[[基本ROP]]、[[控制程序执行流]]等）

**Step 3: 添加 YAML frontmatter**

---

## Task 6: 标记源文件已 ingest

**Files:**
- 修改: `raw/articles/ctf-wiki-fmtstr-intro.md`
- 修改: `raw/articles/ctf-wiki-fmtstr-exploit.md`
- 修改: `raw/articles/ctf-wiki-fmtstr-example.md`

**Step 1: 为每个源文件添加 YAML frontmatter**
- 添加 `ingested: true`
- 添加 `ingestedAt: 2026-05-16`

---

## Task 7: 更新索引和日志

**Files:**
- 修改: `wiki/index.md`
- 修改: `wiki/log.md`

**Step 1: 更新 `wiki/index.md`**
- 添加新分类和新文章的索引

**Step 2: 更新 `wiki/log.md`**
- 记录本次 ingest 操作

---

## Task 8: 在页面间建立双向链接

**Files:**
- 修改: `wiki/安全/CTF/pwn/格式化字符串漏洞/格式化字符串漏洞原理介绍.md`
- 修改: `wiki/安全/CTF/pwn/格式化字符串漏洞/格式化字符串漏洞利用.md`
- 修改: `wiki/安全/CTF/pwn/格式化字符串漏洞/格式化字符串漏洞例子.md`

**Step 1: 添加相互链接**
- 在原理介绍页面链接到利用和例子页面
- 在利用页面链接到原理和例子页面
- 在例子页面链接到原理和利用页面
