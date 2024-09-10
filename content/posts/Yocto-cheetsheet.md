+++
title = "Yocto & Bitbake 速查表"
date = "2024-09-04T00:00:00+08:00"
author = "Magicewenli"
cover = ""
tags = ["速查表", "yocto", "bitbake"]
categories = "embedded"
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

## `local.conf` 配置

这些配置可以加入到 `local.conf` 或者`bblayers.conf`文件中，也根据需求加入其他 Machine 配置中。

| 配置                               | 作用                                               |
| ---------------------------------- | -------------------------------------------------- |
| `RM_WORK_EXCLUDE += "recipe_name"` | 编译后**不删除**指定的 recipe 的工作目录，用于调试 |
| `INHERIT += "rm_work"`             | 编译后**删除**工作目录                             |

## FAQ
