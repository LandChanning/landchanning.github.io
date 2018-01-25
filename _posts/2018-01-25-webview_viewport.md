---
layout:     post
title:      "仔细研究下Viewport"
subtitle:   ""
date:       2018-01-25 16:22
author:     "Channing"
header-img: "img/post-bg-2015.jpg"
tags:
    - Viewport
    - WebView
    - JavaScript
---

在做邮件页面适配时使用到了 viewport，都是照猫画虎用的，基本没有了解，所以写了个 [sample](https://github.com/LandChanning/WebViewTest) 仔细研究了下 Viewport。测试用的设备是红米 note 4X（基于Android 7.0 的 miui） 和 mac 版的 chrome。以下所有宽度的单位都是 px（百分比除外）。

## 看完资料有点懵

在看[两个viewport的故事](https://www.quirksmode.org/mobile/viewports.html)时了解到，Layout Viewport（布局视口）的宽度可用document.documentElement.clientWidth 属性获取，Visual Viewport（视觉视口）可用 window.innerWidth 属性获取。但是在使用读信页模版 log 出来，这俩值都是一样的，不光这俩值，其它的宽度大部分都是一样全是360。

```
I/chromium: [INFO:CONSOLE(2)] "screen.width = 360"
I/chromium: [INFO:CONSOLE(3)] "document.documentElement.offsetWidth = 360"
I/chromium: [INFO:CONSOLE(4)] "document.documentElement.clientWidth = 360 (layout viewport width)"
I/chromium: [INFO:CONSOLE(5)] "window.innerWidth = 360"
I/chromium: [INFO:CONSOLE(6)] "window.devicePixelRatio = 3"
I/chromium: [INFO:CONSOLE(7)] "document.documentElement.scrollWidth = 360"
```

仔细一看才发现，这个 log 是在 <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes"> 标签之后打的，那么在标签前也加个 log 看看会怎样。

```
I/chromium: [INFO:CONSOLE(1)] "--------------------------------------before--------------------------------------"
I/chromium: [INFO:CONSOLE(4)] "document.documentElement.clientWidth = 980 (layout viewport width)"
I/chromium: [INFO:CONSOLE(1)] "---------------------------------------after-------------------------------------"
I/chromium: [INFO:CONSOLE(4)] "document.documentElement.clientWidth = 360 (layout viewport width)"
```

可见文章中布局视口的宽度获取应该是正确的，因为标签中设置了 initial-scale=1，所以解析到这个标签后马上将 Layout Viewport 的宽度设置为 Visual Viewport 的宽度了。

## 领导要我干掉滚动条

嗯嗯，看起来很美，接下来上需求：需求只有一个，保持原页面布局，不能出现横向滚动条。贴一下要用来测试的 html。

```
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <!--输出各个宽度，代码很简单，就是 console.log-->
    <script>
        console.log("------------------------before viewport------------------------");
    </script>
    <script type='text/javascript' src='log.js'></script>
    <style>
        .div1 {
            width: 100%;
            height: 100px;
            box-sizing: border-box;
            border-style: solid;
            border-width: 6px;
            border-color: blue;
            font-size: 32px;
            padding: 10px;
            margin: 6px 0px 0px 0px;
        }
        .div2 {
            width: 400px;
            height: 100px;
            box-sizing: border-box;
            border-style: solid;
            border-width: 6px;
            border-color: red;
            font-size: 32px;
            padding: 10px;
            margin: 6px 0px 0px 0px;
        }
        .div3 {
            width: 800px;
            height: 100px;
            box-sizing: border-box;
            border-style: solid;
            border-width: 6px;
            border-color: green;
            font-size: 32px;
            padding: 10px;
            margin: 6px 0px 0px 0px;
        }
    </style>
</head>
<body style='background-color:white; margin:0px; width:100%'>
    <script type='text/javascript' src='log.js'></script>
    <div class='div1'>width:100%</div>
    <div class='div2'>width:400px</div>
    <div class='div3'>width:800px</div>
</body>
<!--解析完 body 标签后输出下-->
<script>
        console.log("------------------------after body------------------------");
    </script>
<script type='text/javascript' src='log.js'></script>
</html>
```

### 不加 viewport 会怎样？

#### chrome

![chrome](/img/in-post/20180125/no_viewport_chrome.jpg)

在 chrome 模拟器中，layout viewport（布局视口） 980。100% 宽度的实际值也被设置为 980，页面被自动缩小到 visual viewport（视觉视口）的范围内，没有出现横向滚动条。body 标签解析完毕后，srollWidth 的值也被指定 980。据说在 iOS 中，如果不指定 viewport，页面就会自动缩小适应屏幕（没有测试机所以没试）。

至于视觉视口的宽度宽度如何获取，在开头提到的《两个viewport的故事》中指出使用 window.innerWidth 获取，但是从 log 看并没有获取到准确的 375，所以这个属性的可用性还有待考证。（关于这个属性，后面还有奇葩的现象，希望大神们可以告知原因）

#### WebView

有人说这只是模拟器啊，真机中会怎样呢？OK，上真<S>鸡</S>机！
在移动端（红米 Note 4X）的WebView 中，以相关性最高的设置 WebSetting.setUseWideViewPort() 分为两种情况。

##### useWideViewPort = false（也是默认值）

![WebView](/img/in-post/20180125/no_viewport_webview_false.jpg)

```
I/chromium: [INFO:CONSOLE(7)] "------------------------before viewport------------------------"
I/chromium: [INFO:CONSOLE(1)] "screen.width = 360"
I/chromium: [INFO:CONSOLE(2)] "document.documentElement.offsetWidth = 360"
I/chromium: [INFO:CONSOLE(3)] "document.documentElement.clientWidth = 360 (layout viewport width)"
I/chromium: [INFO:CONSOLE(4)] "window.innerWidth = 360"
I/chromium: [INFO:CONSOLE(5)] "window.devicePixelRatio = 3"
I/chromium: [INFO:CONSOLE(6)] "document.documentElement.scrollWidth = 360"
I/chromium: [INFO:CONSOLE(7)] "Uncaught TypeError: Cannot read property 'scrollWidth' of null"
I/chromium: [INFO:CONSOLE(54)] "------------------------after body------------------------"
I/chromium: [INFO:CONSOLE(1)] "screen.width = 360"
I/chromium: [INFO:CONSOLE(2)] "document.documentElement.offsetWidth = 360"
I/chromium: [INFO:CONSOLE(3)] "document.documentElement.clientWidth = 360 (layout viewport width)"
I/chromium: [INFO:CONSOLE(4)] "window.innerWidth = 360"
I/chromium: [INFO:CONSOLE(5)] "window.devicePixelRatio = 3"
I/chromium: [INFO:CONSOLE(6)] "document.documentElement.scrollWidth = 800”
I/chromium: [INFO:CONSOLE(7)] "document.body.scrollWidth = 800”
```

此时 layout viewport width = 360，100% 实际值也是 360，但是页面并没有缩小到 visual viewport 内，而是撑出了屏幕。而 body 的宽度则被指定为 800，即最宽的绿条宽度。（log 中的 error 是因为输出了 document.body.scrollWidth，因为此时并没有解析到 body，所以报空）

##### useWideViewPort = true

![WebView](/img/in-post/20180125/no_viewport_webview_true.jpg)

```
I/chromium: [INFO:CONSOLE(7)] "------------------------before viewport------------------------"
I/chromium: [INFO:CONSOLE(1)] "screen.width = 360"
I/chromium: [INFO:CONSOLE(2)] "document.documentElement.offsetWidth = 980"
I/chromium: [INFO:CONSOLE(3)] "document.documentElement.clientWidth = 980 (layout viewport width)"
I/chromium: [INFO:CONSOLE(4)] "window.innerWidth = 360"
I/chromium: [INFO:CONSOLE(5)] "window.devicePixelRatio = 3"
I/chromium: [INFO:CONSOLE(6)] "document.documentElement.scrollWidth = 980"
I/chromium: [INFO:CONSOLE(7)] "Uncaught TypeError: Cannot read property 'scrollWidth' of null"
I/chromium: [INFO:CONSOLE(59)] "------------------------after body------------------------"
I/chromium: [INFO:CONSOLE(1)] "screen.width = 360"
I/chromium: [INFO:CONSOLE(2)] "document.documentElement.offsetWidth = 980"
I/chromium: [INFO:CONSOLE(3)] "document.documentElement.clientWidth = 980 (layout viewport width)"
I/chromium: [INFO:CONSOLE(4)] "window.innerWidth = 360"
I/chromium: [INFO:CONSOLE(5)] "window.devicePixelRatio = 3"
I/chromium: [INFO:CONSOLE(6)] "document.documentElement.scrollWidth = 980"
I/chromium: [INFO:CONSOLE(7)] "document.body.scrollWidth = 980"
```

设置 useWideViewPort = true 表示支持 viewport meta，此时宽度的值和 chrome 中是一样的，只是页面没有自动缩小到 visual viewport 内。也说明了 chrome 默认打开了 viewport 支持。目前已知绝大多数浏览器都支持 viewport 标签。以下移动端测试都基于 useWideViewPort = true。

### 加上 viewport 会变好吗？

然后我们在 header 中加上 ```<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes"/> ```标签。这个写法也是绝大多数文章中提到的“这是标准写法这样写就好了哪那么多为什么”的推荐写法。我们看看加上后会出现什么情况。

![WebView](/img/in-post/20180125/normal_viewport_chrome.jpg)

![why](/img/in-post/20180125/why.jpg)

不是说这么写就好了吗，为什么反而不缩放了呢？马蛋，看 log～

meta viewport 标签之前，layout viewport 宽度是浏览器默认的（大部分浏览器、WebView都默认为这个值）980。meta viewport 标签之后，因为指定了 initial-scale=1，所以浏览器将 layout viewport 宽度设为 visual viewport 的宽度，也就是375，其它一系列的 width 也跟风变成了 375。

然后解析到 body，乖宝宝 100% 当然就给 375 咯，喂啥吃啥么。而剩下的俩熊孩子一个要400一个要800，也尽量满足，只是多出来的部分不显示在初始化屏幕内罢了。最终 body 宽度定为最大的 800。至于那些说要加上 minimum-scale maximum-scale 就可以自动缩小的文章请自动无视，初始化缩放相关属性只有 initial-scale 一个。

这种情况下，红米和 chrome 基本一样，就不贴图了，唯一的区别是，红米 body 标签后 window.innerWidth 的值没有变化，而 chrome 居然变成了 801。后来发现和 minimum-scale 有关，当这样写时 ```<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, user-scalable=yes”/>```，chrome 的 window.innerWidth 就变成了 375。所以用 window.innerWidth 获取 visual viewport 宽度是不太靠谱的。

如果页面全部是百分比布局，这样写 meta 基本就可以了，但是对于指定了绝对宽度的页面怎么办呢？

### 用 JS 控制 initial-scale

对于需求来说，理想的情况是页面最宽的元素都在屏幕内，body 的 100% 即是最宽的宽度。思路就是使用 JS 控制 initial-scale 的值：initial-scale = visualViewportWidth / bodyWidth。（为什么不用 visualViewportWidth / layoutViewportWidth？因为有要绝对像素的熊孩子啊）bodyWidth 好拿，visual viewport width 怎么取到呢？

我的思路是先写明 initial-scale = 1，此时两个视口的宽度肯定相当了，然后我们就可以用 document.documentElement.clientWidth 获取到 visual viewport width 了，贴一下 JS 代码（用了 jquery，代码很简单，一堆都是 log）。（为了避免某些奇葩浏览器找茬，minimum-scale 和 maximum-scale 还是都写上的好）

```
$(function(){
    console.log("------------------------resize start------------------------");
    console.log("screen.width = " + screen.width);
    console.log("document.documentElement.offsetWidth = " + document.documentElement.offsetWidth);
    console.log("document.documentElement.clientWidth = " + document.documentElement.clientWidth + " (layout viewport width)");
    console.log("window.innerWidth = " + window.innerWidth);
    console.log("window.devicePixelRatio = " + window.devicePixelRatio);
    console.log("document.documentElement.scrollWidth = " + document.documentElement.scrollWidth);
    console.log("document.body.scrollWidth = " + document.body.scrollWidth);

    var scale = document.documentElement.clientWidth / document.body.scrollWidth;
    console.log("scale = " + scale);
    $('meta[name="viewport"]').attr('content','width=device-width, initial-scale=' + scale + ', minimum-scale=' + scale + ', maximum-scale=1.5, user-scalable=yes');

    console.log("------------------------resize end------------------------");
    console.log("screen.width = " + screen.width);
    console.log("document.documentElement.offsetWidth = " + document.documentElement.offsetWidth);
    console.log("document.documentElement.clientWidth = " + document.documentElement.clientWidth + " (layout viewport width)");
    console.log("window.innerWidth = " + window.innerWidth);
    console.log("window.devicePixelRatio = " + window.devicePixelRatio);
    console.log("document.documentElement.scrollWidth = " + document.documentElement.scrollWidth);
    console.log("document.body.scrollWidth = " + document.body.scrollWidth);
});
```

这样应该就满足需求了，不敢把话说满，Web 的坑一样不少。有兴趣的同学可以跑下 smaple，也可以稍微关注下变来变去的 window.innerWidth。

![why](/img/in-post/20180125/done.jpg)

```
I/chromium: [INFO:CONSOLE(5)] "------------------------before viewport------------------------"
I/chromium: [INFO:CONSOLE(1)] "screen.width = 360"
I/chromium: [INFO:CONSOLE(2)] "document.documentElement.offsetWidth = 980"
I/chromium: [INFO:CONSOLE(3)] "document.documentElement.clientWidth = 980 (layout viewport width)"
I/chromium: [INFO:CONSOLE(4)] "window.innerWidth = 360"
I/chromium: [INFO:CONSOLE(5)] "window.devicePixelRatio = 3"
I/chromium: [INFO:CONSOLE(6)] "document.documentElement.scrollWidth = 980"
I/chromium: [INFO:CONSOLE(7)] "Uncaught TypeError: Cannot read property 'scrollWidth' of null"
I/chromium: [INFO:CONSOLE(8)] "------------------------after viewport------------------------"
I/chromium: [INFO:CONSOLE(1)] "screen.width = 360"
I/chromium: [INFO:CONSOLE(2)] "document.documentElement.offsetWidth = 360"
I/chromium: [INFO:CONSOLE(3)] "document.documentElement.clientWidth = 360 (layout viewport width)"
I/chromium: [INFO:CONSOLE(4)] "window.innerWidth = 360"
I/chromium: [INFO:CONSOLE(5)] "window.devicePixelRatio = 3"
I/chromium: [INFO:CONSOLE(6)] "document.documentElement.scrollWidth = 360"
I/chromium: [INFO:CONSOLE(7)] "Uncaught TypeError: Cannot read property 'scrollWidth' of null"
I/chromium: [INFO:CONSOLE(54)] "------------------------after body------------------------"
I/chromium: [INFO:CONSOLE(1)] "screen.width = 360"
I/chromium: [INFO:CONSOLE(2)] "document.documentElement.offsetWidth = 360"
I/chromium: [INFO:CONSOLE(3)] "document.documentElement.clientWidth = 360 (layout viewport width)"
I/chromium: [INFO:CONSOLE(4)] "window.innerWidth = 360"
I/chromium: [INFO:CONSOLE(5)] "window.devicePixelRatio = 3"
I/chromium: [INFO:CONSOLE(6)] "document.documentElement.scrollWidth = 800"
I/chromium: [INFO:CONSOLE(7)] "document.body.scrollWidth = 800"
I/chromium: [INFO:CONSOLE(2)] "------------------------resize start------------------------"
I/chromium: [INFO:CONSOLE(3)] "screen.width = 360"
I/chromium: [INFO:CONSOLE(4)] "document.documentElement.offsetWidth = 360"
I/chromium: [INFO:CONSOLE(5)] "document.documentElement.clientWidth = 360 (layout viewport width)"
I/chromium: [INFO:CONSOLE(6)] "window.innerWidth = 360"
I/chromium: [INFO:CONSOLE(7)] "window.devicePixelRatio = 3"
I/chromium: [INFO:CONSOLE(8)] "document.documentElement.scrollWidth = 800"
I/chromium: [INFO:CONSOLE(9)] "document.body.scrollWidth = 800"
I/chromium: [INFO:CONSOLE(12)] "scale = 0.45"
I/chromium: [INFO:CONSOLE(15)] "------------------------resize end------------------------"
I/chromium: [INFO:CONSOLE(16)] "screen.width = 360"
I/chromium: [INFO:CONSOLE(17)] "document.documentElement.offsetWidth = 800"
I/chromium: [INFO:CONSOLE(18)] "document.documentElement.clientWidth = 800 (layout viewport width)"
I/chromium: [INFO:CONSOLE(19)] "window.innerWidth = 801"
I/chromium: [INFO:CONSOLE(20)] "window.devicePixelRatio = 3"
I/chromium: [INFO:CONSOLE(21)] "document.documentElement.scrollWidth = 800"
I/chromium: [INFO:CONSOLE(22)] "document.body.scrollWidth = 800"
```

Sample 地址：[https://github.com/LandChanning/WebViewTest](https://github.com/LandChanning/WebViewTest)

转载请注明出处