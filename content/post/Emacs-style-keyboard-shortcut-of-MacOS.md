---
title: "MacOS 的 Emacs 风格键盘快捷键"
date: 2022-05-07
categories:
  - 苹果生态
tags:
  - 速查
  - 快捷键
description: "众所周知，MacOS有一组键盘快捷键，其中常用方向键控制Web 表单、输入框、纯文本文档等文本字段的编辑。但似乎不太为人所知的是，MacOS还原生支持某些 Emacs 键盘快捷键。"
slug: emacs-style-keyboard-shortcut-of-macos
---

+++

> 译自： [(Emacs) Keyboard Shortcuts for Editing Text Fields in OS X](https://jblevins.org/log/kbd)
>
> by JASON BLEVINS (JULY 17, 2015)

众所周知，<abbr class="abbr" title="操作系统">MacOS</abbr> 有一组键盘快捷键，其中常用方向键控制Web 表单、输入框、纯文本文档等文本字段的编辑。举个例子， <kbd>⌘←</kbd>将光标移动到当前行的开头。

尽管它们在官方的文档中有提及[(Mac 键盘快捷键)](https://support.apple.com/en-us/HT201236)，但似乎不太为人所知的是， <abbr class="abbr">MacOS</abbr > 还原生支持某些 Emacs 键盘快捷键。 例如，要移动到当前行的开头或结尾，可以按 <kbd>⌃A</kbd> 或 <kbd>⌃E</kbd>。 要删除光标后当前行上的所有内容，请使用 <kbd>⌃K</kbd>。 要调换光标左右两侧的字符的位置，请按 <kbd>⌃T</kbd>。 要在当前行上居中视口，请按 <kbd>⌃L</kbd>。 像这样的快捷用法比使用方向键更快，后者需要将手指从键盘的主行移开。

下表比较了 Emacs 按键绑定与 <abbr class="abbr">MacOS</abbr> 按键绑定（类似 Emacs 的子集）。 对于 <abbr class="abbr">MacOS</abbr> 快捷键，我们使用常用符号来表示 Command <kbd>⌘</kbd>、Shift <kbd>⇧</kbd>、Option <kbd>⌥</kbd>、Control <kbd>⌃</kbd>、Caps Lock <kbd>⇪</kbd>、Delete <kbd>⌫</kbd> 和 Function <kbd>Fn</kbd> 键，并且将所有字母用大写表示。

Emacs 按键绑定以 Control <kbd>C</kbd>、Meta (Alt) <kbd>M</kbd>、Shift <kbd>S</kbd> 前缀和 Delete <kbd>DEL</kbd> 键，并且将所有字母用小写表示。

## Emacs 和 <abbr class="abbr">MacOS</abbr> 键盘快捷键对比

<table>
<colgroup>
<col style="text-align:left;">
<col style="text-align:left;">
<col style="text-align:left;">
<col style="text-align:left;">
<col style="text-align:left;">
</colgroup>

<thead>
<tr>
	<th style="text-align:left;">对象</th>
	<th style="text-align:left;">方向</th>
	<th style="text-align:left;">Emacs</th>
	<th style="text-align:left;" colspan="2"><abbr class="abbr">MacOS</abbr></th>
</tr>
</thead>

<tbody>
<tr>
	<td style="text-align:left;" colspan="5"><strong>光标移动:</strong> 移动光标 by character, word, line, etc.</td>
</tr>
<tr>
	<td style="text-align:left;" rowspan="2">char</td>
	<td style="text-align:left;">left</td>
	<td style="text-align:left;"><kbd>C-b</kbd></td>
	<td style="text-align:left;"><kbd>⌃B</kbd></td>
	<td style="text-align:left;"><kbd>←</kbd></td>
</tr>
<tr>
	<td style="text-align:left;">right</td>
	<td style="text-align:left;"><kbd>C-f</kbd></td>
	<td style="text-align:left;"><kbd>⌃F</kbd></td>
	<td style="text-align:left;"><kbd>→</kbd></td>
</tr>
<tr>
	<td style="text-align:left;" rowspan="2">word</td>
	<td style="text-align:left;">left</td>
	<td style="text-align:left;"><kbd>M-b</kbd></td>
	<td style="text-align:left;"><kbd>⌃⌥B</kbd></td>
	<td style="text-align:left;"><kbd>⌥←</kbd></td>
</tr>
<tr>
	<td style="text-align:left;">right</td>
	<td style="text-align:left;"><kbd>M-f</kbd></td>
	<td style="text-align:left;"><kbd>⌃⌥F</kbd></td>
	<td style="text-align:left;"><kbd>⌥→</kbd></td>
</tr>
<tr>
	<td style="text-align:left;" rowspan="4">line</td>
	<td style="text-align:left;">begin</td>
	<td style="text-align:left;"><kbd>C-a</kbd></td>
	<td style="text-align:left;"><kbd>⌃A</kbd></td>
	<td style="text-align:left;"><kbd>⌘←</kbd></td>
</tr>
<tr>
	<td style="text-align:left;">end</td>
	<td style="text-align:left;"><kbd>C-e</kbd></td>
	<td style="text-align:left;"><kbd>⌃E</kbd></td>
	<td style="text-align:left;"><kbd>⌘→</kbd></td>
</tr>
<tr>
	<td style="text-align:left;">up</td>
	<td style="text-align:left;"><kbd>C-p</kbd></td>
	<td style="text-align:left;"><kbd>⌃P</kbd></td>
	<td style="text-align:left;"><kbd>↑</kbd></td>
</tr>
<tr>
	<td style="text-align:left;">down</td>
	<td style="text-align:left;"><kbd>C-n</kbd></td>
	<td style="text-align:left;"><kbd>⌃N</kbd></td>
	<td style="text-align:left;"><kbd>↓</kbd></td>
</tr>
<tr>
	<td style="text-align:left;" rowspan="2">doc</td>
	<td style="text-align:left;">begin</td>
	<td style="text-align:left;"><kbd>M-&lt;</kbd></td>
	<td style="text-align:left;"></td>
	<td style="text-align:left;"><kbd>⌘↑</kbd></td>
</tr>
<tr>
	<td style="text-align:left;">end</td>
	<td style="text-align:left;"><kbd>M-&gt;</kbd></td>
	<td style="text-align:left;"></td>
	<td style="text-align:left;"><kbd>⌘↓</kbd></td>
</tr>
</tbody>

<tbody>
<tr>
	<td style="text-align:left;" colspan="5"><strong>文本选中:</strong> 扩展选中文本 by character, word, paragraph, and line</td>
</tr>
<tr>
	<td style="text-align:left;" rowspan="2">char</td>
	<td style="text-align:left;">left</td>
	<td style="text-align:left;"><kbd>C-b</kbd></td>
	<td style="text-align:left;"><kbd>⌃⇧B</kbd></td>
	<td style="text-align:left;"><kbd>⇧←</kbd></td>
</tr>
<tr>
	<td style="text-align:left;">right</td>
	<td style="text-align:left;"><kbd>C-f</kbd></td>
	<td style="text-align:left;"><kbd>⌃⇧F</kbd></td>
	<td style="text-align:left;"><kbd>⇧→</kbd></td>
</tr>
<tr>
	<td style="text-align:left;" rowspan="2">word</td>
	<td style="text-align:left;">left</td>
	<td style="text-align:left;"><kbd>M-b</kbd></td>
	<td style="text-align:left;"><kbd>⌃⌥⇧B</kbd></td>
	<td style="text-align:left;"><kbd>⌥⇧←</kbd></td>
</tr>
<tr>
	<td style="text-align:left;">right</td>
	<td style="text-align:left;"><kbd>M-f</kbd></td>
	<td style="text-align:left;"><kbd>⌃⌥⇧F</kbd></td>
	<td style="text-align:left;"><kbd>⌥⇧→</kbd></td>
</tr>
<tr>
	<td style="text-align:left;" rowspan="4">line</td>
	<td style="text-align:left;">begin</td>
	<td style="text-align:left;"><kbd>C-a</kbd></td>
	<td style="text-align:left;"><kbd>⌃⇧A</kbd></td>
	<td style="text-align:left;"><kbd>⇧⌘←</kbd></td>
</tr>
<tr>
	<td style="text-align:left;">end</td>
	<td style="text-align:left;"><kbd>C-e</kbd></td>
	<td style="text-align:left;"><kbd>⌃⇧E</kbd></td>
	<td style="text-align:left;"><kbd>⇧⌘→</kbd></td>
</tr>
<tr>
	<td style="text-align:left;">up</td>
	<td style="text-align:left;"><kbd>C-p</kbd></td>
	<td style="text-align:left;"><kbd>⌃⇧P</kbd></td>
	<td style="text-align:left;"><kbd>⇧↑</kbd></td>
</tr>
<tr>
	<td style="text-align:left;">down</td>
	<td style="text-align:left;"><kbd>C-n</kbd></td>
	<td style="text-align:left;"><kbd>⌃⇧N</kbd></td>
	<td style="text-align:left;"><kbd>⇧↓</kbd></td>
</tr>
</tbody>

<tbody>
<tr>
	<td style="text-align:left;" colspan="5"><strong>文本删除:</strong> 移除 characters, words, and lines</td>
</tr>
<tr>
	<td style="text-align:left;" rowspan="2">char</td>
	<td style="text-align:left;">left</td>
	<td style="text-align:left;"><kbd>C-h</kbd>, <kbd>DEL</kbd></td>
	<td style="text-align:left;"><kbd>⌃H</kbd></td>
	<td style="text-align:left;"><kbd>⌫</kbd></td>
</tr>
<tr>
	<td style="text-align:left;">right</td>
	<td style="text-align:left;"><kbd>C-d</kbd></td>
	<td style="text-align:left;"><kbd>⌃D</kbd></td>
	<td style="text-align:left;"></td>
</tr>
<tr>
	<td style="text-align:left;" rowspan="2">word</td>
	<td style="text-align:left;">left</td>
	<td style="text-align:left;"><kbd>M-DEL</kbd></td>
	<td style="text-align:left;"></td>
	<td style="text-align:left;"><kbd>⌥⌫</kbd></td>
</tr>
<tr>
	<td style="text-align:left;">right</td>
	<td style="text-align:left;"><kbd>M-d</kbd></td>
	<td style="text-align:left;"></td>
	<td style="text-align:left;"><kbd>Fn</kbd>+<kbd>⌥⌫</kbd></td>
</tr>
<tr>
	<td style="text-align:left;" rowspan="2">line</td>
	<td style="text-align:left;">backwards</td>
	<td style="text-align:left;"><kbd>C–0 C-k</kbd></td>
	<td style="text-align:left;"></td>
	<td style="text-align:left;"><kbd>⌘⌫</kbd></td>
</tr>
<tr>
	<td style="text-align:left;">forwards</td>
	<td style="text-align:left;"><kbd>C-k</kbd></td>
	<td style="text-align:left;"><kbd>⌃K</kbd></td>
	<td style="text-align:left;"></td>
</tr>
</tbody>

<tbody>
<tr>
	<td style="text-align:left;" colspan="5"><strong>搜索:</strong> 查找文本和在结果间移动</td>
</tr>
<tr>
	<td style="text-align:left;" rowspan="3">result</td>
	<td style="text-align:left;">first</td>
	<td style="text-align:left;"><kbd>C-s</kbd></td>
	<td style="text-align:left;"></td>
	<td style="text-align:left;"><kbd>⌘F</kbd></td>
</tr>
<tr>
	<td style="text-align:left;">next</td>
	<td style="text-align:left;"><kbd>C-s</kbd></td>
	<td style="text-align:left;"></td>
	<td style="text-align:left;"><kbd>⌘G</kbd></td>
</tr>
<tr>
	<td style="text-align:left;">previous</td>
	<td style="text-align:left;"><kbd>C-r</kbd></td>
	<td style="text-align:left;"></td>
	<td style="text-align:left;"><kbd>⇧⌘G</kbd></td>
</tr>
</tbody>

<tbody>
<tr>
	<td style="text-align:left;" colspan="5"><strong>滚动:</strong> 滚动编辑窗口</td>
</tr>
<tr>
	<td style="text-align:left;" rowspan="3">page</td>
	<td style="text-align:left;">up</td>
	<td style="text-align:left;"><kbd>M-v</kbd></td>
	<td style="text-align:left;"></td>
	<td style="text-align:left;"><kbd>Fn</kbd>+<kbd>↑</kbd></td>
</tr>
<tr>
	<td style="text-align:left;">down</td>
	<td style="text-align:left;"><kbd>C-v</kbd></td>
	<td style="text-align:left;"><kbd>⌃V</kbd></td>
	<td style="text-align:left;"><kbd>Fn</kbd>+<kbd>↓</kbd></td>
</tr>
<tr>
	<td style="text-align:left;">recenter</td>
	<td style="text-align:left;"><kbd>C-l</kbd></td>
	<td style="text-align:left;"><kbd>⌃L</kbd></td>
	<td style="text-align:left;"></td>
</tr>
</tbody>

<tbody>
<tr>
	<td style="text-align:left;" colspan="5"><strong>杂项:</strong> 其他的插入、编辑等操作</td>
</tr>
<tr>
	<td style="text-align:left;">char</td>
	<td style="text-align:left;">transpose</td>
	<td style="text-align:left;"><kbd>C-t</kbd></td>
	<td style="text-align:left;"><kbd>⌃T</kbd></td>
	<td style="text-align:left;"></td>
</tr>
<tr>
	<td style="text-align:left;">line</td>
	<td style="text-align:left;">insert</td>
	<td style="text-align:left;"><kbd>C-o</kbd></td>
	<td style="text-align:left;"><kbd>⌃O</kbd></td>
	<td style="text-align:left;"></td>
</tr>
<tr>
	<td style="text-align:left;"></td>
	<td style="text-align:left;">kill</td>
	<td style="text-align:left;"><kbd>C-w</kbd></td>
	<td style="text-align:left;"><kbd>⌃K</kbd></td>
	<td style="text-align:left;"></td>
</tr>
<tr>
	<td style="text-align:left;"></td>
	<td style="text-align:left;">yank</td>
	<td style="text-align:left;"><kbd>C-y</kbd></td>
	<td style="text-align:left;"><kbd>⌃Y</kbd></td>
	<td style="text-align:left;"></td>
</tr>
</tbody>
</table>

参考：

- [Text System Defaults and Key Bindings](https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/EventOverview/TextDefaultsBindings/TextDefaultsBindings.html) from the Cocoa Event Handling Guide in the Mac Developer Library.
- [Additional Emacs keyboard shortcuts](https://github.com/nileshk/mac-configuration/blob/99eef47cd434fd3d6f4f1f9e2f50321f32179b88/Library/KeyBindings/DefaultKeyBinding.dict) via a `DefaultKeyBinding.dict` file on GitHub that can be placed in `~/Library/KeyBindings`.
