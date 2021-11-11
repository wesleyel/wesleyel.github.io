+++
title = "R语言列表操作和连接MongoDB经验之谈"
date = "2021-11-10T17:28:19+08:00"
author = "Magicewenli"
cover = "img/RStudio.png"
tags = ["", ""]
keywords = ["", ""]
description = ""
showFullContent = false
readingTime = true
Toc = true
+++

## R语言的好处

在做Teamfight Tactics分析时，我先通过Riot's API收集到了许多场次的对局数据。如何将这些复杂的数据转换成可以直接使用的数据，方便进行分析呢？

之前一直用的是Python，思路是通过pymongo包连接MongoDB提取数据，再通过python内建函数进行转换和分析。这样需要不停使用`Table["sub"]['subsub']`这样的格式取得内部结构。这部分内容没有代码提示，需要程序员自行记忆每个`Key`对应的结构，不仅麻烦，而且容易出错。可以预计分析数据的时候会用到大量循环，而python的效率让人缺乏信心。再加上后续还有画图步骤，而`matplotlib`是一个非常麻烦的东西，我有点害怕。

也考虑过使用`Matlab`，它的好处是不少循环可以转为向量化运算，速度会快不少，而且画图容易。`Matlab`的附加功能里有一个`Database Toolbox Interface for MongoDB`。我甚至已经使用它进行了一段时间分析了，但后面发现默认生成的`.mat`格式转换为其他格式比较困难。而且运行速度也不是很理想，消耗资源很大，400MB的数据量在运算时常常卡死我的电脑。也可能是因为我不常使用它，所有代码本身编写的也不够好。

最后终于接触到了R语言，这真是个好工具。配合RStudio，顺手又高效。它解决了上面的所有问题，而且内建和社区的函数和包为分析过程提供了很大帮助，为我节省了很多时间。它的一些用法和其他语言显得有些奇怪，理解和熟悉需要一些时间，但R语言的学习绝对物超所值。

李东风老师的开源R语言教程很好，推荐一下：[https://www.math.pku.edu.cn/teachers/lidf/docs/Rbook/html/_Rbook/index.html](https://www.math.pku.edu.cn/teachers/lidf/docs/Rbook/html/_Rbook/index.html)

## R语言的向量, 列表和数据框

### 向量

向量是将若干个基础类型**相同**的值存储在一起，各个元素可以按序号访问。例如

{{< code language="R" title="" id="1" expand="Show" collapse="Hide" isCollapsed="false" >}}
# 数值型
marks <- c(10, 6, 4, 7, 8)
x <- c(1:3, 10:13)
# 逻辑型
c(1, 3, 5) > 2  # [1] FALSE  TRUE  TRUE
# 字符型
s1 <- c('abc', '', 'a cat', NA, '李明')
{{< /code >}}

内建的大多数函数以向量为参数时，会对向量内的元素逐个运算，然后返回一个和原来一样长的向量。

{{< code language="R" title="" id="2" expand="Show" collapse="Hide" isCollapsed="false" >}}
sqrt(c(1, 4, 6.25)) # [1] 1.0 2.0 2.5

x <- c(33, 55, 11)
order(x)    # [1] 3 1 2
x[order(x)] # [1] 11 33 55
{{< /code >}}

### 列表

R中列表(`list`)类型来保存**不同**类型的数据。一个主要目的是提供R分析结果输出包装：输出一个变量，这个变量包括回归系数、预测值、残差、检验结果等等一系列不能放到规则形状数据结构中的内容。实际上，数据框也是列表的一种，但是数据框要求各列等长，而列表不要求。

列表可以命名，命名后类似字典，可以通过名字访问。

{{< code language="R" title="" id="3" expand="Show" collapse="Hide" isCollapsed="false" >}}
rec <- list(name="李明", age=30,
  scores=c(85, 76, 90))
rec
## $name
## [1] "李明"
## 
## $age
## [1] 30
## 
## $scores
## [1] 85 76 90

rec$age # 或 rec[["age"]]
{{< /code >}}

也可以通过下标访问，但需要两重中括号。如果使用单重方括号对列表取子集，结果还是列表而不是列表元素。

{{< code language="R" title="" id="4" expand="Show" collapse="Hide" isCollapsed="false" >}}
rec[[3]]
## [1] 85 76 90
rec[[3]][2]
## [1] 76

rec[3]
## $scores
## [1] 85 76 90
{{< /code >}}

要删除某个元素，直接将该元素赋值为`NULL`；添加元素则是直接为该元素赋值。

{{< code language="R" title="" id="5" expand="Show" collapse="Hide" isCollapsed="false" >}}
rec[["age"]] <- NULL
rec[["身高"]] <- 178
## $name
## [1] "李明"
## 
## $三科分数
## [1] 85  0 90
## 
## $身高
## [1] 178
{{< /code >}}

### 数据框

数据框类似于数据库表或Excel数据表的形式。这样形式的数据在R中叫做数据框(`data.frame`)。数据框类似于一个矩阵，有$n$个横行、$p$个纵列，但各列允许有不同类型：数值型向量、因子、字符型向量、日期时间向量。同一列的数据类型相同。数据框是一个特殊的列表，其每个列表元素都是一个长度相同的向量。


