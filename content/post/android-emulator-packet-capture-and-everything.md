---
title: "Android 抓包以及 mitmproxy"
date: 2021-11-26
categories:
  - 开发
tags:
  - Android
  - 抓包
description: "这篇文章介绍了如何使用 mitmproxy 抓取 Android Emulator 的包。"
slug: android-emulator-packet-capture-and-everything
---

## 最佳实践

> 经过一段时间的研究，又有了新的看法。

准备以下两种工具：

- mitmproxy
- Android Emulator(MuMu, BlueStack ...)

### mitmproxy

`mitmproxy`最好使用[pipx](https://pypa.github.io/pipx/)安装。因为`mitmproxy`运行在独立的`venv`中，使用`pipx`方便为`mitmproxy`安装额外的 python 包。

```bash
brew install pipx
pipx install mitmproxy
```

最好按照提示说明，使用`pipx ensurepath`修改环境变量。

这样我们就可以为`mitmproxy`安装额外的 python 包了。

```bash
pipx inject mitmproxy pycryptodome # 安装 pycryptodome 包，用于AES解码
```

将浏览器代理设置到`8080`端口，打开(mitm.it)[mitm.it]下载对应平台的证书。

### Android Emulator

抓包之前有两个步骤：

1. 设置手动代理
2. 安装并信任自签名 https 证书

设置 WiFi 代理为主机`8080`端口：

![Snipaste_2021-11-26_01-12-38](/img/Snipaste_2021-11-26_01-17-55.png)

以下是简化的脚本[^4]，先看看`adb devices`信息，是否已经连接。如果没有成功连接需要`adb kill-server`，再重试几次。或者参照后文[^3]。
直接运行以下脚本`./push.sh YOUR_CRT.crt`：

```shell
PEM_FILE_NAME=$1
echo "$PEM_FILE_NAME"
hash=$(openssl x509 -inform PEM -subject_hash_old -in $PEM_FILE_NAME | head -1)
OUT_FILE_NAME="$hash.0"

cp $PEM_FILE_NAME $OUT_FILE_NAME
openssl x509 -inform PEM -text -in $PEM_FILE_NAME -out /dev/null >> $OUT_FILE_NAME

echo "Saved to $OUT_FILE_NAME"
adb shell mount -o rw,remount,rw /system
adb push $OUT_FILE_NAME /system/etc/security/cacerts/
adb shell mount -o ro,remount,ro /system
adb reboot
```

如果模拟器正常重启的话应该就可以了。

### 抓包

运行`mitmweb`，通过 web 界面观察包的发送和接收。

![123](/img/mitmweb.png)

`mitmproxy` 是一个非常强大的工具，其用法如恒河沙数，无不天花乱坠。[官方文档提供的用例](https://docs.mitmproxy.org/stable/addons-examples/)很值得仔细参阅，这里只介绍一个简单的例子。

`ContentView`是显示`request`或`response`负载的界面。有时需要查看的`payload`不是明文的`json`或`plain text`，默认情况下会以`raw`格式显示。

![content view](/img/content_view.png)

这样会很麻烦。

所以可以考虑通过插件增加一个`ContentView`的选项，让请求以我想要的方式显示。模仿[addons-examples/#contentview](https://docs.mitmproxy.org/stable/addons-examples/#contentview)，以挂载脚本的方式启动`mitmweb -S decode.py`：

```python
from mitmproxy import contentviews, flow
from mitmproxy import http
from mitmproxy.contentviews.json import format_json
from Crypto.Cipher import AES
import base64
import hashlib
import json
import random

class ViewAESDecode(contentviews.View):
    name = "AES decode"

    def __call__(
        self,
        data: bytes,
        *,
        content_type: Optional[str] = None,
        flow: Optional[flow.Flow] = None,
        http_message: Optional[http.Message] = None,
        **unknown_metadata,
    ):
        jsdata = decrypt(data)
        jsdata = json.loads(jsdata)
        return "AES decode", format_json(jsdata)

    def render_priority(
        self,
        data: bytes,
        *,
        content_type: Optional[str] = None,
        flow: Optional[flow.Flow] = None,
        http_message: Optional[http.Message] = None,
        **unknown_metadata,
    ):
        if 'what I want' in flow.request.host:
            return 10  # 出现的权重，为10的话会在最前面
        else:
            return 0

def decrypt(data):
   key = '1234567890123456'
   iv = '1234567890123456'
   mode = AES.MODE_CBC
   cryptor = AES.new(key, mode, iv)
   data = base64.b64decode(data)
   decrypted = cryptor.decrypt(data)
   return decrypted.decode('utf-8')


def load(l):
    contentviews.add(view)


def done():
    contentviews.remove(view)
```

结果如下：
![content view](/img/content_result.png)

## ADB 无法连接的问题

打开 USB 调试。`夜神`的 USB 调试并不通过默认的 5037 端口与 adb 客户端通信，可能是考虑多开也许超过 16 个客户端的官方限制。

一般情况下，只需以下步骤就能连接 adb

```shell
# WSL ubuntu 18.04
wesley@WIN10:/mnt/c/Users/Vita/Desktop$ adb devices
List of devices attached

wesley@WIN10:/mnt/c/Users/Vita/Desktop$ adb connect 127.0.0.1:62001
connected to 127.0.0.1:62001
wesley@WIN10:/mnt/c/Users/Vita/Desktop$ adb devices
List of devices attached
127.0.0.1:62001 device
```

虚拟机比较多时就无效了，需要手动找到端口[^3]。

```powershell
# Powershell
PS C:\Users\Vita> Get-Process | where name -like "Nox*"

Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName
-------  ------    -----      -----     ------     --  -- -----------
   1037     184   177620      49000     161.20  28604   1 Nox
   2006     173  1046392      46020     251.53   4716   1 NoxVMHandle
   3058      16     6268      19040       0.67  27528   1 NoxVMSVC

PS C:\Users\Vita> Get-NetTcpConnection -OwningProcess 4716 -State Listen


LocalAddress    LocalPort RemoteAddress   RemotePort State   AppliedSetting
------------    --------- -------------   ---------- -----   --------------
127.0.0.1       64001     0.0.0.0         0          Listen
127.0.0.1       63001     0.0.0.0         0          Listen
127.0.0.1       62001     0.0.0.0         0          Listen
127.0.0.1       61001     0.0.0.0         0          Listen
```

依次尝试连接这些`LocalPort`，验证`adb devices`是否正常。

[^1]: loco, “当你写爬虫抓不到 APP 请求包的时候该怎么办？【中级篇】,” _知乎专栏_, 2019. <https://zhuanlan.zhihu.com/p/56397466> (accessed Nov. 25, 2021).
[^2]: 空夜无殇, “手机抓不到包的原因与解决方法（非 xposed 框架）,” _知乎专栏_, 2021. <https://zhuanlan.zhihu.com/p/349267640> (accessed Nov. 25, 2021).
[^3]: Mateusz, “ADB can’t connect to Nox,” _Stack Overflow_, Jul. 06, 2018. <https://stackoverflow.com/questions/51214825/adb-cant-connect-to-nox> (accessed Nov. 25, 2021).
[^4]: pwlin, “Android : add cert to system store,” _Gist_, Mar. 07, 2016. <https://gist.github.com/pwlin/8a0d01e6428b7a96e2eb> (accessed Nov. 25, 2021).
