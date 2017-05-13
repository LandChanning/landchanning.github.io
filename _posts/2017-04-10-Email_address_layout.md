---
layout:     post
title:      "邮箱地址栏实现历程"
subtitle:   ""
date:       2017-04-10 18:00
author:     "Channing"
header-img: "img/post-bg-2015.jpg"
tags:
    - EditText
    - Layout
---

记实现邮箱地址栏的实现历程。

## 粗记重难点，待编辑 ##

需求1、类似自动换行标签控件

自定义TabLayout，重写onMeasure和onLayout方法，onMeasure中根据子控件宽度计算总行数，从而计算出布局高度。onLayout方法中，依次布局子控件的左上右下。

需求2、该布局为可输入控件，点击确认添加一个地址Item

继承TabLayout实现AddressTabLayout，构造方法中先添加一个EditText，用于输入文本，点击确认后，向倒数第二的位置addView。

问题1、最初的TagItem和EditText都是使用代码实例化，结果出现样式丢失的情况。
采用xml文件定义，LayoutInflater注入的方式解决。保留代码实现控件如何应用系统布局的疑问。

问题2、EditText不显示光标。
因为需要EditText根据内容决定宽度，并实现输入过程中换行，所以使用wrap_content，结果没输入字符前不显示光标。经测试发现是宽度不够，因为开始时的宽度为0，通过设置minWidth解决。但是在小米3上测试，如果超出minWidth的宽度，光标变细，保留此疑问。

需求3、点击删除键时，如果EditText没有内容，则删除最后一个Address标签。
开始使用OnKeyListener实现，但测试发现某些输入法不会回调该接口，研究获知TextView的onCreateInputConnection方法会构造一个EditableInputConnection，不回调OnKeyListener的输入法会回调其中的deleteSurroundingText，从此处入手增加一个回调接口解决。目前测试的输入法会从OnKeyListener和deleteSurroundingText两条线中选一条进行，所以两个回调需同时处理，并设置标识符避免重复。

问题1、EditableInputConnection是internal包下的类，无法继承，所以下载源码并自行修改。类中部分方法无法调用，用反射的方式强制调用。

问题2、OnKeyListener和deleteSurroundingText，删除编辑状态的字符不会回调，而在删除非编辑状态的字符时产生回调（编辑状态是指输入英文时，EditText中下面有黑线的字符，通过输入建议选择后，或输入字母以外的字符，都会变成非编辑状态），误触发删掉最后一个tag的逻辑。
OnKeyListener的情况，顺序为down事件-->字符被删-->up事件，所以在down事件时判断内容为空则选择最后一个tag。
deleteSurroundingText的情况，super.deleteSurroundingText会执行删除字符的造成，所以需要在super之前判断内容为空则回调，然后实现回调接口处理删除tag的逻辑。
