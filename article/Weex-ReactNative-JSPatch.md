---
title: Weex & ReactNative & JSPatch
date: 2016-07-22 22:50:49
categories: 技术感悟
tags: [Hybrid]
---

在微博上看到一篇绝赞的文章

[__Weex&ReactNative对比__](https://zhuanlan.zhihu.com/p/21677103)

绝对值得强烈推荐，我想写这篇文章的原因就是因为看了这篇文章觉得太棒了！前一阵子我自己确实有比较深入的拆解分析ReactNative的源码，一连写了三篇源码分析，当Weex开源的那一天，我也第一时间run起了demo，第一时间感受了这个东西，很多的新奇！很多的惊喜！

由于时间精力所限，我一直没有深入的去拆解分析weex，还是比较初步的了解和使用，所以一直没准备动笔写一篇对比类的文章，直到我今天看到了这篇文章，基于对RN的理解，看到了作者这么深刻的从方方面面非常多的角度对比分析了二者，简直产生了好多共鸣！虽然我不了解weex，但是RN的痛点还是相当相当认同的~哈哈哈哈

于是才产生了今天的blog。

并且在这基础上，我还想对比一下iOS 与 JSPatch的这套框架，因为无论weex也好rn也好，他们的思路或许一脉相承思路同源，但是和JSPatch这套方案比，那还真是完全不同的两个世界，这两个世界差异之大，但又能实现同样的热更新功能界面，对比一下真的很有意思！

# Weex&ReactNative对比
<!--more-->

这二者之间的对比我相信，读过作者原文的能学到很多，这里我就不重复啰嗦相同的内容了，不过我还是想以标注的形式，对于那些对比差异点我还是想说说我的一些个人的看法^_^

__(后面的内容，竖线+灰色文字是原文，底下是我的看法)__

>JS引擎：
>
>weex使用V8， ReactNative使用JSCore

这一点和作者交流确认了，iOS上weex依然使用JSCore而在安卓上weex使用了V8。

其实为什么会这样也是有原因的，安卓ReactNative虽然使用了JSCore，但这个JSCore不是系统源生的，而是直接打入app包里的WebKit库，这也是为啥安卓项目引入RN包大小会增大4~5M的原因，ReactNative在iOS上JSCore是系统自带的，完全无法打入app包内，所以iOS的包大小，引入RN后变化并没有那么夸张。

来到了weex，反正安卓RN都是完全自己植入进去的一整个JSCore，那不如把JSCore换成最新的V8引擎，但是iOS就不同了，iOS继续使用系统自带的JSCore还是方便的，系统自带的不用白不用，别浪费了，不然APP包凭空再多个4~5M，这也是个大槽点哈哈

>vue vs react
>
>react模板JSX学习使用有一定的成本 vue更接近常用的web开发方式，模板就是普通的html，数据绑定使用mustache风格，样式直接使用css

我是iOS开发哈，前端领域我不是很了解，我是看原文评论里，很多人说vue用起来更爽，我还没深入使用，但是我一个iOS客户端写React和JSX还是有点痛苦的╮(╯_╰)╭，不过值得说的是即便使用了vue，听说weex依然重现了react的virtual dom以及v dom diff算法，作为渲染性能上的保证，听说哈，我不懂，希望更多的前端大神给我解惑

>布局
>
>两者实现了flexbox的相同子集（都使用了FaceBook的代码解析），基本没有区别

哈哈都使用了FaceBook的代码解析，weex不愧是站在巨人肩膀上的~，顺带FlexBox算法这个还是好多都在用，聚划算的LuaView在用（lua的flexbox算法），fb的AsyncDisplayKit Layout在用，我其实对这个没啥好吐槽的，唯一只有一点

我是一个客户端开发，对于源生客户端开发来说，flexbox布局产生的页面层级太多了╮(╯_╰)╭，虽然weex和ReactNative，实际上都是纯native的界面渲染，但即便是native代码，View层级多了依然会带来些许性能问题

而FlexBox的排版就产生了很多这样的空UIView层级容器.这一层面其实是可以优化的,布局用的View容器其实不用驱动UIManager亲自绘制,不知道是不是我把问题想简单了，大家可以看一下这图，一个很简单的页面对于native来说，撑死了每个图片是一层完事，但是换成了flexbox，层级就变成了这样

![图1](http://ww4.sinaimg.cn/mw690/678c3e91jw1f5vj5wwsd3j20no0omgnt.jpg)

其实我倒是有个解决办法，就是不以前端的布局思路去做js脚本驱动native绘制，而是以客户端的思路，依然用js脚本驱动native绘制

这种思路的老前辈就是早已成熟3~4年的cocos2dx-lua，那种动态脚本更新整个游戏app，动态更新功能不是个新技术哈~思路早就有。

这种思路其实也是JSPatch的体现，JSPatch虽然写的是JS代码，但是全都要以native的编写代码风格，native的api使用风格去写代码，最终写出了跟纯native一模一样的功能界面。（相比较cocos2dx whole nativebridge的方案 JSPatch 的runtime bridge方案极度的轻便的多！）

>页面开发
>
>weex提供了一个playground，可以方便的预览正在开发的页面
>
>ReactNative开发一个页面，需要建立一个native工程，然后编译运行

这一点也是一个最大的感触，weex是一套解决三端，安卓，iOS，wap的解决方案，而ReactNative仿佛在facebook创造它的时候，没有为他考虑太多的wap，听说携程在使用RN的时候，先有ReactMix，后有Moles框架，都是在RN之上，在封装了一层统一wap，iOS，安卓三端的庞大框架，现在好了weex从一开始设计的出发点，就从3端去考虑了

既然支持了wap，wap也是一个环境，自然写功能页面的时候，完全可以不用Android Studio，不用Xcode，开一个浏览器跑起来wap的效果，也就是wap playground，等wap调的差不多了，再搭建native环境去细致跑

>打包
>
>ReactNative官方只能将ReactNative基础js库和业务js一起打成一个js bundle，没有提供分包的功能，需要制作分包打包工具
>
>weex默认打的js bundle只包含业务js代码，体积小很多，基础js库包含在weex sdk中

这个是个大吐槽！RN打出来的包，除了我们自己写的index.ios.js以外，把一整个React基础JS库全打进包里了，确实这部分完全可以内置app的，不然太浪费动态更新的流量了

>扩展性
>
>组件的扩展上，weex和ReactNative具有一样的能力
>
>三方库的接入上，weex对网络，图片，统计等常见的用户可能想自己定制的功能，提供了相应的适配接口，可以由用户方便的定制，ReactNative需要自己修改源码


这块虽然不了解weex，但觉得ReactNative做的实在是太赞了，所有RN的native底层，都是一个个的模块Module，完全解耦，随意灵活扩展插拔移除，而且支持开发者自行构建完全自己的Module，无论是界面还是数据网络接口。

我经常说的一句是，ReactNative其实是一个可以任意扩展支持的框架，你down下来的源码，你发现实现不了的功能，扩展一下，妥妥没问题，你down下来的源码，你发现性能有问题？很卡？（没错我说的就是listview！）我去自己扩展一个啊~iOS基于tableview自己重写一个带重用cell的RNTableview~安卓基于recycleview，重写一个哈？我始终认为，RN是一个思路，不是一个死的框架


>Moudle方法调用线程
>
>weex 可以通过注解标注是否在UI线程执行
>
>ReactNative在native_modules线程执行

这一点和作者交流了一下，安卓是这样的，但是iOS不是，iOS里面，RN每一个native_modules线程一样可以支持标记控制，只需要重写module的methodQueue方法，return gcd队列的mainqueue就好了，RN的module线程控制源码就是dispatch_async，gcd的queue一般默认用class那么字符串创建，所以默认是随机线程唯一队列，但如果指定async到mainqueue，是可以直接切换到主线程的

```objectivec
//RCTClipboard类的源码
- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}
```

>ListView Android
>
>ReactNative目前采用scrollView使用，有一些性能问题
>
>weex使用recyclerview实现，性能稍好

这个刚才就提到了的一个大吐槽!RN的ListView！RN的ListView是完全基于scrollview封装的，一旦数据够多，是完全没有重用的，业务中如果真的对listview性能痛苦不堪，并且RN提供的一些JS层面的优化性能的属性还不能满足需求，那是真的得完全重新自己封装一个基于native重用的ListView，很多人在使用RN的时候估计也都不能忍ListView然后自己封装了吧？这下好了，weex帮你做了


2016.7.27补充  

__ListView缺少重用机制是一个本质上的问题__

无数的人在和我强调ListView没有问题，我这里说的是重用机制，重用机制ListView是完全没有的，所以ListView在使用上推荐使用分页的方案，而不是无限制持续上拉加载更多，无上限的持续加载成百上千的Cell，这一点才是本质层面的问题

ListView由于这个底层实现的本质，所以在使用上推荐用分页的方法，无论是20个一屏，还是30个一页，实际上没啥区别，依然是无法不封顶的增加数量，在一些常规使用方法下ListView有一些基本的优化选项，可以增加表现力，但这改变不了功能上缺失的本质

[facebook官方文档中文翻译-性能优化](http://reactnative.cn/docs/0.30/performance.html#content)
>这是一个频繁出现的问题。因为iOS配备了UITableView，通过重用底层的UIViews实现了非常高性能的体验（相比之下ListView的性能没有那么好）。用React Native实现相同效果的工作仍正在进行中，但是在此之前，我们有一些可用的方法来稍加改进性能以满足我们的需求。 

以上是FaceBook官方的原文翻译，ListView有没有问题自然能看到。不用我多说了。。。

顺带Git上已经有UITableView的RN封装

[github react-native-tableview](https://github.com/aksonov/react-native-tableview)

粗略看了下源码实现，跟我脑海中的那套方案一致，每一个cell内部是一个rootview，可以通过initParams传入不同数据，进行reload渲染，cell自然进入native OC的重用池，（我太偷懒啦，有了一点思路，一直没亲自实现）

>工具链

卧槽，我要继续提一句，weex不亏是站在巨人肩膀上的，开发RN的时候其实有很多痛点，调试界面的时候，我需要全局加框，来查看flexbox布局是否正确，打包的时候我完全得自己重新开发分包或者diff包的工具，从而做到增量更新。

当我第一天使用weex的时候，就看到了那个devTools，那个可爱的小button，这可比RN的command + R的能力强大得多，用两个字评价就是`贴心！`



# 说点我自己的对比看法

我还是想说

__站在巨人的肩膀上看的更远！__

其实在我看来（我不太懂前端，我觉得从React.JS到Vue.JS，前端层面weex和rn的差异应该非常大），在native层面，也就是如何用js写出来的确是纯native界面这个原理上来说，Weex与ReactNative，思路同源，一脉相承，我觉得差异完全不大，原理是共通的，甚至如果扔掉了JSCore换成C++的luaengine，是不是跟LuaView都原理和核心思想是一致的呢？（luaview也是flexbox用lua写布局，最终是native渲染，不过我是真的没亲自跑过luaview的代码，但我2年前是做cocos2dx-lua的，非常了解lua动态更新app的机制）

但是facebook做出来的RN，我们在使用上确实是有很多的吐槽，这些吐槽完全不是RN做不到

- 你说RN做不到封装一个打包+diff工具吗？不可能，咋可能做不到
- 你说RN做不到开发一个更加贴心，更加酷炫的devTools和那个可爱的小button吗？当然不可能，扩展一下分分钟支持
- 你说RN真的做不到更优化ListView？很多第三方的做出来了，facebook咋可能做不到
- 你说RN真的做不到统一wap？传说中的携程的moles都是基于RN然后再扩展的一套牛逼的大框架，说明设计上没啥不可能做到的

RN本身是一套非常牛逼非常灵活而模块扩展式设计，天然支持你任何开发者去补充RN，去扩充RN，这些都不是RN的不足。

如果把ReactNative比作是Linux系统，不懂的人会觉得这也太难用了吧？看视频软件需要单独配置，去yum包去命令行安装配置一大堆，装各种软件都得命令行弄一大堆（很久以前上学的时候纯小白对Linux的认知），但不能说Linux系统是不能看视频解码小电影的╮(╯_╰)╭

那么Weex就很人性化的针对痛点，做了更多改善上的事情，更贴心，更易用，更强大，但又不失灵活，开源，扩展都还在（这里没有引申windows缺点的意思）

我甚至能有一种感觉，一定是深刻的使用过RN，真的了解了RN的痛点，才驱动做出这样一个贴心的项目

# iOS 平台独有的 JSPatch 动态更新完整功能

这里我要说一点就是，JSPatch现在很多人是拿他当HotPatch，进行热修复线上bug去用的，但是他得益于OC极其强大牛逼的运行时，超级灵活的反射机制，不像安卓的hotfix，可能受限于设备，受限于系统，总之反射机制不能完全发挥作用。

- JSPatch可以修改任何已经用OC写好的代码从而实现hotfix
- JSPatch可以动态创建任何原本OC代码没有写没有实现的类
- JSPatch可以对任何类（无论OC已有代码的类，还是JSPatch动态创建的类）创建任何新的方法，任何OC原本没有写好的方法
- JSPatch可以调用任何存在类，存在的方法，哪怕这条调用语句并没有预先被OC写好

从上面的描述我们可以看出来，JSPatch绝不仅仅可以用来HotFix，而是可以用来构建全新的功能，并且实现一整个功能模块的动态更新！

## 并且JSPatch的灵活无人能比

说句实话JSPatch得益于牛逼无敌的OC，runtime，他的灵活能力，是ReactNative&Weex这个方案思路远远不能比的。

- 例子一

举个最简单的例子，RN与Weex，对于微信支付这种很native的模块，或许都是采用预先在native代码里写好了实现，最后让JS去调用（无论是开发者自己扩展的还是系统扩展的），这个东西就叫jsbridge，但这个bridge很普通，你写了微信支付的jsbridge，那你的js就有了微信支付的能力，你写了支付宝支付的jsbridge，那你的js就有了支付宝的能力，你写了iOS平台的IAP的jsbridge，那你的js就有了IAP的能力，如果你没写咋办？你的JS就办不到，要知道，扩写这些jsbridge，都是需要发版的，都是不能动态更新的。

换句话说，如果一开始使用RN的app只开发了支付宝的支付功能，写好了支付宝的jsbridge，于是发版上线了，等某一天突然想接入苹果的applepay，那么只有一个办法，那就是重新发版，重新写好了applepay的jsbridge，再次提交苹果审核（我举了个系统库的例子，但意义可以扩展一下）

但是对于JSPatch来说，JSPatch也是一套基于JSCore的bridge，但是牛逼就牛逼在JSPatch不是这种常规的normal jsbridge，而是runtime jsbridge，runtime的特点就是实现没有被任何oc代码预先写好的功能，同时还能修改已经被OC代码预先写好的功能！

- 例子二

如果整个APP都是RNorWeex包一个壳子，所有功能都是js写的，那么如果不需要更新jsbridge，那么确实可以实现，修改任何功能模块，写新的功能模块，都可以用RNorWeex进行热更新，完全不发版。

但是我相信，相当多的APP都是部分界面保留原有工程的native，部分界面，部分新界面采用RNorWeex（那些已经成熟的大app一定是这样的，不可能推翻重写）

那么问题来了，RN能更新用RN写的界面，RN能更新那些原本native的界面吗？答案是不行，JSPatch可以。RN可以开发一整个新功能界面，动态更新到app上，但是这个新功能界面怎么打开呢？办法有一个，app内有一套URLRoute的路由机制，并且辅助以云端可控的路由配置表，那么确实可以改变某些位置原本的界面跳转，从而跳转打开全新的RN界面，实现了新RN界面的动态更新，但是JSPatch就不需要URLRoute这套全局跳转的辅助机制帮忙，JSPatch完全有能力更改任何已经由OC写好的代码，随意的改变跳转到新界面，随意的增加新按钮，不改变旧界面就把新界面打开！


## 阿里的Wax
与JSPatch能力和机制类似的还有[阿里的Wax](https://github.com/alibaba/wax)

Wax本是很久以前国外的大神编写的一套用Lua写OC的动态框架，但是这个框架太老了，老到还没有支持苹果64位就没人维护了，年代太久远了

大众点评的大神在Wax的基础上融入了运行时，变成了WaxPatch，但这年代也很久远，也是在没有支持64位的时候就不维护了。

直到去年10月，阿里宣布接管维护了Wax，并且大量扩展了海量功能，因为以前的wax也好waxpatch也好，支持的动态runtime能力还特别少。

不过都是纯iOS平台，毕竟这种思路和玩法完全依托于无敌的OC Runtime

# JSPatch 福祸相依，优劣共存

和JSPatch的作者[@bang哥](http://blog.cnbang.net/)学习以及交流了很多动态更新方面的看法，bang哥最近也在酝酿一篇大作，专程去对比JSPatch与ReactNative的对比。

bang哥的看法

| 对比        | 学习成本           | 接入成本  | 热更新能力 | 开发效率 |性能体验|
| ------------- |:-------------:| -----:|-----:|-----:|-----:|-----:|
| Weex&RN      | 高 | 高 | 中| 高，跨平台|高|
|   JSPatch    | 低      |   低 | 强 | 中，不跨平台|高|


>总的来说，JSPatch在学习成本，接入成本，热更新能力上占优，而 React Native 在开发效率和跨平台能力上占优，大家可以根据需求的不同选用不同的热更新方案。JSPatch 目前仍在不断发展中，欢迎参与这个开源项目的开发。

原文还没发布，等到发布了我一定第一时间补上原文链接。


## 我的一些补充：

- 学习成本：

这其实是对native开发人员来说的，JSPatch所有的API，所有的写法，所有界面的布局，都是纯native开发人员最熟悉的，只是需要略微熟悉下从OC变JS的转变（最基础的js语法）（甚至有一些不是太智能的oc直接转js的工具），以及JSPatch的一些独特规定，对于native iOS开发人员来说（就是我啦），学习css+html式的布局，理解flexbox（忍受flexbox那层级的吐槽），其实远没有直接按着native的思维方式写JSPatch方便。

ReactNative&Weex的方案更贴近web开发人员，尤其是熟练掌握React和Vue的，但是当面临自定义扩展native能力也就是bridge开发的时候，其实还是需要native代码能力，并且视你的扩展需求不同，可能需要比较深的native能力。

所以从我一个native开发人员的角度来讲，JSPatch学习成本低很多

- 接入成本

你能想象 JSPatch的核心代码，不算边角扩展，所有源码只有2个文件吗？`jspatch.js`和`JPEngine.h.m`

- JPEngine.h.m  只有区区1700行代码！
- jspatch.js 只有区区200行代码！

这接入成本可想而知啊，下源码，扔进工程，完事啊~哈哈哈哈哈

- 热更新能力

前面解释的够多了，在iOS平台上，JSPatch其runtime能力，真的是无论weex还是ReactNative都是远远无法比拟的

- 开发效率

确实Weex & ReactNative的辅助开发工具超级多，并且HTML+CSS式的界面布局，熟练了以后开发真的是太快了╮(╯_╰)╭

JSPatch还是native的开发方式，辅助工具也开发了很多，大家可以细看JSPatch的Github和bang哥的Github和博客，但效率上我觉得还是比不上的╮(╯_╰)╭

- 性能体验
bang哥的评价二者都是高，我觉得二者差异不大，但非要说个优劣，我提到过flexbox的层级问题，即便是纯native开发搞出如此多的层级，也是会有性能损耗的，但这个点可能没那么关键，性能损耗没那么严重。二者最终都是纯native的效果与渲染，与触摸交互，所以，都给了个高的评分

## 我用JSPatch也遇到一些坑

JSPatch目前在使用上会和webview有一定的冲突，如果有需要动态用jspatch写一个含有webview的页面的时候，会有略微的麻烦，和不稳定因素，在GitWiki上有明确介绍了如何在JSPatch里面使用webview，比如初始化的时候先于JSPatch构建一个Webview然后在销毁啊，比如js创建webview记得需要十分小心的使用一个performInOc的api啊，不要按着常用方法使用，还有就是不稳定，我的case是某一些特殊的业务场景下，会偶现crash（很低概率，但是频繁操作可以复现）

## JSPatch与ReactNative的内存控制差异

- JSPatch在OC与JS交互的时候，是支持直接把一个OC对象，一个界面，一个model，直接传给JS上下文里面的，这个OC对象会因此引用计数+1，并且随着JS上下问的垃圾回收机制，对这个OC对象进行引用计数的额外控制，在JS上下文内是无法去查看这个OC对象的，但是却可以指定任何OC对象原本的方法，然后发送回OC环境去操作这个OC对象。

- RN在OC与JS交互的时候，是完全不支持传递任何OC对象的，所有能在JS与OC中间传递的，一定是可以被json化，字符化的内容，数字，字典，数组，字符串，所以RN专门有个RCTConvert类去专门处理，json的序列化model化，反序列化反model化。那么RN是如何通过JS去控制一个纯OC的界面View呢?是通过viewTag，JS控制的每一个界面效果，都是传过来一个tag，让native创建，让native修改，native会储存住这些tag到一个hashmap里，这样JS才能够不直接传递OC对象，而是传递一个数字，从而控制OC对象

二者的实现差异，是会造成一些底层运行差异的，OC与JS对象只传递JSON其实就保证了，JS上下文的内存与OC上下文的内存完全没有互通，各自的内从各自控制，JS是一套垃圾回收机制，而OC是一套引用计数机制。

JSPatch将二者进行了互通，这些互通的对象内存管理则是一套，又有引用计数控制，又有JS的垃圾回收，当JS的垃圾回收，并且iOS的引用计数归0，才会销毁。

这里没有优劣之分，JSPatch在双内存控制机制下，也是可以正常work没有问题的，RN&Weex的这套机制，内存上简单清晰，不过这都是底层实现的问题，上层使用，都是没问题的



相关系列文章

- [ReactNative iOS源码解析（一）](http://awhisper.github.io/2016/06/24/ReactNative%E6%B5%81%E7%A8%8B%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90/)
- [ReactNative iOS源码解析（二）](http://awhisper.github.io/2016/07/02/ReactNative%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%902/)
- [Talk about ReactNative Image Component](http://awhisper.github.io/2016/07/17/Talk-about-ReactNative-Image-Component/)

