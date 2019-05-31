---
layout:     post
title:      "SimpleDateFormat的parse方法不是线程安全的"
subtitle:   ""
date:       2019-05-31 20:21
author:     "Channing"
header-img: "img/post-bg-js-module.jpg"
tags:
    - SimpleDateFormat
    - 线程安全
---

今天在解析时间字符串时碰到了一个奇怪的问题。例如 "Fri, 31 May 2019 07:17:49 +0000"（不特只这一个，任何时间都有可能，无规律），偶尔就给 parse 成 3205 或其他的什么奇葩年份，毫无规律。无论怎么设置 SimpleDateFormat 的时区都会出现这问题。

然后突然想到，我的解析操作是批量在多线程中执行的，但是使用的都是同一个 SimpleDateFormat 对象。

推测应该是使用同一个 SimpleDateFormat.parse 导致的线程安全问题，然后改成每次单独实例化对象解决了问题（之后有时间写代码证实）。

因为用的是 Rx，就忽略的线程安全的问题，以后要多注意。

转载请注明出处