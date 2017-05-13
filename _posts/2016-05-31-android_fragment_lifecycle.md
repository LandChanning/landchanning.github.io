---
layout:     post
title:      "Fragment生命周期"
subtitle:   "Hello Fragment"
date:       2016-05-31 23:00
author:     "Channing"
header-img: "img/post-bg-2015.jpg"
tags:
    - Android
    - Fragment
---

## FragmentTransaction管理下的Fragment生命周期
---

在Android中，一般是通过FragmentTransaction来管理Fragment。从显示结果来看，FragmentTransaction中对Fragment的操作大致可以分为两类：

- 显示：add() replace() show() attach()
- 隐藏：remove() hide() detach()

对于每一组方法，虽然最后产生的效果类似，但方法背后带来的副作用以及对Fragment的生命周期的影响都不尽相同。

### add() vs replace()

只有在Fragment数量大于等于2的时候，调用add()还是replace()的区别才能体现出来。当通过add()连续两次添加Fragment的时候，每个Fragment生命周期中的onAttach()-onResume()都会被各调用一次，而且两个Fragment的View会被同时attach到containerView。

```
E/Fragment#0: onAttach
E/Fragment#0: onCreate
E/Fragment#0: onCreateView
E/Fragment#0: onViewCreated
E/Fragment#0: onActivityCreated
E/Fragment#0: onViewStateRestored
E/Fragment#0: onStart
E/Fragment#0: onResume

E/Fragment#1: onAttach
E/Fragment#1: onCreate
E/Fragment#1: onCreateView
E/Fragment#1: onViewCreated
E/Fragment#1: onActivityCreated
E/Fragment#1: onViewStateRestored
E/Fragment#1: onStart
E/Fragment#1: onResume
```

同样，退出Activty时，每个Fragment生命周期中的onPause() - onDetach()也会被各调用一次。

```
E/Fragment#0: onPause
E/Fragment#1: onPause
E/Fragment#0: onStop
E/Fragment#1: onStop
E/Fragment#0: onDestroyView
E/Fragment#0: onDestroy
E/Fragment#0: onDetach
E/Fragment#1: onDestroyView
E/Fragment#1: onDestroy
E/Fragment#1: onDetach
```

但当使用replace()来添加Fragment的时候，第二次添加会导致第一个Fragment被销毁（在不使用回退栈的情况下），即执行第二个Fragment的onAttach()方法之前会先执行第一个Fragment的onPause()-onDetach()方法，同时containerView会detach第一个Fragment的View。

```
E/Fragment#0: onAttach
E/Fragment#0: onCreate
E/Fragment#0: onCreateView
E/Fragment#0: onViewCreated
E/Fragment#0: onActivityCreated
E/Fragment#0: onViewStateRestored
E/Fragment#0: onStart
E/Fragment#0: onResume
E/Fragment#0: onPause
E/Fragment#0: onStop
E/Fragment#0: onDestroyView
E/Fragment#0: onDestroy
E/Fragment#0: onDetach

E/Fragment#1: onAttach
E/Fragment#1: onCreate
E/Fragment#1: onCreateView
E/Fragment#1: onViewCreated
E/Fragment#1: onActivityCreated
E/Fragment#1: onViewStateRestored
E/Fragment#1: onStart
E/Fragment#1: onResume
```

### show() & hide() vs attach() & detach()

调用show() & hide()方法时，Fragment的正常生命周期方法并不会被执行，仅仅是Fragment的View被显示或者​隐藏，并视情况调用onHiddenChanged()。而且，尽管Fragment的View被隐藏，但它在父布局中并未被detach，仍然是作为containerView的childView存在着。

```
// 调用show()，注意如果Fragment本来就是显示的状态，调用
// show()不会产生任何影响，也不会回调onHiddenChanged()
E/Fragment#0: onHiddenChanged hidden = false

// hide()，同理隐藏状态下调用hide()也不会重复触发onHiddenChanged()
E/Fragment#1: onHiddenChanged hidden = true
```

相比较下，attach() & detach()做的就更彻底一些。一旦一个Fragment被detach()，它的onPause()-onDestroyView()周期都会被执行，同时Fragment的View也会被detach，但是不会执行onDestroy()和onDetach()，也就是说Fragment的实例还是在内存中的。

```
E/Fragment#0: onPause
E/Fragment#0: onStop
E/Fragment#0: onDestroyView
```

在重新调用attach()后，onCreateView()-onResume()周期也会被再次执行。

```
E/Fragment#0: onCreateView
E/Fragment#0: onViewCreated
E/Fragment#0: onActivityCreated
E/Fragment#0: onViewStateRestored
E/Fragment#0: onStart
E/Fragment#0: onResume
```

### remove()
相对应add()方法执行onAttach()-onResume()的生命周期，remove()就是完成剩下的onPause()-onDetach()周期。而且replace()其实就是remove()+add()。

```
E/Fragment#0: onPause
E/Fragment#0: onStop
E/Fragment#0: onDestroyView
E/Fragment#0: onDestroy
E/Fragment#0: onDetach
```

### 状态保存
前面的log中有一个onViewStateRestored()的生命周期，是用来恢复保存的状态的。它对应的保存回调是onSaveInstanceState()，此回调会在app<b>进入后台</b> 、<b>熄屏</b>和 <b>其他系统认为需要保存状态</b>的情况下调用

```
// 进入后台或熄屏
E/Fragment#1: onPause
E/Fragment#1: onSaveInstanceState
E/Fragment#1: onStop
```

## PagerAdapter管理下的生命周期
---

目前一般使用FragmentPagerAdapter和FragmentStatePagerAdapter来配合ViewPager、TabLayout实现Fragment管理。

### FragmentPagerAdapter

FragmentPagerAdapter实际上是使用add()，attach()和detach()来管理Fragment的，所以影响的基本生命周期和上文中相关说明是一致的。缓冲范围内的从onAttach() - onResume()，超出缓存范围onPause() - onDestroyView()。

需要注意的是所有实例化过的Fragment实例都会保存在内存中，所以适合页面数量不多且固定的app首页等情况。

查看源码可知，FragmentPagerAdapter会add设定缓存数量（默认为前后各1个，首页和末页只缓存1个）的Fragment实例，超出缓存范围的使用detach清除。

```
// 省略部分源码突出重点

// 实例化item
@Override
public Object instantiateItem(ViewGroup container, int position) {
    ...
    Fragment fragment = mFragmentManager.findFragmentByTag(name);
    if (fragment != null) {
        ...
        // 如果不空则attach
        mCurTransaction.attach(fragment);
    } else {
        fragment = getItem(position);
        ...
        mCurTransaction.add(container.getId(), fragment,
                makeFragmentName(container.getId(), itemId));
    }
    ...
    return fragment;
}

// 清除缓存范围外item
@Override
public void destroyItem(ViewGroup container, int position, Object object) {
    if (mCurTransaction == null) {
        mCurTransaction = mFragmentManager.beginTransaction();
    }
    ...
    mCurTransaction.detach((Fragment)object);
}
```

### FragmentStatePagerAdapter

由源码可知，FragmentStatePagerAdapter使用add()和remove()管理Fragment，所以缓存外的Fragment的实例不会保存在内存中，适合分页多，数据动态的情况。

```
// 省略部分源码突出重点

// 实例化item
@Override
public Object instantiateItem(ViewGroup container, int position) {
    ...
    if (mCurTransaction == null) {
        mCurTransaction = mFragmentManager.beginTransaction();
    }
    ...
    // 直接add
    mCurTransaction.add(container.getId(), fragment);
    return fragment;
}

// 清除缓存范围外item
@Override
public void destroyItem(ViewGroup container, int position, Object object) {
    Fragment fragment = (Fragment) object;
    ...
	// 使用remove直接销毁Fragment
    mCurTransaction.remove(fragment);
}
```

### 显示和隐藏

对干缓存数量外的Fragment会被detach或remove，我们可以根据其常规生命周期进行开发，但是缓存数量内的显隐并不会影响生命周期，那我们怎么知道某个Fragment是否显示了呢？

当然，在Activity中可以通过Tab的position来判断，那Fragment内部呢？我们来看下log日志。

```
E/Fragment#0: setUserVisibleHint isVisibleToUser = false
E/Fragment#1: setUserVisibleHint isVisibleToUser = false
E/Fragment#0: onAttach
E/Fragment#0: onCreate
E/Fragment#0: setUserVisibleHint isVisibleToUser = true
E/Fragment#0: onCreateView
E/Fragment#0: onViewCreated
E/Fragment#0: onActivityCreated
E/Fragment#0: onViewStateRestored
E/Fragment#0: onStart
E/Fragment#0: onResume
E/Fragment#1: onAttach
E/Fragment#1: onCreate
E/Fragment#1: onViewCreated
E/Fragment#1: onActivityCreated
E/Fragment#1: onViewStateRestored
E/Fragment#1: onStart
E/Fragment#1: onResume
```

在Fragment中，还有一个setUserVisibleHint(boolean isVisibleToUser)的回调，页面的显隐就是通过该回调通知Fragment的。isVisibleToUser为true时显示、为false是隐藏。

从日志中我们可以看出，缓存数量内的Fragment0和Fragment1的isVisibleToUser首先会被设置成false，然后分别进行onAttach() - onResume()的生命周期，其中需要显示的Fragment在onCreate()之后，会将isVisibleToUser置为true，然后显示出来。由此可见setUserVisibleHint()有可能在onAttach()之前调用，并且到显示前可能调用2此，开发时需注意。

再之后的显隐就是设置isVisibleToUser并回调通知了。和上文中的onHiddenChanged()一样，显隐状态没有变化时，也是不会回调的。

```
// 从0切换到1
E/Fragment#0: setUserVisibleHint isVisibleToUser = false
E/Fragment#1: setUserVisibleHint isVisibleToUser = true

// 从1切换到0
E/Fragment#1: setUserVisibleHint isVisibleToUser = false
E/Fragment#0: setUserVisibleHint isVisibleToUser = true

// 从0切换到1
E/Fragment#0: setUserVisibleHint isVisibleToUser = false
E/Fragment#1: setUserVisibleHint isVisibleToUser = true

// 从1切换到0
E/Fragment#1: setUserVisibleHint isVisibleToUser = false
E/Fragment#0: setUserVisibleHint isVisibleToUser = true

// 从1切换到2
E/Fragment#0: setUserVisibleHint isVisibleToUser = false
E/Fragment#2: setUserVisibleHint isVisibleToUser = true
```

> 转载请注明出处：[Fragment生命周期](/2016/05/31/android_fragment_lifecycle)
