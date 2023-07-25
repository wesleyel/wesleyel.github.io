+++
title = "Linux Process 的内存布局"
date = "2023-07-25T22:17:00+08:00"
author = "Magicewenli"
cover = ""
tags = ["内存", "C"]
categories = "Linux"
description = "Linux下C程序的存储空间布局，环境变量和命令行参数"
showFullContent = false
readingTime = true
Toc = true

+++

## 内存布局

一般而言，C程序通常由一下几个部分组成。

- 正文段
    - 正文段是用于存储代码的，也称之为代码段。如果函数是可重入的，那么代码段是可以共享的。正文段通常都是只读的，以防止被更改。
 
- 初始化数据段
    - 初始化数据段包含了程序中需要明确初始化的变量。
 
- 未初始化数据段
    - 未初始化数据段也被称为bss段。这里的存放的数据是交由内核来完成初始化为0的操作。例如：函数外定义的数组，它会在程序执行之前被内核全部初始化为0。
 
- 栈区
    - 自动变量以及每次函数调用时需要保存的信息都被保存在这个区域。
 
- 堆区
    - 通常在堆区进行动态内存分配。

对于Intel x86处理器上的Linux操作系统而言，典型的存储空间布局如下：

![内存布局](/img/process_memory_layout.png)

## 命令行参数和环境变量

命令行参数是指从命令行执行程序的时候，给程序的参数。C语言总是从main函数执行的，它的命令行参数被ISO C和POSIX规定为如下：

```c
int main(int argc,char *argv[]);
```

main函数的第一个参数argc保存的是程序执行的时候，命令行输入的参数总个数。其中第0个参数就是被执行的程序名字。第二个参数argv是用来保存命令行参数的。ISO C和POSIX都要求argv[argc]是一个空指针。

一个简单的实例如下：

```c
#include<stdio.h>
int main(int argc,char *argv[])
{
    printf("程序执行名：%s\n",argv[0]);
    printf("参数列表：\n");
    for (int i = 1; i < argc; i++)
    {
        printf("%s\n",argv[i]);
    }
    
    return 0;
}
```

执行结果如下：
![example](/img/argc_argv_example.jpg)

现在，POSIX规定了不使用第三个参数，通常使用getenv函数和putenv函数来访问环境变量。

每次程序都有一张环境表，当我们需要查看整个环境的时候，可以使用全局变量environ。它包含了该指针数字的地址。

`extern char **environ;`

我们来写个程序打印一下全部的环境变量。

```c
#include<stdio.h>
extern char **environ;

int main(int argc,char *argv[])
{
    for (int i = 0; NULL != environ[i]; i++)
    {
        printf("%s\n",environ[i]);
    }
    return 0;
}
```

执行以后的结果如下：
![example](/img/environ_example.jpg)

依照惯例，环境变量应该是`name=value`这样的字符串构成。ISO C给我们提供了一些和环境变量有关的函数。可以通过以下方法查询：

```bash
man getenv
man setenv
```

