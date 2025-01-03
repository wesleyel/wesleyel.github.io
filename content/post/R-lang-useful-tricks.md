---
title: "R语言列表操作和连接MongoDB经验之谈"
date: 2021-11-10
categories:
  - 经验
tags:
  - R
  - 数据分析
description: "在分析云顶之弈数据时，使用R语言连接MongoDB，并进行数据处理和分析的经验"
slug: R-lang-useful-tricks
---

{{<figure src="/img/RStudio.png" alt="RStudio" position="center" style="border-radius: 8px;" caption="RStudio" captionPosition="left" captionStyle="color: black; " >}}

## R语言的好处

在做Teamfight Tactics分析时，我先通过Riot's API收集到了许多场次的对局数据。如何将这些复杂的数据转换成可以直接使用的数据，方便进行分析呢？

之前一直用的是Python，思路是通过pymongo包连接MongoDB提取数据，再通过python内建函数进行转换和分析。这样需要不停使用`Table["sub"]['subsub']`这样的格式取得内部结构。这部分内容没有代码提示，需要程序员自行记忆每个`Key`对应的结构，不仅麻烦，而且容易出错。可以预计分析数据的时候会用到大量循环，而python的效率让人缺乏信心。再加上后续还有画图步骤，而`matplotlib`是一个非常麻烦的东西，我有点害怕。

也考虑过使用`Matlab`，它的好处是不少循环可以转为向量化运算，速度会快不少，而且画图容易。`Matlab`的附加功能里有一个`Database Toolbox Interface for MongoDB`。我甚至已经使用它进行了一段时间分析了，但后面发现默认生成的`.mat`格式转换为其他格式比较困难。而且运行速度也不是很理想，消耗资源很大，400MB的数据量在运算时常常卡死我的电脑。也可能是因为我不常使用它，所有代码本身编写的也不够好。

最后终于接触到了R语言，这真是个好工具。配合RStudio，顺手又高效。它解决了上面的所有问题，而且内建和社区的函数和包为分析过程提供了很大帮助，为我节省了很多时间。它的一些用法和其他语言显得有些奇怪，理解和熟悉需要一些时间，但R语言的学习绝对物超所值。

李东风老师的开源R语言教程很好，推荐一下：[https://www.math.pku.edu.cn/teachers/lidf/docs/Rbook/html/\_Rbook/index.html](https://www.math.pku.edu.cn/teachers/lidf/docs/Rbook/html/_Rbook/index.html)

## R语言的数据类型

### 向量

向量是将若干个基础类型**相同**的值存储在一起，各个元素可以按序号访问。需要注意的是，R语言各种类型的数据结构的下标都是从1开始的。例如

```r
# 数值型
marks <- c(10, 6, 4, 7, 8)
x <- c(1:3, 10:13)
# 逻辑型
c(1, 3, 5) > 2  # [1] FALSE  TRUE  TRUE
# 字符型
s1 <- c('abc', '', 'a cat', NA, '李明')
```

内建的大多数函数以向量为参数时，会对向量内的元素逐个运算，然后返回一个和原来一样长的向量。

```r
sqrt(c(1, 4, 6.25)) # [1] 1.0 2.0 2.5

x <- c(33, 55, 11)
order(x)    # [1] 3 1 2
x[order(x)] # [1] 11 33 55
```

### 列表

R中列表(`list`)类型来保存**不同**类型的数据。一个主要目的是提供R分析结果输出包装：输出一个变量，这个变量包括回归系数、预测值、残差、检验结果等等一系列不能放到规则形状数据结构中的内容。实际上，数据框也是列表的一种，但是数据框要求各列等长，而列表不要求。

列表可以命名，命名后类似字典，可以通过名字访问。

```r
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
```

也可以通过下标访问，但需要两重中括号。如果使用单重方括号对列表取子集，结果还是列表而不是列表元素。

```r
rec[[3]]
## [1] 85 76 90
rec[[3]][2]
## [1] 76

rec[3]
## $scores
## [1] 85 76 90
```

要删除某个元素，直接将该元素赋值为`NULL`；添加元素则是直接为该元素赋值。

```r
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
```

### 数据框

数据框类似于数据库表或Excel数据表的形式。这样形式的数据在R中叫做数据框(`data.frame`)。数据框类似于一个矩阵，有$n$个横行、$p$个纵列，但各列允许有不同类型：数值型向量、因子、字符型向量、日期时间向量。同一列的数据类型相同。数据框是一个特殊的列表，其每个列表元素都是一个长度相同的向量。

数据框可以说是处理数据的最佳方式，利用它可以轻松按列或按行取值，并且可以直接用向量化的方式计算。

```r
d<-data.frame(TraitsComb=character(0),Top4=double(0),Winner=double(0),AvgPlacement=double(0),PickTimes=integer(0))
print(d)
## [1] TraitsComb   Top4         Winner       AvgPlacement PickTimes
## <0 行> (或0-长度的row.names)

d[1,]<-list("a", 1.2, 2.3, 3.4, 5)
print(d)
##   TraitsComb Top4 Winner AvgPlacement PickTimes
## 1          a  1.2    2.3          3.4         5

colnames(d)
## [1] "TraitsComb"   "Top4"         "Winner"       "AvgPlacement" "PickTimes"

d$Winner
## [1] 2.3
d[3]
##   Winner
## 1    2.3
d[3][1]
##   Winner
## 1    2.3
```

## R语言函数

### 字符串

观察下面的例子，只用了1行代码就实现了我想要的字符串拼接。

```r
tiers<-rev(c("DIAMOND","PLATINUM","GOLD","SILVER","BRONZE","IRON"))
ranks<-rev(c("I","II","III","IV","V"))
tire_order<-lapply(tiers,function(x) paste(x,ranks,sep="-")) %>% unlist

## [1] "IRON-V"          "IRON-IV"         "IRON-III"        "IRON-II"         "IRON-I"          "BRONZE-V"
## [7] "BRONZE-IV"       "BRONZE-III"      "BRONZE-II"       "BRONZE-I"        "SILVER-V"        "SILVER-IV"
## [13] "SILVER-III"      "SILVER-II"       "SILVER-I"        "GOLD-V"          "GOLD-IV"         "GOLD-III"
## [19] "GOLD-II"         "GOLD-I"          "PLATINUM-V"      "PLATINUM-IV"     "PLATINUM-III"    "PLATINUM-II"
## [25] "PLATINUM-I"      "DIAMOND-V"       "DIAMOND-IV"      "DIAMOND-III"     "DIAMOND-II"      "DIAMOND-I"
```

这里`lapply`是对列表遍历，将每个元素先赋值为`x`，然后应用`function(x)`函数。`paste`函数是将两个参数连接起来，`sep`是连接符。

`%>%`是一个`pipe`，它将结果传递给另一个函数作为第一个参数。`unlist`是将列表转换为向量。

### 排序

对一张以下格式的数据框排序，可以使用`order`函数。倒序只需要在排序的列名前加`-`号。

```r
head(traits_comp_discribe)
##                                  TraitsComb  Top4 Winner AvgPlacement PickTimes
## 1                               Transformer 0.253  0.025        5.696        79
## 2 Bruiser,Cuddly,Glutton,Sister,Transformer 0.922  0.314        2.373        51
## 3                           Arcanist,Cuddly 0.662  0.166        3.593       145
## 4                                 Socialite 0.217  0.024        6.133        83
## 5                         Chemtech,Twinshot 0.462  0.154        4.231        13
## 6              Clockwork,Cuddly,Transformer 0.750  0.250        3.875         8

head(traits_comp_discribe[order(-traits_comp_discribe$Top4),])
##                    TraitsComb  Top4 Winner AvgPlacement PickTimes
## 7              Academy,Cuddly,Imperial    1  0.500        3.000         4
## 11            Bruiser,Sister,Socialite    1  0.400        6.400         5
## 32     Cuddly,Glutton,Sister,Socialite    1  0.333        2.000         3
## 34                           Mercenary    1  0.071        7.286        14
## 37 Bruiser,Sister,Transformer,Twinshot    1  0.333        3.000         3
## 38          Bodyguard,Cuddly,Syndicate    1  0.250        3.500         4
```

## MongoDB

MongoDB是一个介于关系数据库和非关系数据库之间的产品，是非关系数据库当中功能最丰富却最像关系数据库的。它提供了一个非常简单的接口，可以让你在简单的程序中操作数据库。

在R语言中，连接MongoDB可以使用`mongolite`库

```r
install.packages("mongolite")
library(mongolite)

url <- "mongodb://user:pass@site:port"
db<- "tft" # 数据库名

# 连接数据库
s_con <- mongo(collection='summoner',
               db=db,
               url=url)

# 查询数据 （查询等级低于100的召唤师）
summoners <- s_con$find('{"summonerlevel": { "$lt": 100 }}')
head(summoners)
##   id      puuid     summonerlevel summonertire summonerrank
## 1  4    ********            66     PLATINUM            I
## 2  5    ********             1      DIAMOND           II
## 3  6    ********            85       MASTER            I
## 4  8    ********             1     PLATINUM           IV
## 5  9    ********            20     PLATINUM           II
## 6 12    ********            19     PLATINUM           II
```
