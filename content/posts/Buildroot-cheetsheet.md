+++
title = "Buildroot cheetsheet"
date = "2024-09-04T00:00:00+08:00"
author = "Magicewenli"
cover = ""
tags = ["cheatsheet", "buildroot"]
categories = "embedded"
description = "I'll keep it updated with my notes when playing with buildroot."
showFullContent = false
readingTime = true
Toc = true

+++

Full documentation can be found [on the official website](https://buildroot.org/downloads/manual/manual.html).

## Basic commands

[Make tips](https://buildroot.org/downloads/manual/manual.html#make-tips)

use `make help` to get a list of all the available targets.

| Command             | Description                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| make                | Build the rootfs                                                                                                     |
| make xyz_de­fconfig | Select the configuration file                                                                                        |
| make menuconfig     | Open the configuration menu                                                                                          |
| make savedefconfig  | Save the current configuration to the defconfig file                                                                 |
| make source         | Download the source code of the packages                                                                             |
| make clean          | Clean all build products (including build directories, host, staging and target trees, the images and the toolchain) |
| make distclean      | Clean everything, including the configuration                                                                        |

### Package management

[Package-specific make targets](https://buildroot.org/downloads/manual/manual.html#pkg-build-steps)

| Command                      | Description                                     |
| ---------------------------- | ----------------------------------------------- |
| make \<pkg\>             | Build a package                                 |
| make \<pkg\>-reinstall   | Reinstall a package                             |
| make \<pkg\>-rebuild     | Rebuild a package(this implies a reinstall)     |
| make \<pkg\>-reconfigure | Reconfigure the package(this implies a rebuild) |
| make \<pkg\>-dirclean    | Clean the package directory                     |

### Debug

| Command                        | Description                                       |
| ------------------------------ | ------------------------------------------------- |
| make graph-depends             | Generate a graph of the dependencies              |
| make \<pkg\>-graph-depends | Generate a graph of the dependencies of a package |

## Directory structure

| Directory      | Description                                                                        |
| -------------- | ---------------------------------------------------------------------------------- |
| configs        | Location of config and defconfig files of board                                    |
| package        | Location of package definitions                                                    |
| dl             | Downloaded source code tarballs                                                    |
| output/build   | Directory where all components are built                                           |
| output/images  | Location of built kernel, bootloader and root filesystem images                    |
| output/staging | Headers and libraries of the cross-­com­pil­ation toolchain and userspace packages |
| output/host    | Host tools including the cross-­com­pil­ation toolchain                            |
| output/target  | Almost complete root filesystem for the target                                     |

## The `.mk` file

### Cmake

[cmake-package-tutorial](https://buildroot.org/downloads/manual/manual.html#cmake-package-tutorial)

Example of a cmake package:

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

### External package and sysvinit

Example of an external package with sysvinit:

```makefile
################################################################################
#
# gsmmux project
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

## FAQ

### How to clean only `output/target`?

[How to clean only target in buildroot](https://stackoverflow.com/questions/47320800/how-to-clean-only-target-in-buildroot)

```bash
rm -rf output/target
find output/ -name ".stamp_target_installed" -delete
rm -f output/build/host-gcc-final-*/.stamp_host_installed
```

### How to setup ccache(compile cache)?

[Using ccache in Buildroot](https://buildroot.org/downloads/manual/manual.html#ccache)

`ccache` support is integrated in Buildroot. You just have to enable `Enable compiler cache` in `Build options`. This will automatically build `ccache` and use it for every host and target compilation.

The `cache` is located in the directory defined by the `BR2_CCACHE_DIR` configuration option, which defaults to `$HOME/.buildroot-ccache`. This default location is outside of Buildroot output directory so that it can be shared by separate Buildroot builds. If you want to get rid of the cache, simply remove this directory.