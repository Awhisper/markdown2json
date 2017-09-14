---
title: ARC下强制retain
date: 2016-01-13 14:07:07
categories: 技术感悟
tags: [ARC]
---


## 引子
主要是由于上一篇文章callselector引起的

>如果断点调试，整个call_selector的过程完全走完都不会有事，但是一旦放开断点，彻底走完就崩溃。
为啥呢？因为在使用invocation的时候 invoke的过程中，如果对象在invoke内被创建初始化了，invoke结束后，在下一个autorelease的时间点就会产生zombie的crash，send release to a dealloc object

>为什么会这样，简单的说下我的理解不细说吧，invoke和直接函数调用不太一样，如果发生了alloc对象，那么这个对象系统会额外多一次autorelease，所以，不会立刻崩溃，但当autoreleasepool释放的时候，就会发生过度release。

invoke函数会导致ARC下额外的一次autoRelease，所以在自动释放池释放后就会多一次release，导致zombie

## 有点挫的解决办法

就是我在上一篇callselector提到的
>因为多了个release，那我再arc下不能强制retain，那我就add到一个字典里，让他被arc retain一下

于是问题是解决了，但是也产生了一个一直存在的static字典，并且这个字典里，这个key所对应的数据已经野指针，千万不能操作，一旦操作就野指针crash，你对字典进行removeall，也会野指针crash

## 威武的思路
@无边的翅膀 在我的简书下留言

> 针对这个，我想给出一个建议。在ARC下修改一个对象的引用计数，可以使用CoreFoundation框架的API，CFRetain和 CFRelease 函数

这个思路靠谱啊，于是动手试验
<!-- more -->

```objectivec
const void* cfobj = CFBridgingRetain(obj);
CFRetain(cfobj);
CFBridgingRelease(cfobj);
```

- 将对象的内存管理控制移交给CF
- CFRetain
- 将对象的内存管理移交回ARC（让使用者无感知）

我其实对CF这块并不是很熟悉。初步跑通了一下，感觉没啥问题

然后@无边的翅膀 给出了修改意见

> 不需要这么复杂，一行代码就好，CFRetain((__bridge CFTypeRef)(obj));

简直太赞了！

## ARC下的MRC
如果实在迫不得已一定得在ARC下进行MRC操作的话。。无论是`release`，`retain`这样也可以有办法了，但是

慎用啊