---
title: "用 Traefik 收拾家里的 Homelab 网络"
description: "从记不住的端口号到一套域名走天下：NAS 上做统一入口时踩过的坑，以及最后收敛出来的思路。"
date: 2026-08-09T21:10:00+08:00
categories:
  - 工具货架
tags:
  - Traefik
  - Docker
  - 群辉
  - 网络
slug: homelab-networking-with-traefik
hidden: false
---

家里的 NAS 上跑着十来个容器，下载、刮削、智能家居、代理、订阅管理，各自占一个端口。
一开始只有两三个服务的时候，`192.168.1.2:8080` 这种地址还能记住；
到了第八个，我已经要翻 Docker 管理界面才知道某个面板到底在哪个端口上。

这篇记录的是把这堆东西收进一个统一入口的过程。
下文出现的域名、IP 都是占位写法，实际部署时替换成自己的即可。

## 一、痛点：不是"配不出来"，而是"配了也不好用"

真正让人难受的不是某一个配置项，而是这几件事叠在一起：

**地址记不住，也没法分享。** 端口是实现细节，却变成了用户接口。
换个设备、换个人用，第一句话永远是"那个下载器在几号端口来着"。

**清一色的 HTTP。** 内网服务大多默认裸 HTTP。浏览器每次都提示不安全，
密码管理器不肯自动填充，某些前端功能（剪贴板、Service Worker）直接不可用。
让每个容器各自配一套证书？十个容器十套续期逻辑，不现实。

**80/443 已经被占了。** NAS 的系统面板自带一个 nginx，牢牢占着这两个端口。
反向代理想监听标准端口，第一步就撞墙。改用 8443 之类的端口，等于又回到了记端口的老路。

**后端还不是一种东西。** 有普通容器，有 `network_mode: host` 的容器（拿不到容器 IP），
还有根本不是容器的系统套件。指望一套自动发现全覆盖是不可能的。

**内网域名拿不到受信任的证书。** 服务不暴露到公网，HTTP-01 验证走不通；
自签证书又要在每台设备上装根证书，家里人的手机不可能一台台去装。

![Homelab 网络拓扑](/img/homelab-network-topology.svg)

## 二、解决思路

### 1. 给反向代理一个独立的局域网身份

既然宿主机的 80/443 被占，就不要和它抢——用 macvlan 给反代容器分一个**独立的局域网 IP**。
在交换机看来它就是一台新设备，独占自己的 80/443，和 NAS 系统面板互不干扰。

```yaml
networks:
  lan:
    driver: macvlan
    driver_opts:
      parent: eth1
    ipam:
      config:
        - subnet: 192.168.1.0/24
          gateway: 192.168.1.1
          # 只把一小段交给 docker 分配，避开路由器 DHCP 池
          ip_range: 192.168.1.8/29
          aux_addresses:
            host-shim: 192.168.1.9
```

这里有两个细节值得单说：

- **`ip_range` 一定要划出来。** 不限制的话 Docker 会认为整个 `/24` 都归它管，
  和路由器的 DHCP 池撞上只是时间问题。
- **`aux_addresses` 预留一个地址**，留给下面要说的 shim，防止被 Docker 分配出去。

### 2. macvlan 的那个坑：宿主机和容器互相看不见

macvlan 有个反直觉的限制：**容器无法与父接口自身的 IP 通信**。
也就是说反代拿到了 `192.168.1.10`，局域网里所有设备都能访问它，
唯独访问不了自己所在的那台宿主机 `192.168.1.2`。

这恰恰是最需要的一条路径——系统面板、host 网络的容器，全都跑在宿主机 IP 上。

解法是在宿主机上再建一个 macvlan 接口作为 shim，专门用来和容器段通信：

```sh
IF=macvlan-shim
PARENT=eth1
SHIM_IP=192.168.1.9
RANGE=192.168.1.8/29

ip link add "$IF" link "$PARENT" type macvlan mode bridge
ip addr add "$SHIM_IP/32" dev "$IF"
ip link set "$IF" up
ip route add "$RANGE" dev "$IF"
```

之后所有"反代 → 宿主机服务"的后端地址一律写 shim 的地址，而不是宿主机本身的 IP。

⚠️ 这个接口**重启就没了**，必须挂到开机任务里。脚本写成幂等的，重复执行无副作用。
我第一次漏了这一步，重启后所有走宿主机的服务集体 502，而容器服务一切正常——
这种"一半好一半坏"的现象，事后看正是 macvlan 隔离的典型症状。

### 3. 一张通配证书，配合 DNS 验证

内网服务不暴露到公网，HTTP-01 走不通，那就走 **DNS-01**：
证书颁发机构要求你在 DNS 里写一条 TXT 记录，只要域名托管在支持 API 的服务商那里，
反代可以自动完成整个流程。域名不需要真的解析到公网 IP。

一次签发一张 `*.lan.example.com` 的通配证书，之后新增服务不再需要碰证书这块：

```yaml
entryPoints:
  websecure:
    address: ":443"
    http:
      tls:
        certResolver: le
        domains:
          - main: lan.example.com
            sans:
              - "*.lan.example.com"
```

**这里踩了一个很花时间的坑。** 反代在提交验证前会自己查一次 DNS，确认 TXT 记录已经生效。
但家用路由器往往开着两个功能，让这个自检永远不可能通过：

- **DNS 劫持**：所有出站 53 端口被重定向到路由器自己，指定任何公共 DNS 都没用；
- **DNS Rebind 保护**：解析结果指向内网地址的域名会被直接吞掉。

结果就是记录明明写进去了，NAS 内部却怎么查都查不到，卡在自检环节反复超时。

处理方式是**关掉主动查询、改成固定等待**：

```yaml
propagation:
  disableChecks: true
  delayBeforeChecks: 90s
```

注意这两行是一组，不能只留前一行。
通配证书里 `lan.example.com` 和 `*.lan.example.com` 共用同一个 TXT 记录名，
两条值必须同时可见；等待时间设成 0 的话，验证请求会赶在传播完成之前发出去，一样失败。

### 4. 两类后端，两种配置来源

前面说过后端不是一种东西，所以配置来源也分两套，各管一摊：

**容器服务走标签自动发现。** 在 compose 里打几行标签，反代自动建好路由，
新增服务不需要碰反代自己的配置：

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.docker.network=proxy"
  - "traefik.http.routers.app.rule=Host(`app.lan.example.com`)"
  - "traefik.http.routers.app.entrypoints=websecure"
  - "traefik.http.services.app.loadbalancer.server.port=3000"
```

关键是 `exposedByDefault: false`：不打标签就不暴露，避免哪天随手起个容器就被挂上域名。
`traefik.docker.network` 也别省——容器往往同时连着好几个网络，
不指明的话反代可能取到一个它根本访问不到的 IP。

**非容器服务走文件声明。** 系统套件、host 网络的容器拿不到容器 IP，
只能手写后端地址，指向前面那个 shim：

```yaml
http:
  routers:
    hass:
      rule: "Host(`hass.lan.example.com`)"
      service: hass
      entryPoints: [websecure]
  services:
    hass:
      loadBalancer:
        servers:
          - url: "http://192.168.1.9:8123"
```

两类路径共用同一套域名和同一张证书，差别只在最后一跳。

![请求分流](/img/homelab-request-routing.svg)

### 5. 出站网络单独一张，且不要抢默认路由

反代和应用之间单独建一个 Docker 网络（这里叫 `proxy`），设成 `internal`——
它只负责"反代 ↔ 应用"这一段流量，没有网关，不会把容器的默认路由抢走。
容器出公网仍然走各自项目的默认 bridge。

这一条看起来是洁癖，实际收益是排查时的确定性：
某个容器连不上外网的时候，你可以立刻排除掉入站网络的嫌疑。

## 三、几个只有踩过才知道的细节

**别给反代容器自己打 `traefik.enable=true`。**
它跑在 macvlan 上、没有 `ports` 声明，自动发现会试图为它建一个默认 service，
然后报 `port is missing`。而这个错误会**作废整个容器的配置**——
连带你精心配置的管理面板路由一起失效。面板应该用内部服务 `api@internal`，在文件配置里声明。

这个坑的恶心之处在于报错和现象对不上：你看到的是"面板 404"，
日志里却是一行关于端口的抱怨。

**保留直连端口作为逃生通道。**
反代挂了、证书过期了、配置改错了，你总得有办法进去修。
关键服务我都留了一个 `ports:` 映射，日常不用，出事时救命。

**日志落一份到磁盘。**
排查时不想每次都为了看日志去折腾容器权限，直接写文件更省事。

**分清楚"连不上"和"服务挂了"。**
不在家或者没连 VPN 的时候，各种超时报错很容易被误读成服务出问题。
先确认自己在不在这张网里，能省下大量无用的排查。

## 四、最后的样子

现在的状态是：所有服务一个域名前缀，全部 HTTPS 且证书受信任，
浏览器不再报警，密码管理器正常填充，家里人只需要记住一个首页地址。

新增一个服务的完整流程变成了：

1. 写 compose，加五行标签；
2. `docker compose up -d`；
3. 打开新服务对应的 `https://newapp.lan.example.com`。

没有证书步骤，没有端口分配，没有反代配置改动。
前面那些坑加起来花了大半天，但换来的是之后每一次新增服务都只要几分钟——
这大概就是基础设施类折腾唯一说得过去的理由。
