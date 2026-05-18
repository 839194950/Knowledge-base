
---
title: Shellcode绕过
description: 深入分析Shellcode相关的绕过技术，包括各种字符限制下的Shellcode执行方法
created: 2026-05-18
---

# Shellcode绕过

在CTF pwn题目中，经常会遇到各种对Shellcode进行严格限制的场景。这个分类收集了各种Shellcode绕过技术的深度分析。

## 相关技术
- [[栈溢出基础]] - 基础栈溢出技术
- [[格式化字符串漏洞]] - 格式化字符串漏洞利用

## 常见限制类型
- 字符白名单/黑名单限制
- 长度限制
- 内存保护机制
- 等等

