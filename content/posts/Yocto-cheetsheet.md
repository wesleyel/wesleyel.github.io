+++
title = "Yocto & Bitbake 速查表"
date = "2024-09-04T00:00:00+08:00"
author = "Magicewenli"
cover = ""
tags = ["速查表", "yocto", "bitbake"]
categories = "嵌入式"
description = "我会在玩 Yocto 时不断更新我的笔记。"
showFullContent = false
readingTime = true
Toc = true

+++

> 完整文档可以在[Yocto 文档网站](https://docs.yoctoproject.org/)找到。
> 参考自[yoctoproject-cheatsheet](https://github.com/shantanoo-desai/yoctoproject-cheatsheet)。

## Cli 命令

| 命令 | 描述 |
| ---- | ---- |
| todo | todo |

## 变量语法和操作

> 参考自[Bitbake User Manual](https://docs.yoctoproject.org/bitbake/2.4/bitbake-user-manual/bitbake-user-manual-metadata.html)

可以随时使用 `bitbake -e` 查看编译时的变量。

| 语法                              | 描述                                                                                                                                                       |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VARIABLE = "value"`              | 设置变量                                                                                                                                                   |
| `VARIABLE = " value "`            | 如果变量值中有空格，那么空格会被**保留**                                                                                                                   |
| `VARIABLE = ""`                   | 设置变量为空                                                                                                                                               |
| `VARIABLE = " "`                  | 设置变量为一个空格                                                                                                                                         |
| `VARIABLE = '"'`                  | 通过单引号设置含有双引号的变量                                                                                                                             |
| `VARIABLE = "${OTHER_VARIABLE}"`  | 引用其他变量, 变量在**真正使用时**才会被展开                                                                                                               |
| `VARIABLE := "${OTHER_VARIABLE}"` | 设置变量，**立即展开**                                                                                                                                     |
| `VARIABLE ?= "value"`             | 设置默认值，如果变量已经设置，那么不会覆盖                                                                                                                 |
| `VARIABLE ??= "value"`            | 设置*弱*默认值，见[弱默认值](https://docs.yoctoproject.org/bitbake/2.4/bitbake-user-manual/bitbake-user-manual-metadata.html#setting-a-weak-default-value) |
| `VARIABLE += "value"`             | 追加变量值（带空格）                                                                                                                                       |
| `VARIABLE =+ "value"`             | 在变量值前面追加（带空格）                                                                                                                                 |
| `VARIABLE .= "value"`             | 追加变量值（无空格）                                                                                                                                       |
| `VARIABLE =. "value"`             | 在变量值后面追加（无空格）                                                                                                                                 |

> TODO

## `local.conf` 配置

这些配置可以加入到 `local.conf` 或者`bblayers.conf`文件中，也根据需求加入其他 Machine 配置中。

| 配置                               | 作用                                               |
| ---------------------------------- | -------------------------------------------------- |
| `RM_WORK_EXCLUDE += "recipe_name"` | 编译后**不删除**指定的 recipe 的工作目录，用于调试 |
| `INHERIT += "rm_work"`             | 编译后**删除**工作目录                             |

## FAQ
