---
layout:     post
title:      "使用Google Cloud搭建git仓库遇到的坑"
subtitle:   ""
date:       2016-07-14 14:00
author:     "Channing"
header-img: "img/post-bg-2015.jpg"
tags:
    - Git
---

## 前言

今天逛GDG网站是发现一篇介绍使用Goolge Cloud免费搭建私有Git代码仓库的文章，然后兴致勃勃地就去体验了，结果遇到好几个坑，弄了一下午。。。

## 参考链接

少有的在百度上发现的有用的帖子。

- [google私有cloud搭建git之一push本地git仓库](http://jingyan.baidu.com/article/95c9d20d5ae536ec4e75618d.html)
- [google私有cloud搭建git之二AS push 远程仓库](http://jingyan.baidu.com/article/c33e3f48f0d32eea15cbb5a4.html)

## 坑一

明明使用了官方推荐的做法，安装的GoogleCloudSDK，并使用其正确的初始化账户成功，结果push代码时还是弹窗要让输入账号密码，根本就木有毛的账号密码啊！。

一通搜索，终于查到了一个靠谱的解释。原因是Git在安装的时候默认配置credential.helper为系统及的账号管理，导致GoogleCloudSDK不能接管账户管理（此为我个人理解的中心思想-_-!）。

具体解决办法为：

If you run

```
C:\> git config --list --system
credential.helper=manager
```

and get a setting for credential.helper like above, it will have precedence over gcloud installed credential helper.

You can unset it via (possibly as administrator)

```
C:\> git config --system --unset credential.helper
```

Now

```
C:\> gcloud source repos clone default my_repo
```

should work and

```
C:\> cd my_repo
C:\my_repo> git config --list
```

should display

```
credential.helper="gcloud.cmd"
```

[原文戳我](http://stackoverflow.com/questions/36339248/on-windows-git-pull-and-clone-for-google-cloud-repository-pops-credential-manage)

解答问题的大神最后还说了一段话：

More recent git versions for windows started to set credential helper to Microsoft credential manager github.com/Microsoft/Git-Credential-Manager-for-Windows by default. If you working with Visual Studio or otherwise want to use this manager you can still set it for the repository you are working with, just don't use --system flag. That should remain unset.

大意应该就是，如果你使用的是Visual Studio或其它什么的，坚持要使用credential manager，你仍然可以单独为仓库单独设置，只要不加上--system标签就好了

然而悲催的是，虽然我觉得这个方法可行，但我根本没办法尝试，因为我遇到了坑二，有请坑二。。。

## 坑二

最开始安装GoogleCloudSDK的时候一切顺利，然而就因为一直卡在坑一让我无比烦躁，然后我就想卸载重装试试，然后，就再也装不上了。。。

每次装到一半就报error：UnicodeDecodeError: 'ascii' codec can't decode byte 0xbb in position 1: ordinal not in range(128)

然后这个问题最终也没解决，我已经在项目下提交[issue](https://code.google.com/p/google-cloud-sdk/issues/detail?id=975&colspec=ID%20Type%20Status%20Priority%20Milestone%20Owner%20Stars%20Summary%20log)了，啥时候解决了再来更新吧。

---

update2016.7.15：重新安装成功了。

在我提交的issue下，有位大神问：

Hello, do you happen to have a SOCKS proxy configured?
In internet explorer, if you press Alt, go to Tools -> Internet Options -> Connections -> LAN settings, do you have any information entered in "Proxy Server"?

我看了下，果然设置了代理，然后我就把代理去掉，然后重新安装成功，哈哈 ^_^

可是安装完成后还是不能用，因为SDK在sock5代理下就会报这个error，根本无法登陆ssh，管理员已经将我提交的issue合并到[791号](https://code.google.com/p/google-cloud-sdk/issues/detail?id=791)下面了，看来这个问题早有人提，估计得等版本更新才能修复吧

-_-!

> 转载请注明出处：[使用Google Cloud搭建git仓库遇到的坑](/2016/07/14/google_cloud_git_server)
