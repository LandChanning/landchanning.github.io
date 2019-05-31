---
layout:     post
title:      "干掉 Android 8、9 状态栏的半透明黑色"
subtitle:   ""
date:       2019-05-31 15:27
author:     "Channing"
header-img: "img/post-bg-js-module.jpg"
tags:
    - StatusBar
    - windowTranslucentStatus
---

在实现透明状态栏时遇到了一个问题，在 Android 8 以后，即使设置 windowTranslucentStatus = true，api 也会强制在状态栏上绘制一个半透明黑色，为毛？

如果是纯色背景的 toolbar，可以将windowTranslucentStatus = false， 然后通过 statusBarColor 将状态栏背景和 toolbar 置为一样的颜色，但是图片背景就不能这么干了。

## 原因

查资料得知（其实这个查源码也可以发现，但是需要对 DecorView 有一些认识时才好入手，我还没看过这部分的源码，之后要补课），DecorView 在绘制状态栏时，如果指定 windowTranslucentStatus = true，那么将会取 mSemiTransparentStatusBarColor 这个属性中保存的色值，绘制为状态栏背景，这个是强制的无法改变，这个属性是从 R.color.system_bar_background_semi_transparent 获取的色值 #66000000，就是这个难看的半透明黑色。

毫无疑问，这个属性是私有的无法修改，甚至 DecorView 也是隐藏的类，根本无法 import。那么如何解决呢？

## 解决

万能的反射搞定它。反射代码毕竟简单，就不解释了。

```
try {
    val decorView = window.decorView
    val field = decorView::class.java.getDeclaredField("mSemiTransparentStatusBarColor")
    field.isAccessible = true
    field.setInt(decorView, Color.TRANSPARENT)
} catch (e: Exception) {
    e.printStackTrace()
}
```

转载请注明出处