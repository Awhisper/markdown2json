---
title: iOS app与浏览器深度链接 DeeperLink
date: 2016-05-11 16:57:52
categories: 技术感悟
tags: [Hybrid,浏览器]
---

# Update 2016.11.23

更新一个最新的方案，老文章里面介绍的2个方案都不如这个易操作，唯一的问题是就看iOS10的覆盖率了，覆盖率不够之前下文的`设备指纹方案`可以与这个方案互补

- 只支持iOS10以上
- 通过剪切板
- 跨越浏览器app与宿主app，传递数据

[clipboard.js](https://github.com/zenorocha/clipboard.js)

一个1w Star的js库

因为iOS10系统给js开放了API可以操作剪切板，因此直接使用这个库，可以很方便的在任何App的webview（包含safari，微信，qq，百度框等）将数据存入剪切板

然后很方便的在其他任何app中，读取出剪贴板的数据用于互通

这个方案在准确度上，成功率上，适用范围上全面优于下文讨论的`设备指纹`和`SafariViewController方案`

忘掉`SafariViewController方案`吧，这个方案现在非常的坑

原因是，SFViewController的方案，Openurl事件会以各种方式被系统吞吃掉事件，duplicate等等，都会导致失败率非常的高


# Deeper Link 简介

本文主要介绍，app跨域访问app外部的浏览器的数据的方案，包括外部safari，或者QQ，微信，手百等外部app内的浏览器。

主要使用场景就是：

用户在别的wap网页上，产生了用户行为，用户数据，但是还没下载app，当用户下载app后，打算直接在app内延续之前在wap上的行为和数据的时候，就需要运用到跨越浏览器与app鸿沟的，互通方案。

简单举个例子就是：

用户在微信浏览器里，访问某个页面，感兴趣并且登陆了，然后引导下载了app，等用户下载完app后第一次打开，希望能自动就完成登陆，甚至同步下来一些刚才用户在wap页面上操作的数据

__如果能发生跨浏览器与app的互通，除了这个case之外，还可以有更多地自由发挥，设计出更加舒畅的用户体验__

__这就是 Deeper Link__
<!-- more -->

想要实现这样目前看有2个方案，各自都有弊端，都不是完美的，本文会详细说明这两个方案

- 设备指纹唯一识别方案
- iOSSafariCookie互通方案





# 设备指纹唯一识别方案
如果用户在wap页面，能通过某种方式识别到唯一的设备标识，当用户离开去下载app，下载完成第一次打开app的时候，app能识别到一样的设备标识，那么就可以判断第一次打开app的用户，就是刚才浏览wap网页的用户，这样服务就可以把刚才wap上操作的数据结果，通过网络下发给app，从而让app实现，还原刚才wap的操作场景

## 方案流程

- 用户在wap网页上产生了行为，产生了用户个人数据
- wap网页收集了一种能够`唯一标识`设备的信息，并且发送给了服务器
- app安装完毕后第一次运行，也去通过app尝试收集`唯一标识`设备的信息，并且发给服务器
- 服务器经过对比，发现app的`唯一标识`与wap网页发上来的`唯一标识`能够匹配
- 服务器判断，是同一个人操作，于是下发用户个人数据

纵观整个流程发现，一切的核心，一切的关键，就是那个`唯一标示`

## 选取唯一标识

这个`唯一标识`要具备苛刻的条件，想找到其实很不容易

- 选择当做`唯一标识`的内容，必须能让app获取的到
- 选择当做`唯一标识`的内容，必须也能让wap获取的到
- 选择当做`唯一标识`的内容，还必须有能力区分出不同的设备，如果选的`唯一标识`好几个设备取出来的都一样，那么就乱套了

那么我们看看遵循这几个条件，我们能选择啥？

- UDID,MAC地址啥的，别说wap了，app都不可能取到了
- JS有好几套，通过网页渲染canvas的方案获取屏幕"指纹"，但这玩意app不可能拿到完全一致的东西，二者对不上，就没任何意义
- IDFA，IDFV，这玩意app是能取到了，但是wap拿不到啊

上面说的几个都是相对来说，如果能双方都拿到，是可以比较精准的进行设备`唯一标识`的，但问题是，我们拿不到。。怎么办？

看看下面几个数据

- 设备屏幕尺寸（iOS设备如此的统一，一共就那么几个屏幕尺寸，重复的还不一堆一堆的）
- 设备操作系统（iOS系统碎片化如此的低，大部分几乎都升到较高级的系统版本，重复的依然一堆一堆）
- 设备IP（IP这玩意会变啊，离开WIFI进入3G，经常变，并且IP这玩意在同一WIFI下也重复的一堆一堆的啊）
- 访问时间（时间这玩意更没谱了，你们的用户量越大，某一个确定的时间段内，发生第一次安装，重复的就越多）
- 还有更多类似的数据

发现没有，上面的数据最大的特点就是，有一定的描述设备体征的信息，但是如果只靠这一个描述信息，那结果就是重复的太多太多，根本没法确定一个唯一性。


但是，如果我们把这么些描述信息做成一个合集，同一时间内满足所有的条件，那么这个设备重复的概率一下就缩减了太多太多。

## 举例说明

举个例子，到app安装完毕第一次打开的时候，所有访问过wap的设备信息，把他们的信息全都收集起来，找到同样的屏幕尺寸，同样的操作系统版本，同样的IP地址，访问时间相差不超过10min（暂定）的设备，在如此多得限定条件下，我们近乎可以认定为，是具有唯一性的设备，是同一个人

可以看到这里面众多的信息一起去过滤，比较强的过滤条件就是IP，但因为IP存在频繁变化，所以追加了时间条件，IP也可能因为WIFI路由器的原因导致，IP也存在重复和误伤，这时候，又辅助了简单的设备信息进行二次过滤。

这样我们就找到了一个并不完美的`唯一标识`，有了这个唯一标识，就可以实现我们的跨浏览器和app的互通。

其实友盟的SDK就是这么做的

[友盟 SDK文档](http://bbs.umeng.com/thread-10-1-1.html)

友盟通过这个方法，知道了用户是从哪个网页看到的app下载的广告，然后发生的去appstore下载并运行的行为，从而有效的能核算广告的收益

>a.通过对应用appstore URL进行封装，获取分渠道点击用户的相关信息，包括：时间、IP、设备类型、操作系统版本；
>
>b.通过在应用中集成代码，获取初次打开应用的用户信息，包括：时间、IP、设备类型、操作系统版本；
>
>c.实时对比不同渠道点击用户和应用激活用户信息，区分不同渠道带来的激活用户；
>
>d.此统计方式不用媒介提供统计数据，实时自动对比，会存在一定误差，但可以基本衡量各渠道间及不同时期的渠道激活转化数据。
>

## 方案弊端

他有什么弊端吗？弊端还是挺明显的，因为他是不完美的`唯一标识`，所以就存在着误伤。

什么是误伤？用户A浏览了WAP界面，用户B恰巧用同一屏幕，同一操作系统版本，同一网段出口IP，在既定时间内，B用户下载并运行了APP，这样我们这套方案，会把B识别成A，等到A真的下载完APP后再来运行，数据可能已经失效了

这种误伤是概率存在的，在现有的限定条件下，随着app的用户体量越来越大，这种误伤将会越来越明显。

# iOSSafariCookie互通方案
## 方案简介

接下来介绍另外一种方案，iOSSafariCookie互通，这种方案借助的是iOS9系统新出的一个系统API`SFSafariViewController`，这个API是专为Safari设计的。所以这套方案有他的特点

- 优点：精准，不会误伤。
- 缺点：只能通过safari，不能借助QQ，微信，手百等第三方app的浏览器

感谢SafariAutoLoginTest这个demo项目提供的思路

[SafariAutoLoginTest Github地址](https://github.com/mackuba/SafariAutoLoginTest)

## 方案思路
详细说一下思路，如果我们能在用户访问wap页面的时候，通过网页，网手机里写入一些用户的行为和数据，比如用户名，然后在app运行的时候去读取这个信息，那么就自然能建立起，wap页面访问，和app下载安装后第一次运行，二者之间的联系。但是想要做到这一点，谈何容易。

大家都知道，iOS是有沙盒的，不同app之间，几乎不可能跨越沙盒屏障来访问数据，wap在浏览器里可以写数据进入cookie，保存在手机上，这没问题，但是app所在的cookie，和刚才的外部浏览器所在的cookie，分属不同沙盒，完全就不是同一份cookie。我们在wap上写cookie写进的是safari的cookie，我们打开自己app读cookie读得是自己app的cookie。

有什么方法可以跨越沙盒传递数据？`URL Scheme`没错，通过OpenUrl的方式。如果我在wap页面访问，wap页面发出来一个已经和我们的app约定好的`URL Scheme`跳转，那么就可以，唤起我们的app，并且伴随着url，传递来数据。


如果用户手机里安装了我们的app，用户先去浏览wap页面，wap页面触发了url跳转，自动唤起了已经安装的app，并且伴随着url传递来了数据，一气呵成，没错用户很自然的从wap上的操作行为，延续到了app上。

问题来了，如果用户没装app怎么办？难道让用户先浏览Wap站，产生了行为数据，被引导下载app，下载完后，重新回到wap站，重新再由wap站发起url跳转？这体验简直渣到爆，简直无法忍受

## SFSafariViewController

iOS9以后，苹果推出了`SFSafariViewController`这个全新的类，这个类的API允许在app内打开一个safari浏览器，而不是一个app内部的webview。

__这个app内safari和外面系统的safari是同一个，共享同一个沙盒，可以操作同一个cookie__

刚才我们设想的操作流程，用户体验很差的流程

- 用户浏览wap站
- 用户引导下载app
- 用户回到wap站，跳转app
- wap通过openurl唤醒app传递数据

经过app内safari的处理，我们可以采用一些鬼点子，顺着这个旧思路，把用户体验极差的第三部，第四部，给隐藏了，让用户无感知的静默完成，这样方案就完美了

- 用户通过safari浏览wap站，wap站写用户行为数据进入cookie
- 用户通过引导下载app，运行app
- 第一次运行app，app内静默的打开一个纯透明safari（让用户感觉不出来）
- 纯透明的safari访问一个专门用来静默取cookie得页面
- 纯透明的safari访问的取cookie的页面，取到了正确的cookie数据，
- 纯透明的safari将数据通过openurl，静默的回传给app
- app拿到浏览器数据后，销毁无用的纯透明safari


流程上看起来很复杂，但结果就是，用户用系统safari，浏览了wap站，下载了app，app打开后就自动能恢复到他浏览wap站的个人信息了（或者其他数据）



# VKSafariDomainBridge使用
# 这个工具已经不推荐使用了！！

原因是，SFViewController的方案在iOS10以后，Openurl事件会以各种方式被系统吞吃掉事件，duplicate事件，等等，因为有了更好的替换方案，所以

__所以非常非常不推荐继续使用这个SafariAutoLogin方案了__




>上面的流程，如果用代码进行开发还算挺麻烦的，所以我封装了一个工具，来辅助进行这一串静默让用户无感知的操作

>[VKSafariDomainBridge Github地址](https://github.com/Awhisper/VKSafariDomainBridge)

>按理说整个流程应该分为2部分

>- wap页面功能：
	- 用户浏览wap页的存cookie （wap地址1，用户访问用的）
	- 隐藏safari浏览的读cookie页面（wap地址2，静默代码访问用的）
	- 隐藏safari跳转openurl功能
>- app内功能：
	- 打开隐藏safari
	- 收听openurl的回调，处理数据
	- 关闭隐藏safari

>鉴于实在是不会h5相关的开发，所以我封装的工具就只包含app内的功能

>```objectivec
//初始化 VKSafariDomainBridge
NSURL *url = [NSURL URLWithString:@"wap地址2，静默代码访问用的url"];
NSString *key = @"xxkey"
[VKSafariDomainBridge VKSetupSafariBridgeUrl:url AndKey:key];
```
>url的地址就是`wap地址2，静默代码访问用的`
key作为协议识别关键字，隐藏safari发起的跳转，通过这个key识别，才会走入VKSafariDomainBridge的处理逻辑，如果是其他正规渠道的openurl跳转，key不匹配，便直接走正常逻辑，不会进行VKSafariDomainBridge处理

>想要获取wap用户数据的时候

>```objectivec
[[VKSafariDomainBridge VKSingleton]VKGetSafariInfo:^(BOOL success, NSString *info) {
        NSLog(@"%@ status = %@",info,@(success));
}];
```
>通过回调，如果成功success会返回YES，并且整个跳转含有数据的url会被转成string，通过block返回，如果失败，则会返回NO

>## 代码分析

>这个功能需要通过appdelegate的openurl回调来实现，既然是封装工具，就要做到无侵入性，写成category形式，只要使用者导入工程，便可以一行代码不需要写，自动生效。

>`application:openURL:options:`这个方法，如果开发者没有在工程中用到，我会自动添加，保证了openurl回调可以正常工作。

>如果开发者已经在工程中使用，已经有很多使用者自己的openurl协议要处理了，那么我的category会生成一个新方法，交换掉老的系统函数（MethodSwizzling），先判断url协议里是否含有上面提到的专属`Key`，含有则走我的处理逻辑，如果不含有，调用老函数，保证原项目功能无异常。

```objectivec
SEL origSelector = @selector(application:openURL:options:);
SEL newSelector = @selector(vkApplication:openURL:options:);
    
Method origMethod = class_getInstanceMethod(class,origSelector);
    
if (!origMethod) {
    SEL emptySelector = @selector(vkEmptyApplication:openURL:options:);
    Method emptyMethod = class_getInstanceMethod(class,emptySelector);
    IMP emptyImp = method_getImplementation(emptyMethod);
    class_addMethod(self, origSelector, emptyImp,
                    method_getTypeEncoding(emptyMethod));
}
    
origMethod = class_getInstanceMethod(class,origSelector);
Method newMethod = class_getInstanceMethod(class,newSelector);
if (origMethod && newMethod) {
    method_exchangeImplementations(origMethod, newMethod);
}
```

>接下来就是打开一个透明safari，等待来自网页的openurl跳转。制作透明safari的方法就是new出来后，alpha改为0，直接present。

```objectivec
-(void)VKGetSafariInfo:(VKSafariReturn)rtBlock
{
    if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 9.0) {
        if (rtBlock) {
            self.rtblock = rtBlock;
            
            SFSafariViewController *safari = [[SFSafariViewController alloc]initWithURL:self.safariUrl];
            safari.delegate = self;
            safari.modalPresentationStyle = UIModalPresentationOverCurrentContext;
            safari.view.alpha = 0.0f;
            self.safari = safari;
            
            UIViewController *currentVC = [self getCurrentVC];
            self.currentVC = currentVC;
            [currentVC presentViewController:safari animated:NO completion:nil];
        }
    }else
    {
        if (rtBlock) {
            rtBlock(NO,nil);
        }
    }
    
}
```

>当透明safari加载完毕后，略微延迟后直接销毁safari，如果在延迟期间，openurl返回则判断，取cookie数据成功，回调成功，如果超时，就判断取cookie数据失败，回调失败。

>此处是SFSafariViewController的delegate回调

```objectivec
-(void)safariViewController:(SFSafariViewController *)controller didCompleteInitialLoad:(BOOL)didLoadSuccessfully{
    __weak typeof(self) weakself = self;
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(self.timeOut * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [weakself.currentVC dismissViewControllerAnimated:NO completion:^{
            weakself.safari = nil;
            weakself.currentVC = nil;
        }];
        [weakself VKTimeOut];
    });
}
```

>openUrl的逻辑就不细说明了。