---
layout:     post
title:      "Traslucent StatusBar 适配总结"
subtitle:   ""
date:       2017-06-10 11:44
author:     "Channing"
header-img: "img/post-bg-2015.jpg"
tags:
    - Theme
    - StatusBar
---

总结Translucent的实现过程及需注意的问题。

# 适配目标

android 4.4 SDK 开始支持Translucent StatusBar的配置，所以 4.4 是一个分水岭。

![sdk_18](/img/in-post/20170610/sdk_18.png)![sdk_18_open_drawer](/img/in-post/20170610/sdk_18_open_drawer.png)
android 4.4 以下：正常显示content、drawer layout的nav，不被StatusBar遮挡。

![sdk_19](/img/in-post/20170610/sdk_19.png)![sdk_19_open_drawer](/img/in-post/20170610/sdk_19_open_drawer.png)
android 4.4 ：StatusBar全透明，content、drawer layout的nav不被遮挡。

![sdk_18](/img/in-post/20170610/sdk_21.png)![sdk_18_open_drawer](/img/in-post/20170610/sdk_21_open_drawer.png)
android 4.4 以上：Material Design效果，状态栏颜色为colorPrimaryDark同时覆盖半透明效果，content、drawer layout的nav不被遮挡。

# 适配方式一：Style 配合 android:fitsSystemWindows
