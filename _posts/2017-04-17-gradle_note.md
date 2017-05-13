---
layout:     post
title:      "gradle问题记录"
subtitle:   ""
date:       2017-04-17 17:15
author:     "Channing"
header-img: "img/post-bg-2015.jpg"
tags:
    - EditText
    - Layout
---

记录gradle使用时遇到的问题。

## 粗记，待编辑

### compile报错
直接写的compile语句依赖design包，一直compile() method not found的错误，包名和版本号都正常。

解决过程是：不直接写complie语句，在Project Structure--》module--》Dependencies找到design包添加，build之后再改成想要的版本号就正常了。。。

感觉像studio的bug。
