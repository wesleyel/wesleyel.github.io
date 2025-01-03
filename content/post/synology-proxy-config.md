---
title: "Synology Proxy Config"
description:
date: 2025-01-03T21:59:46+08:00
categories:
  - 工具货架
tags:
  - 群辉
hidden: false
---

> refer: [给群晖 Docker 命令配置代理](https://blog.mitsea.com/8c059ad1807e424d8f7059b330525443/)

1. 首先确保内网里有一个能够访问互联网的代理，随便什么设备，随便什么客户端，只要能起 http 代理就行，注意打开 LAN 访问权限

2. 执行下面的命令创建文件夹

   ```bash
   sudo mkdir -p /etc/systemd/system/pkg-ContainerManager-dockerd.service.d
   ```

3. 执行下面的命令创建配置文件

   ```bash
   sudo vi /etc/systemd/system/pkg-ContainerManager-dockerd.service.d/http-proxy.conf
   ```

4. 编辑内容如下，地址根据自己的 IP 和客户端端口修改

   ```bash
   [Service]
   Environment="HTTP_PROXY=http://192.168.2.52:6152"
   Environment="HTTPS_PROXY=http://192.168.2.52:6152"
   Environment="NO_PROXY=localhost,127.0.0.1"
   ```

5. 应用配置文件

   ```bash
   sudo systemctl daemon-reload
   ```

6. 重启服务，注意所有的容器都会被关闭

   ```bash
   sudo systemctl restart pkg-ContainerManager-dockerd.service
   ```
