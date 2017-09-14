---
title: ReactNative iOS源码解析（二）
date: 2016-07-02 14:39:37
categories: 技术感悟
tags: [Hybrid]
---

相关系列文章

- [ReactNative iOS源码解析（一）](http://awhisper.github.io/2016/06/24/ReactNative%E6%B5%81%E7%A8%8B%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90/)
- [ReactNative iOS源码解析（二）](http://awhisper.github.io/2016/07/02/ReactNative%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%902/)
- [Talk about ReactNative Image Component](http://awhisper.github.io/2016/07/17/Talk-about-ReactNative-Image-Component/)

上一篇了解了 ReactNative是如何初始化一整套JS/OC通信机制，是如何相互通信的。通篇在讲JS/OC的通信的源代码流程，解释了为什么JS可以调用OC，为什么OC可以调用JS，这相互之间的通信，是如何通过代码进行控制与管理的

但是上一篇讲的内容有一点太抽象了，全都是底层通信，我们依然不知道：

__上层的业务module是如何一步步用js搭建出一款app的？__

于是就进入了今天的环节，ReactNative中的Native，具体讲讲各种各样的Module是如何工作的，官方写好的Module以及我们可以自行扩展的Module

这里面分为2种module

- 源生API模块 - RCTModuleData 

（说明，官方文档把这个起名就叫源生模块，英文Module，我这里先中二的起名叫APIModule，为了和另一个区别起名一下，瞎起的名字，大家凑合一下）

- 源生UI组件模块 - RCTComponentData

（说明，官方文档把这个起名就叫源生UI组件，英文Component，我这里先中二的起名叫UIModule，为了和另一个区别起名，瞎起的名字，大家凑合一下）

API模块阐述了JS是如何调用native各个模块的逻辑

UI组件阐述了JS是如何创建出native的UI界面

本文在源码分析部分，对照前文的代码流程可以加深理解

<!--more-->

# 源生API型模块

什么叫APIModule？

APIModule是一种面向过程式的模块调用

JS只需要用一个模块名，一个API名，就能通过bridge找到对应的native的方法进行调用，JS Call OC Method

这个过程就是一个函数调用而已，不存在操作某个实例对象，只是传递参数，操作参数，处理逻辑，返回数值 OC Call JS（通过前文知道，bridge都是异步的，通过callback block返回）

举个例子好了，对于系统alert弹框，分享微信朋友圈，这种功能是最适合使用APIModule的


## 如何使用APIModule呢？

其实[ReactNative原生模块 中文文档](http://reactnative.cn/docs/0.26/native-modules-ios.html#content)上面详细介绍了如何使用APIModule，因为一会我们还要详细看源码，我这里还会再简单复数一遍。

假如我们想让RN拥有，iOS系统弹框这一个功能：

第一步，先写一个APIModule对象，遵从RCTBridgeModule协议

```objectivec
#import "RCTBridgeModule.h"

@interface VKAlertModule : NSObject<RCTBridgeModule>

@end
```
第二步，在实现文件里写一个宏`RCT_EXPORT_MODULE()`

第三步，实现这个Module能为RN提供的API。

如果我打算写这样一个函数

`-(void)nativeAlert:(NSString *)content withButton:(NSString *)name`

让RN去调用，那么按着文档我需要去掉-(void)后的所有内容，写进一个宏里面`RCT_EXPORT_METHOD(xxx)`

整个代码就会是这样

```objectivec
@implementation VKAlertModule

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(nativeAlert:(NSString *)content withButton:(NSString *)name){
    
   // Use UIAlertView create a alert
}
@end
```

一个最简单的APIModule就写好了，在JS里面想要使用这个APIModule，只需要这样写就OK了

```javascript
import { NativeModules } from 'react-native';
var VKAlertModule = VKAlertModule;

//然后在需要调用的地方
VKAlertModule.nativeAlert('这是一个系统弹框','确定')
```

可以看到，在JS中模块名就是我们创建的类名，function名就是我们写的OC函数中，第一个参数以前的那一部分（只保留第一个参数前的nativeAlert为名字，后面的withButton什么的都不算了）

我们之前在源码中提到，JS是可以把回调传回来的，那我们就改两笔，加入回调的形式

```objectivec
//OC侧代码
@implementation VKAlertModule

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(nativeAlert:(NSString *)content withButton:(NSString *)name callback:(RCTResponseSenderBlock)callback）{
   // Use UIAlertView create a alert
   // show alert
   // 持有 block
   // when alert button click ok
   // use block callback
}
@end

//JS侧代码
import { NativeModules } from 'react-native';
var VKAlertModule = VKAlertModule;

//然后在需要调用的地方
VKAlertModule.nativeAlert('这是一个系统弹框','确定',function(){
	console.log('clickok');
})

```
此时我们虽然不知道是怎么回事，只是照着文档做了，但看起来，JS已经完全能任意的调用APIModule提供的native能力了

使用RN写一个系统alert要做这么多工作么？当然不是，facebook已经帮你写好了一个非常大而全的Alert的APIModule，`RCTAlertManager`，所以你完全可以按着上面的思路去打开RN源码里面的RCTAlertManager类，去看看和学习如何写一个功能强大的APIModule

系统alert这种通用型的需求，facebook帮你写好了，但是如果是分享微信微博朋友圈之类的，facebook当然就不可能把这么独特的中国化的需求提前给你做好，但是不用慌，相信你也能自己写出来一样强大的shareManager-APIModule

## APIModule的源码是如何运作的呢？

__知其然知其所以然__

我们只清楚了，如何按着文档写一个APIModule，如何直接让JS去使用module，但为什么会这样，这里面代码是怎么运作的，完全是一头雾水，那么就深入源码，看看这几个宏是怎么样能产生这样神奇的功效的


__RCT_EXPORT_MODULE() 注册APIModule宏__

这是一个宏套函数的过程，完全展开一下可以看到

```objectivec
//宏展开
RCT_EXTERN void RCTRegisterModule(Class); \
+ (NSString *)moduleName { return @#js_name; } \
+ (void)load { RCTRegisterModule(self); }
//宏里面调用的函数
void RCTRegisterModule(Class moduleClass)
{
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    RCTModuleClasses = [NSMutableArray new];
  });

  RCTAssert([moduleClass conformsToProtocol:@protocol(RCTBridgeModule)],
            @"%@ does not conform to the RCTBridgeModule protocol",
            moduleClass);

  // Register module
  [RCTModuleClasses addObject:moduleClass];
}
```

可以看到写了这个宏就自动帮你写好了2个method实现

一个是自动写好了`+moduleName`的实现，返回了`@#js_name`，`@#`的意思是自动把宏的参数js_name转成字符，但我们刚才的样例里，都是直接不写参数的注册宏，所以说如果注册的时候不写参数，`+moduleName`会返回空，此处先不细说，后面会提到

另一个是自动写了`+load`的实现，+load大家都知道，app一运行就会执行一次，所有的类都会执行一次，所以在app运行的时候，你写的这个module类就会自动的执行了`RCTRegisterModule`这个函数，这个函数干了些什么事情呢？首先在内存中创建了一个单例RCTModuleClasses表（上一篇中提到过），然后判断你写的类是否遵从RCTBridgeModule协议（这也是为什么要求你在写module定义的时候一定要组从协议），然后把你写的moduleClass放入内从的单例RCTModuleClasses表中

__RCT_EXPORT_METHOD() 导出方法宏__ 

这又是一个宏套宏，看着会有一点晦涩

```objectivec
//最外层宏
#define RCT_EXPORT_METHOD(method) \
  RCT_REMAP_METHOD(, method)
  
//内一层
#define RCT_REMAP_METHOD(js_name, method) \
  RCT_EXTERN_REMAP_METHOD(js_name, method) \
  - (void)method

//内二层
#define RCT_EXTERN_REMAP_METHOD(js_name, method) \
  + (NSArray<NSString *> *)RCT_CONCAT(__rct_export__, \
    RCT_CONCAT(js_name, RCT_CONCAT(__LINE__, __COUNTER__))) { \
    return @[@#js_name, @#method]; \
  }
```

可以看一下我们把`-(void)nativeAlert:(NSString *)content withButton:(NSString *)name`这么长一串剪裁掉`-(void)`都扔进最外层宏当做参数了，最外层基本上没处理什么，直接调用内一层宏，第一个参数传空，第二个参数透传

看一下内一层宏干了啥，内一层宏除了2个参数透传给内二层宏之外，还重新补全了`-(void)`，恢复了一个完整OC语法的函数定义，这样才使得RCT_EXPORT_METHOD(xxx)这样写一个函数编译器不会报错

最重要的内二层我们看看都做了啥，RCT_CONCAT又是一个宏，这个宏我就不展开了，他基本上就是实现了一个宏的拼接，最先把`__LINE__`与`__COUNTER__`进行拼接，这是两个C语言宏，分别代表着行号与一个内置计数器，我没有详细去跟这两个数字的具体表现，大概意思就是为每一个RCT_EXPORT_METHOD生成一个唯一识别的数字tag在将这个tag与js_name拼接（此处其实js_name为空字符串），然后在前面拼接上一个`__rct_export__`，用宏生成了一个返回NSArray的方法

说这有点绕举个例子就好了，假设我们写`RCT_EXPORT_METHOD(nativeAlert:xxx)`的时候，`__LINE__`与`__COUNTER__`组合起来的数字tag如果是123456，那么这个内二层宏还会自动生成一个这样的函数

```objectivec
+ (NSArray<NSString *> *)__rct_export__123456{ 
    return @[@"", @"nativeAlert:xxx"]; 
  }
```

换句话说，一行RCT_EXPORT_METHOD(xxxx)，等于生成了2个函数的实现。

- `-(void)nativeAlert:(NSString *)content withButton:(NSString *)name`
- `+(NSArray<NSString *> *)__rct_export__123456`


__我们native注册的这些modules表，导出的这些自动生成的方法，JS是怎么知道的？怎么调用的？__

这就紧密联系前一篇文章提到的RCTRootView的初始化环节中的几个重要标记了

- InitModule标记
- moduleConfig标记
- moduleConfigInject标记
- evaluateJS标记

__InitModule的时候__,就会从单例RCTModuleClasses表中拿出所有的APIModule的class对象，循环去创建RCTModuleData实例（上文提到过RCTModuleData不是APIModule，而是包装了一下APIModule，RCTModuleData.instance才是APIModule），并且一一保存在RCTBatchBridge对象的三个表中

- moduleClassesByID数组表，枚举APIModule的class，添加进入数组
- moduleDataByID数组表，枚举由APIModule生成的RCTModuleData对象，添加进入数组
- moduleDataByName字典表，以`+methodName`方法的返回值为key，枚举由APIModule生成的RCTModuleData对象，添加进入字典
（刚才不是说注册宏我们从来都不填参数，导致+methodName返回为空字符串么，这里通过RCTBridgeModuleNameForClass方法，如果是空字符串会自动返回类名字符串）

__moduleConfig的时候__，RCTBatchBridge会循环moduleDataByID数组表，把每一个APIModule的name都写进数组，然后写进key为remoteModuleConfig的字典，最后序列化成JS，形成类似这样的json，所有的RCT开头的都是facebook官方写好的APIModule

```json
{"remoteModuleConfig":[["VKAlertModule"],
["RCTFileRequestHandler"],
["RCTDataRequestHandler"],
...]}
```

__moduleConfigInject的时候__，会通过RCTJSExecutor，把这个json注入JSContext，在JS的global全局变量里面加入一个`__fbBatchedBridgeConfig`对象，是一个数组，里面记录着所有APIModule的name，这样相当于告知了JS，OC这边有多少个APIModule分别都叫做什么，可以被JS调用，但此时还没有告诉JS，每一个APIModule，都可以使用哪些方法

上一篇还提到了一个JS Call OC的方案，`[RCTJSExecutor setUp]`中设置了一大堆`JSContext[“xxx”]=block`的方法，这里面有一个名为`nativeRequireModuleConfig`的JSContext的block注入

__当evaluateJS标记的时候__,JS就会主动call`nativeRequireModuleConfig`这个方法，从而调用了这个blck，从名字可以猜出来，前面我们把所有的APIModule的名字列表发给了JS，这下JS开始用名字，找OC一一确认每一个APIModule里面都有啥具体信息，具体Method方法。

通过名字，block会找到对应的RCTModuleData，从而调用RCTModuleData-Config方法

- 会调用RCTModuleData的methods方法拿到一个所有方法的数组
	- 运行时获取RCTModuleData的APIModule类的所有MethodList
	- 循环找到以`__rct_export__`开头的方法（上文提到过）
		- 从这个方法中得到字符串`nativeAlert:(NSString *)content xxxx`
		- 截取：前面的字符串`nativeAlert`作为JS简写方法名
		- 生成RCTModuleMethod
		- 保存在RCTModuleData内
	- 生成JS简写方法名数组
- 有类名+类的简写方法名数组，生成APIModule的info信息，转换成json，通过block返回给JS

`["VKAlertModule",["nativeAlert"]]`

这样JS就完全知晓，Native所有APIModule的名字，每个APIModule下所有的Method的名字了

__JS Call NA的时候__

除了主动的block式callNA以外，前一篇文章提到了`nativeFlushQueueImmediate`这个JS主动call OC的方法，通过[nativeFlushQueueImmediate的逻辑](http://mini.eastday.com/a/160612151604890-15.html)可以看出，当JS每次想主动调用OC的时候，会把所有JS消息都扔到JS的messagequeue的队列里，然后每个5毫秒，会触发`nativeFlushQueueImmediate`的block，让OC主动去发起一次`flushedQueue `来把这段时间内所有的JS消息都拉去过来，这就走到了前一篇文章提到过的

`- (void)handleBuffer:(id)buffer batchEnded:(BOOL)batchEnded`

再往后就是上文介绍过的 __handleBuffer分发逻辑__

>- RCTBatchedBridge-handlebuffer
	- analyze Buffer(__analyze buffer标记__)
	- find module（__find modules标记__）
	- for 循环all calls
	- dispatch async（__dispatch async标记__）
		- [RCTBatchedBridge- handleRequestNumber:]
			- [RCTBridgeMethod invokeWithBridge:]（__invocation标记__ 这个标记会复杂点，子流程表细说） 

基本上就是，找到对应的RCTModuleData，找到对应的APIModule，找到对应的RCTModuleMethod，执行invocation，完成了调用


## APIModule小结

以上就是一整个JS Call Native APIModule的源码流程交互图，那种API型的功能，比如系统弹框，比如社交分享，都是通过这样的运作流程，才能让React在JS环境中自由的调用native源生API模块

__这里提一个遇到的坑__

当我们写RCT_EXPORT_METHOD()宏的时候，写导出给JS的函数的时候，如果参数中含有successcallback，errorcallback，切记把这种callback block放在最后，千万不要，把其他类型的参数放在block之后。

原因是在JS代码一侧有last arg，second arg的判断，当callbackblock 不是以倒数第二第一的位置出现的时候，JS会报exception
```
//正确的做法
RCT_EXPORT_METHOD(nativeAlert:(NSString *)content withButton:(NSString *)name callback:(RCTResponseSenderBlock)callback)）

//错误的做法
RCT_EXPORT_METHOD(nativeAlert:(NSString *)content withCallback:(RCTResponseSenderBlock)callback) withButton:(NSString *)name）
```


能让React在JS环境中自由的调用native源生API模块，只是实现一个app很小的一部分，如果能React在JS环境中自由的创建Native源生的UI界面，自由的修改，变化每一个UI界面的展现效果，才是实现一个app最重要的一环，于是我们进入了下一部分
源生UI组件模块


# 源生UI组件模块


__什么叫UIModule？__

UIModule是一种面向对象式的UI组件调用

每一个React的Component都是一个独立的UI组件，经过React的flexbox排版计算，有自己的大小，形状，样式。

每一个被RN渲染出来的RCTView都是继承自UIView的纯源生UI组件，他是根据React的Component的计算结果（大小，形状，样式）从而创建出来的。

RCTView与Component是一一对应的

当一个JS Component对象想要创建/改变自己的颜色，大小，样式的时候，就需要通过brdige找到自己所对应的那个RCTView，传递过去相应的数据参数，对RCTView生效传来的数据 JS CALL OC

当RCTView发生了触摸等源生事件响应的时候，通过brdige找到自己所对应的JS Component，把触摸的事件和数据参数传过去，让React.JS根据数据进行JS Component的重新布局或者界面响应

## 我把UIModule比作iOS开发中的UIKit的子类扩展

UIModule 其实由2部分组成，RCTView与RCTViewManager，就好像v与c的关系一样，每个UIModule都会有一个RCTComponentData与之配合（就好像APIModule与RCTModuleData一样）

- UIView 对应RCTView（继承UIView）与RCTViewManager
- UIImage 对应RCTImageView（继承UIImageView）与RCTImageViewManager
- UILabel 对应RCTTextView（继承RCTView）与RCTTextViewManager
- UIScrolView 对应RCTScrolView（继承RCTView）与RCTScrolViewManager

正式因为每一个JS的Component都是与一个UIModule建立了一一对应的关系，所以当发生渲染的时候，JS Component的渲染信息，就会通过brdige，生成继承自纯源生iOS UIKit的UIModule

每一个JS的Component与之直接配合的都是RCTViewManager，这是一个继承自NSObject遵从RCTBridgeModule协议的类，如果你打算自己写一个自定义的UIModule，也是需要继承自RCTViewManager，他只是一个控制器的角色，因此RCTViewManager还需要决定他采用什么方案进行绘制，所以在RCTViewManager可以选择使用不同的UIView来实现真正的视图角色。


## 如何使用UIModule呢？
老规矩，[ReactNative原生UI组件 中文文档](http://reactnative.cn/docs/0.26/native-component-ios.html#content)上面详细介绍了如何使用UIModule，因为一会我们还要详细看源码，我这里还会再简单复数一遍。由于UIModule要处理的东西，官方文档源码都比较详细了，所以我不会太细致的介绍。

__自定义一个UIModule组件__

- 创建RCTViewManager子类
	- RCT_EXPORT_MODULE()注册宏
	- `-(UIView *)view` 指定视图真正实现
	- requireNativeComponent导入JS源生组件
- 创建属性
	- oc 属性导出宏（普通属性，复杂属性）
	- JS Component封装 属性propTypes声明
- 创建事件
	- oc定义eventblock 属性
	- oc call eventblock
	- js component 同名function 响应
- 创建样式常亮（不是很常用）
	- oc的constantsToExport 方法返回字典
	- JS通过UIManager.XXUIModule.Constants 得到字典

上面全都是按着文档的流程去操作，你就可以在JS中以React.JS的方式去构建一个纯源生native组件了

```javascript
...
  render: function() {
    return (
      <View style={this.props.style}>
        <XXUIModule
          ...
        />
      </View>
    );
  }
});
```

## UIModule源码是如何运作的

__知其然知其所以然__

我们只清楚了，如何按着文档写一个UIModule，如何直接让JS去使用这个UIModule对应的JS Component，但为什么会这样，这里面代码是怎么运作的，依然是一头雾水，那么就深入源码，看看这几个宏，这几个native oc方法是怎么运作的

__RCT_EXPORT_MODULE() 注册Module宏__

跟APIModule注册是同一个宏，都是在一个单例RCTModuleClasses表中把xxRCTViewManager添加进去，不做多解释

__`-(UIView *)view`方法__

`RCTComponentData-createViewWithTag`这个方法会调用RCTViewManager的view方法，前边讲过RCTComponentData的角色

而`RCTComponentData-createViewWithTag`这个方法会被一个`RCTUIManager`调用，当真正需要渲染的时候，RCTUIManager会通过这个方式决定，到底应该alloc，init出一个什么样的UIView（RCTView？MKMapView？UIImageView？）

这里提到了一个关键词`RCTUIManager`，先按下不表，后面我们会详细说明

__requireNativeComponent为React.JS导入源生component__

这块就得看JS的源码了，就是下面这个文件

`node_modules/react-native/Libiraries/ReactIOS/requireNativeComponent.js`

我对JS没那么深的了解，大致看了下这里一直在操作一个叫做`UIManager`，从UIManager按名字取出ViewConfig的配置，然后配置了一大堆内容，那我们就打开这个文件

`node_modules/react-native/Libiraries/Utilities/UIManager.js`

看到了这样一行代码`var UIManager = require('NativeModules').UIManager;`眼熟么？没错，这就是APIModule在JS文件中使用的时候，需要的require，换句话说，这个UIManager操作的就是`RCTUIManager`，RCTUIManager先按下不表，后面我们会详细说明


__OC属性导出宏__

- RCT_EXPORT_VIEW_PROPERTY(name,type)
- RCT_CUSTOM_VIEW_PROPERTY(name,type,class)

```objectivec
//常规导出宏
#define RCT_EXPORT_VIEW_PROPERTY(name, type) \
+ (NSArray<NSString *> *)propConfig_##name { return @[@#type]; }
//自定义导出内置宏
#define RCT_REMAP_VIEW_PROPERTY(name, keyPath, type) \
+ (NSArray<NSString *> *)propConfig_##name { return @[@#type, @#keyPath]; }
//自定义导出宏
#define RCT_CUSTOM_VIEW_PROPERTY(name, type, viewClass) \
RCT_REMAP_VIEW_PROPERTY(name, __custom__, type)         \
- (void)set_##name:(id)json forView:(viewClass *)view withDefaultView:(viewClass *)defaultView
```
看常规导出宏，##在宏里面的用法就是字符串拼接，@#在宏里面的用法就是参数转字符，换句话说`RCT_EXPORT_VIEW_PROPERTY(isHidden, BOOL)`的作用就是生成了一个方法

```objectivec
+ (NSArray<NSString *> *)propConfig_isHidden { 
 	return @[@"BOOL"]; 
}
```
propConfig_isHidden这个函数被谁调用了呢？RCTComponentData的`setProps:forView:`方法，这个方法被谁调用了呢？RCTUIManger，嗯，一会细说

看自定义导出宏，这个宏被用来导出一些非常规类型的属性，一些自定义的结构体，对象类型的属性，他首先调用了自定义导出内置宏，着红看起来和刚才的宏差不多，只不过返回的字符串数组多了一个值，他还又单独创建了一个新函数，举例说明，如果我们写了一行`RCT_CUSTOM_VIEW_PROPERTY(region, MKCoordinateRegion, RCTMap)`(官方文档的例子)，就相当于自动添加了2个方法，第一个方法已经在宏里实现了，第二个方法写完宏后自动生成了声明，但实现需要使用者跟着马上补上（如同RCT_EXPORT_METHOD）

```objectivec
+ (NSArray<NSString *> *)propConfig_region { 
 	return @[@"MKCoordinateRegion",@"__custom__"];
}

- (void)set_region:(id)json forView:(RCTMap *)view withDefaultView:(RCTMap *)defaultView
```

第一个方法方法和常规属性导出宏作用一样，都会被RCTComponentData，RCTUIManger调用，详细内容后续说明

第二个方法在哪调用呢？调用的位置紧紧挨着第一个方法执行，在第一个方法propConfig_xx执行过后，会判断是否还有@"__custom__"标记，如果含有就会调用第二个方法，详细内容还是属于RCTComponentData，RCTUIManger，后续会说明

至于JS Component封装，属性propTypes声明，这就属于React.JS的特性了，反正最后还是通过JS的UIManager去操作Native

__OC用属性导出宏创建事件__

一个UIView必须具备一个RCTBubblingEventBlock型的block属性，才可以被当做事件导出

这个block属性导出和常规属性导出，都是同一个宏`RCT_EXPORT_VIEW_PROPERTY`只不过type必须是RCTBubblingEventBlock，宏的工作流程是一致的，区别只是RCTComponentData，RCTUIManger在处理上的不同而已，后续说明

__创建常量__

这个constantsToExport方法会返回一个字典，在RCTModuleData的gatherConstants函数中被调用，而这个函数会被RCTModuleData的config方法调用

这个在APIModule的时候提到过，在injectModuleConfig的时候，获取config，转成json，最后会注入js，成为js可以获取到得常量

## RCTUIManager与RCTComponentData
终于来说`RCTUIManager`与`RCTComponentData`，上面提到了无数次，这两个东西加上`UIManager.js`构成了整个RN可以通过js创建native界面的核心

__首先强调一点，RCTUIManager是一个APIModule，RCTUIManager是一个APIModule，RCTUIManager是一个APIModule，重要的事情说三遍__


这个东西就有意思了，这是一个APIModule，因此就像其他所有APIModule一样，他会被RCTModuleData管理着，最重被RCTBatchBrdige持有着，时刻等待着JS`UIManager.js`的调用

但是他就像RCTBridge一样内部也维护了不止一个字典，管理着所有的UIModule，以及所有的View，他在初始化的时候`RCTUIManager-setBridge`

- 会循环所有的RCTBatchBrdige已登记在册的Module，循环寻找其中继承自RCTViewModule的对象
- 录入`_componentDataByName`这个内部字典表，以ModuleName为Key
- 此时还创建了一些其他的表包括以下等等，这里先不提，后面说道了会再解释
	- _viewRegistry字典
	- _rootViewTags数组
	- _pendingUIBlocks字典

让我们看看，当ReactNative开始创建界面的时候，都会发生什么事情？当进过上一篇提到的__evaluateJS标记__之后，并不会立刻开始绘制RN界面，为啥？输入了JSBundle以后，整个JS环境就已经完全配置完毕，ready就位了，但是并不会真正开始绘制界面，绘制界面会通过开发者，自行创建RCTRootView，并且执行initWithBridge后开始（这里我并没有说initWithBundleURL，二者流程是一模一样的，但是initWithBundleURL与initWithBridge的区别我在下一环节会特别说明）


- RCTRootView-initWithBridge
	- (如果此时JS环境已经搭建完毕) RCTRootView-bundleFinishedLoading
		- RCTContentRootView-initWithFrame:bridge:reactTag:
			- reactTag getter
			  - RCTUIManager-allocateRootTag
			- RCTContentRootView-registerRootView
		- RCTContentRootView-addsubview
		- RCTRootView-runApplication
			- RCTBridge-enqueueJSCall
	
因为不是很长，我就不安着这标记那标记的解释了，顺着说一下。

首先创建RCTRootView的时候如果bridge已经搭建完毕，JS环境已经就位，那么就会直接出发`bundleFinishedLoading`，如果JS环境没有就位，那么就会等待JS环境运行完毕Ready后，通过通知触发`bundleFinishedLoading`

在开始正式创建RCTRootView的时候会创建一个subview`RCTContentRootView`这个东西创建的时候需要一个reactTag，这个tag是一个很关键的东西，此时通过`allocateRootTag`方法创建了root得reactTag，规则是从1开始，每次创建一个RootView实例都会累加10，1，11，21，31，以此类推。创建完RCTContentRootView后还要去UIManager用这个reactTag注册View，也就是以Tag为Key，登记进入_viewRegistry字典表

然后将RCTContentRootView添加到RCTRootView上面，执行了runApplication，这里面真正的意义是执行了一行JS代码，告诉JS你要开始绘制这个参数params的界面了！

`AppRegistry.runApplication(params)`

再往后就是React.JS的工作了，React.JS会着手把JS中的页面进行计算，排版，生成对应的JS Component，准备组织绘制界面了，包含着无数个JS Component的相互嵌套。最重通过`UIManager.js`这个APIModule的JS接口，开始call oc去创建界面

__RCTUIManager__都有哪些API提供给了JS呢？

- createView
- updateView
- setChildren
- removeRootView
- manageChildren
- findSubviewIn
- measure
- dispatchViewManagerCommand

我们可以想象一下，当React.JS开始工作的时候，JS把所有布局好的Component，一层套一层的JS界面数据，通过UIManager，调用createView，updateView，setChildren等接口API，来创建一个个纯iOS native的UIKit的界面。

有兴趣的话，完全可以在`runApplication`，`createView`，`updateView`，`setChildren`等处打上断点，看看是不是像我说的一样。

- createView的作用是创建一个个的UIView，RCTView，各种nativeView，并且把传过来的JS的属性参数，一一赋值给nativeView
- updateView的作用是，当JSComponent的布局信息，界面样子发生变化，JS来通知nativeView来更新对应的属性变化，样子变化
- setChildren的作用是，告诉OC，那个tag的View是另一个tag的view的子view，需要执行addsubview，insertsubview等

这样一来，基本上就完成了React.JS创建一个纯native界面的过程，但我们还是具体以createView举例，深入分析一下这里面的源码，这里面有很多我们在前文提到的未解之谜（各种RCTComponentData去调用ViewManager的过程）

- RCTUIManager-createView
	- js传来viewName，通过初始化的_componentDataByName表获取RCTComponentData
	- dispatch_async(mainqueue)从JS通信线程抛到主线程创建UI
		- js传来了ReactTag，通过RCTComponentData-createViewWithTag，创建界面
		- js传来了属性props，通过RCTComponentData-setProps:forView:进行属性赋值
			- （只运行一次）循环每一个属性，创建属性赋值block函数
				- 通过`propConfig`拼接props的名字来确认，此property是否已经使用EXPORT宏注册过属性（上面提到过）
				- 如果此属性已经注册，通过运行时invocation的方式，生成了一个block函数，每次调用这个block，就会以运行时的方式，setter给对应属性
			- 通过属性赋值block函数，直接输入参数赋值属性
		- _viewRegistry字典表里讲创建的View录入以reactTag为Key

看到这个过程没有，整个过程有一个最核心的点ReactTag，为什么说这个tag核心呢？因为我们都知道APIModule的特点就是面向过程的，他是不存在对象self这个概念的，所以必须通过这个tag，在JS里面有一个所有JSComponent的tag表，在OC里面依然也有这么一个所有nativeView的Tag表`_viewRegistry`，只有通过唯一指定的tag，这样APIModule-RCTUIManager，才能知道到底应该操作哪一个nativeView

我们顺带来看一看JS侧的代码吧~看看JS那边是怎么操作和读取这个tag的吧~比较简便的方式是，查JS源码代码，看看各处都是如何调用`UIManager.js`的，我对JS没那么熟，不细说了，怕说错，大家可以自己看看。

这里要介绍一下JS那边tag是如何管理的，有个`ReactNativeTagHandles.js`的JS模块，require了ReactNativeTagHandles以后在Chrome内存中可以看看ReactNativeTagHandles这个对象都有什么内容，你会发现，它内部存着一大堆的表格

- tagToRootNodeID
- rootNodeIDToTag

你会发现他里面存着这样的东西
```
rootNodeIDToTag:Object
.r[1]{TOP_LEVEL}:1
.r[1]{TOP_LEVEL}[0]:2
.r[1]{TOP_LEVEL}[0].1:27
.r[1]{TOP_LEVEL}[0].$1:3
.r[1]{TOP_LEVEL}[0].$1.0:4
.r[1]{TOP_LEVEL}[0].$1.0.0:5
...
```

这里面不仅保存着tag信息，还保存着相当多的层级信息，还有其他信息，简单的发现最后一个数字大概代表着reactTag，r[n]中的那个n代表着，component所在的rootView的tag

因为这样的内容肯定不方便读写操作，所以ReactNativeTagHandles还提供了很多方法可以用

- getNativeTopRootIDFromNodeID()
- reactTagIsNativeTopRootID()
- balabalabal好多函数

我JS不是很熟悉，这部分就细细解读了


## 由APIModule与UIModule引发的半RN半源生开发的坑

这里就简单的说一下，我们因为业务原因，注定不可能以单一RCTRootView去实现整个APP功能，注定了大部分保留现有native功能，个别动态性较强的新功能采用ReactNative去开发

所以我们采用的是多RCTRootView得方式，什么意思呢，创建一个RNViewController类，这个类内部有一个RCTRootView当做界面，但是整个RNViewController被当做其他natve的UIViewControler一样，去push，去present，去pop，并没有使用ReactNative里面的navigator组件

既然选择了这种模式就要注意一个问题，facebook其实也在源码的注释中强调，如果你还有多个RCTRootView，推荐让所有的RCTRootView共享同一个RCTBridge，毕竟上一篇文章我们就讲了，整个RCTBridge的初始化流程还是相当的复杂，挺耗性能的，既然是一个JS环境，干脆所有的rootview公用同一个JS环境，也就是JSBridge

这就引发了我前面提到过的，RCTRootView创建的时候，跟常规开发文档demo都不同的方式initWithBridge，首先我选择在app启动的时候，就创建初始化整个JS环境，JSBridge，（上一篇分析过，这里面有很多异步处理，不用担心卡主线程UI），等到用户要点击弹出RN页面的时候，再去构建RCTRootView，使用initWithBridge的方式。

常规的开发文档demo都选择initWithBundleURL的方式，这个方法其实就是，把initJSBridge，与initRootView打包处理了，很适合整个app都是reactnative的开发模式，但是我们就不适用了

__从自定义的APIModule中JS call OC，OC如何知道这个JS Call来自哪个RootView__

我就碰到了这样的一个坑，发现坑了后，读了RCTUIManager的源码才按着UIManager的思路解决了问题，没错就是reactTag，当你希望JS通过APIModule调用na的时候，在JS调用前先找到自己component所在的rootViewTag，把这个tag随着API的参数一起发过来，然后直接通过RCTBridge.uimanager的方法获取RCTUIManager，从而查找整个`_viewRegistry[tag]`表，最终快速定位到，JSCall来自哪个RootView





相关链接：[ReactNative iOS源码解析（一）](http://awhisper.github.io/2016/06/24/ReactNative%E6%B5%81%E7%A8%8B%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90/)
