---
title: AsyncDisplayKit源码分析(二)，异步渲染
date: 2016-12-16 14:33:17
categories: 技术感悟
tags: [渲染]
---


这篇文章烂尾了吧。。为什么？

因为我在出去休假的时候，看到了一片微博有个文章，把我所有想说的点，想介绍的技术细节都说了，说的巨清楚，巨棒巨赞，巨详细

当当当当！！！


[使用 ASDK 性能调优 - 提升 iOS 界面的渲染性能](http://draveness.me/asdk-rendering/)


不过我对ASDK的看法还是那样

__我们为什么压根不应该使用AsyncDisplayKit__

__不用AsyncDisplayKit，我们把他里面的精华拿出来自己AsyncDisplay__


相关文章

- [圆角卡顿刨根问底](http://awhisper.github.io/2016/03/12/滚动圆角卡顿刨根问底/)
- [AsyncDisplayKit官方文档翻译](http://awhisper.github.io/2016/05/04/AsyncDisplayKit官方文档翻译/)
- [AsyncDisplayKit源码分析(一)，轮廓梳理](http://awhisper.github.io/2016/05/06/AsyncDisplayKit%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90/)
- AsyncDisplayKit源码分析(二)，异步渲染（本篇）



原谅我吧，这一篇挖坑拖着拖到现在╮(╯_╰)╭，上一篇说道

__我们为什么压根不应该使用AsyncDisplayKit__

那么这一篇就继续聊聊

__不用AsyncDisplayKit，我们怎么异步绘制__


# 前言

其实异步绘制很简单，[滚动圆角卡顿刨根问底](http://awhisper.github.io/2016/03/12/滚动圆角卡顿刨根问底/)中也提到过，我把生成bitmap这个阶段的工作放到线程里去做，bitmap生成完了得到需要的UIImage，再把Image在主线程里画到屏幕上。


bitmap的意思就是位图，图的尺寸多大，每个像素点上就有一个(r,g,b,a)的色值，换句话说bitmap，就是图片在内存中的数据原始形态，一堆一堆的数字，你可以循环遍历，你可以修改值，你可以进行矩阵变换，玩数字的同时，图片的呈现也会随之改变。

既然是一堆一堆的数字，一堆一堆的数据，那么在内存中，通过一个子线程去专门处理这些数据是完全没有问题的，只要你在编码的时候保证这段内存的线程安全，不会产生冲突访问。

也就是说，生成bitmap，就是生成一堆内存数据的过程，与渲染无关，不会占用唯一的屏幕设备资源，所以是完全可以放到子线程去操作的。

等到需要渲染的时候，因为设备屏幕资源就只有一个，多个线程同时争抢必然会crash，所以当数据在线程里准备好了，拿回主线程渲染。


__常规渲染__

- 主线程生成bitmap（也就是UIImage，无论是读文件读的，还是画布化的）
- 主线程渲染bitmap（通俗易懂的说就是把UIImage赋值给UIImageView，或者用drawAtPoint进行绘制）

__异步渲染__

- 主线程发起子线程任务
	- dispatch_asyc一下
	- 其他线程方案NSOperationQueue啊之类的
- 子线程执行任务
	- 绘制CGContextRef啊，生成UIImage啊
	- 读本地大文件啦，或者读网络请求图片啦（SDWebImage）
- 回到主线程渲染
	- UIImageView.image = xxximage;
	- [xxximage drawInRect:xxxx];

	
是不是觉得很简单？确实这就是异步绘制了~

但是AsyncDisplaykit这么简单吗？三言两语就解决了？

那我抛出来几个问题

- 异步绘制，如果绘制完了，界面数据已经发生了变化，绘制完的图片过期了，不应该再绘制了，怎么办？
- 异步绘制，如果还没绘制完，紧急叫停需要集体cancel怎么办？
- 异步绘制，同时并发多少个线程最合适？
	- 一个线程的话不卡主线程了但还是慢，得串行执行，这可取吗？
	- 每一次绘制都开一个线程，线程爆炸不会产生问题吗？（tableview滑动的时候，直接dispatch_asyc，滑的很快不就是一次滑动瞬间产生海量异步任务）
	- 如何管理控制一套线程池，不过度消耗，也不串行任务拉长耗时？


所有的东西一旦涉及异步，情况就可能变的非常复杂哟~
这也是ASDK值得我们好好拆解学习研究的

# AsyncDisplayKit的异步绘制