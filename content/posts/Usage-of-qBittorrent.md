+++
title = "qBittorrent 的一些事儿"
date = "2022-04-22T00:00:00+08:00"
author = "Magicewenli"
cover = ""
tags = ["qBittorrent", "PT"]
keywords = ["", ""]
description = ""
showFullContent = false
readingTime = true
Toc = true
+++

## Introduction

大学4年即将结束，回想这段时间。有时一个机缘巧合，我们就会被吸引并走进一个新的世界。PT就是我在大一期间认识到的，这种Freeeee的感觉太好了。后来组了自己的NAS，装入大容量硬盘，开启我的下载做种之路。

有时会遇到种子掉线的问题，虽然出现的频率很低，但每次出现都让人困恼不已。具体情况是因为torrent下载工具和NAS不在同一个设备上，每当突然掉电后，恢复启动的torrent下载工具无法确定种子进度，于是种子进度干脆显示成0%。要想恢复做种进度，需要对所有种子重新进行散列检测。

对于数以TB的文件，重新检测不仅需要大量的时间，而且会消耗大量的硬盘写入量，这对无论哪种硬盘都是一个灾难。

之前开发过qBittorrent和uTorrent的备份工具，没有达到预期效果。

今天看到了[这篇文章](https://tomorrow505.xyz/%E5%9F%BA%E4%BA%8Eqbittorrentapi%E5%AE%9E%E7%8E%B0%E6%89%B9%E9%87%8F%E5%8A%A0%E8%BD%BD%E7%A7%8D%E5%AD%90%E8%B7%B3%E6%A3%80/)，感觉很有参考意义。本文就是在此基础上做的一点修改。


## qbittorrent-api

[qbittorrent-api](https://github.com/rmartin16/qbittorrent-api) 是qBittorrent Web API的Python实现。[RTD](https://qbittorrent-api.readthedocs.io/en/latest/introduction.html)

它支持qBittorrent v4.1.0+版本，基本实现了所有API。

支持的版本：
```python
from qbittorrentapi import Version
versions = Version.supported_app_versions()
print(sorted(versions))

# ['v4.1.0', 'v4.1.1', 'v4.1.2', 'v4.1.3', 'v4.1.4', 'v4.1.5', 'v4.1.6', 'v4.1.7', 'v4.1.8', 'v4.1.9', 'v4.1.9.1', 'v4.2.0', 'v4.2.1', 'v4.2.2', 'v4.2.3', 'v4.2.4', 'v4.2.5', 'v4.3.0', 'v4.3.0.1', 'v4.3.1', 'v4.3.2', 'v4.3.3', 'v4.3.4.1', 'v4.3.5', 'v4.3.6', 'v4.3.7', 'v4.3.8', 'v4.3.9', 'v4.4.0', 'v4.4.1', 'v4.4.2']
```

qBittorrent有许多版本，有些版本API变化很大。[官方WIKI](https://github.com/qbittorrent/qBittorrent/wiki#user-content-webui-api)中将WebUI API划为三个版本。


| State    | Version                   |
|----------|---------------------------|
| Current  | qBittorrent v4.1+         |
| Previous | qBittorrent v3.2.0-v4.0.4 |
| Obsolete | qBittorrent v3.1.x        |

有一些PT站点限定使用`v3.*.*`版本，这样的话，就需要自己更新API了。

例如
- `v3.*.*`的login接口为 `http://localhost:8080/login`
- `v4.1.*`的login接口为`http://localhost:8080/api/v2/auth/login`

要寻找合适的版本，参考PT站的常见问题和[sourceforge](https://sourceforge.net/projects/qbittorrent/files/qbittorrent-win32/).

## qBittorrent 跳过检测

根据[torrent_parser issue#11](https://github.com/7sDream/torrent_parser/issues/11), `torrent_parser.py#L46`

```
from typing_extensions import OrderedDict
```

是误加入，应该手动删除。

`BitTorrent`fastresume文件的解析包`bencode`似乎不支持python3了，这里使用`bencodepy`作为替代。

{{< code language="python" title="完整代码" id="1" expand="Show" collapse="Hide" isCollapsed="false" >}}
from qbittorrentapi import Client, LoginFailed
import torrent_parser as tp
from yaml import load
import os
import hashlib
import bencodepy
try:
    from yaml import CLoader as Loader
except ImportError:
    from yaml import Loader

def get_qb(config):
    # 获取客户端实例
    qb = Client(host='%s:%s' % (config['ip'], config['port']), username=config['user'], password=config['pwd'])

    # 客户端进行登录
    try:
        qb.auth_log_in()
    except LoginFailed as e:
        print(e)

    # 输出客户端信息
    print(f'qBittorrent: {qb.app.version}')
    print(f'qBittorrent Web API: {qb.app.web_api_version}')
    print()
    return qb


# 根据种子路径获取其hash值
def get_hash(filename):
    with open(filename, 'rb') as f:
        torrent_data = f.read()
        metainfo = bencodepy.decode(torrent_data)
        info = metainfo[b'info']
        return hashlib.sha1(bencodepy.encode(info)).hexdigest()


# 加载配置文件
def load_config():
    data = load(open('./config.yml', 'rb'), Loader=Loader)
    return data


# 获取种子文件列表信息
def pars_torrent(path):
    file_paths = []
    data = tp.parse_torrent_file(path)
    info = dict(data['info'])
    if 'files' in info.keys():
        for item in info['files']:
            file_paths.append(info['name'] + '\\' + '\\'.join(item['path']))
    else:
        file_paths.append(info['name'])
    return file_paths

# 主程序入口
if __name__ == '__main__':
    user_info = load_config()
    qb = get_qb(user_info['qb'])
    save_paths = user_info['save_path']
    
    # 输入种子所在目录
    torrents_path = input("请输入种子保存路径>>")
    files = os.listdir(torrents_path)
    
    # 循环处理种子信息
    for file in files:
        if not file.endswith('.torrent'):
            continue
        print("*********************** 当前处理种子文件：%s ***********************" % file)
        torrent_path = os.path.join(torrents_path, file)
        
        # 种子已经存在于客户端，跳过
        hash_value = get_hash(torrent_path)
        torrent = qb.torrents_info(torrent_hashes=hash_value)
        if len(torrent) == 1:
            print("当前种子已经存在于客户端，跳出……")
            continue
        
        # 判断种子文件是否存在于常用的保存路径
        torrent_files = pars_torrent(torrent_path)
        print('种子文件包含%d个文件'%len(torrent_files))
        for save_path in save_paths:
            flag = True
            for torrent_file in torrent_files:
                if not os.path.isfile(os.path.join(save_path, torrent_file)):
                    print('%s 文件不存在，跳出……' % os.path.join(save_path, torrent_file))
                    flag = False
                    break
            if flag == True:
                qb.torrents_add(torrent_files=torrent_path, save_path=save_path, is_skip_checking=True, is_paused=True)
                print('种子检验完毕，保存路径为%s，已经添加！！' % save_path)
{{< /code >}}

```
qBittorrent: v4.1.4
qBittorrent Web API: 2.1.1

*********************** 当前处理种子文件：Severance.S01.1080p.ATVP.WEB-DL.DDP5.1.Atmos.H.264-TEPES.torrent ***********************
种子文件包含9个文件
种子检验完毕，保存路径为Y:\Transmission\DOWNLOADS，已经添加！！
```

{{< code language="yaml" title="config.yml" id="2" expand="Show" collapse="Hide" isCollapsed="false" >}}
qb:
  ip: '192.168.123.189'
  port: '12345'
  user: admin
  pwd: adminadmin
save_path:
    - Y:\Transmission\DOWNLOADS
{{< /code >}}