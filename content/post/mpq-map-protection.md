---
title: "301 张打不开的魔兽地图"
description: "MPQ 的保护手法、验证方法，以及把打不开的地图捞出来的三条路"
date: 2026-08-14T18:59:57+08:00
categories:
  - 工具货架
tags:
  - Warcraft III
  - MPQ
  - 逆向
slug: mpq-map-protection
hidden: false
---

[上一篇](/p/war3-map-archive/)整理完一万张地图之后，剩下 301 张读不出元数据。名字、作者、推荐人数全是空的，站点上只能拿文件名凑数。

这 301 张里，223 张能靠扫描扇区数据捞出一点信息，78 张连这个都做不到。我想知道它们到底被做了什么。

## 一、地图保护都在做什么

`w3x` 就是一个 MPQ 归档，前面挂 512 字节的 `HM3W` 头。MPQ 靠两张表定位文件：hash 表按文件名的哈希索引，block 表存实际的偏移、大小和标志位。两张表都用固定密钥加密，密钥表本身由一个确定的算法生成：

```python
CRYPT = [0] * 0x500

def _prepare():
    seed = 0x00100001
    for i in range(0x100):
        idx = i
        for _ in range(5):
            seed = (seed * 125 + 3) % 0x2AAAAB
            hi = (seed & 0xFFFF) << 16
            seed = (seed * 125 + 3) % 0x2AAAAB
            CRYPT[idx] = hi | (seed & 0xFFFF)
            idx += 0x100

def hash_string(name, kind):
    """kind: 0x000 桶索引， 0x100 名字 A, 0x200 名字 B, 0x300 文件密钥"""
    seed1, seed2 = 0x7FED7FED, 0xEEEEEEEE
    for b in name.encode("latin-1", "replace"):
        ch = _UP[b]
        seed1 = CRYPT[kind + ch] ^ ((seed1 + seed2) & 0xFFFFFFFF)
        seed2 = (ch + seed1 + seed2 + (seed2 << 5) + 3) & 0xFFFFFFFF
    return seed1 & 0xFFFFFFFF
```

当年流传的保护手法基本围绕两个论断：拿到 MPQ 也不知道里面有哪些文件；只有知道文件名才能访问文件。由此推出的招式是把 `dwBlockTableSize` 改得比 `dwHashTableSize` 大、把失效的 hash/block 项改成有效、把 `dwHashTableSize` 放大让暴力 listfile 变龟速。这些招式**确实能**干掉当年的 MPQ 工具，但打击面很窄。

第一个论断在 `w3x` 上几乎没有意义：名字是固定集合（`war3map.w3i`、`war3map.j`、`war3mapMap.blp`……），导入文件的路径又明写在 `war3map.imp` 里。懂格式的读取方从来不需要枚举。

第二个论断是错的。block table 自带 offset / size / flags，不需要名字就能 dump 每个成员的字节；加密成员的密钥也能用已知明文反推（StormLib 的 `DetectFileKeyByContent` 就干这个）。甚至连表都不需要——MPQ 扇区是一字节压缩掩码加压缩流，zlib 成员在文件里就是 `02 78 9C` 开头，直接扫都能扫出来。

所以那套招式攻击的是**枚举器**，不是按名读取。魔兽只读它要的文件，从不枚举，这才是加密图照样能玩的原因。

有两个细节值得抄进实现：

- **`dwHeaderSize` 只跟 `0x20` 比大小**。Storm 接受任何 `>= 0x20` 的头，死等 `== 0x20` 的工具才会被这招骗到。
- **桶掩码必须用声明的表大小**。`HashString(name, 0) & (dwHashTableSize - 1)` 是 Storm 的算法，把跑出文件的表截断到更小的 2 的幂会丢掉尾部条目。

然后是数据。我把那 301 张挨个量了一遍，看这些招式到底在不在场：

| 招式 | 出现次数 |
|---|---|
| `dwBlockTableSize > dwHashTableSize` | 10 |
| 声明的 block 数超出文件尾 | 9 |
| 声明的 hash 数超出文件尾 | 2 |
| `dwHeaderSize` 被改坏 | 72 |
| 额外的假 `MPQ\x1A` 头 | 1 |

301 张里只有 10 张用了主招。这些手法解释不了这批图，得换个方向查。

## 二、先证伪：那不是"换了密钥"

295 张有可用文件头的图里，**284 张在声明位置上的 hash 表用标准密钥解出来是噪声**，276 张连一个已知魔兽文件名都对不上。

最顺手的猜测是"保护者换了加密密钥"。这个猜测可以被彻底排除，因为 Storm 的表加密算法里，第 0 个字的掩码只取决于密钥：

```
seed0 = 0xEEEEEEEE + CryptTable[0x400 + (key & 0xFF)]
mask0 = key + seed0
```

于是只要猜中明文的第 0 个字，`mask0` 就确定了；而密钥的低字节只有 256 种可能，每种可能都唯一确定一个候选密钥。**验证 256 个候选，而不是 2^32 个**：

```python
def candidate_keys(raw0, plain0):
    """由 raw0 ^ plain0 反推所有自洽的密钥"""
    mask0 = raw0 ^ plain0
    out = []
    for b in range(256):
        seed0 = (0xEEEEEEEE + CRYPT[0x400 + b]) & 0xFFFFFFFF
        key = (mask0 - seed0) & 0xFFFFFFFF
        if key & 0xFF == b:          # 自洽性检查
            out.append(key)
    return out
```

明文第 0 个字的猜法很自然：hash 表的空槽是 `0xFFFFFFFF`，block 表第 0 项的偏移通常是 `0x20`。

在正常地图上，这段代码一次就还原出标准密钥 `0xC3AF3770`，解出来 20 多个文件名，证明方法本身没问题：

```
key 0xC3AF3770 (empty slot) score 1.00
names=['war3mapSkin.txt', 'war3map.shd', 'war3map.w3i', 'war3map.w3h', ...]
标准密钥就是 0xC3AF3770
```

在那 284 张上，**任何密钥都解释不了那块区域**。我又写了个全文件扫描，用标准密钥在每个字节偏移上试着解出 block 表（第 0 个字的掩码固定，可以先做一次廉价的预筛），健康地图上能精确命中声明位置，这些图上一个都找不到。

表不是被换了密钥，也不是被搬走了。表没了。

## 三、不靠表也能读：顺着数据区往下走

成员数据还在，而且它是自描述的。

MPQ 把成员从归档开头连续排布，每个基于扇区的成员以自己的扇区偏移表开头：`n+1` 个小端 `u32`，第一个值恰好是 `4*(n+1)`，最后一个值是这个成员的压缩后大小。这就够了——不碰任何一张表，从 `0x20` 一路串到 hash 表开始的地方：

```rust
fn member_at(&self, buf: &[u8], pos: u64, end: u64) -> Option<SalvagedMember> {
    let start = self.offset.checked_add(pos)?;
    let first = LittleEndian::read_u32(&buf[start as usize..]);
    if first < 8 || first % 4 != 0 || first > MAX_SECTOR_TABLE {
        return None;
    }
    let count = first / 4;                        // 扇区数 + 1
    let mut offsets: Vec<u32> = Vec::with_capacity(count as usize);
    for i in 0..count {
        offsets.push(LittleEndian::read_u32(&buf[(start + u64::from(i) * 4) as usize..]));
    }
    // 扇区表单调递增，且没有哪个扇区能超过归档声明的扇区大小；噪声两条都过不了
    for pair in offsets.windows(2) {
        if pair[1] < pair[0] || pair[1] - pair[0] > self.sector_size {
            return None;
        }
    }
    let packed_size = *offsets.last()?;
    Some(SalvagedMember { offset: pos as u32, packed_size, sector_offsets: offsets })
}
```

拿 200 张健康地图对照验证：这个走法**精确复现真实 block 表**（偏移、大小、顺序全同）99 例，其余多数是正确前缀。它会在零长度成员、单块存储成员和加密成员上停下——加密成员的扇区表本身也是加密的，读不动。

在那 301 张上，它找到 192 张的 `war3map.w3i`、172 张的 `war3mapMap.blp`、113 张的 `war3map.wts`。封面和字符串表是新增的收获，原来的扇区扫描只找 w3i 和 wts。

有一点必须说清楚：**这个方法拿不到文件名**。名字只存在于 hash 表里，而且是单向哈希，没有任何东西可以反推。走出来的成员只能靠内容判断类型。

## 四、尾部那串 0x00

有一张 66 KB 的图，几何结构完美得可疑：成员从 `0x20` 一路连续排到 `0x10324`，正好是文件头声明的 hash 表位置；从那里到文件尾恰好 496 字节 = 16×16 + 15×16，正好是声明的 16 个 hash 项加 15 个 block 项。一切都对得上，只有内容是噪声。

把那段 dump 出来，规律肉眼可见：

```
00010324  5b cd 86 2d 07 c6 00 61  08 c3 73 b8 7c 41 12 00  [..-...a..s.|A..
00010334  6d b2 ab 4d f6 b4 c9 be  00 36 39 d0 26 87 da e4  m..M.....69.&...
00010344  a3 00 36 f9 a4 4d 8e f4  4f 1e 00 d1 a4 db 5d 3a  ..6..M..O.....]:
```

每 9 个字节出现一个 `0x00`。统计了一下，从 `0x101F8` 到文件尾，55 个零字节，间隔**全部**是 9。

把这些零剔掉，hash 表完整浮现——16 个槽、15 个真实文件名、block 索引 0 到 14 齐全：

```
 0 war3map.w3i     blk=7      8 Scripts\war3map.j  blk=e
 1 war3map.w3t     blk=a      9 war3map.w3a        blk=4
 2 war3mapMisc.txt blk=3     10 war3map.doo        blk=c
 3 war3map.mmp     blk=b     11 war3map.shd        blk=6
 5 war3map.wts     blk=8     13 war3map.w3e        blk=0
 6 war3map.wpm     blk=9     14 war3mapMap.blp     blk=1
 7 war3mapSkin.txt blk=5     15 war3map.w3u        blk=2
```

block 表只活下来 7 项——插进去的字节把尾巴挤出了文件——但这 7 项和前面走出来的成员**逐项对得上**：偏移 `0x20`、`0x2E8F`、`0x6C8B`、`0x7F9C`、`0x8091`、`0x89B5`、`0x8AA2`，一个不差。block 索引顺序就是数据顺序，走法能把丢掉的那截补回来。

值得注意的是这排除了什么：文件头、成员链、文件长度三者互相自洽，说明这是事后损坏，不是保护手段。**Storm 自己也读不了它**。所以这条线索最后没写进代码——走法不需要名字就能拿到同样的成员。

## 五、真正拖垮一切的 bug

做完上面这些，我把打捞逻辑接进批量重扫，然后 10365 个对象跑到 99% 就再也不动了。

前后猜了好几轮：走表没上限？全量解压太贵？内存打爆？并发太高？每一轮都改了点东西，每一轮都没解决。

最后老老实实上采样。第一次采出来全是裸地址——release profile 开了 `strip = true`，符号全没了。把这个 profile 改成保留符号重跑，栈一目了然：

```
catalog::derive → salvage_w3i (catalog.rs:747)
  → war3_mpq::compression::decompress (compression.rs:46)
    → implode::exploder::Exploder::explode_block
```

问题代码：

```rust
let mut exploder = Exploder::new(&DEFAULT_CODE_TABLE);
let mut cpos: u32 = 1;
let mut c = 0;
while !exploder.ended {
    let abuf = &mut data[cpos as usize..len];
    let x = exploder.explode_block(abuf).unwrap();
    cpos += x.0 as u32;                       // x.0 == 0 时，永远不前进
    for (d, s) in out.iter_mut().zip(x.1.iter()) {
        *d = *s;                              // 每个 block 都从 out[0] 覆写
        c += 1;
    }
}
```

两个 bug 叠在一起：

1. **空转**。一个 block 如果既不消费输入也不产出输出，`cpos` 不动，`ended` 不置位，循环永远出不去。打捞这件事的日常就是把垃圾字节喂给解压器，撞上是必然的。
2. **多 block 写错位置**。每个 block 都从 `out[0]` 开始写，而 `c` 还在累加。任何超过一个 block 的 imploded 文件，解出来都是错的。

修法就是让它有进展可查、写到该写的地方：

```rust
while !exploder.ended && read < data.len() && written < out.len() {
    let (consumed, block) = exploder
        .explode_block(&data[read..])
        .map_err(|_| Error::new(ErrorKind::InvalidData, "PKWARE stream is malformed"))?;

    if consumed == 0 && block.is_empty() {
        return Err(Error::new(
            ErrorKind::InvalidData,
            "PKWARE stream stopped making progress",
        ));
    }

    read += consumed;
    let take = block.len().min(out.len() - written);
    out[written..written + take].copy_from_slice(&block[..take]);
    written += take;
}
Ok(written)
```

改完之后，593 个待处理对象**全部跑完只要 1.85 秒**。

这里有个更值得记的教训。我在排查过程中，一度认定是"暴力扫描每个字节找 zlib 头"太贵，把它从默认路径挪走了——代价是 29 张图掉回读不出。修完 implode 再实测，那个扫描全程只花不到 2 秒。**我砍掉的东西从来不是瓶颈**，只是它离真凶最近，看起来最可疑。

## 六、结果

最终目录状态：

| | 现在 | 之前 |
|---|---|---|
| ok | **9775** | 9772 |
| carved（扇区打捞） | 223 | 226 |
| metadata_error | 78 | 78 |
| 战役包（不解析元数据） | 289 | 289 |

3 张图从"打捞出一点"升级成"完全可读"，靠的是两个和保护无关的修复：一个是扇区位移超过 31 时按 x86 寄存器语义回绕（有三张图的 `sector_size_shift` 是 65295，Storm 在寄存器里移位只取低 5 位，所以它们一直是好图，是我的实现在拒绝它们），另一个就是上面那个 implode。

那 78 张仍然读不出的，绝大多数卡在同一个地方：**第一个成员是加密的**，扇区表也一并加密，走法在第一步就停住。而 `FILE_ENCRYPTED` 的密钥由文件的 basename 派生，名字恰恰是唯一拿不到的东西。

不过第二节那个已知明文攻击在这里同样成立：扇区表的第 0 项必定是 `4*(n+1)`，枚举合理的扇区数就能把候选密钥压到很小的集合，逐个用"偏移单调递增、扇区能解压"来验证。StormLib 的 `DetectFileKeyByContent` 就是这么做的。这是下一步，还没写。

代码都在 [war3-maps](https://github.com/war3-archive/war3-maps)：MPQ 读取在 `crates/war3-mpq`，打捞逻辑在 `salvage.rs` 和 `carve.rs`，详细的验证记录在 [docs/PROTECTED_MAPS.md](https://github.com/war3-archive/war3-maps/blob/main/docs/PROTECTED_MAPS.md)。

回头看，当年那套保护思路搞错了边界在哪：它守的是"能不能知道名字"，而实际的边界是"数据在不在"。名字没了可以靠结构走，结构没了可以靠特征扫，只要字节还在，就总有办法。真正让我卡住三个小时的，反而是自己代码里一个二十行的循环。
