---
layout:     post
title:      "EditText wrap_content 光标挤压文本"
subtitle:   ""
date:       2017-06-28 12:00
author:     "Channing"
header-img: "img/post-bg-2015.jpg"
tags:
    - Theme
    - StatusBar
---

记录在实现邮箱地址栏输入控件时遇到的适配问题。

# Bug

自定义的地址栏输入控件中，负责文本输入的是一个EditText，其 layout_width 设置为 wrap_content，以便文本输入时自动将宽度撑开，自动换行。

但在魅族手机上出现bug，文本输入时开头有一部分被遮挡，无法正常显示，如下图所示。

![extrusion](/img/in-post/20170628/extrusion.png)

# 原因

排除 singleline、padding、maxline 等原因，最终确定原因是 wrap_content 时光标会挤压文本显示空间（其实在小米手机上也有类似情况，只不过光标不会挤压文本，而是光标宽度只显示出一半）。

# 解决

重写 EditText 的 onMeasure 方法，首先获取文本绘制所需宽度，然后加上一定值（经测试加 20 可以正常显示）后设置到 SpecSize。

```
@Override
protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
    TextPaint textPaint = getPaint();
    int textWidth = (int) (textPaint.measureText(getText().toString()) + 0.5F);
    // 因为这个 EditText 是用在地址栏，宽度不固定，某些机型光标会将文字挤出控件，所以此处获取文本所需宽度
    // 并加上 20，给光标留出空间
    // 与 specWidth 进行比较取最小值，是因为此场景中 EditText 宽度不能超过父控件可用宽度
    int specWidth = MeasureSpec.getSize(widthMeasureSpec);
    int width = Math.min(textWidth + 20, specWidth);
    super.onMeasure(MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY), heightMeasureSpec);
}
```

![extrusion](/img/in-post/20170628/resolved.png)

注：因为控件中 EditText 没有背景，宽度并不需要精确，所以可以这么干。一般情况只需要将 layout_width 设置为 match_parent 或固定值就可以解决这个问题。
