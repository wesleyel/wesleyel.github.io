+++
title = "Android 抓包之歪路"
date = "2021-11-26T02:37:41+08:00"
author = "Magicewenli"
cover = ""
tags = ["webpacket", "Android"]
keywords = ["", ""]
description = ""
showFullContent = false
readingTime = true
Toc = true

+++



## 最佳实践

### Android 5.1

1. 安装`夜神`模拟器，打开夜神多开器，添加Android版本为5.1的模拟器。下载完成后启动。
2. 下载`Fiddler Everywhere`。Setting—Https—Advanced Setting—Export root certificate.
3. 将桌面的`FiddlerRootCertificate.crt`复制到`C:\Users\<UserName>\Nox_share\Download`，此处为共享路径。
4. 在模拟器中手动安装证书。设置—安全—从SD卡安装。

   ![Snipaste_2021-11-26_01-12-38](/img/Snipaste_2021-11-26_01-12-38.png)

5. 设置WiFi代理。

   ![Snipaste_2021-11-26_01-17-55](/img/Snipaste_2021-11-26_01-17-55.png)

6. OK

   ![Snipaste_2021-11-26_01-27-55](/img/Snipaste_2021-11-26_01-27-55.png)

### Android 7.0

安装Android版本为7.0的模拟器，在添加完毕证书后，进行一个额外的步骤。

通过adb工具将用户证书添加到**系统证书**中，先确保adb已连接，见[ADB](#adb)。

```shell
# WSL ubuntu 18.04
HASH_FILE_NAME=$(adb shell ls /data/misc/user/0/cacerts-added)
echo "HASH_FILE_NAME: $HASH_FILE_NAME"

adb pull /data/misc/user/0/cacerts-added/$HASH_FILE_NAME
adb push $HASH_FILE_NAME /system/etc/security/cacerts/
adb shell ls -lt /system/etc/security/cacerts/ | head -5

echo "Add system certs successful"
rm $HASH_FILE_NAME
```

设置代理，或者通过`Proxifier`添加一个端口为8866的http代理服务器，与一条`nox*.exe` proxy的代理规则。

## 防止失忆做的补充

### 抓包工具

#### Fiddler

Fiddler现在分了`classic`和`everywhere`两个版本，这两版基本功能都一样，各有特点。

后者在UI上做了升级，显示内容比较直观，更加Accessible。新UI给人一股Postman味，这是一句夸奖的话。必须**登录账户**才能使使用，提供了云服务，同时以订阅制收费。

老版本也能照常使用，有很多强大的开源插件，比如[FreeHttp](https://github.com/lulianqi/FreeHttp)。在网页中访问`http://localhost:<proxy-port>`，里面就有证书的下载链接。

它们的使用过程都是打开代理—允许远程访问—生成证书。不过我在用`classic`版时，远程应用无论如何都连接不到代理上，用新版没有问题。

#### Postman

感觉这个公司的工具非常有极客精神，他们的产品既好用，又`Free of use`。通过代理抓包只是它的一个小功能，设置好端口，按照[官方文档](https://learning.postman.com/docs/sending-requests/capturing-request-data/capturing-http-requests/#capture-https-traffic-with-postmans-built-in-proxy)里说的做就好。记得下载安装 [OpenSSL v1.1.1L](https://slproweb.com/products/Win32OpenSSL.html)的时候不要选带Light的版本，安装完毕后重启Postman，随后就能在`%APPDATA%\Postman\proxy`找到证书`postman-proxy-ca.crt`。

![Snipaste_2021-11-26_01-57-36](/img/Snipaste_2021-11-26_01-57-36.png)

#### Proxifier

这个工具是专门给程序设置代理的。有时有为每个程序分别设置代理的需求，程序本身提供代理设置的还好说（但手工管理它们也不轻松），没有这个选项的那就只能使用`Proxifier`这类工具了。

手工设置Android代理，就是填写WiFi设置中的高级选项。

### 证书

用自己的手机是可行的，不过用虚拟机是更稳妥的选择。抓包的时候会安装证书，手机自带的证书是**系统证书**，而我们之后安装的证书是**用户证书**，两者的级别和权限是不一样的。

7.0之后的Android就不再**信任用户证书**了。所以在进行抓包时，数据并不走**用户证书**，App也会发出一个不再信任证书的警告，也就抓不到包。而5.1版本，系统信任**用户证书**。

![Snipaste_2021-11-26_01-18-05](/img/Snipaste_2021-11-26_01-18-05.png)

这里我走了一些弯路，不过总结一下可以找到3种使得证书信任的方法：

1. 直接安装5.1系统，随后安装证书（设置-安全-从SDCard安装证书）。

2. 安装7.0或以上的系统，想办法将我们的证书添加到**系统证书**[4]。

3. 安装7.0或以上的系统，安装`xposed`，hook certificate pinning，使得app跳过证书校验[7]。

### Android虚拟机

这方面尝试的不多，自己仅用过`蓝叠(Bluestacks)`，`夜神(Nox)`和`Genymotion`。听说网易`MoMo`也不错，最后用的是夜神。

刚好三种都分别安装、卸载了一遍。

`Genymotion`安装好了直接无法启动虚拟机，G了。

`蓝叠`的Rom定制化程度很高，换句话说就是与原生系统差别比较大。系统设置里许多地方缺失了，好像没找到添加证书的入口。它除广告外还自带了Chrome和另一些常用工具，甚好。

`夜神`这款基本上满足了抓包的需要。自带Root权限，这样就可以装`Xposed`，还可以装`Termux`玩玩。有个官方论坛有许多交流帖子，国外也有很多人用。遇到问题比较容易解决。

### ADB

打开USB调试。`夜神`的USB调试并不通过默认的5037 端口与adb客户端通信，可能是考虑多开也许超过16个客户端的官方限制。

一般情况下，只需以下步骤就能连接adb

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

虚拟机比较多时就无效了，需要手动找到端口[3]。

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

## 参考文档

[1]loco, “当你写爬虫抓不到APP请求包的时候该怎么办？【中级篇】,” *知乎专栏*, 2019. <https://zhuanlan.zhihu.com/p/56397466> (accessed Nov. 25, 2021).

[2]空夜无殇, “手机抓不到包的原因与解决方法（非xposed框架）,” *知乎专栏*, 2021. <https://zhuanlan.zhihu.com/p/349267640> (accessed Nov. 25, 2021).

[3]Mateusz, “ADB can’t connect to Nox,” *Stack Overflow*, Jul. 06, 2018. <https://stackoverflow.com/questions/51214825/adb-cant-connect-to-nox> (accessed Nov. 25, 2021).

[4]pwlin, “Android : add cert to system store,” *Gist*, Mar. 07, 2016. <https://gist.github.com/pwlin/8a0d01e6428b7a96e2eb> (accessed Nov. 25, 2021).

[5]“Capturing HTTP requests,” *Postman Learning Center*, 2021. <https://learning.postman.com/docs/sending-requests/capturing-request-data/capturing-http-requests/#capture-https-traffic-with-postmans-built-in-proxy> (accessed Nov. 25, 2021).

[6]用户1470878743, “7.x系统的夜神安装Xposed - 辅助工具 夜神游戏论坛,” *Yeshen.com*, 2021. <https://bbs.yeshen.com/forum.php?mod=viewthread&tid=33446> (accessed Nov. 25, 2021).

[7]ac-pm, “SSLUnpinning_Xposed: Android Xposed Module to bypass SSL certificate validation (Certificate Pinning).,” *GitHub*, 2021. <https://github.com/ac-pm/SSLUnpinning_Xposed> (accessed Nov. 25, 2021).
