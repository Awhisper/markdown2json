---
title: AsyncDisplayKit源码分析（一）轮廓梳理
date: 2016-05-06 19:07:21
categories: 技术感悟
tags: [渲染]
---


本篇文章的全文可以用另一个文章标题来概括！

__我们为什么压根不应该使用AsyncDisplayKit__

而我的异步绘制的后面那一篇文章也可以用另一个文章标题来概括！

__不用AsyncDisplayKit，我们怎么异步绘制__

# 前言


Facebook出得这个AsyncDisplayKit严格意义上讲，已经远远超出了超出了AsyncDisplay的范围.

我个人在最开始思考AsyncDisplay的时候，以为这只是一个解决异步渲染的问题，可能是最大限度的在layer层display的时候做文章，直到我粗略了学习了下他的源码，才发现，我只看到了ASDK中很小很小很小的一块。

ASDK其实已经十分庞大，涵盖了AsyncQueueControl（异步队列控制），在队列控制基础上封装的AsyncDisplay（异步绘制）,AsyncLayout（异步UI布局计算），AsyncFetchData（异步数据准备），AsyncTextLayout（异步文字排版）并且又在此之上，重写了一整套几乎我们能用到的所有UIKit控件，小到ImageView，Button，Text，大到Tableview，CollectionView，再到ViewController，全都一一对应重写了一套ASDK的ASXXNode

因此，使用ASDK的开发者，面临的最大问题是，虽然ASDK各方面的用法都是尽可能做到很像UIKit的，并且支持兼容从旧的UIKit生成新的ASNode，但是如果想使用ASDK，势必得完全改变以前的编码习惯，以前的旧代码，再开发UI的时候，完全使用ASXX开头的控件，放弃苹果官方的frame布局，或者官方的autolayout，转而使用ASDK的layout方案（支持自己扩展），如果涉及文字，也要使用ASText相关的富文本描述（支持自己扩展），如果涉及Tableview CollectionView，甚至写代理的习惯都要跟着改变和适应

对于我们来说，想要引入ASDK，确实太重了，我们不妨把它当做一个学习样本，去拆解分析一下这里面是如何运作的


# AsyncDisplayKit 轮廓梳理

# 核心基础ASDisplayNode

<!--more-->

就好像所有的UIKit最重都是从UIView继承一样，ASDisplayNode就是整个AsyncDisplayKit的基石，几乎所有的AS对象都是从ASDisplayNode继承出来（ASViewController，ASRangeController，ASDataController等例外）

![ASNode](http://7xu1rc.com1.z0.glb.clouddn.com/asdknodeshow.png)

此图是官网一个截图，便于我们去进行类比理解 ASDisplayNode VS UIView

CALayer

- CALayer专注负责一切关于渲染绘制的事情
- CALayer只能在主线程使用

UIView

- UIView内部持有了CALayer，将layer封装起来
- UIView充当CALayer的delegate，渲染动画时产生的时间会通知view
- UIView可以通过.layer直接访问CALayer，从而更进一步操作渲染
- UIView管理着CALayer的渲染，同时还管理着其他诸如点击事件等渲染之外的事情
- UIView只能在主线程使用

ASDisplayNode

- ASDisplayNode内部持有了UIView，将view封装起来
- ASDisplayNode充当UIView的delegate，原本view产生的各种事件，由于已经不直接操作UIView，因此会delegate通知node进行处理
- ASDiplayNode可以通过.view直接访问UIView
- ASDiplayNode管理着UIView，接管了UIView的一些处理操作
- ASDiplayNode通过对异步处理的改造，让使用者可以在安全的在线程进行操作

# ASNode的控件继承结构

可以看看ASXXNode系列，都有哪些，下图里面并没有举例完所有的public ASNode，只是粗略列出常用的

![asnodetree](http://7xu1rc.com1.z0.glb.clouddn.com/nodetree.png)

是不是很像，UIView->UIControl->UIButton的UIKit继承结构

# ASDK的容器
每一个Node节点是可以直接通过UIView的`addSubnode`方法添加到原本的UIView之上，但是官方在文档里并不推荐这么做，我前一篇的官方文档翻译中有写

>当在项目中替换使用AsyncDisplayKit的时候，一个经常犯的错误就是把一个Node节点直接添加到一个现有的view视图层次结构里。这样做会导致你的节点在渲染的时候会闪烁一下
>
>相反，你应该你应该把nodes节点，当做一个子节点添加到一个容器类里。这些容器类负责告诉所包含的节点，他们现在都是什么状态，以便于尽可能有效的加载数据与渲染。你可以把这些类当做UIKit和ASDK的整合点
>

借助nodes容器可以更好的对容器内子nodes进行管理和渲染控制，这是官方推荐使用的，因此我们引出了节点容器的概念

__ASViewController__

ASViewController就是这样的一种节点容器，它并非继承自ASDisplayNode，而是直接继承自UIViewController，就好像每一个UIViewController一定要有一个self.view一样，ASViewController必须由一个ASDisplayNode进行初始化。

__ASTableNode__

__ASCollectionNode__

这两个节点，本身就是一个ASDisplayNode节点，但它同时也有节点容器的作用

不仅如此，Table和Collection都是用于滚动并且批量展示数据的，ASDK还特意为此封装了一套复杂的处理----滚动情况下的数据异步加载过程。

因此他内部有两个很特殊的控制器

- ASRangeController 用于智能判断滚动范围和滚动方向，提起对即将滚入屏幕的区域进行预处理控制，包括预处理数据加载，和预处理渲染
- ASDataController 专门用于数据相关的加载控制，在RangeController的指挥下，对指定区域内的数据进行加载。

# AsyncDisplayKit的其他组件

讲到这里，还有2个重要的东西没说明

- ASLayout布局功能：ASDK专门基于CSS Flex Box布局方案，重写了一套自己的布局算法，没有依赖于UIKit的布局，就是为了能让这套算法在异步线程里也能运算页面布局，ASDisplayNode，可以直接对他设置约束，也可以直接设定frame，postion，并且有专门的measure方法可以线程安全的去计算自己，以及所有子节点的布局位置。
- ASAsyncTransaction异步控制：ASDK专为异步渲染而写的一套异步队列控制，每当ASDisplayNode内部的ASDisplayLayer发生`display`方法的时候，就是主线程将要发生绘制的时候，会把相关绘制的操作，ASDisplayNode会将绘制任务提交给ASAsyncTransaction，在他内部的线程队列里进行绘制运算，当运算完毕，将绘制结果抛回主线程渲染到屏幕上。

# OverView

![流程](http://7xu1rc.com1.z0.glb.clouddn.com/chubuliucheng.png)


大致的轮廓可以看上面，ASDK非常大，里面还有太多太多的细节，比如专门为ASText相关的Node，写了一整套独特的ASTextLayout，整个框架里很多关键的类都可以深入展开，详细说太多太多

# AsyncDisplay（等待下篇）

下一篇分析就决定从ASDisplayNode + ASAsyncTransaction入手，重点去拆解学习，异步渲染这个过程。聚焦于整个Display环节。

我的本意是重点学习和分析异步渲染，然后可以不引入ASDK如此大的framework来解决实际项目中遇到的渲染性能问题。

至于ASLayout以及RangeController，DataController，由于ASDK太大，短时间内由于涵盖的东西太多，慢慢来吧╮(╯_╰)╭

相关文章

- [圆角卡顿刨根问底](http://awhisper.github.io/2016/03/12/滚动圆角卡顿刨根问底/)
- [AsyncDisplayKit官方文档翻译](http://awhisper.github.io/2016/05/04/AsyncDisplayKit官方文档翻译/)
- AsyncDisplayKit源码分析(一)，轮廓梳理
- AsyncDisplayKit源码分析(二)，异步渲染（还没写。。）