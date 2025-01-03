---
title: "通过Gitbook将Markdown电子书转换为PDF格式"
date: 2021-11-10
categories:
  - 工具货架
tags:
  - 电子书
description: "以《[the-way-to-go_ZH_CN](https://github.com/unknwon/the-way-to-go_ZH_CN)》为例，将它转换为PDF文档。"
slug: convert-gitbook-to-pdf
---

## 找到一本电子书

以《[the-way-to-go_ZH_CN](https://github.com/unknwon/the-way-to-go_ZH_CN)》为例，先`clone`下来。

## 预处理

GitBook使用简单的目录结构，通过 `SUMMARY.md` 目录文件来确定哪些文件被转换。原书目录是`TOC.md`，因此将`TOC.md`改名为`SUMMARY.md`。

原书的图片链接都带上了`?raw=true`参数，导致转换后的PDF文件里图片无法正确显示，需要全部删除

```bash
grep -rl "?raw=true" ./ | xargs sed -i "" 's/?raw=true//g'
```

## 开始转换

安装[calibre](https://calibre-ebook.com)，主要是需要`ebook-converter`这个命令行工具

1. 创建一个符号连接

```bash
sudo ln -s /Applications/calibre.app/Contents/MacOS/ebook-convert /usr/local/bin
```

`/usr/local/bin`可以是`$PATH$`中的任何文件夹

2. 安装`gitbook-cli`，这时会自动编译安装`gitbook`

```bash
npm install gitbook-cli -g
```

3. 转换之

```bash
gitbook pdf ./ ./book.pdf
```
