---
title: PHP伪协议
created: 2026-05-19
updated: 2026-05-19
categories: [安全, CTF, Web安全, 文件包含漏洞]
categoryPath: "安全/CTF/Web安全/文件包含漏洞"
tags: [PHP, 伪协议, Web安全, CTF]
sources: [raw/articles/BUUCTF-ACTF2020新生赛-Include-1题解.md]
confidence: high
---

# PHP伪协议

## 概述

**PHP伪协议** 是 PHP 内置的一些特殊协议，通过这些协议可以实现一些特殊功能，如读取文件、写入文件、执行代码、过滤数据流等。在 CTF 中，PHP 伪协议常用于绕过文件包含漏洞的防护。

### 为什么重要
- 是文件包含漏洞利用的核心技术
- 可以绕过很多安全限制
- 在 CTF Web 题目中频繁出现

---

## 常用伪协议详解

### 1. php://filter

**用途**：读取文件并对内容进行过滤处理

**语法**：
```
php://filter/[过滤器]/resource=[文件名]
```

**常用过滤器**：
- `convert.base64-encode` - Base64 编码
- `convert.base64-decode` - Base64 解码
- `string.rot13` - ROT13 变换
- `string.toupper` - 转大写
- `string.tolower` - 转小写
- `string.strip_tags` - 去除 HTML/PHP 标签

**示例**：
```
?file=php://filter/read=convert.base64-encode/resource=flag.php
```

### 2. php://input

**用途**：读取 POST 请求的原始数据

**条件**：需要 `enctype="multipart/form-data"` 时不可用

**示例**：
```
POST /?file=php://input HTTP/1.1
Host: example.com

<?php phpinfo();?>
```

### 3. data://

**用途**：执行 data URI 中的 PHP 代码

**条件**：需要 `allow_url_include` 开启

**示例**：
```
?file=data://text/plain,<?php phpinfo();?>
?file=data://text/plain;base64,PD9waHAgcGhwaW5mbygpOz8+
```

### 4. zip:// 和 phar://

**用途**：访问压缩文件中的内容

**示例**：
```
?file=zip:///path/to/archive.zip%23file.txt
?file=phar:///path/to/archive.phar/file.txt
```

### 5. php://stdin / php://stdout / php://stderr

**用途**：访问标准输入/输出/错误流

### 6. file://

**用途**：访问本地文件系统

**示例**：
```
?file=file:///etc/passwd
```

---

## 应用场景

- 文件包含漏洞利用
- 读取被 PHP 执行的文件源码
- 绕过 WAF 防护
- CTF Web 题目

---

## 相关题目

- [[安全/CTF/Web安全/文件包含漏洞/BUUCTF-ACTF2020新生赛-Include-1题解]]

---

## 相关概念

- [[安全/CTF/Web安全/文件包含漏洞/文件包含漏洞]]
