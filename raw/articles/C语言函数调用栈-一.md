---
ingested: true
ingestedAt: 2026-05-14
---
标题: C语言函数调用栈(一)
UP主: clover_toeic
链接: https://www.cnblogs.com/clover-toeic/p/3755401.html
内容: 

# C语言函数调用栈(一)

程序的执行过程可看作连续的函数调用。当一个函数执行完毕时，程序要回到调用指令的下一条指令(紧接call指令)处继续执行。函数调用过程通常使用堆栈实现，每个用户态进程对应一个调用栈结构(call stack)。编译器使用堆栈传递函数参数、保存返回地址、临时保存寄存器原有值(即函数调用的上下文)以备恢复，以及存储局部变量。

## 1. 栈与栈帧

计算机程序使用堆栈来管理函数调用。每个函数调用都会创建一个新的栈帧(stack frame)，栈帧中包含了该函数调用相关的信息。栈帧是栈上的一块连续内存区域，从高地址向低地址增长。

典型的栈帧布局包含以下内容：
- 函数参数(Arguments)
- 返回地址(Return Address)
- 旧的基址指针(Old EBP)
- 局部变量(Local Variables)
- 临时存储(Temporary Storage)
