---
layout:     post
title:      "搭建Git服务器"
subtitle:   "自己动手丰衣足食"
date:       2016-07-16 13:00
author:     "Channing"
header-img: "img/post-bg-2015.jpg"
tags:
    - Linux
    - Git
---

## 前言

接触Github之后，终于体会到了Git的强大之处，加之Android Studio对Git的支持远远好于SVN，所以一直想让公司自建一个Git服务器，但是无奈公司暂时没有此计划，只好自己想办法。

因为公司项目不能开源，所以不能直接在Github上建仓库，于是把目光转向Google Cloud（可以免费建代码库，使用Git，目前提供5G的空间）。折腾半天，结果提供的SDK在国内完全不能用，原因是在sock5代理下有bug会崩溃，不挂代理又不能访问，真是坑。（见[使用Google Cloud搭建git仓库遇到的坑](/2016/07/14/google_cloud_git_server/)）

后来一想，我干嘛不自己搭建个Git服务器呢，正好手里有个扶梯子的VPS闲着，说干就干。

### 1 服务端安装最新版Git

我的VPS系统是Ubuntu15.04，可以直接使用apt安装。

```
# 添加apt依赖仓库，以便安装最新版，否则在Ubuntu15.04下，Git镜像版本是2.1.4
$ sudo add-apt-repository ppa:git-core/ppa
# 升级镜像（貌似叫镜像）
$ sudo apt-get update
# 安装Git
$ sudo apt-get install git
```

PS：add-apt-repository命令有可能报“sudo: add-apt-repository: command not found”的error，需要先键入如下命令。

```
sudo apt-get install software-properties-common python-software-properties
```

然后重新尝试添加ppa仓库及安装。如果已经安装了Git，可以在添加好ppa仓库的情况下，使用如下命令进行升级。

```
sudo apt-get dist-upgrade
```

### 2 新建Git服务器使用的用户

```
# 添加Git用户
sudo adduser -d /home/git -m git
# 设置密码
sudo passwd git
```

### 3 禁止Git用户直接登录Git服务器

作为一个额外的防范措施，你可以用 Git 自带的 git-shell 工具限制 git 用户的活动范围。只要把它设为 git 用户登入的 shell，那么该用户就无法使用普通的 bash 或者 csh 什么的 shell 程序。
```
which git-shell  #查看git-shell的路径
sudo vim /etc/passwd #编辑passwd文件
```
在文件末尾，你应该能找到类似这样的行：
```
git:x:1000:1000::/home/git:/bin/sh
```
更改为
```
git:x:1000:1000::/home/git:/usr/bin/git-shell
```

### 4 配置ssh密钥认证自动登录

#### 4.1 客户端各自创建公钥

打开bash，执行如下命令:
```
# -t 指定密钥类型，默认即 rsa ，可以省略
# -C 设置注释文字，比如你的邮箱
ssh-keygen -t rsa -C  'xxx@xxx.com'
```

#### 4.2 将公钥复制到git服务器

将上一步生成的公钥~/id_rsa.pub文件，复制到ssh服务器对应用户下~/.ssh/authorized_keys文件。一般来说，公钥会生成在"C:\Users\username\\.ssh"目录下（windows用户目录的.ssh下），而服务器的.ssh目录一般在用户根目录下。

注：~代表用户根目录，如本文中git用户根目录指定的是/home/git，所以authorized_keys文件的绝对路径就是/home/git/.ssh/authorized_keys（~/.ssh/authorized_keys），。

使用pscp命令从win上传id_rsa.pub到服务端的指定目录及文件名
```
# -P参数用于指定ssh连接的端口（注意必须大写，这和ssh登陆命令是小写不一样），如果没改默认是22，注意试用的时候要规范的写到命令后面，
# 我最开始写到最后了，结果一直报"More than one remote source not supported"。

# pscp命令可以使用putty工具包下的PSCP.EXE来执行。
# 打开cmd，cd到putty安装目录，就可以使用了

pscp -P ***** C:\Users\JC\.ssh\id_rsa.pub username@hostname:/home/git/.ssh/id_rsa_jc.pub
```

将公钥追加到authorized_keys文件

```
# 若.ssh目录已存在，可省略此步
mkdir /home/git/.ssh
# 将公钥文件id_rsa.pub文件内容追加到authorized_keys文件
cat id_rsa.pub >> .ssh/authorized_keys
```

### 5 建立仓库

建立仓库目录

```
# 新建版本库目录
sudo mkdir -p /home/git/repo
# 将文件夹所有权更改为git用户
sudo chown -R git:git /home/git/repo
```

初始化项目版本库

```
cd /home/git/repo
# project为项目名称
sudo git init --bare project.git
sudo chown -R git:git /home/git/repo/project.git
```

### 6 克隆远程仓库

在客户端pc指定目录下打开git bash，执行克隆命令

```
# 将hostname替换你的git服务器IP
# git clone git@hostname:~/repo/project.git
git clone git@hostname:/home/git/repo/project.git
```

如果服务器更改了ssh的端口，需要在ssh_config中配置下git访问该服务器的端口号。使用文本工具打开该文件（注意写权限）C:\Program Files\Git\etc\ssh\ssh_config，添加如下配置：

```
Host hostname                 # hostname替换主机路径
  Port port                   # port替换为端口号
  IdentityFile ~/.ssh/id_rsa  # 该配置可指定用哪个密钥
```

然后就可以愉快（MeiRiMeiYe）的coding啦！

---

update:2016.11.28

在osx中，git目录下找不到ssh目录，更别提配置文件，好一番搜索，最后找到很靠谱的解决方式。

只需要配置好config(不是git目录下，是.ssh目录下的)，然后用别名代替用户及主机地址即可。[详见](/2016/11/28/linux_git_ssh_config/)

> 转载请注明出处：[搭建Git服务器](/2016/07/16/linux_git_server)
