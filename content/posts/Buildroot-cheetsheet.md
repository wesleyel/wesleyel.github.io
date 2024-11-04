+++
title = "Buildroot Cheatsheet"
date = "2024-09-04T00:00:00+08:00"
author = "Magicewenli"
cover = ""
tags = ["速查表", "buildroot"]
categories = "嵌入式"
description = "I'll keep updating this cheatsheet while I'm playing Buildroot"
showFullContent = false
readingTime = true
Toc = true

+++

> 完整文档可以在[官方网站](https://buildroot.org/downloads/manual/manual.html)找到。

## 快速开始一个buildroot项目

```bash
buildroot_repo=https://github.com/buildroot/buildroot.git
buildroot_version=2022.11
buildroot_src=buildroot-$buildroot_version
buildroot_defcfg=raspberrypi4_defconfig

git clone --branch $buildroot_version --depth 1 $buildroot_repo
make -C $buildroot_src defconfig BR2_DEFCONFIG=$buildroot_defcfg
make -C $buildroot_src linux-reconfigure all
```

## 基本命令

[Make 提示](https://buildroot.org/downloads/manual/manual.html#make-tips)

使用 `make help` 获取所有可用目标的列表。

| 命令               | 描述                                                               |
| ------------------ | ------------------------------------------------------------------ |
| make               | 构建 rootfs                                                        |
| make xyz_defconfig | 选择配置文件                                                       |
| make menuconfig    | 打开配置菜单                                                       |
| make savedefconfig | 将当前配置保存到 defconfig 文件中                                  |
| make source        | 下载包的源代码                                                     |
| make clean         | 清理所有构建产品（包括构建目录、主机、暂存和目标树、镜像和工具链） |
| make distclean     | 清理所有内容，包括配置                                             |

### 包管理

> [特定包的 make 目标](https://buildroot.org/downloads/manual/manual.html#pkg-build-steps)

| 命令                     | 描述                               |
| ------------------------ | ---------------------------------- |
| make \<pkg\>             | 构建一个包                         |
| make \<pkg\>-reinstall   | 重新安装一个包                     |
| make \<pkg\>-rebuild     | 重新构建一个包（这意味着重新安装） |
| make \<pkg\>-reconfigure | 重新配置一个包（这意味着重新构建） |
| make \<pkg\>-dirclean    | 清理包目录                         |

### 调试

| 命令                       | 描述               |
| -------------------------- | ------------------ |
| make graph-depends         | 生成依赖关系图     |
| make \<pkg\>-graph-depends | 生成包的依赖关系图 |

## 目录结构

| 目录           | 描述                                                                                  |
| -------------- | ------------------------------------------------------------------------------------- |
| configs        | 单板的配置和 defconfig 文件的位置                                                     |
| package        | 包定义的位置                                                                          |
| dl             | 下载的源代码压缩包                                                                    |
| output/build   | 所有组件构建的目录                                                                    |
| output/images  | 构建的内核、引导加载程序和根文件系统镜像的位置                                        |
| output/staging | 交叉编译工具链和用户空间包的头文件和库的位置（这是 host/<toolchains>/sysroot 的软链） |
| output/host    | 包括交叉编译工具链在内的主机工具的位置                                                |
| output/target  | 几乎是最终的目标根文件系统                                                            |

## `.mk` 文件

### Cmake

> [cmake 包教程](https://buildroot.org/downloads/manual/manual.html#cmake-package-tutorial)

一个 cmake 包的示例：

```makefile
################################################################################
#
# libfoo
#
################################################################################

LIBFOO_VERSION = 1.0
LIBFOO_SOURCE = libfoo-$(LIBFOO_VERSION).tar.gz
LIBFOO_SITE = http://www.foosoftware.org/download
LIBFOO_INSTALL_STAGING = YES
LIBFOO_INSTALL_TARGET = NO
LIBFOO_CONF_OPTS = -DBUILD_DEMOS=ON
LIBFOO_DEPENDENCIES = libglib2 host-pkgconf

$(eval $(cmake-package))
```

### 外部包和 sysvinit

一个带有 sysvinit 的外部包示例：

```makefile
################################################################################
#
# gsmmux 项目
#
################################################################################

GSMMUX_SITE = $(TOPDIR)/../external/path/gsmmux
GSMMUX_SITE_METHOD = local
GSMMUX_INSTALL_STAGING = YES
GSMMUX_VERSION = 1.0

define GSMMUX_INSTALL_INIT_SYSV
$(INSTALL) -D -m 755 $(@D)/S50start_cmuxd \
    $(TARGET_DIR)/etc/init.d/S50start_cmuxd
endef

$(eval $(cmake-package))
```

### 如何设置 ccache（编译缓存）？

[在 Buildroot 中使用 ccache](https://buildroot.org/downloads/manual/manual.html#ccache)

`ccache` 支持已集成在 Buildroot 中。只需在 `Build options` 中启用 `Enable compiler cache`。这将自动构建 `ccache` 并将其用于每个主机和目标编译。

`cache` 位于 `BR2_CCACHE_DIR` 配置选项定义的目录中，默认值为 `$HOME/.buildroot-ccache`。此默认位置在 Buildroot 输出目录之外，因此可以由单独的 Buildroot 构建共享。如果要删除缓存，只需删除此目录。

### 如何重新生成target/rootfs

[How to clean only target in buildroot](https://stackoverflow.com/questions/47320800/how-to-clean-only-target-in-buildroot)

由于`rm -rf output/target && make`并不会触发install操作，所以需要用以下hack来实现：

```bash
rm -rf output/target

# 删除所有的 .stamp_target_installed 文件
find ../ -name ".stamp_target_installed" -delete

rm -f output/build/host-gcc-final-*/.stamp_host_installed
```