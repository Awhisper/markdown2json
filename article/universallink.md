---
title: Universal Link 前端部署采坑记
date: 2017-09-02 12:09:23
categories: 技术感悟
tags: [deeplink,universallink]
---

>前言：
>
>文章会适当说一些如何开发iOS上的universal link，但类似的文章太多了一艘一大堆，每篇都介绍的挺清楚，因此也不是重点
>
>本文更加会侧重从前端的角度，将整个universal link 部署应用到wap app中的一些策略和一些问题解决办法
>
>其实整个Universal Link没啥难的，真正上线过Universal link的人这些应该都趟过一遍了，本文主要是我们team去应用Universal link的时候一些文档沉淀和记录

# Schema VS Universal Link

Deeplink相关的技术，在wap中唤起app其实应用最最广泛的并不是Universal Link，而是直接Schema跳转

```javascript
location.href = 'schema://xxxx'
```

并且一般各大APP都会给自己做一套路由体系，这样其实可以直接在schema头后面对接路由体系，做到一行schema定位打开任意App内功能界面（我就不详细扯路由的事了）

```objectivec
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {
    if ([[url absoluteString] hasPrefix:@"schema://"]) {
        [[WKDispatcher sharedInstance] operationObjectFromRouteURL:[url absoluteString]];//路由
        return YES;
    }
}
```

如果单纯为了实现deeplink -- 在WAP上打开App，并且传递来数据信息，定位App内的具体逻辑，那么Schema就够了，其实没必要上Universal Link，Schema相当于是很特殊的Url，他是`schema://xxx`这种样子，如果安装了APP才能支撑跳转这种Schema Url，如果没安装APP就没任何效果，而Universal Link则是把普通url，长`http://xxx.xxx.xxx/xxx`这样的Normal Url，如果安装了App，就能像Schema一样传递给App，延续App内逻辑，如果没装App，则还会继续在浏览器里跳转这个Normal Url

# Schema的弊端

## Schema无法判断是否安装App

<!--more-->

一定会有这样的产品需求的：

- 如果已经安装App，则打开App
- 如果没有安装App，则前往下载App

浏览器实际上是没有能力判断手机里是否安装了某个App的，所以聪明的程序员们选择了讨巧的方法

```javascript
try {
    var appSchema = 'schema://xxxx';
    if ($.os.ios) {
        location.href = openNALocation; //location.href 打开schema
    }
    else {
        $('body').append('<iframe src="' + appSchema + '" style="display:none"></iframe>'); //iFrame 打开 schema
    } 
}catch (e) {}

//延迟1000秒
setTimeout(function () {
    if ($.os.ios) {
        location.href = `https://itunes.apple.com/us/app/idxxxxxxx?mt=8`;
    }
    else {
        location.href = `https://xxx.xxx.xxx/xxx/xxx.apk`;//直接apk下载link
    } 
}，1000）
```


- 首先发起跳转Schema
    - 如果没安装App，会打开App失败，没效果
    - 如果安装App，会成功打开App
- 延迟1000ms
    - 如果没安装App，Schema打开失败，等1000秒后会自动跳转
    - 如果安装App，App会打开，当前网页会被暂停，这延迟代码不会执行
    
聪明的人会发现，这样有个风险，如果用户打开APP成功后，又手动切回浏览器，那么延迟1000ms的代码依然会执行，安卓会跳出下载apk包得提示，iOS会又再度跳到Appstore，但这个瑕疵也不是太大的问题，所以这种做法被普遍采用，运用在各种`安装就跳转，不安装就下载`的用户场景。

__安卓这么用挺好，iOS有个讨厌的弹框__

如果用户没有安装App，那么他一定会经历2个事情

- schema打开app，但是失败
- 延迟后，跳转下载App

在第一个环节，安卓上schema打开失败，没有任何反映，也没有任何提示，一切顺利，但是iOS就不同了。

schema会弹个可恶的跳转失败的框
![1504334347900](http://ouz34cilp.bkt.clouddn.com/1504334347900.jpg)

然后再延迟后弹跳转AppStore的框
![1504334376521](http://ouz34cilp.bkt.clouddn.com/1504334376521.jpg)


## Schema被很多App禁止，比如微信手百

Schema被广泛使用，从浏览器中唤起打开专门的App，但这并不被很多App认可，比如`微信`，`手机百度`，他们本身除了浏览网页以外有其他的使用场景，所以站在微信/手百的角度，并不希望用户为了看一些分享和内容就跳出微信/手百的App，于是这些客户端拦截了Schema，使得所有Schema都无法生效。

于是不得已，广大开发者只好针对，微信/手百，等特殊UA信息，展现出蒙层，引导用户用系统/外部浏览器打开

![](http://ouz34cilp.bkt.clouddn.com/15043348932645.jpg)


## Universal Link 解决 Schema的弊端

开篇就说了，如果你单纯为了能让wap打开App，Schema就能做到了，Universal Link的意义则是把普通url，也赋予了能打开App的能力，而不必编写专门的Schema Url去唤起App

Schema 的2个弊端确实能通过Universal Link解决

不同于Schema，在没装App的时候，Universal Link他也是一个合法的url链接，浏览器可以正常跳转，因此不会出现在iOS上讨人厌的框

Universal Link目前还没有基于iOS的UI/WKWebView的应用进行拦截，所以目前看还是能突破微信/手百的封锁。（以后，不好说啊~）

# Universal Link 开发

类似的话题，随便搜搜Universal Link能搜到一大堆，我这里就略微多啰嗦两句，一般各大教程里会反复说的，我尽量一带而过，多说点我遇到的坑

## 配置apple-app-association

究竟哪些的url会被识别为Universal Link，全看这个apple-app-association文件
[Apple Document UniversalLinks.html](https://developer.apple.com/library/content/documentation/General/Conceptual/AppSearch/UniversalLinks.html)

- 你的域名必须支持Https
- 域名根目录下放这个文件`apple-app-association`，不带任何后缀
- 文件为json保存为文本即可
- json按着官网要求填写即可

怎么写json其实没啥可教的，满世界的文章都教你咋写了，我们看个例子，点下面的链接，你的浏览器就会自动把知乎的`apple-app-association`的json file给down下来

[知乎的 apple-app-association 文件](https://oia.zhihu.com/apple-app-site-association)


![](http://ouz34cilp.bkt.clouddn.com/15043372687469.jpg)

__划重点__

有心人可能看到，知乎的Universal Link配置的是 `oia.zhihu.com` 这个域名，并且对这个域名下比如/answers /questions /people 等urlpath进行了识别，也就是说，知乎的universal link，只有当你访问 `https://oia.zhihu.com/questions/xxxx`，在移动端会触发Universal Link，而知乎正经的Url`https//www.zhihu.com/questions/xxx`是不会触发Universal Link的，知乎为什么制作，为什么不把他的主域名配置Universal Link，这是由于Universal Link的一个大坑所致

__PS.__

>apple-app-association 你可以看完全了知乎的json file，会发现里面也不止是 universal link
>
>苹果的一些其他功能都和apple-app-association有关，都需要配置这个文件，增加更多json字段信息
>
>比如Hand off 还有一些跨Web&App的分享

__测试是否正确__

苹果官方提供了一个网站来测试你配置的域名apple-app-association是否正常work

[https://search.developer.apple.com/appsearch-validation-tool/](https://search.developer.apple.com/appsearch-validation-tool/)

![](http://ouz34cilp.bkt.clouddn.com/15043386160170.jpg)

这个网站有点SB，就是你用他测试不通过，其实Universal Link也可能不生效的，比如我把知乎的`oia.zhihu.com`输入进去，他就没感应到，认为没有。我搜索的时候，发现也有人发现了这个问题，反正可以当个参考

## 配置iOS App工程

- 开发者中心证书打开Associated Domains
- 工程配置Associated Domains
- 将你apple-app-association所在域名配置进去
- 给你的工程像Schema的OpenUrl一样，编写App被唤醒后的处理逻辑

![](http://upload-images.jianshu.io/upload_images/2271929-54258e880f10ce3c?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```objectivec
#pragma mark Universal Links
- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray * _Nullable))restorationHandler {
    if ([userActivity.activityType isEqualToString:NSUserActivityTypeBrowsingWeb]) {
        NSURL *webUrl = userActivity.webpageURL;
        [self handleUniversalLink:webUrl]; // 转化为App路由
    }
    return YES;
}
```

恩比较千篇一律，我不多说了

## Universal Link的基本运作流程

- APP第一次启动 or APP更新版本后第一次启动
- APP向工程里配置的域名发起Get请求拉取apple-app-association Json File
- APP将apple-app-association注册给系统

- 由任意webview发起跳转的url，如果命中了apple-app-association注册过的通用链接
- 打开App，触发Universal Link delegate
- 没命中，webview继续跳转url

在你进行apple-app-association 以及 App工程的配置之后，整个Universal Link的运作流程完全由系统控制了


# Universal Link 采坑

整个Universal Link其实真要只是开发完成，完全写不了几行代码，就差不多搞定了，不过还真是踩了几个坑

## 跨域

前端开发经常面临跨域问题，恩Universal Link也有跨域问题，但不一样的是，Universal Link，必须要求跨域，如果不跨域，就不行，就失效，就不工作。（iOS 9.2之后的改动，苹果就这么规定这么设计的）

这也是上面拿知乎举例子的时候重点强调的一个问题，知乎为什么使用`oia.zhihu.com`做Universal Link？

- 假如当前网页的域名是 A
- 当前网页发起跳转的域名是 B
- 必须要求 B 和 A 是不同域名，才会触发Universal Link
- 如果B 和 A 是相同域名，只会继续在当前WebView里面进行跳转，哪怕你的Universal Link一切正常，根本不会打开App


是不是不太好理解，那直接拿知乎举例子

[https://www.zhihu.com/question/22914651](https://www.zhihu.com/question/22914651)

知乎的一般网页URL都是`www.zhihu.com`域名，你在微信朋友圈看到了知乎的问题分享，如果copy url 你就能看到这样的链接

![](http://ouz34cilp.bkt.clouddn.com/15043399516932.jpg)

微信里其实是屏蔽Schema的，但是你依然能看到大大的一个按钮`App内打开`，这确实就是通过Universal Link来实现的，但如果知乎把Universal Link 配在了`www.zhihu.com`域名，那么即便已经安装了App，Universal Link也是不会生效的。

一般的公司都会有自己的主域名，比如知乎的`www.zhihu.com`，在各处分享传播的时候，也都是直接分享基于主域名的url，但为了解决苹果强制要求跨域才生效的问题，Universal Link就不能配置在主域名下，于是知乎才会准备一个`oia.zhihu.com`域名，专为Universal Link使用，不会跟任何主动传播分享的域名撞车，从而在任何活动WAP页面里，都能顺利让Universal Link生效。

简单一句话

- 只有当前webview的url域名，与跳转目标url域名不一致时，Universal Link 才生效

## apple-app-association 覆盖

我们业务机房的集群是大部门下几条业务线共用的，有一整套云服务系统来进行机房集群的管理，有统一的接入层进行分发。虽然是不同的产品线，不同的服务，但是共享分布式的机房进行运作的。

很多Universal Link的教学文章是这么写的

- 将json命名为 `apple-app-association` 不要乱改名
- 将file 上传到域名所在的服务器根目录下

于是我就将我们文库的apple-app-association，上传到我准备的wenkuUniversal域名的所在机器的根目录下。（因为机房都是分布式的，所以其实就是upload的全部门下的很多机器上）

同部门另一个产品线阅读后来也开始尝试Universal Link，也要把他们写好的apple-app-association上传到他们的yueduUniversal域名所在的机器的根目录下。

因为都是同样的文件名，又因为整个事业部机器实际上是共用的，因此就发生了覆盖。

__解决办法__

- 共用同一个 apple-app-association

因为apple-app-association的具体内容里有App 的Bundle ID在，因此可以简单的把2个json file 进行merge，你的App bundle 生效你的link，我的App bundle生效我的link

但其实并不推荐，毕竟双方都要小心在更新的时候，不能覆盖对方，并且这样做也很不合理，apple-app-association也不止为universal link 一个feature工作，当面临跨app / web share 甚至hand off的时候，共用一个json file 还是有坑

- 接入层分发不同json file

2个产品线的link域名其实是不一样的，只不过恰巧这两个域名最重打到得机器是同一个或者说有重叠，因此产生了覆盖，完全可以将json文件保存成各自的名字，在接入层对域名进行分发

最终App也是通过Get请求去拉取apple-app-association的，只要Get到，并且ssl安全性上符合要求（强制https）就没问题

__隐藏的坑：apple-app-association被覆盖后如何更新__

我们线上已经work的Universal Link功能，突然有一天发现坏了，查了一圈最后查到被阅读覆盖了，那就修复呗，修复倒是没问题，问题在于修复后的universal link，用户必须重新安装一次app，才能重新work，这个太坑了啊

所以关键是需要掌握apple-app-association的更新时机，反复重新杀APP重开完全没用，删了APP重装确实有用，但不可能让用户这么去做

[https://stackoverflow.com/questions/35187576/does-the-apple-app-site-association-json-file-ever-get-updated-in-app
](https://stackoverflow.com/questions/35187576/does-the-apple-app-site-association-json-file-ever-get-updated-in-app
)

这里解释了，每次App安装后的第一次Launch，会拉取apple-app-association，除此之外在Appstore每次App的版本更新后的第一次Launch，也会拉取apple-app-association。

也就是说，一旦不小心因为意外apple-app-association，想要挽回又让那部分用户无感，App再发一个版本就好了

## Universal Link 会因为用户行为而失效

Universal Link 触发后打开App，这时候App的状态栏右上角会有文字提示来自XXApp，可以点状态栏的文字快速返回原来的AP

如果用户点了返回微信，就会被苹果记住，认为用户并不需要跳出原App打开新App，因此这个App的Universal Link会被关闭，再也无效。

想要开启也不是不行，让用户重新用safari打开，universal link的页面，然后会出现很像苹果smart bar的东西，那个东西点了后就能打开（我是看到的，我没亲自操作过）

# Universal Link 业务部署

知乎的apple-app-association可以看到里面有一大堆的WAP的URL，比如/answers /questions /people等，知乎都将它一一映射到App得对应界面里，问题/回答/人详情页。这是因为知乎的WAP站和APP的功能几乎是一致的。因此知乎的Universal Link的使用方式，可以说是很经典的遵循着苹果的原始设计初衷`通用链接`，将wap url，变成通用url，同样的url，对应着2个跳转，web跳转/app跳转，但是他们是同一个功能。

我们产品线面临的情况不一样，我们的产品线文库，他的WAP和APP功能差异非常大，可以说除了文档阅读页/view，WAP与APP都有这个功能，其他的功能WAP是WAP的，APP是APP的，形态和场景都有明显差异。除了/view这个功能，我们可以按着`通用链接`的设计，将APP阅读页跳转，与WAP阅读页跳转进行统一。其他时候Universal Link对于我们业务来说就是一个更强大的Schema（突破旧Schema局限的=），他只需要跳转到APP，他没有合法的WAP Url可以让浏览器在没有安装App的情况下继续跳转。

## 我们的Universal Link 业务部署

我们的Universal Link就像知乎一样，没有选择我们的主域名，而是选了一个完全没在WAP上有任何页面和流量的域名，我们的apple-app-association是这么写的

```json
{
    "appID": "xxxxxx.xxx.xxx.xxxxx",
    "paths":[ "/view/*",
              "/_iosuniversallink/*"]
},
```

我们的AppDelegate中具体handleUniversalLink的逻辑是这么写的

```objectivec
- (BOOL)handleUniversalLink:(NSURL *)url {
    NSURLComponents *components = [NSURLComponents componentsWithURL:url resolvingAgainstBaseURL:YES];
    NSString *host = components.host;
    if ([host isEqualToString:@"xxx.xxx.xxx"]) { //host判断，虽然没啥意义
        if (pathComponents.count >= 3) {
            //地址匹配+页面跳转
            NSString *router;
            if ([pathComponents[1] isEqualToString:@"view"]) {
                router = @"xxx";//生成打开APP阅读页的专属Router
            } else if ([pathComponents[1] isEqualToString:@"_iosuniversallink"]) {
                router = @"xxx";//解析出APP能识别的任意路由，
            }
            if (router && router.length > 0) {
                [[WKDispatcher sharedInstance] operationObjectFromRouteURL:router];//无论是阅读页路由还是任意路由，发起跳转
            }
            return YES;
        }
    }
    return NO;
}
```

可以看出来我只打开了这个域名下`https://xxx.xxx.xxx/view/*` 和 `https://xxx.xxx.xxx/_iosuniversallink/*`2个Universal Link Path.对没错，不像知乎那么多。

- `/view/*` 后面的*直接是阅读页ID，用于快速生成阅读页路由，发起跳转
- `/_iosuniversallink/*` 后面的*其实应该填写的是我们App已经设计好的路由字符串，识别出路由字符串后，发起跳转

其实可以看出来/_iosuniversallink是完全包含/view的，因为APP阅读页天然也是包含在我们的路由规则内的，只要这里有路由策略，扩展力已经足够支持任意APP页面了，因此apple-app-association只配置了2个，但是如果有计划外的特殊case，大不了更新一下，也没多大事。



## 为了统一WAP&APP，为了通用链接的效果

我刚才提到，我们选择的Universal Link的域名其实是一个没有实际页面的域名，也就是说`https://xxx.xxx.xxx/view/*`这个url，如果没安装APP因此触发WebView继续跳转原地址，会直接404。处理很简单，重定向一下

```javascript
router.use('/view', function (req, res, next) {
    var path = req.path;
    res.redirect('https://wk.baidu.com/view' + path + '?st=1#1');
});
```

整个效果就是

- 跳转`https://xxx.xxx.xxx/view/*`
    - 已安装App
        - 打开App 触发handleUniversalLink
        - 走到/view/分支，拼接阅读页路由
        - 跳转
    - 未安装App
        - WebView原地跳转`https://xxx.xxx.xxx/view/*`
        - 命中服务器的重定向逻辑
        - 重定向到`https://wk.baidu.com/view/*`
        - 打开我们的WAP阅读页
        

这就是为啥明明`/_iosuniversallink`是完全包含`/view`能力的，但还是要把`/view/`单独处理的原因，为的是实现WAP与APP的统一设计，为了`通用链接`这个初衷

## 不为统一WAP&APP 只拿来当强化版Schema使用

同样的道理，`https://xxx.xxx.xxx/_iosuniversallink/*`这个url，也没有实际的页面，如果不进行重定向，也会直接返回404，因此看一眼重定向的代码

```javascript
    router.use('/_iosuniversallink', function (req, res, next) {
        var redirecturl = 'https://wk.baidu.com/topic/naiosappstore';
        res.redirect(redirecturl);
    });
```

解释一下[https://wk.baidu.com/topic/naiosappstore](https://wk.baidu.com/topic/naiosappstore)就是我们为iOS下载App准备的专门的WAP单页面，这个页面打开后会自动延迟500ms，发起跳转appstore

整个效果就是

- 跳转`https://xxx.xxx.xxx/_iosuniversallink/*`
    - 已安装App
        - 打开App 触发handleUniversalLink
        - 走到/_iosuniversallink/分支，拼接出任意App内的界面路由
        - 跳转界面
    - 未安装App
        - WebView原地跳转`https://xxx.xxx.xxx/_iosuniversallink/*`
        - 命中服务器的重定向逻辑
        - 重定向到`https://wk.baidu.com/topic/naiosappstore`
        - naiosappstore页面会延迟跳转AppStore
        - 打开AppStore下载

这个设计看起来就是完美解决了PM得需求

- 如果已安装App，跳转对应界面
- 如果没安装App，跳转App下载界面

解决了旧Schema模式下的弊端问题：

- Schema无法判断是否安装App，只能采用`setTimeout`的Trick方式
- Schema的Trick方式会有一个丑陋的错误跳转弹框
- Schema无法在微信/手百等App内，打开我们自己的App

简单的说，这样设计的初衷就是，我不为了`通用链接`这一目的来使用Universal Link，来统一WAP&APP的URL跳转，我就为了把Universal Link当做加强版Schema来使用


