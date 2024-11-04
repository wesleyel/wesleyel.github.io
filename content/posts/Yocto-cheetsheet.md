+++
title = "Yocto & Bitbake Cheatsheet"
date = "2024-09-04T00:00:00+08:00"
author = "Magicewenli"
cover = ""
tags = ["速查表", "yocto", "bitbake"]
categories = "嵌入式"
description = "I'll keep updating this cheatsheet while I'm playing Yocto and Bitbake."
showFullContent = false
readingTime = true
Toc = true

+++

> 完整文档可以在[Yocto 文档网站](https://docs.yoctoproject.org/)找到。
> 参考自[yoctoproject-cheatsheet](https://github.com/shantanoo-desai/yoctoproject-cheatsheet)。

## Cli 命令

需要先通过`source setup-environment`设置Bitbake环境

| 命令                                   | 描述                                                                                                                                                                          |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| bitbake <image>                        | 编译指定的 image                                                                                                                                                              |
| bitbake -c <task> <recipe>             | 执行指定的 task。 可选的 task 有: `fetch`, `unpack`, `patch`, `configure`, `compile`, `install`, `package`, `clean`, `cleansstate`, `rebuild`, `reconfigure`, `reinstall`等。 |
| bitbake -c cleanall <recipe>           | 清理指定的 recipe. 包括工作目录和 sstate cache                                                                                                                                |
| bitbake -c devshell <recipe>           | 进入指定 recipe 的 shell 环境                                                                                                                                                 |
| bitbake -c listtasks <recipe>          | 列出指定 recipe 的所有 task                                                                                                                                                   |
| bitbake -c showappends <recipe>        | 显示指定 recipe 的所有 append 文件                                                                                                                                            |
| bitbake -e <recipe>                    | 显示指定 recipe 的所有变量                                                                                                                                                    |
| bitbake -s                             | 列出所有可用的 recipe                                                                                                                                                         |
| bitbake -S <recipe>                    | 显示指定 recipe 的依赖关系                                                                                                                                                    |
| bitbake <image> --graphviz --ui=depexp | 生成<image>的包依赖关系图                                                                                                                                                     |
| bitbake-layers show-layers             | 显示所有的 layer                                                                                                                                                              |
| bitbake-layers show-appends            | 显示所有的 append 文件                                                                                                                                                        |
| bitbake-layers show-recipes            | 显示所有的 recipe                                                                                                                                                             |
| bitbake-layers show-recipes "gdb*"     | 搜索 recipe                                                                                                                                                                   |
| bitbake-layers show-depends            | 显示所有的依赖关系                                                                                                                                                            |


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

### NOTE: Reconnecting to bitbake server

删除 bitbake.lock

```bash
rm -rf <build-dir>/bitbake.lock
```

### ERROR: nothing provides A needed by B

- 情况一： recipe A 不存在，没有被添加到 packagegroup 或者 dependcy 中
- 情况二： recipe A 编出来是空包，没有生成任何文件。需要在 A 的 recipe 中添加 `ALLOW_EMPTY_${PN} = "1"` 来解决

经常在编译动态库时会遇到这个问题，因为动态库的 recipe 生成的是一个空包。

[Yocto / OE : recipe with CMake install a shared library .so - Stack Overflow](https://stackoverflow.com/questions/59091938/yocto-oe-recipe-with-cmake-install-a-shared-library-so)
[do_rootfs missing package (ipk) or not found in base feeds (rpm) (yoctoproject.org)](https://docs.yoctoproject.org/pipermail/yocto/2015-January/022921.html)

只有 `*.so.*`（包含版本号的动态库）会被打包进 FILES_${PN}，而软链接 `*.so` 会被打包进 `-dev`package

### 如何使用 `devtool` 新增patch

[bitbake - What is best practice to do small changes in source code in Yocto - Stack Overflow](https://stackoverflow.com/questions/33939837/what-is-best-practice-to-do-small-changes-in-source-code-in-yocto)

```bash
devtool modify -x <recipe> <path-to-unpack>
devtool build <recipe>

# 修改位于<path-to-unpack>的源码
git add
git commit

devtool update-recipe <recipe>
devtool reset <recipe>
```