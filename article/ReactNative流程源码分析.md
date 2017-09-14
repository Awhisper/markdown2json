---
title: ReactNative iOS源码解析（一）
date: 2016-06-24 22:05:24
categories: 技术感悟
tags: [Hybrid]
---

相关系列文章

- [ReactNative iOS源码解析（一）](http://awhisper.github.io/2016/06/24/ReactNative%E6%B5%81%E7%A8%8B%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90/)
- [ReactNative iOS源码解析（二）](http://awhisper.github.io/2016/07/02/ReactNative%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%902/)
- [Talk about ReactNative Image Component](http://awhisper.github.io/2016/07/17/Talk-about-ReactNative-Image-Component/)

本篇前两部分内容简单介绍一下ReactNative，后面的章节会把整个RN框架的iOS部分，进行代码层面的一一梳理

全文是不是有点太长了，我要不要分拆成几篇文章

函数栈代码流程图，由于采用层次缩进的形式，层次关系比较深的话，不是很利于手机阅读，

# ReactNative 概要
ReactNative，动态，跨平台，热更新，这几个词现在越来越火了，一句`使用JavaScript写源生App`吸引力了无数人的眼球，并且诞生了这么久也逐渐趋于稳定，`携程`,`天猫`,`QZone`也都在大产品线的业务上，部分模块采用这个方案上线，并且效果得到了验证[（见2016 GMTC 资料PPT）](http://ppt.geekbang.org/gmtc)

我们把这个单词拆解成2部分

- React

熟悉前端的朋友们可能都知道`React.JS`这个前端框架，没错整个RN框架的JS代码部分，就是React.JS，所有这个框架的特点，完完全全都可以在RN里面使用（这里还融入了Flux，很好的把传统的MVC重组为dispatch，store和components，[Flux架构](http://reactjs.cn/react/docs/flux-overview.html)）

所以说，写RN哪不懂了，去翻React.JS的文档或许都能给你解答

以上由@彩虹 帮忙修正

- Native

顾名思义，纯源生的native体验，纯源生的UI组件，纯原生的触摸响应，纯源生的模块功能

__那么这两个不相干的东西是如何关联在一起的呢？__

React.JS是一个前端框架，在浏览器内H5开发上被广泛使用，他在渲染render()这个环节，在经过各种flexbox布局算法之后，要在确定的位置去绘制这个界面元素的时候，需要通过浏览器去实现。他在响应触摸touchEvent()这个环节，依然是需要浏览器去捕获用户的触摸行为，然后回调React.JS

上面提到的都是纯网页，纯H5，但如果我们把render()这个事情拦截下来，不走浏览器，而是走native会怎样呢？

当React.JS已经计算完每个页面元素的位置大小，本来要传给浏览器，让浏览器进行渲染，这时候我们不传给浏览器了，而是通过一个JS/OC的桥梁，去通过`[[UIView alloc]initWithFrame:frame]`的OC代码，把这个界面元素渲染了，那我们就相当于用React.JS绘制出了一个native的View

拿我们刚刚绘制出得native的View，当他发生native源生的`- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event`触摸事件的时候，通过一个OC/JS的桥梁，去调用React.JS里面写好的点击事件JS代码

这样React.JS还是那个React.JS，他的使用方法没发生变化，但是却获得了纯源生native的体验，native的组件渲染，native的触摸响应

于是，这个东西就叫做React-Native

<!--more-->

# ReactNative 结构

大家可以看到，刚才我说的核心就是一个桥梁，无论是JS=>OC，还是OC=>JS。

刚才举得例子，就相当于把纯源生的UI模块，接入这个桥梁，从而让源生UI与React.JS融为一体。

那我们把野心放长远点，我们不止想让React.JS操作UI，我还想用JS操作数据库！无论是新玩意Realm，还是老玩意CoreData，FMDB，我都希望能用JS操作应该怎么办？好办，把纯源生的DB代码模块，接入这个桥梁

如果我想让JS操作Socket做长连接呢？好办，把源生socket代码模块接入这个桥梁。如果我想让JS能操作支付宝，微信，苹果IAP呢？好办，把源生支付代码模块接入这个桥梁

由此可见RN就是由一个bridge桥梁，连接起了JS与na的代码模块

- 链接了哪个模块，哪个模块就能用JS来操作，就能动态更新
- 发现现有RN框架有些功能做不到了？扩展写个na代码模块，接入这个桥梁

这是一个极度模块化可扩展的桥梁框架，不是说你从facebook的源上拉下来RN的代码，RN的能力就固定一成不变了，他的模块化可扩展，让你缺啥补上啥就好了

__ReactNative 结构图__

![RN结构图](http://o8n2av4n7.bkt.clouddn.com/reactnativejiegou.png)

大家可以看这个结构图，整个RN的结构分为四个部分，上面提到的，RN桥的模块化可扩展性，就体现在JSBridge/OCBridge里的ModuleConfig，只要遵循RN的协议`RCTBridgeModule`去写的OC Module对象，使用`RCT_EXPORT_MODULE()`宏注册类，使用`RCT_EXPORT_METHOD()`宏注册方法，那么这个OC Module以及他的OC Method都会被JS与OC的ModuleConfig进行统一控制

![RN类图](http://o8n2av4n7.bkt.clouddn.com/RCTRoot.png)

上面是RN的代码类结构图

- 大家可以看到`RCTRootView`是RN的根试图，

	- 他内部持有了一个`RCTBridge`,但是这个RCTBridge并没有太多的代码，而是持有了另一个`RCTBatchBridge`对象，大部分的业务逻辑都转发给BatchBridge，BatchBridge里面写着的大量的核心代码
	
		- BatchBridge会通过`RCTJavaScriptLoader`来加载JSBundle，在加载完毕后，这个loader也没什么太大的用了
		
		- BatchBridge会持有一个`RCTDisplayLink`，这个对象主要用于一些Timer，Navigator的Module需要按着屏幕渲染频率回调JS用的，只是给部分Module需求使用
		
		- `RCTModuleXX`所有的RN的Module组件都是RCTModuleData，无论是RN的核心系统组件，还是扩展的UI组件，API组件
			
			- `RCTJSExecutor`是一个很特殊的RCTModuleData，虽然他被当做组件module一起管理，统一注册，但他是系统组件的核心之一，他负责单独开一个线程，执行JS代码，处理JS回调，是bridge的核心通道
			- `RCTEventDispatcher`也是一个很特殊的RCTModuleData，虽然他被当做组件module一起管理，统一注册，但是他负责的是各个业务模块通过他主动发起调用js，比如UIModule，发生了点击事件，是通过他主动回调JS的，他回调JS也是通过`RCTJSExecutor`来操作，他的作用是封装了eventDispatcher得API来方便业务Module使用。

后面我会详细按着代码执行的流程给大家细化OCCode里面的代码，JSCode由于我对前端理解还不太深入，这个Blog就不会去拆解分析JS代码了

ReactNative通信机制可以参考bang哥的博客 [React Native通信机制详解](http://blog.cnbang.net/tech/2698/)



# ReactNative 初始化代码分析

我会按着函数调用栈类似的形式梳理出一个代码流程表，对每一个调用环节进行简单标记与作用说明，在整个表梳理完毕后，我会一一把每个标记进行详细的源码分析和解释

下面的代码流程表，如果有类名+方法的，你可以直接在RN源码中定位到具体代码段

- RCTRootView-initWithBundleURLXXX(__RootInit标记__)
	- RCTBridge-initWithBundleXXX
		- RCTBridge-createBatchedBridge（__BatchBridgeInit标记__）
			- New Displaylink（__DisplaylinkInit标记__）
			- New dispatchQueue (__dispatchQueueInit标记__)
			- New dispatchGroup (__dispatchGroupInit标记__)
			- group Enter（__groupEnterLoadSource标记__）
				- RCTBatchedBridge-loadSource (__loadJS标记__)
			- RCTBatchedBridge-initModulesWithDispatchGroup（__InitModule标记__ 这块内容非常多，有个子代码流程表）
			- group Enter（__groupEnterJSConfig标记__）
				- RCTBatchedBridge-setUpExecutor（__configJSExecutor标记__）
				- RCTBatchedBridge-moduleConfig（__moduleConfig标记__）
				- RCTBatchedBridge-injectJSONConfiguration（__moduleConfigInject标记__）
			- group Notify（__groupDone标记__）
				- RCTBatchedBridge-executeSourceCode（__evaluateJS标记__）
				- RCTDisplayLink-addToRunLoop（__addrunloop标记__）


__RootInit标记__：所有RN都是通过init方法创建的不再赘述，URL可以是网络url，也可以是本地filepath转成URL

__BatchBridgeInit标记__：前边说过rootview会先持有一个RCTBridge，所有的module都是直接操作bridge所提供的接口，但是这个bridge基本上不干什么核心逻辑代码，他内部持有了一个batchbrdige，各种调用都是直接转发给RCTBatchBrdige来操作，因此batchbridge才是核心

RCTBridge在init的时候调用`[self setUp]`

RCTBridge在setUp的时候调用`[self createBatchedBridge]`

__DisplaylinkInit标记__：batchbridge会首先初始化一个`RCTDisplayLink`这个东西在业务逻辑上不会被所有的module调用，他的作用是以设备屏幕渲染的频率触发一个timer，判断是否有个别module需要按着timer去回调js，如果没有module，这个模块其实就是空跑一个displaylink，注意，此时只是初始化，并没有run这个displaylink

__dispatchQueueInit标记__：会初始化一个GCDqueue，后面很多操作都会被扔到这个队列里，以保证顺序执行

__dispatchGroupInit标记__：后面接下来进行的一些列操作，都会被添加到这个GCDgroup之中，那些被我做了group Enter标记的，当group内所有事情做完之后，会触发group Notify

__groupEnterLoadSource__标记：会把无论是从网络还是从本地，拉取jsbundle这个操作，放进GCDgroup之中，这样只有这个操作进行完了（还有其他group内操作执行完了，才会执行notify的任务）


__loadJS标记__：其实就是异步去拉取jsbundle，无论是本地读还是网络啦，`[RCTJavaScriptLoader loadBundleAtURL:self.bundleURL onComplete:onSourceLoad];`只有当回调完成之后会执行`dispatch_group_leave`，离开group


__InitModule标记__：这个函数是在主线程被执行的，但是刚才生成的GCD group会被当做参数传进内部，因为内部的一些逻辑是需要加入group的，这个函数内部很复杂 我会继续绘制一个代码流程表

- 1）RCTGetModuleClasses() 

一个C函数，RCT_EXPORT_MODULE()注册宏会在`+load`时候把Module类都统一管理在一个static NSArray里，通过RCTGetModuleClasses()可以取出来所有的Module

- 2）RCTModuleData-initWithModuleClass 

此处是一个for循环，循环刚才拿到的array，对每一个注册了得module都循环生成RCTModuleData实例

- 3）配置moduleConfig

每一个module在循环生成结束后，bridge会统一存储3分配置表，包含了所有的moduleConfig的信息，便于查找和管理

```objectivec
//barchbridge的ivar
  NSMutableDictionary<NSString *, RCTModuleData *> *_moduleDataByName;
  NSArray<RCTModuleData *> *_moduleDataByID;
  NSArray<Class> *_moduleClassesByID;
// Store modules
  _moduleDataByID = [moduleDataByID copy];
  _moduleDataByName = [moduleDataByName copy];
  _moduleClassesByID = [moduleClassesByID copy];
```

- 4）RCTModuleData-instance

这是一个for循环，每一个RCTModuleData都需要循环instance一下，需要说明的是，RCTModuleData与Module不是一个东西，各类Module继承自NSObject，RCTModuleData内部持有的instance实例才是各类Module，因此这个环节是初始化RCTModuleData真正各类Module实例的环节

通过`RCTModuleData-setUpInstanceAndBridge`来初始化创建真正的Module

```objectivec
	//SOME CODE
	_instance = [_moduleClass new];
	//SOME CODE
	[self setUpMethodQueue];
```

这里需要说明，每一个Module都会创建一个自己独有的专属的串行GCD queue，每次js抛出来的各个module的通信，都是dispatch_async，不一定从哪个线程抛出来，但可以保证每个module内的通信事件是串行顺序的

每一个module都有个bridge属性指向，rootview的bridge，方便快速调用

- 5）RCTJSCExecutor 

RCTJSCExecutor是一个特殊的module，是核心，所以这里会单独处理，生成，初始化，并且被bridge持有，方便直接调用

`RCTJSCExecutor初始化`做了很多事情，需要大家仔细关注一下

创建了一个全新的NSThread，并且被持有住，绑定了一个runloop，保证这个线程不会消失，一直在loop，所有与JS的通信，一定都通过RCTJSCExecutor来进行，所以一定是在这个NSThread线程内，只不过各个模块的消息，会进行二次分发，不一定在此线程内

- 6）RCTModuleData-gatherConstants

每一个module都有自己的提供给js的接口配置表，这个方法就是读取这个配置表，注意！这行代码执行在主线程，但他使用dispatch_async 到mainQueue上，说明他先放过了之前的函数调用栈，等之前的函数调用栈走完，然后还是在主线程执行这个循环的gatherConstants，因此之前传进来的GCD group派上了用场，因为只有当所有module配置都读取并配置完毕后才可以进行 run js代码

__下面思路从子代码流程表跳出，回到大代码流程表的标记__

__groupEnterJSConfig标记__：代码到了这块会用到刚才创建，但一直没使用的GCD queue，并且这块还比较复杂，在这次enter group内部，又创建了一个子group，都放在这个GCD queue里执行

如果觉得绕可以这么理解他会在专属的队列里执行2件事情（后面要说的2各标记），当这2个事情执行完后触发子group notify，执行第三件事情（后面要说的第三个标记），当第三个事情执行完后leave母group，触发母group notify

```objectivec
dispatch_group_enter(initModulesAndLoadSource);
  dispatch_async(bridgeQueue, ^{
    dispatch_group_t setupJSExecutorAndModuleConfig = dispatch_group_create();

    // Asynchronously initialize the JS executor
    dispatch_group_async(setupJSExecutorAndModuleConfig, bridgeQueue, ^{
      RCTPerformanceLoggerStart(RCTPLJSCExecutorSetup);
      [weakSelf setUpExecutor];
      RCTPerformanceLoggerEnd(RCTPLJSCExecutorSetup);
    });

    // Asynchronously gather the module config
    dispatch_group_async(setupJSExecutorAndModuleConfig, bridgeQueue, ^{
      if (weakSelf.valid) {
        RCTPerformanceLoggerStart(RCTPLNativeModulePrepareConfig);
        config = [weakSelf moduleConfig];
        RCTPerformanceLoggerEnd(RCTPLNativeModulePrepareConfig);
      }
    });

    dispatch_group_notify(setupJSExecutorAndModuleConfig, bridgeQueue, ^{
      // We're not waiting for this to complete to leave dispatch group, since
      // injectJSONConfiguration and executeSourceCode will schedule operations
      // on the same queue anyway.
      RCTPerformanceLoggerStart(RCTPLNativeModuleInjectConfig);
      [weakSelf injectJSONConfiguration:config onComplete:^(NSError *error) {
        RCTPerformanceLoggerEnd(RCTPLNativeModuleInjectConfig);
        if (error) {
          dispatch_async(dispatch_get_main_queue(), ^{
            [weakSelf stopLoadingWithError:error];
          });
        }
      }];
      dispatch_group_leave(initModulesAndLoadSource);
    });
  });
```

__configJSExecutor标记__：再次专门处理一些JSExecutor这个RCTModuleData

1）property context懒加载，创建了一个JSContext

2）为JSContext设置了一大堆基础block回调，都是一些RN底层的回调方法


__moduleConfig标记__：把刚才所有配置moduleConfig信息汇总成一个string，包括moduleID，moduleName，moduleExport接口等等

__moduleConfigInject标记__：把刚才的moduleConfig配置信息string，通过RCTJSExecutor，在他内部的专属Thread内，注入到JS环境JSContext里，完成了配置表传给JS环境的工作

__groupDone标记__:GCD group内所有的工作都已完成，loadjs完毕，配置module完毕，配置JSExecutor完毕，可以放心的执行JS代码了

__evaluateJS标记__：通过`[_javaScriptExecutor executeApplicationScript:script sourceURL:url onComplete:]`来在JSExecutor专属的Thread内执行jsbundle代码


__addrunloop标记__：最早创建的`RCTDisplayLink`一直都只是创建完毕，但并没有运作，此时把这个displaylink绑在JSExecutor的Thread所在的runloop上，这样displaylink开始运作

__小结__：

整个RN在bridge上面，单说OC侧，各种GCD，线程，队列，displaylink，还是挺复杂的，针对各个module也都是有不同的处理，把这块梳理清楚能让我们更加清楚OC代码里面，RN的线程控制，更方便以后我们扩展编写更复杂的module模块，处理更多native的线程工作。

后面的 js call oc  oc call js 我也会以同样的方式进行梳理，让大家清楚线程上是如何运作的

PS：JS代码侧其实bridge的设计也有一套，包括所有call oc messageQueue会有个队列控制之类的，我对JS不是那么熟悉和理解，JS侧的代码我就不梳理了。


			
# ReactNative JS call OC 代码分析

既然整个RCTRootView都初始化完毕，并且执行了jsbundle文件了，整个RN就已经运作起来了，那么RN运作起来后，JS的消息通过JS代码的bridge发送出来之后，是如何被OC代码识别，分发，最重转向各个module模块的业务代码呢？我们接下来就会梳理，这个流程的代码

JS call OC 可以有很多个方法，但是所有的方法一定会走到同一个函数内，这个关键函数就是

`- (void)handleBuffer:(id)buffer batchEnded:(BOOL)batchEnded`

需要说明的事，handleBuffer一定发生在RCTJSExecutor的Thread内

__正所谓顺藤摸瓜，我可以顺着他往上摸看看都哪里会发起js2oc的通信__

- [RCTJSExecutor setUp]

可以看到这里面有很多JavaScriptCore的JSContext["xxx"]=block的用法，这个用法就是JS可以把xxx当做js里面可以识别的function，object，来直接调用，从而调用到block得意思，可以看出来`nativeFlushQueueImmediate`当js主动调用这个jsfunction的时候，就会下发一下数据，从而调用handleBuffer，可以确定的是，这个jsfunction，会在jsbunlde run起来后立刻执行一次

这个方法要特别强调一下，这是唯一个一个JS会主动调用OC的方法，其他的js调用OC，都他由OC实现传给JS一个回调，让JS调用。

[JS侧主动调用nativeFlushQueueImmediate的逻辑](http://mini.eastday.com/a/160612151604890-15.html)

- [RCTBatchBridge enqueueApplicationScript:]

可以看到这句代码只发生在执行jsbundle之后，执行之后会`[RCTJSExecutor  flushedQueue:callback]`在callback里调用handleBuffer，说明刚刚执行完jsbundle后会由OC主动发起一次flushedQueue，并且传给js一个回调，js通过这个回调，会call oc，进入handleBuffer

- [RCTBatchBridge _actuallyInvokeCallback:]
- [RCTBatchBridge _actuallyInvokeAndProcessModule:]

两个_actuallyInvoke开头的方法，用处都是OC主动发起调用js的时候，会传入一个call back block，js通过这个callback block回调，这两个方法最后都会执行`[RCTJSExecutor _executeJSCall:]`

从上面可以看出JS只有一个主动调用OC的方法，其他都是通过OC主动调用JS给予的回调

__我们还可以顺着handleBuffer往下摸看看都会如何分发JS call OC的事件__


以handleBuffer为根，我们继续用函数站代码流程表来梳理

- RCTBatchedBridge-handlebuffer
	- analyze Buffer(__analyze buffer标记__)
	- find module（__find modules标记__）
	- for 循环all calls
	- dispatch async（__dispatch async标记__）
		- [RCTBatchedBridge- handleRequestNumber:]
			- [RCTBridgeMethod invokeWithBridge:]（__invocation标记__ 这个标记会复杂点，子流程表细说） 

			
__analyze buffer标记__：js传过来的buffer其实是一串calls的数组，一次性发过来好几个消息，需要OC处理，所以会解析buffer，分别识别出每一个call的module信息

```obejctivec
  NSArray<NSNumber *> *moduleIDs = [RCTConvert NSNumberArray:requestsArray[RCTBridgeFieldRequestModuleIDs]];
  NSArray<NSNumber *> *methodIDs = [RCTConvert NSNumberArray:requestsArray[RCTBridgeFieldMethodIDs]];
  NSArray<NSArray *> *paramsArrays = [RCTConvert NSArrayArray:requestsArray[RCTBridgeFieldParams]];
```
__find modules标记__：解析了buffer之后就要查找对应的module，不仅要找到RCTModuleData，同时还要取出RCTModuleData自己专属的串行GCD queue

__dispatch async标记__：每一个module和queue都找到了就可以for循环了，去执行一段代码，尤其要注意，此处RN的处理是直接dispatch_async到系统随机某一个空闲线程，因为有模块专属queue的控制，还是可以保持不同模块内消息顺序的可控


__invocation标记__：这个标记的作用就是真真正正的去调用并且执行对应module模块的native代码了，也就是JS最终调用了OC，这个标记内部还比较复杂，里面使用了NSInvocation去运行时查找module类进行反射调用

__invocation内部子流程如下__

解释一下，JS传给OC是可以把JS的回调当做参数一并传过来的，所以后面的流程中会特别梳理一下这种回调参数是如何实现的，

- [RCTBridgeMethod-processMethodSignature]（__invocation预处理标记__）
	- argumentBlocks（__参数处理标记__）
- 循环压参（__invocation压参标记__）
- 反射执行Invocation调用oc

__invocation预处理标记__：RN会提前把即将反射调用的selector进行分析，分析有几个参数每个参数都是什么类型，每种类型是否需要包装或者转化处理。	

__参数处理标记__：argumentBlocks其实是包装或转化处理的block函数，每种参数都有自己专属的block，根据类型进行不同的包装转化策略

此处别的参数处理不细说了，单说一下JS回调的这种参数是怎么操作的

- JS回调通过bridge传过来的其实是一个数字，是js回调function的id
- 我们在开发module的时候，RN让你声明JS回调的时候是声明一个输入参数为NSArray的block
- js回调型参数的argumentBlocks的作用就是，把jsfunctionid进行记录，包装生成一个输入参数为NSArray的block，这个block会自动的调用`[RCTBridge enqueueCallback:]`在需要的时候回调JS，然后把这个block压入参数，等待传给module

这块代码各种宏嵌套，还真是挺绕的，因为宏的形式，可读性非常之差，但是读完了后还是会觉得很风骚

`[RCTBridgeMethod  processMethodSignature]`这个方法，强烈推荐

__invocation压参标记__：argumentBlocks可以理解为预处理专门准备的处理每个参数的函数，那么预处理结束后，就该循环调用argumentBlocks把每一个参数处理一下，然后压入invocation了

后面就会直接调用到你写的业务模块的代码了，业务模块通过那个callback回调也能直接calljs了


# ReactNative OC call JS EventDispatcher代码分析

我们编写module，纯源生native模块的时候，有时候会有主动要call js的需求，而不是通过js给的callback calljs

这时候就需要`RCTEventDispatcher`了，可以看到他的头文件里都是各种sendEvent，sendXXXX的封装，看一下具体实现就会发现，无论是怎么封装，最后都走到了`[RCTJSExecutor enqueueJSCall:]`，追中还是通过RCTJSExecutor，主动发起调用了JS

他有两种方式

- 直接立刻发送消息主动callJS
- 把消息add进一个Event队列，然后通过flushEventsQueue一次性主动callJS


# ReactNative Displaylink 代码分析

之前我们提到过一个`RCTDisplayLink`，没错他被添加到RCTJSExecutor的Thread所在的runloop之上，以渲染频率触发执行代码，执行frameupDate

`[RCTDisplaylink _jsThreadUpdate]`

在这个方法里，会拉取所有的需要执行frameUpdate的module，在module所在的队列里面dispatch_async执行didUpdateFrame方法

在各自模块的didUpdateFrame方法内，会有自己的业务逻辑，以DisplayLink的频率，主动call js

比如：RCTTimer模块


# RCTJSExecutor

最后在强调下JSBridge这个管道的线程控制的情况

刚才提到的无论是OC Call JS还是JS call OC，都只是在梳理代码流程，让你清楚，所有JS/OC之间的通信，都是通过RCTJSExecutor，都是在RCTJSExecutor内部所在的Thread里面进行

如果发起调用方OC，并不是在JSThread执行，RCTJSExecutor就会把代码perform到JSThread去执行

发起调用方是JS的话，所有JS都是在JSThread执行，所以handleBuffer也是在JSThread执行，只是在最终分发给各个module的时候，才进行了async+queue的控制分发。


