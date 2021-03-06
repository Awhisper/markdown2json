---
title: iOS上的CSS样式协议 VKCssProtocol
date: 2016-11-01 16:23:35
categories: 工具代码
tags: [Github,CSS,Hybrid]
---


# CSS产生的想法

早先，写过一阵子RN，前一阵子写微信小程序，深深地觉得CSS这个东西写起来很爽，样式与界面完全隔离，写好一套一套的样式`CSS Class`然后，在写界面HTML的时候直接对界面元素，无论是什么HTML标签，什么控件，只要指定`CSS Class`的名字就能自动生效。

- 样式和界面完全隔离解耦
- 样式之间可以自由任意排列组合创建新CSS Class
- 对任意界面元素指定样式Class名就能自动生效

__客户端场景__

- UI出App设计图也会有一套标准UI库
- 不同的底色，字号，字色，圆角，字体，阴影等等样式属性相互组合
- UI有时候更换整体设计风格的时候，所有项目中用到的标准组件，应该随着UI设计一起变为最新的设计效果
- 标准UI库扩展延伸一下，就是客户端主题风格，换肤等系统

__工厂模式__

看到上面的设计需求，相信很多人第一时间想到的都是客户端里构建一套工厂模式

- 由工厂模式统一生成UI设计的标准控件
- 所有需要使用标注控件的地方都用工厂去生成
- 当UI需要整体修改样式属性，修改工厂模式的构造方法就能实现整体应用新效果

我不是很喜欢这种模式

- 写法不统一，必须让使用者使用工厂的构造方法来创建标准UI，非标准UI写法就随意了
- 耦合性比较强，必须引入工厂模块

__Css样式,Protocol协议__

- 希望引入Css的样式思想，让样式与界面分离
- 将UI给的统一标准设计图，专心的写成`.css`文件
- 可以动态下发，可以动态替换，动态更新效果。
- 希望像iOS Protocol协议那样工作
- 不管控件是Label Button Image View，CSSClass都可以直接指定一个协议名字，样式功能就自动生效
- 不管控件是用工厂创建的，还是Xib拖线的，还是手写代码写的，都能无缝接入这个cssprotocol
- `xxview.protocol = "cssclassname1 cssclassname2"` 这种感觉
- 协议可以同时指定多个样式，以空格区分，样式之间自由组合

__我不想动态修改界面元素布局，动态创建全新的界面__

大家都知道，CSS有一个很大的用途就是用于界面布局，并且css的布局写法和iOS原生的布局写法有很大的区别，所以在这里我想强调一点，我这里写的cssprotocol，不想包含任何跟布局有关，只是单纯的动态配置外观样式，丝毫不影响布局。

原因是，项目里总会存在着各种各样的布局方式，有frame布局，有masonry autolayout，也有XIB拖线autolayout，我希望我写的东西能让使用的人很快的在自己项目里接入，而不是一下删掉旧的布局方案，全都替换成我的。

我希望使用者直接在现有的代码里，无论是哪种方式实现的界面，取到UIView，直接指定cssprotocol，就自动样式生效了，不要让使用者需要大规模改动现有代码。

同理，我也没想让这一套能够动态的创建UI，真要动态创建原生UI，直接用samurai reactnative weex好了。

还原我的初衷，我还是希望原生开发者能在不改变自己的项目的情况下，很快的接入这个工具，对于主题样式能够控制的更灵活和方便。

>题外话：
>
>我就很不喜欢ASDK的设计，一整套异步渲染，flexbox页面布局，网络，缓存，滚动控制等等一堆完整解决方案杂糅在一起，让使用者的代价异常的高，哪怕提供了UIKit转ASNode的简单入口也无法改变这一笨重无比的事实
>
>其实ASDK每一个feature，单看源码，单独拆出来模块，学习思想，吸收进入自己的项目都是很好地。


# VKCssProtocol

[VKCssProtocol  Github地址](https://github.com/Awhisper/VKCssProtocol)

整个项目的代码，以及使用demo，都在上面

<!--more-->

这其实是一个为native开发准备的工具，是OC的代码，OC的实现，别被CSS的名字欺骗了╮(╯_╰)╭

对于这样的iOS客户端开发的场景，多少会有一定的帮助

- UI出App设计图有一套标准UI库，包括大中小标题，大中小按钮，bar配色，分割线等
- 每种标准样式都含有不同的底色，字号，字色，圆角，字体，阴影等等样式属性，属性之间相互自有组合
- UI有时候更换整体设计风格的时候，所有项目中用到的标准组件，应该随着UI设计一起动态生效为最新的设计效果
- 客户端主题风格切换，换肤等系统



# 基本用法
简单的看一个GIF吧，左边就是CSS代码，后续我会给出目前已支持的CSS列表，在这里写完后，右侧可以实时看到css效果，可以看到我准备了2个view样式，准备了2个文字样式，然后四个UI进行排列组合，任意交叉组合，实现各种灵活的设计

![gif](http://ww2.sinaimg.cn/mw1024/678c3e91jw1f9coq69wx5g20sb0i5wsf.gif)


__先在项目里创建.css文件__

然后在里面写Css代码，这里我粘个样例

```css
.commenView1{
    background-color:orange;
    border-top: 3px solid #9AFF02;
    border-left: 5px solid black;
}
.commenView2{
    background-color:#FF9D6F;
    border-color:black;
    border-width:2px;
    border-radius:15px;
}
.commenText1{
    color:white ;
    font-size: 20px ;
    text-align : right;
    text-transform: lowercase;
    text-decoration: line-through;
}
.commenText2{
    color:black ;
    font-size: 15px ;
    text-align : right;
    text-transform: uppercase;
    text-decoration: underline;
}

```

__在iOS项目代码里加载Css__

在didFinishLaunch or 某个你打算加载整体Css文件的位置

```objectivec
//先import 头文件
#import "VKCssProtocol.h"

//读取bundle中名为cssDemo的css文件
@loadBundleCss(@"cssDemo");
```

__对任意UI指定协议__

```objectivec
UILabel *btabc = [[UILabel alloc]initWithFrame:CGRectMake(20, 50, self.view.bounds.size.width - 40, 80)];
btabc.text = @"commenView1 commenText1";
[self.view addSubview:btabc];
    
UILabel *lbabc = [[UILabel alloc]initWithFrame:CGRectMake(20, 150, self.view.bounds.size.width - 40, 80)];
lbabc.text = @"commenView2 commenText1";
[self.view addSubview:lbabc];
    
UILabel *btabcd = [[UILabel alloc]initWithFrame:CGRectMake(20, 250, self.view.bounds.size.width - 40, 80)];
btabcd.text = @"commenView1 commenText2";
[self.view addSubview:btabcd];
    
UILabel *lbabcd = [[UILabel alloc]initWithFrame:CGRectMake(20 , 350, self.view.bounds.size.width - 40, 80)];
lbabcd.text = @"commenView2 commenText2";
[self.view addSubview:lbabcd];
```
上面的UI创建可以用任意方法创建，frame，autolayout，xib，随便创建

只需要对指定的UI对象，赋值cssClass属性，就可以指定css协议，就直接生效了，

```objectivec
btabc.cssClass = @"commenView1 commenText1";
lbabc.cssClass = @"commenView2 commenText1";
btabcd.cssClass = @"commenView1 commenText2";
lbabcd.cssClass = @"commenView2 commenText2";

```

可以对一个UI对象，指定多个cssClass协议，他们一起组合生效，优先级按最后生效的算

# 加载CSS的API

加载css主要依赖的是`VKCssClassManager`这个类，但提供了4个宏，可以快速方便的加载css

- `VKLoadBundleCss(@"cssDemo");`

加载bundle内文件名为cssDemo的.css文件

- `VKLoadPathCss(@"xxx/xxx.css");`

加载路径path下的css文件

- `@loadBundleCss(@"cssDemo");`

等同于VKLoadBundleCss，模拟了@语法糖

- `@loadPathCss(@"xxx/xxx.css");`

等同于VKLoadPathCss，模拟了@语法糖

>吐槽：
>
>模拟@selector()这种的OC语法糖的方案真TM坑爹
>
>凡是这种@loadBundleCss的宏，是无法获得xcode提供的代码自动补全的
>
>直接使用VKLoadBundleCss，是可以获得xcode代码自动补全的
>
>跟RAC的@strongify @weakify一样，无法获得代码自动补全
>
>这真的是一种只有装B，没球用的，看起来很pro的写法

# 指定cssClass

上面贴过代码，我对所有的UIView都扩写了一个category，里面新增了一个属性`cssClass`，对这个属性赋值，就相当于给这个UIView对象指定所遵从的cssClass协议，可以同时指定多个cssClass协议，用空格分开。

一个cssClass其实是一系列样式属性style的集合，将这一系列样式属性组合在一起，起个名字就是cssClass了，样给一个UI指定了cssClass就相当于一组style都生效了。

```objectivec
btabc.cssClass = @"commenView1 commenText1";
lbabc.cssClass = @"commenView2 commenText1";
btabcd.cssClass = @"commenView1 commenText2";
lbabcd.cssClass = @"commenView2 commenText2";
```

# 指定cssStyle
如果使用者并不打算专门写一个cssClass，只是打算简单的使用这个工具给一个ui赋值一个或几个style，这也是支持的（嗯，常规的html组件也是可以写class属性和style属性的嘛）

```objectivec
btabc.cssStyle = @"background-color:black border-color:black";
```

我扩写的category里，还新增了一个属性`cssStyle`，对这个属性赋值，就相当于给这个UIView对象不创建一个cssClass，直接写一个或多个style使之生效

相当于你把一个或多个style写法，用空格分开，直接赋值给cssStyle即可

# 目前支持的style

- `background-color:orange;`View的背景色样式，冒号后是颜色参数，可以直接输入颜色英文or #ffffff这样的十六进制色值

- `color:#ffffff`如果含有文字，文字的颜色，冒号后是颜色参数，可以直接输入颜色英文or #ffffff这样的十六进制色值

- `font-size: 20px ;`如果含有文字，文字的字体大小，冒号后面是字号参数

- `border-color:red`View的边框颜色，等同于layer.borderColor，冒号后是颜色参数，可以直接输入颜色英文or #ffffff这样的十六进制色值

- `border-width: 2px`View的边框宽度，等同于layer.borderWidth，冒号后是宽度参数

- `text-align: center`如果含有文字，文字的左右居中对齐，等同于TextAlignment，参数可以输入left center right justify

- `border-radius: 2px`View的边框圆角，等同于layer.cornerRadius，冒号后面是半径参数

- `text: abcdefg`如果含有文字，文字的内容，后面参数是字符串

- `font-family: fontname`如果含有文字，文字的字体，等同于UIFont fontWithName的name，也可以直接输入systemFont，boldSystemFont，italicSystemFont三个快捷输入

- `background-image: imagenamed`如果含有image，image的名字，等同于UIImage的imageNamed的name

- `text-shadow: 2px`如果含有文字，文字的阴影宽度，后面是数字参数

- `text-transform:uppercase`如果含有文字，文字的变化，包含uppercase，lowercase，capitalize三个值，全小写，全大写，首字母大写
- `text-decoration:underline`如果含有文字，文字加特殊处理，包含underline，line-through两个值，下划线，删除线
- `border-top: 3px solid #9AFF02`对UIView进行上右下左的单独边线处理，这个值是上边线，第一个参数是宽度，solid后面是颜色
- `border-right: 3px solid #9AFF02`对UIView进行上右下左的单独边线处理，这个值是右边线，第一个参数是宽度，solid后面是颜色
- `border-bottom: 3px solid #9AFF02`对UIView进行上右下左的单独边线处理，这个值是下边线，第一个参数是宽度，solid后面是颜色
- `border-left: 3px solid #9AFF02`对UIView进行上右下左的单独边线处理，这个值是左边线，第一个参数是宽度，solid后面是颜色

# 支持灵活扩展

上面提到的每一个style都是一个模块化组件，如果希望扩展新的style，只需要遵循并且实现模块化协议即可轻松地在整个框架里，加入全新的style模块

以`background-color`这个style模块为例

随便新建一个继承自NSObject的类，让这个类遵从`<VKCssStyleProtocol>`协议

```objectivec
#import <Foundation/Foundation.h>
#import "VKCssStylePch.h"

@interface VKBackgroundcolorStyle : NSObject<VKCssStyleProtocol>

@end
```

然后在.m文件实现里，先使用`VK_REGISTE_ATTRIBUTE()`宏向框架注册，然后必须实现2个类方法协议

- +styleName: 实现这个协议决定于你写css的时候冒号前的名字
- +setTarget: styleValue: 实现这个协议决定于你如何解读css里面冒号后面的参数，并且处理传入的target，也就是目标UIView

```objectivec
@implementation VKBackgroundcolorStyle

VK_REGISTE_ATTRIBUTE()

+ (NSString *)styleName{
    return @"background-color";
}

+ (void)setTarget:(id)target styleValue:(id)value{
    UIColor *color = [value VKIdToColor];
    if ([target isKindOfClass:[UIView class]]) {
        [(UIView *)target setBackgroundColor:color];
    }
}

@end
```

# 动态更新样式

`VKCssClassManager`这个类负责管理所有的css样式表，我们希望这个css文件就好像配置表一样，可以动态下发，这样在未来发版之后，也能改变app的主题样式，自然就需要一套刷新机制

```objectivec
+ (void)readBundleCssFile:(NSString *)cssFile;

+ (void)readCssFilePath:(NSString *)cssFilePath;

+ (void)reloadCssFile;

+ (void)clearCssFile;
```

上面是`VKCssClassManager`的接口，由于bundle里的css文件是不可更新的，因此刷新机制与readBundleCssFile没啥关系，只有通过readCssFilePath路径加载的刷新机制才有意义

- reloadCssFile 的用处就是沿着原路径重新加载css，使用场景是新的css覆盖了旧CSS路径不变，在reloadCssFile的时候会自动触发clearCssFile;
- clearCssFile 的用处是让cssClassManager清空目前所管理的所有class；
- 在不直接使用reloadCssFile的情况下，可以先执行clearCssFile，再执行readCssFilePath，从而实现清空css后加载新路径的css文件

# HotReloader

大家在Gif里看到了像playground一样，无需编译和重新运行，每改一行代码，界面就立刻实时生效的效果，主要是额外写了一个插件`HotReloader`

由于HotReloader的设计初衷是给调试，高效的实时看效果用的，因此整个HotReloader通过编译控制，所有函数只有在模拟器编译的情况下才有效，真机下HotReloader回自动失效

这个HotReloader不是必须的，你完全可以不使用它，整个CssProtocol一样可以work

想要使用它需要先import头文件`#import "VKCssHotReloader.h"`，然后在准备加载Css的地方用预编译控制，控制模拟器下加载css的代码变为hotReloader监听Css

```objectivec
#if TARGET_IPHONE_SIMULATOR
    //playground调试
    //JS测试包的本地绝对路径
    NSString *rootPath = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"projectPath"];;
    NSString *cssPath = [NSString stringWithFormat:@"%@%@", rootPath, @"/cssDemo.css"];
    
    [VKCssHotReloader hotReloaderListenCssPath:cssPath];
#else
	VKLoadBundleCss(@"cssDemo");
#endif
```

这个绝对路径一定要填Mac的磁盘文件路径哟，用过JSPatchPlaygroundTool的一定不会陌生

做完这件事之后还要注意2个事情

- 在你打算开启调试的地方调用`[VKCssHotReloader startHotReloader];`（比如某个界面的ViewDidLoad）
- 在你打算停止调试的地方调用`[VKCssHotReloader endHotReloader];`(比如某个界面的dealloc)

为什么要这么做，因为一旦当你startHotReloader的时候，所有进行过cssClass，cssStyle设置的view都会被建立一个监听，因此会造成View对象的额外持有导致的不释放，因此当你不打算HotReload了就要关闭这个监听endHotReloader


__因为这样的设计有可能造成使用不当的内存Leak，所以对HotReloader的所有代码都进行了编译控制，只有模拟器下才会工作，真机orRelease包下，无论你怎么忘记写endHotReloader都不会造成Leak__


# 补充

整个结构大体如这样，采用模块化的设计之后，就是有需求完全按着自己的意愿任意扩充新支持的style属性了。

不过有一点要补充的是

由于最近比较忙，这玩意都拖了半个月才凑合写完，我目前已经支持的很多属性，其实实现并不是很优雅

比如

- border-top 
- border-bottom
- border-right
- border-left
- font-weight

四边独立边线凑合用比较low的方法做了，只是图快，以后这四个模块还得再好好雕琢一下

字体加重这个模块，用的stroke结果会把字体变镂空，反正没啥工夫好好细弄一下

后续我还打算做 四个角不同弧度的圆角属性

总之，这玩意还会不断完善补充
