---
title: UIWebView代码注入时机与姿势
date: 2017-09-09 13:06:27
categories: 技术感悟
tags: [Hybrid,UIWebView,web注入]
---

>一个奇怪的业务场景，引发的胡乱思考
>
>问题其实不难解决，只是顺着这个问题，发散出了一些有意思的东西
>
>本文旨在讨论UIWebView，WKWebView有自己的机制，不用这么费劲

我们的业务最大的最重要的流量还是在PC与WAP，也就是说主要业务还是以Web的形式进行开发的，WAP上很多活动/页面/功能，他们不是由APP的H5团队主导开发的，也不在APP整体的规划功能内，但经常会以所谓低成本的形式接入APP尝试，快速的也在APP里进行传播。（后续验证可行和有效后，也会纳入APP的功能规划里，以最流畅的体验进行呈现）

但这样会有一些问题，纯为WAP开发的页面，直接扔到APP的WebView里表现并不好

WAP的团队开发出来的界面一般长这样
![15049394419512](http://ouz34cilp.bkt.clouddn.com/wenkuwaphead.jpg)



如果这样的页面不做任何处理直接在APP中`低成本接入`会变成这样

![15049394419512](http://ouz34cilp.bkt.clouddn.com/appwaphead.jpg)


问题就在于APP是有自己的NavigationBar的，而WAP的页面一般都为浏览器而生，浏览器没有自己的导航条于是WAP的团队很自然都会在WAP页面里开发出一个导航条，如果这个页面不做任何针对APP的处理，直接放入APP的WebView中，就会出现这样丑陋的双导航条，一个是native App自己的，一个是WAP网页自己画的

>这是一个非常常见的场景
>
>想要实现也非常简单
>
>WAP识别APP的UA，进行定制化的开发就好了
>
>为什么说他奇怪？

团队不同，业务场景不同，也面临不一样的问题，对于我们来说，这个问题不在于如何实现，而在于如何做到让WAP开发最省事。因为背景交代过了，WAP的前端团队和APP完全不是一拨人，如果能有什么办法让WAP前端团队在开发工作中尽量的无感知，尽量的少操作，不需要WAP团队在开发的时候人工的判断UA，选择性渲染，于是蛋疼的问题来了

- 直接让WAP开发人员定制开发
    - 后端渲染的时候判断UA
    - 前端模板隐藏UI
    
>现有老的开发模式就是这样，每次都是人工适配，纯体力活，有时候项目紧急WAP团队就会忘了，上线的时候一发现，咦？在App里好丑啊，虽然改动很小，但一块后端判定UA，一块前端模板选择渲染，代码分散在几处，改起来很麻烦
>
>单纯是Bar的话不是问题，写进WAP基类就行，问题是类似的场景看业务功能，有时候不止是Bar，会有定制化的东西，在APP里表现，不能和WAP一样

- WAP的编译框架支持
    - 这确实是可行的，并且是很好的解决方案之一
    - 厂里的前端使用的是FIS的编译打包框架，支持一定的插件扩展，可以在前端代码编译环节，就自动加入UA判断，对特定的UI，进行有规律的渲染控制
    
>这个太底层了，对每天几千万UV的WAP来说，进行这么大的改动，风险高，收益低（毕竟这个界面适配APP只是搂草打兔子捎带手）有点难推动，后续确实可以尝试一下

- WAP的JS插件支持
    - 基础模板引入JS脚本
    - 用JS脚本在client里判断UA
    - 提取特定Dom
    - 隐藏Dom

>最大的问题在于，JS在client里执行的时机，JS执行的时候，这个Dom已经被渲染出来了，当你判断UA，要移除的时候，画面那个bar会闪一下，整体效果是，整个页面带着bar加载出来了，但是会突然闪一下bar消失

- App在WebView里注入CSS
    - 让WAP只需要对需要隐藏的Dom做个标记比如`XXWAPBAR`（WAP只用写几个字母）
    - 在WAP浏览器里，无感知，完全不需要定制化开发
    - 在App WebView加载网页的时候，注入额外的CSS，将含有`XXWAPBAR`标记的Dom隐藏

>看起来靠谱，看起来是一种WAP开发人员几乎不用管不用操心，也不会影响WAP，只在APP里有独有效果的设计，试试看

<!--more-->

# WebView注入

对于Hybrid App来说，向WebView里面注入JS（CSS也是通过JS代码的方式注入），是太常见的一件事情了，注入就是最常见的native to js的通信方式

- iOS

```objectivec
[self.webView stringByEvaluatingJavaScriptFromString:injectjs];
```

- 安卓

```java
webView.loadUrl("javascript:" + injectjs);
```

我们注入这么一行demo JS代码试试看

```javascript
var style = document.createElement('style');
//XXWAPBAR 是我们的WAP顶部Bar的class标记
style.innerHTML = '.XXWAPBAR { display: none;}';
document.head.appendChild(style)
```

习惯性的在iOS的`webViewDidFinishLoad`，安卓的`OnPageFinished`的时机去注入这个JS，Run一下看看效果，纳尼？还是闪烁！看来是注入晚了，网页已经渲染完了，这时候注入css，会像前面提到的client端隐藏dom一样，画面会闪烁一下，那我们早一点，`webViewDidStartLoad`与`onPageStarted`的时机注入？Run一下看看效果，纳尼？彻底没反应？

# WebView的JSContext

JSContext是Webkit里面JavaScriptCore框架里面的js上下文，其实就相当于一个WebView里面的js运行时，也可以理解为JS运行环境，先拿iOS做个试验

iOS的同学想必都知道可以用KVC的方式取出UIWebView的JSContext，那么做一个试验，分别在`StartLoad`和`FinishLoad`的delegate里打印一下JSContext

```
- (void)webViewDidStartLoad:(JSBridgeWebView *)webView {
    JSContext* context =[self.webView valueForKeyPath:@"documentView.webView.mainFrame.javaScriptContext"];
    NSLog(@"%@",context);
}

- (void)webViewDidFinishLoad:(JSBridgeWebView *)webView
{
    JSContext* context =[self.webView valueForKeyPath:@"documentView.webView.mainFrame.javaScriptContext"];
    NSLog(@"%@",context);
}

```

运行过后你就会发现，同一个webview的JSContext，在时机不同，他根本就不是一个JS上下文对象，地址都不一样。相同的JS，运行在不同的JS环境里，自然效果是完全不一样的。

每次WebView加载一个新Url的时候，都会丢掉旧的JS上下文，重新启用一个新的JS环境新的JS上下文，因此你在`webViewDidStartLoad`的时候即便使用`stringByEvaluatingJavaScriptFromString`去注入js，也是把js代码在旧的上下文中执行，当新的js上下文完全不受任何影响，没任何效果。


# 在资源加载的时候注入js

安卓的道理也是一样的，因此我们选择`OnPageFinished`已经晚了，此时页面已经渲染完了，再注入画面会闪，选择`OnPageStarted`其实是早了，注入到错误的js上下文里，等页面开始加载，就启用了新的js上下文，因此白注入了。

我们得换一个事件，选一个恰到好处的事件回调，安卓的WebViewClient的`onLoadResource`事件，这个可以满足我们的需求，这个时间点新的js上下文已经生效，整个网页处于加载资源的阶段，还没开始进行排版与渲染，此时加入刚好满足需求

运行一下，效果非常好，画面打开的时候，页面中就已经看不到那个Bar了

__蛋疼的问题来了：__

iOS的UIWebView没有这个事件，UIWebView只有可怜的这4个事件

```
- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType;
- (void)webViewDidStartLoad:(UIWebView *)webView;
- (void)webViewDidFinishLoad:(UIWebView *)webView;
- (void)webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error;
```

# UIWebView的其他出路之一，NSURLProtocol

iOS平台提供的`NSURLProtocol`是一个可以Hook所有网络请求的工具，无论是由WebView发起的，还是直接由App发起的。

`NSURLProtocol`与`Hybrid App`相结合可以碰撞出非常多的火花比如

- 利用`NSURLProtocol`实现Web图片Native缓存
    - UIWebView的缓存有统一上线，并且不好细粒度控制
    - Hook图片请求，不走UIWebView的网络请求，直接通过`SDWebImage`,进行fetch&cache图片
- 利用`NSURLProtocol`实现Hybrid Web页面静态资源本地包
    - css/js/image等静态资源打包随app下发
    - WebView发起请求的时候Hook，从app本地包中返回静态资源
    - 加快网页加载速度
    - 静态资源本地包通过app的方式进行批量更新
- 利用`NSURLProtocol`实现Web图片native滤镜处理能力
    - UIWebView发起图片资源加载
    - Hook后由App下载图片
    - App下载图片后进行native滤镜处理
    - App将滤镜过后的图片返回Web



怎么使用NSURLProtocol我就不多说了，随便搜搜你能搜出一大筐。

我们这个场景也可以利用这样方式来实现，简单的说，App就是通过Hook的方式，直接修改了WAP页面的源代码。但有2个选择，可以选择修改css代码，也可以选择直接修改html页面

- __HookCss__

每个页面都要加载很多CSS，一般我们的WAP项目里都有一些基础模板通用css，假设是`common.css`

1.NSURLProtocol选择性hook我们自己域名下的`common.css`文件
2.通过iOS的字符串处理，给这个文件尾部增加css信息
3.和JS注入的代码里的css一样`.XXWAPBAR { display: none;}`

```
NSString *newcontent = [NSString stringWithFormat:@"%@\n\n.XXWAPBAR { display: none;}\n",content];
```

这样Run一下，效果非常好，画面打开的时候，页面中就已经看不到那个Bar了

- __HookHtml__

如果不修改CSS，修改HTML也行，但这样就不限定文件了，任意自己域名下的HTML

1.NSURLProtocol选择性hook我们自己域名下的任意HTML文件
2.通过iOS的字符串处理，给这个`head`标签增加信息
3.给`head`标签增加`script`子标签
4.其实直接给`head`标签直接增加`style`子标签也可以

```
NSString *newcontent = [content stringByReplacingOccurrencesOfString:@"<head>" withString:@"<head>\n<script type=\"text/javascript\">\n
var style = document.createElement('style'); 
style.innerHTML = '.wkWapX { display: none;}'; 
document.head.appendChild(style);
\n</script>\n"];
```

这样Run一下，效果一样，画面打开的时候，页面中就已经看不到那个Bar了

# UIWebview的其他出路之二，WebFrameLoadDelegate

__这是一个黑科技__

__这个科技和KVC取JSContext一样，都属于UnDocumented API__

## WebView与JSContext在UIWebView上的困境

自从iOS 7推出`JavaScriptCore`，苹果本意是开放这个框架，让开发者根据自己的需求，自己独立运行和开发脚本引擎，但很多人都想在UIWebView上使用`JavaScriptCore`里非常方便的API快速的进行js与oc的互通，使用里面的JSContext，抛弃以往iframe走`shouldStartLoadWithRequest`的delegate方式。

>UIWebView是基于Webkit的，内部天然存在着一个javascriptcore，以前只是iOS没对外开放，iOS7才对外开放

但很可惜，对于UIWebView看起来苹果真是对它没多少爱了，并没有把JSContext暴露出来，拿到不到webview的JSContext，整个JSC的API也玩不起来，于是聪明的开发者利用KVC的方式还是把它拿了出来

`documentView.webView.mainFrame.javaScriptContext`

说到底这还是一个Undocumented Api，没有记录在合法苹果开发者文档与头文件的一个Api，存在一定的风险，但即便如此，使用这个方式依然存在一个问题，也就是我上文强调过的WebView与JSContext的问题

>每次WebView加载一个新Url的时候，都会丢掉旧的JS上下文，重新启用一个新的JS环境新的JS上下文，因此你在`webViewDidStartLoad`的时候即便使用`stringByEvaluatingJavaScriptFromString`去注入js，也是把js代码在旧的上下文中执行，新的js上下文完全不受任何影响，没任何效果。

大家在搜索`javaScriptCore`使用指南的时候，总能看到类似这样的代码，在OC中给JSContext直接注入对象or函数

```
// Use JSExport Protocol 将oc对象注入给js
context[@"ViewController"] = self

// 将oc的block，注入给JS当做函数
context[@"hello"] = ^(void) {
        NSLog(@"hello world");
    };
```

如果我们基于这种模式来构建Hybrid Bridge，那么将带来很大的便利，最直观的优势就是，这种bridge是同步直接return返回的

而以前iframe通过`shouldStartLoadWithRequest`的delegate方式想要返回，必须得异步，并且用js语句注入来执行回调，才能返回数据给js。


这种基于JSContext的同步Hybrid Bridge构建的时机如果是`webViewDidFinishLoad`就会存在一些问题，在loadfinish的时候，代表网页中的js代码已经执行完了，如果此时才将bridge构建完毕，那么loadfinish之前执行的js代码是不能够使用jsbridge

如果我们能捕获到新JSContext刚创建的时机，那么我们就能`搞事情`

- 比如创建这种同步jsBridge，是的任意js执行的时候都能有效jsBridge！
- 比如解决我们今天聊得场景问题，在新JS环境刚创建，网页还没开始排版和渲染的时候，注入CSS！


## WebFrameLoadDelegate寻求突破

搜索和寻找中发现了这样一个东西

[TS_JavaScriptContext](https://github.com/TomSwift/UIWebView-TS_JavaScriptContext)

简单的说，这个开源库也找到了一种`UnDocumented API`来准确捕捉到了新JSContext刚创建的时机，通过`WebFrameLoadDelegate`

`WebFrameLoadDelegate`这个词随便在网上一搜，你就能搜到API和OC/Swift代码，但很可惜，这个代码仅限`macOS`

[Apple关于WebFrameLoadDelegate的官方文档URL](https://developer.apple.com/documentation/webkit/webframeloaddelegate?language=objc)

![15049523772825](http://ouz34cilp.bkt.clouddn.com/15049523772825.jpg)



从这个官方文档中你可以发现比UIWebViewDelegate多很多的各种Webkit内核的事件

![15049524279135](http://ouz34cilp.bkt.clouddn.com/15049524279135-1.jpg)



看到其中最重要的一个delegate没？

`webView:didCreateJavaScriptContext:forFrame:`

没错就是他，意思是说，其实Webkit内核早就把这类事件都抛出来了，并且在macOS的SDK中把这些事件都暴露给了开发者，但是在iOS的SDK中，UIWebView的头文件设计却把这些事件都吞掉了，没暴露出来，不让开发者使用

按着苹果的尿性，源码里一般都会这么写

```
if (_xxDelegate && [_xxDelegate respondsToSelector:@selector(webView:didCreateJavaScriptContext:forFrame:)]) {
     [_xxDelegate webView:webView didCreateJavaScriptContext:ctx forFrame:frame];
}
```

如果苹果把这个delegate给藏了起来，没有写进UIWebViewDelegate的Protocol里，但我们自己把这个函数实现了，按着苹果的尿性，就应当可以触发

于是[TS_JavaScriptContext](https://github.com/TomSwift/UIWebView-TS_JavaScriptContext)这个项目就按着这个思路去尝试并且真的成功了，他给NSObject添加了一个category，使得NSObject拥有了`webView:didCreateJavaScriptContext:forFrame:`的implement，因此`respondsToSelector`的判定就会生效，从而我们就拿到了JS环境的创建事件

![15049532969678](http://ouz34cilp.bkt.clouddn.com/15049532969678.jpg)


既然已经拿到了正确的时机，后面注入JS就好了，效果杠杠的，

## 一些探讨和猜测

到了这一步，单纯的找到时机，已经能解决我的问题了，不过`WebFrameLoadDelegate`里面的其他事件让我产生了很大的好奇心

[Apple关于WebFrameLoadDelegate的官方文档URL](https://developer.apple.com/documentation/webkit/webframeloaddelegate?language=objc)

从这里可以看到很多很多的事件，都是UIWebView里没有的，可以说macOS下的WebKit框架对外暴露的Api，更加能窥视Webkit原本的运作机制以及事件周期

想要窥视更多Webkit也可以看这个

[ios UIWebview runtime header 用于私有api调用查看](http://blog.csdn.net/cyforce/article/details/8561369)

其实Webkit整个都是开源的，网上也有很多教你自己下Webkit源码，编译Webkit的，看些个是最直接的，但毕竟太庞大了，头疼看不进去，哈哈哈哈哈


我在之前的文章[动态界面：DSL&布局引擎](http://awhisper.github.io/2017/05/01/DSLandLayoutEngine/)中画过这样一个图

![](http://o8n2av4n7.bkt.clouddn.com/webkit.png)

而今天发现，在这图里面还需要补充很多环节，也就是`html/css/js`在被加载之前都发生了啥


[浅谈WebKit之WebCore篇](http://ourpgh.blogspot.hk/2008/09/webkitwebcore.html)

可以看看这篇文章来学习一下，然后梳理一个大概的理解

- 当webview跳转了一个url
- 会先交给Frameloader
- 然后就会new Document啊
- Load Resource啊(html/css/js)
- 就会commit Document
- 然后parse HTML
- 生成Dom树啦
- 再排版 layout
- 最后渲染 render

看了苹果的`WebFrameLoadDelegate`文档和那篇`私有api调用查看`，你会发现有很多`forFrame`的Api&Delegate，可见FrameLoader还是很重要的一个环节

而且，通过[TS_JavaScriptContext](https://github.com/TomSwift/UIWebView-TS_JavaScriptContext)这个项目，我还发现一个有趣的现象，就是如果页面中不包含任何的JS（无论是HTML中的JS代码，还是额外JS文件）那么就完全不会有`webView:didCreateJavaScriptContext:forFrame:`的事件被抛出来，可以想象既然没有JS代码，要毛的JS引擎。


# 后记
 
其实一开始我们聊的要注入CSS隐藏WAPUI的业务场景，已经不重要了。这么整体review一下你会发现，客户端解决方案里只有安卓比较舒服，iOS UIWebView都不太尽如人意。而且换了WKWebView可能这些问题都不存在（恩，项目还没用，没深挖）

- 前端解决
    - 定制开发（机械工作，繁琐，没意义）
    - 前端编译框架（成本大，风险高，跨团队）
- 客户端解决
    - 安卓onLoadResource时机注入（比较完美）
    - iOS NSURLProtocol改HTML源码（感觉并不很好）
    - iOS 非公开Api调用（可能有审核风险）
 

>一个奇怪的业务场景，引发的胡乱思考

但是这个奇怪的场景，和胡乱发散的思考，确实让我多的了解了很多关于WebView内核的机制，这内核机制太庞大了，现在还是靠发散思考和搜索查找进行学习，有时间和精力真的想好好看看，亲自编译一下Webkit的源码，光是纯纯的源码文本就20M呢，要想看进去还真是一个十足的挑战


