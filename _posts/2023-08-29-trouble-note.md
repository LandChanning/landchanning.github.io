---
layout:     post
title:      "问题记录"
subtitle:   ""
date:       2023-08-29 17:26
author:     "Channing"
header-img: "img/post-bg-js-module.jpg"
tags:
    - 问题记录
---

## 1、仅在华为 Android 11 系统，通过华为应用市场安装崩溃

### 问题及原因

仅在华为设备，基于 Android 11 系统，且通过华为市场安装时崩溃，报如下错误

```
java.lang.NoClassDefFoundError
  at android.net.ssl.SSLSockets.<clinit>(Unknown Source:2)
  at android.net.ssl.SSLSockets.isSupportedSocket(Native Method)
  at ld.a.a(Android10SocketAdapter.kt:1)
  at kd.a.d(Android10Platform.kt:25)
  at okhttp3.internal.connection.a.h(RealConnection.kt:89)
  at okhttp3.internal.connection.a.d(RealConnection.kt:178)
  at gd.d.a(ExchangeFinder.kt:687)
  at gd.a.intercept(ConnectInterceptor.kt:62)
  at hd.f.a(RealInterceptorChain.kt:148)
  at ed.a.intercept(CacheInterceptor.kt:196)
  at hd.f.a(RealInterceptorChain.kt:148)
  at hd.a.intercept(BridgeInterceptor.kt:233)
  at hd.f.a(RealInterceptorChain.kt:148)
  at hd.h.intercept(RetryAndFollowUpInterceptor.kt:157)
  at hd.f.a(RealInterceptorChain.kt:148)
  at com.huawei.agconnect.credential.obs.u.a(Unknown Source:158)
  at com.huawei.agconnect.credential.obs.u.intercept(Unknown Source:111)
  at hd.f.a(RealInterceptorChain.kt:148)
  at gd.e.f(RealCall.kt:96)
  at gd.e.execute(RealCall.kt:45)
  at com.huawei.agconnect.https.d$1.a(Unknown Source:41)
  at com.huawei.agconnect.https.d$1.call(Unknown Source:0)
  at f5.f.run(Unknown Source:4)
  at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1167)
  at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:641)
  at java.lang.Thread.run(Thread.java:933)
Back traces ends.
```

原因是使用的 Android Studio Electric Eel | 2022.1.1 Patch 2，com.android.tools.build:gradle:7.3.1，gradle-7.4.2-bin.zip 在打包时会将 android sdk 里的部分类打进包里，其中就包括 android.net.ssl.SSLSockets，然后“华为市场在安装时会做 art 优化，把包里的 SSLSockets 拷贝进 art 文件中（华为技术的解释）”，导致和系统已经存在类产生冲突。可是为什么只在基于 Android 11 的华为设备上出现呢？为什么别的设备，或者不通过市场安装都没问题呢？

### 解决

升级编译工具版本，com.android.tools.build:gradle:7.4.2，gradle-7.5.1-bin.zip，就不会把 sdk 的类打进包里了。

## 2、用 WebView 加载页面，input 标签点击无法获取焦点

### 问题

使用 WebView 加载某个页面后，点击 input 标签无法正确获取焦点及弹出键盘。经排查发现点击事件传递给了 InputMethodManager，但被忽略掉了，在小米测试机上能看到这样的警告：

```
InputMethodManager  W  Ignoring showSoftInput() as view=android.webkit{4f3d8d VFEDHVC.. ........ 0,190-1080,2400} is not served.
```

翻看源码，在```InputMethodManager.showSoftInput()```方法中会先调用```hasServedByInputMethodLocked()```进行判断，但这个方法返回了 false，导致弹出键盘逻辑无法正确执行。当前 Activity 使用了 WindowInsetsControllerCompat 来管理键盘，怀疑跟这个有关系，但为什么只有这个有问题，别的 Activity 中就正常呢？

### 解决

在```Activity.onResume()```中调用一```WebView.requestFocus()```，问题解决，具体原因待排查。

