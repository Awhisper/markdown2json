---
title: 动态界面：DSL&布局引擎
date: 2017-05-01 13:46:55
categories: 技术感悟
tags: [排版,布局,DSL]
---

# Jasonette 与 Tangram

很早的时候火了一阵子[Jasonette](https://github.com/Jasonette/JASONETTE-iOS)，打出来的宣传语是用json写出纯native的app(牛皮其实有点大，其实只是写动态界面，完全不是写动态App)。

前一阵子，天猫又开源了跨多个平台的[Tangram](http://tangram.pingguohe.net/)，一套通用的UI解决方案，仔细阅读文档我们会发现，他们也是在用json来实现这套七巧板布局。一套灵活的跨平台的UI解决方案。

Jasonette的牛皮其实有点大，很多人看到动态用Json写出纯native的app，就很激动，仿佛客户端也能有H5那样的能力，但其实他只是focus在解决app中的界面的问题。Tangram的定位就很精准了，是一套为业务出发的通用跨平台UI解决方案，把布局渲染性能与多段一致性考虑在框架内的UI框架。这二者有个共同点都是用json来描述界面与内容，从而用native进行呈现，json这种数据是一种天然便于下发与动态更新的数据，因此这些其实都能让客户端做到类似H5网页一样的赶脚。虽然没有使用WebView，但他们的设计思路和网页技术的发展历史如出一辙，因此[@响马](http://www.weibo.com/xicilion)大叔说过"这其实是最纯正的网页技术，虽然他是native的"。

顺着这个话题继续问几个问题

- DSL

为什么Jasonette与Tangram都是用json？

- 布局排版

为什么Jasonette写出来的json有些属性看着很像css？`padding` & `align`（拿Jasonette举例）

- 渲染

Jasonette调用UIKit进行渲染，H5用WebView渲染，所以Jasonette就叫native？

# 从DSL说起
<!--more-->

DSL 是 Domain Specific Language 的缩写，意思就是特定领域下的语言，与DSL对应的就是通用编程语言，比如Java/C/C++这种。换个通俗易懂的说法，DSL是为了解决某些特定场景下的任务而专门设计的语言。

举几个很著名的DSL的例子

- 正则表达式

通过一些规定好的符号和组合规则，通过正则表达式引擎来实现字符串的匹配

- HTML&CSS

虽然写的是类似XML 或者 .{} 一样的字符规则，但是最终都会被浏览器内核转变成Dom树，从而渲染到Webview上

- SQL

虽然是一些诸如 create select insert 这种单词后面跟上参数，这样的语句实现了对数据库的增删改查一系列程序工作

计算机领域需要用代码解决很多专业问题，往往需要同时具备编码能力以及专业领域的能力，为了提高工作于生产效率，需要把一些复杂但更偏向专业领域的处理，以一种更简单，更容易学习的语言或者规范（即DSL），抽象提供给领域专家，交给不懂编码的领域专家编写。

然后代码编程能力者通过读取解析自己定制出来的这些语言规范，来领会领域专家的意图，最终转化成真正的通用编程语言代码实现，接入底层代码框架，从而实现让领域专家只需要学习更简单的DSL，就能影响代码程序的最终结果。

（虽然DSL的原始定义是为了非编程的专业领域人才使用，但到后来直接交给程序员使用，但能大幅度提高程序员编写效率的非通用语言，也被当做是DSL的一种）

## DSL在设计上的应用

设计师会设计出很多精美的界面，最后交给程序员去用代码编写成漂亮的网页或者App。每个界面如果纯用代码编写，都会面临大量的代码工作量，这里面可能更多的是一些重复的机械性的代码工作。诸如：某个元素设置长宽，设置居中，设置文字，设置距离上个元素XX像素，N个元素一起纵向，横向平均排列等等。对于代码实现界面开发来说，程序员需要编写一系列诸如：setFrame,setTitle,setColor,addSubview这样的代码，一边写这样的代码，一边查阅设计师给出的各种标注。

为了提高工作效率，如果能把一些设计师产出的`长宽`，`色值`，`文字`，`居中`，`距上`等设计元数据（设计的标注信息等），以一种约定的简洁的语言规则（即DSL）输入给程序代码，由程序和代码自动的分析和处理，从而生成真正的界面开发代码setFrame,setTitle,setColor,addSubview,这样就可以大幅度的减少代码量与工作量，程序员来写这种简洁的语法规则会更快更高效，甚至可以把这种简洁的语法规则教会设计师，让设计师有能力直接写出DSL，然后输入给底层程序，这样界面就自然完成。

做iOS客户端开发的同学有兴趣可以用文本编辑器打开以下XIB文件，你会看到我们拖来拖去拖线出来的Xib，其实就是XML语法，而Jasonette就是Json语法，他们用XML/JSON这种通用的结构化语法来存储这些设计数据，用一些自定义的标签，来标记这些数据的用途，XIB/JSON经过解析后就会生成签到字典的树状结构，因此代码就可以进行遍历执行，从而转变成最终的UIKit的渲染代码。

HTML/CSS，是网页开发普遍使用的，他们也是一种DSL，你写出的每一个HTML的DIV以及CSS的属性样式，最后都不是通过.html .css文件渲染到屏幕到浏览器上的，都是通过浏览器内核最后调用OpenGL，C++代码渲染上去的。从这个层面讲，Jasonette客户端框架用的json，native客户端开发的XIB，与网页浏览器的HTML/CSS是一回事。

XIB的XML代码其实也一般不会交给设计师去学习和掌握，但是在XIB的XML基础之上，制作出一个InterFaceBuilder，可以让设计师用图形界面拖来拖去，这种UI编辑器式的设计其实都离不开DSL，都是规划出了一种比通用代码语言更简洁的DSL后，再辅助开发界面编辑器生成这种简洁DSL来实现的。


## Jasonette里的json如何工作

扯淡了这么多，亲自看看Jasonette源码是如何执行DSL的。

```json
{
  "$jason": {
    "head": {
      "title": "{ ˃̵̑ᴥ˂̵̑}",
      "actions": {
        "$foreground": {
          "type": "$reload"
        },
        "$pull": {
          "type": "$reload"
        }
      }
    },
    "body": {
      "header": {
        "style": {
          "background": "#ffffff"
        }
      },
      "style": {
        "background": "#ffffff",
        "border": "none"
      },
      "sections": [
        {
          "items": [
            {
              "type": "vertical",
              "style": {
                "padding": "30",
                "spacing": "20",
                "align": "center"
              },
              "components": [
                {
                  "type": "label",
                  "text": "It's ALIVE!",
                  "style": {
                    "align": "center",
                    "font": "Courier-Bold",
                    "size": "18"
                  }
                },
                {
                  ......省略
                }
              ]
            },{
                ......省略
            },
            {
              "type": "label",
              "style": {
                "align": "right",
                "padding": "10",
                "color": "#000000",
                "font": "HelveticaNeue",
                "size": "12"
              },
              "text": "Watch the tutorial video",
              "href": {
                "url": "https://www.youtube.com/watch?v=hfevBAAfCMQ",
                "view": "Web"
              }
            }
          ]
        }
      ]
    }
  }
}

```

>这是demo里的页面json代码，你会看到很多很像网页开发的东西，head，body，padding，align等等，是不是觉得和CSS很像

这个demo写的json文件其实就是一个helloworld界面，里面有一些按钮，点击可以跳转，还有一些图片，我先简单介绍一下Jasonette DemoApp的启动流程

- Application didFinishLaunchingWithOptions

程序初始化，触发`[[Jason client] start:nil]`，初始化Jason，在这个start里面，会创建JasonViewController，并且给这个VC设置rootUrl，设置这个VC作为Window的Key，从而进行App展现

- VC viewWillAppear

这个KeyVC，当viewWillAppear的时候，触发[`[Jason client] attach:self]`，这个函数内会调用`[self reload]`来进行网络数据拉取，刚刚说的rootUrl其实是一个json网络文件（也可以设置成bundle内文件），换句话说这个vc的json文件可以每次从网络上拉取最新的json文件来实现动态更新的（跟网页实际上是一样的），这个过程就是触发网络框架AF去拉取最新的json

- AFNetworking download

在网络数据拉取回来后，会经过一系列的处理，包括请求异步的其他相关json（像不像异步请求其他css），把请求到的json字典经过`JasonParser`这个类的一些其他处理最后生成最终的`Dom字典`（Dom这个词写在Jason drawViewFromJason的源码里，源码就将这个数据字典的变量起名叫dom，可见他做的和网页工作原理是一个思路）

- Jason drawViewFromJason 进行主线程渲染

找到Jason类的`drawViewFromJason:`函数，这才是我们DSL之所以能渲染成界面的最重要的一步，前面都是一直在下载DSL，处理DSL，结果就是json生成了最终需要的元数据字典--Dom字典，这一步就是将DSL转变成App界面


__Dom字典生成界面的过程__

简单的看看这个流程都分别依次调用了哪些函数，不一一讲解了，最后我们挑最有代表的进行说明。

- [Jason drawViewFromJason:DomDic]

- [JasonViewController reload:DomDic]

- Set Stylesheet //CSS

- [JasonViewController setupSections:DomDic]

- [JasonViewController setupLayers:DomDic] 

setupSections与setupLayers基本上涵盖了页面主元素的所有渲染方式

先以简单的setupLayers的代码逻辑举例，先按着约定的标签从Dom字典中有目的的读取需要的数据字段Layers，循环遍历Layers字段数组下的所有数据，每一次都先判断子节点的Type属性，如果Type写了Image，就会创建UIImageView，如果Type写了Label，就会创建UILabel，根据子节点其他属性一一设置不同的UIView的属性，最后AddSubview到界面上。（我会略过大量实际代码，以伪代码形式进行说明，实际代码可以看源码查看）

```objectivec
NSArray *layer_items = body[@"layers"];
NSMutableArray *layers = [[NSMutableArray alloc] init];
//循环遍历Dom树下的layer字段
if(layer_items && layer_items.count > 0){
    for(int i = 0 ; i < layer_items.count ; i++){
        NSDictionary *layer = layer_items[i];
        layer = [self applyStylesheet:layer];
        //设置Css
        
        //判断type字段是否为image，是否有image url
        if(layer[@"type"] && [layer[@"type"] isEqualToString:@"image"] && layer[@"url"]){
            
            //NEW一个UIImageView

            //设置UIImageView的style

            //设置UIImageView的 image URL

            //将UIImageView Add subview

            //异步拉取图片回来后，通过style，运算UIImageView的frame
            
            
        } 
        //判断type字段是否为label，是否有text
        else if(layer[@"type"] && [layer[@"type"] isEqualToString:@"label"] && layer[@"text"]){

            //NEW一个TTTAttributedLabel
            
            //设置TTTAttributedLabel的style

            //设置文本

            //addSubview
        }
    }
}
```

再说说setupSections，他其实充分利用了tableview的能力，首先将Dom字典下的`sections`字段进行保存与整理，然后并不立刻进行渲染，而是直接调用`[UITableview reloadData]`，触发`heightForRowAtIndexPath`与`cellForRowAtIndexPath`。（我会略过大量实际代码，以伪代码形式进行说明，实际代码可以看源码查看）

heightForRowAtIndexPath获取cell高度

```objectivec
//取出indexPath.section对应的dom节点数据
NSArray *rows = [[self.sections objectAtIndex:indexPath.section] valueForKey:@"items"];
//取出indexPath.row对应的dom节点数据
NSDictionary *item = [rows objectAtIndex:indexPath.row];

//取出样式属性
item = [JasonComponentFactory applyStylesheet:item];
NSDictionary *style = item[@"style"];

//通过JasonHelper传入style[@"height"]样式属性计算宽高
//一些样式算法算出
return [JasonHelper pixelsInDirection:@"vertical" fromExpression:style[@"height"]];
```

cellForRowAtIndexPath获取cell

```objectivec
NSDictionary *s = [self.sections objectAtIndex:indexPath.section];
NSArray *rows = s[@"items"];
//获取对应的Dom节点数据
iNSDictionary *item = [rows objectAtIndex:indexPath.row];
//渲染竖着滑的CELL
//只支持SWTableViewCell这一种客户端预先写好的这种通用cell
//支持Dom节点循环内嵌stackview，按着内嵌形式，横竖布局都支持
//stackview内的子元素通过JasonComponentFactory创建对应的UIKit UIView
//创建方式如同layer，判断type等于'image'创建UIImageView，判断等于'text'创建UILabel
//frame通过style等字段，进行系统autolayout计算
return [self getVerticalSectionItem:item forTableView:tableView atIndexPath:indexPath];
```

上面讲的其实力度很粗，并且很多代码没有详细展开，其实目的是让大家发现，Jasonette的源码持续在干一件事情：

- 从Dom字典中，读取约定好的固定字段

- 循环遍历Dom字典，遍历所有设计数据

- 然后用字符串匹配去判断每个节点的key与值，指引OC代码应该怎么调用

    - 匹配出label就创建UILabel

    - 匹配出iamge就创建UIImageView

    - 匹配出style就调用autolayout赋值属性进行autolayout计算，或者进行自行算法计算。

Jasonette的DSL工作特点就是这样，先从设计师给出的元数据入手，把所有的元数据抽象抽离出来，约定成固定的标签与值，然后客户端一一遍历整个Dom元数据的节点，一一解读这些标签与值，走入对应的客户端代码，从而调用对应的客户端代码功能。

客户端的这套框架写完之后，以后在写全新的界面，其实是无需再重复写一套客户端代码，而是直接写全新的DSL也就是Jasonette的json文件就可以了。

## DSL小结

拿JSON/HTML/CSS举例子其实，这些都是一种`外部DSL`，与之对应的还有某些语言支持的`内部DSL`，这里也就不展开了

[Never's Blog 外部DSL的实现](http://xfhnever.com/2014/08/08/dsl-implementouter/)

>XML DSL
>很多常见的XML配置文件实际上就是DSL，但不是所有的配置文件都是DSL。比如“属性列表”和DSL是不同的，那只是一份简单的“键-值对”列表，可能再加上分类。
>XML不是编程语言，是一种没有语义的语法结构。XML是DSL的承载语法，但是它又引入了太多语法噪音—太多的尖括号、引号和斜线，每个嵌套元素都必须有开始标签和结束标签。
>自定义的外部DSL也带来了一个烦恼：它们处理引用、字符转义之类事情的方式总是难以统一。

所以DSL叫特殊领域语言，离开了为某一DSL专门开发的语言环境或者代码框架，DSL是无法运行的，没有效果的，没有正则表达引擎的源码，你写出来的正则表达式没人认识。没有底层数据库框架，sql语句就只是一行字符串，没法进行数据管理。没有Jasonette这个框架，你写出来json也不可能生成界面，有了Jasonette这个框架，你不按着约定的标签写，自己单纯的在json里凭空创建标签，也是不可能正确生成你想要的东西。

>在最后，笔者想说的是，当我们在某一个领域经常需要解决重复性问题时，可以考虑实现一个 DSL 专门用来解决这些类似的问题。

>from [谈谈 DSL 以及 DSL 的应用](http://draveness.me/dsl.html)


# 布局与排版

既然说到动态界面，那一定得聊屏幕适配，这其实不管是不是动态界面，不管用不用到DSL，做客户端都要考虑的一点，其实网页在这方面发展的更完善，毕竟客户端的屏幕尺寸就那么几种，就算安卓碎片化，也比不上PC电脑上，桌面浏览器用户可以任意伸缩窗口的大小，因此对于在不同尺寸的限定屏幕大小（即排版区域）内，把设计出来的元素以最美观的形式进行展现，这就是布局与排版。

刚才在讲解DSL，讲解Jasonette的时候其实回避一些问题，我们光提到了通过Dom的type信息，来创建不同的UIView，但是每一个UIView应该摆放在屏幕的什么位置，在哪进行展现，在上面的文章中被一带而过，有的描述，读取style字段后分别赋值给对应的autolayout，有的被我说成了进行一定的算法从而算出高度。这背后其实都是布局与排版的算法。

做iOS客户端的同学很多会有感触，早些年的时候写绝对坐标，那时候iOS的屏幕尺寸还不是太多，用代码手写frame进行元素定位，试想一下如果纯用frame进行app开发，那么去开发一套对应的DSL动态界面其实更容易，我们只需要给每个字典节点，规定上{x:N,y:N,w:N,h:N}的属性，然后在框架里别的跟布局相关的style都不需要写了，只需要用xywh生成CGRect，然后调用setFrame就好了，想开发出这样一种绝对布局的`动态界面框架`其实还真是挺简单的。

到后来有了iPad，有了iPhone5，有了iPhone6，6Plus，iOS的屏幕尺寸变的碎片化，如果继续使用frame，客户端同学开发工作量会变的异常繁琐，于是在IOS7引入了苹果的autolayout，引入了VFL语言Visual Format Language。其实VFL也应该算是一种DSL吧，他不是用来绘制出一个个的界面元素，而是用来在绘制前，计算清楚每一个元素在动态的屏幕区域下的最终位置。我们学会了如何写VFL，或者说我们学会了如何用masnory这个框架实现autolayout，但我们并不需要深入去了解这里面的排版布局算法。

需要记住的一点是，最终渲染一定是通过frame去页面上进行绘制，有了明确的坐标才能绘制出UI，手写frame式的绝对布局代码，直接由程序员指定，因此一定是性能开销最小的，可以说没有或者少量的布局运算开销直接进行渲染，但在多屏适配的需求下才引入了一整套庞大的布局算法体系（不一定非得是苹果的autolayout），引入庞大布局算法的目的是希望根据可排区域动态的计算frame，但并不代表采用自动布局，就与frame无关，自动布局算法只是间接的运算出frame再渲染。

## 布局排版的流程图

- RenderTree parse
    - 浏览器内核的方案是
        - 解析HTML，生成Dom
        - 解析CSS，生成style rules
        - attach Render Tree CSS与HTML挂载到一起
    - Jasonette的方案是
        - 反序列化Json，直接生成Dom字典
- RenderTree layout
    - 从RenderTree RootNode 遍历
    - 不同节点对应调用不同layout算法
    - 运算出每个可显示界面元素的位置信息
- RenderTree render
    - 遍历Tree
    - 渲染

## 布局排版信息解析

- 浏览器解析HTML/CSS 生成RenderTree

将HTML文件以字符串的形式输入，经过解析，生成了Dom树，Dom树就好比是iOS开发里面页面View的层级树，但是每个View/div里面并没有css信息，只写了每个div所对应的css的名字

将CSS文件以字符串形式输入，经过解析，得到了一系列不同名字的style rules，样式规则

Dom树上的div并不包含样式信息，而是只记录了样式的名字，然后从style rules里找到对应名字的具体样式信息，Attech到一起，生成了Render Tree渲染树，此时的渲染树只是Dom与CSS的合并，他依然不包含真正可以用于渲染的位置信息，因为他还没经过布局排版。

- Jasonette直接生成RenderTree

网页将View的层级，与View的样式进行了分离，View就是HTML，样式是CSS，但是Jasonette的Json没有做这样的分离，Json直接描述的就是view与style归并到一起的数据，因此在Jasonette经过了parse解析后直接就拿到了样式与视图的合体结构信息。我们在Json里明显可以看到`head`,`footer`,`layers`,`sections`这种字段其实就是HTML里面的类似Dom的对象，而`style`这个字段其实就是CSS里面的对象。Jasonette的源码里直把这个字典起名叫 `NSDictionary * dom`，其实就可以感知到，虽然Jasonette使用的是json，但是他的思路跟浏览器内核是一样的。


- iOS autolayout的操作过程

当你使用代码执行addsubview的操作的时候，你其实就是在对一个view（一种节点），添加了一个子view（一个子节点），当所有subview添加完成的时候，你已经创建好了一个界面层级树，你addSubview一个子view以后，会对这个view要么设置VFL，要么使用masnory，总之会对这个view设置样式属性（其实就是在用oc代码，attach css），之后在`layoutIfNeeded`的时候，autolayout开始自己闷头计算排版

换句话说iOS autolayout与HTML/CSS在解析上的区别是，iOS的布局是用代码写死的，生成一种界面层级树形结构，而网页HTML/CSS是用可随意下发的字符串，进行解析，从而生成了一种界面层级树形结构（RenderTree）

## 布局排版

无论使用的是网页，还是Jasonette，还是iOS autolayout，当我们拿到没有经过排版的Render Tree的时候，虽然里面的节点包含着样式信息，但是并没有具体的绘制位置信息，因此需要从Tree的根节点开始依次遍历每个节点，每个节点都根据自己的样式信息以及子节点的样式信息进行排版算法计算。

在排版引擎的设计模式里（一种设计概念，不是指具体某个排版源码实现），一个RenderTree上每一个节点是一种RenderNode，他可能是不同的界面元素，甚至是界面容器，每个RenderNode都可以有自己的layout()方法用于计算自己和自己的子节点的算法，一个position绝对布局的节点，他及内部的子节点布局算法layout()，肯定与一个listview，tableview那种有规律的排布容器节点布局算法layout()不一样，从根节点rootNode开始，循环遍历递归下去，直到把Tree上的所有节点的位置信息都运行了layout()，就完成了布局排版。

我们知道不同的节点，是可以用不同的算法进行他与内部子节点的布局计算的。

拿iOS开发举例子，我们完全可以同一个页面内，有的view是用frame方式写死的绝对布局，有的view是用masnory进行的autolayout，甚至父view是写死的绝对布局，子view是autolayou，或者反过来。

拿浏览器CSS来说，浏览器内核C++代码里一个RenderObject的基本子类之一就是RenderBox，该类表示遵从CSS盒子模型的对象，每一个盒子有四条边界：外边距边界 margin edge, 边框边界 border edge, 内边距边界 padding edge 与内容边界 content edge。这四层边界，形成一层层的盒子包裹起来。这种基础RenderBox有着自己的layout()算法。而在新的CSS里引入了更多不同的布局方式，比如运用非常广泛的Flexbox弹性盒子布局，Grid布局，多列布局等等。

![](http://my.csdn.net/uploads/201208/11/1344657195_1730.png)

在排版引擎的设计模式里，如果你想引入一种新的布局算法，或者一种新的专属布局效果锁对应的布局计算，你只需要创建一种新的RenderNode，并且实现这种node的layout()函数，你就可以为你的排版引擎，持续扩展支持更多的排版能力了


_Jasonette是怎么做的？_

_jasonette其实根本没自己实现布局算法，也没有抽象出renderNode这种树状结构，他直接用原始的Dom字典直接开始遍历递归。_

_遍历到layers节点，就调用`[JasonLayer setupLayers]`函数，内部是自己写的一套xywh的算法，有那么点像CSS盒子模型，但简单的多。_ 

_遍历到sections节点，就调用`[JasonViewController setupSections]`函数，走系统的tableview的reload布局，在heightforrow的时候，用自己的一套算法计算高度，而在cellforrow的时候，他使用系统stackview与系统autolayoutAPI进行设置，最后走系统autolayout布局_

_Jasonette的布局过程看起来很山寨，从设计上把Dom字典直接快速遍历，识别标签，用if else直接对接到不同的iOS代码里，有的布局代码是一些简单盒子运算，有的布局代码则是直接接入系统autolayout，可以看出来他从DSL的角度，多快好省的快速实现了一个界面DSL框架，但从代码架构设计的角度上，他距离完善庞大的排版引擎，从模块抽象以及功能扩展上，还欠缺不少。_


## 布局排版的几种算法

- 绝对布局

这就不说了，固定精确的坐标，其实不需要计算了

- iOS autolayout

> [从 Auto Layout 的布局算法谈性能](http://draveness.me/layout-performance.html)

> Auto Layout 的原理就是对线性方程组或者不等式的求解。

这篇文章写得非常非常清楚，我就不详细展开了，简单的说一下就是，iOS会把父view，子view之间的坐标关系，样式信息，转化成一个N元一次方程组，子view越多，方程组的元数越多，方程组求解起来越耗时，因此运算性能也会越来越底下，这一点iOS 的Auto Layout其实被广泛吐槽，广受诟病。

- CSS BOX 盒子模型

传统的CSS盒子模型布局，这个前端开发应该是基本功级别的东西，可以自行查阅

- FlexBox 弹性盒子

CSS3被引入的更好更快更强的强力布局算法FlexBox，因为其优秀的算法效率，不仅仅在浏览器标准协议里，被广泛运用，在natie的hyrbid技术方面，甚至纯native技术里也被广泛运用。

Facebook的ASDK也用的是Flexbox，一套纯iOS的完全与系统UIKit不同的布局方式

大前端Hybrid技术栈里，RN与Weex中都用的是FlexBox，阿里的另外一套LuaView用Lua写热更新app的方案也用的是FlexBox算法

[由FlexBox算法强力驱动的Weex布局引擎](http://www.jianshu.com/p/d085032d4788)

- Grid 布局

[网格布局（CSS Grid Layout）浅谈](https://fe.ele.me/wang-ge-bu-ju-css-grid-layout-qian-tan/)

[CSS布局模块](http://www.w3cplus.com/css3/css3-layout-modules.html)

Grid布局被正式的纳入了CSS3中的布局模块，但似乎目前浏览器支持情况不佳，看起来从设计上补全了Flexbox的一些痛点。

- 多列布局

[CSS布局模块](http://www.w3cplus.com/css3/css3-layout-modules.html)

CSS3的新布局方式，效果就好像看报刊杂志那样的分栏的效果。



# 渲染

经过了整个排版过程之后，renderTree上已经明确知道了每个节点/每个界面元素具体的位置信息，剩下的就是按着这个信息渲染到屏幕上。

- Jasonette

Jasonette直接调用的addSubview来进行view的绘制，Dom字典遍历完了，view就已经被add到目标的rootview里面去了，渲染机制和正常客户端开发没区别，完全交给系统在适当的时候进行屏幕渲染。

- ReactNative & Weex

[ReactNative iOS源码解析（二）](http://awhisper.github.io/2016/07/02/ReactNative%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%902/)

[Weex 是如何在 iOS 客户端上跑起来的](http://www.jianshu.com/p/41cde2c62b81)

这两个Link其实介绍了，RN与Weex也是通过addSubview的方式，调用原生native进行渲染，在iOS上来说就是addSubview

- WebKit

在绘制阶段，浏览器内核并不会直接使用RenderTree进行绘制，还会进一步将renderTree处理成LayerTree，遍历这个LayerTree，将内容显示在屏幕上。

浏览器本身并不能直接改变屏幕的像素输出，它需要通过系统本身的 GUI Toolkit。所以，一般来说浏览器会将一个要显示的网页包装成一个 UI 组件，通常叫做 WebView，然后通过将 WebView 放置于应用的 UI 界面上，从而将网页显示在屏幕上。但具体浏览器内核内部的渲染机制是怎么工作的有什么弊端，还取决于各个浏览器的底层实现。

[How Rendering Work (in WebKit and Blink)](http://blog.csdn.net/rogeryi/article/details/23686609)

从这里面可以详细看出来，浏览器内核的渲染其实是可以做到下面这些多种功能的，但不同平台，不懂浏览器内核的支持能力不同，不是所有的WebView或者浏览器App都是同样的性能与效果

- 直接调用平台的系统GUI API
- 设计自己的高效的Webview图形缓存
- 设计多线程渲染架构
- 融入硬件加速
- 图层合成加速
- WebGL网页渲染

仔细想想，真正到渲染这一步，你需要做的都是操作CPU和GPU去计算图形，然后提交给显示器进行逐帧绘制，webview与native其实殊途同归。

# native界面？动态？ 我们其实一直在聊的是浏览器内核技术

[@响马](http://www.weibo.com/xicilion)大叔说过"这其实是最纯正的网页技术，虽然他是native的"。

本文从Jasonette出发，从这个号称纯native，又动态，又用json写app的技术上入手，看看这`native`+`动态`的巨大吸引力到底有多神奇，挖下来看一看。

我们看到了和浏览器内核一脉相承的技术方案

- 通过DSL，下发设计元数据信息

- 构建Dom树

- 遍历Dom树，排版（计算算法与接入autolayout）

- 遍历Dom树，渲染（addsubview接入系统渲染）


## 浏览器内核

![](http://o8n2av4n7.bkt.clouddn.com/webkit.png)

Webkit浏览器内核就是按着这样的结构分为2部分

- WebCore 

绿色虚线部分是WebCore，HTML/CSS都是以String的形式输入，经过了parse，attach，layout，display，最终调用底层渲染api进行展现

- JSCore（本文之前一直没提）

红色部分是JSCore，JS以string的形式输入，输入JS虚拟机，形成JS上下文，将Dom的一些事件绑定到js上，将操作Dom的api绑定到js上，将一些浏览器底层native API绑定到js上


## 动态界面，其实就是浏览器内核的WebCore

整个WebCore不是一个虚拟机，他里面都是C++代码，因此HTML/CSS在执行效率上，从原理上讲和native是一回事，没区别。

而我们今天提到的动态界面，无论是Jasonette还是Tangram，甚至把xib或者storyboard动态下发后动态展示，用iOS系统API就完全可以做到动态界面（滴滴的DynamicCocoa里面提到把xib当做资源动态下发与装载），其实都和浏览器内涵的WebCore部分是一个思路与设计，没错。

- Jasonette的设计思路和HTML/CSS是一回事
- iOS的xib/storyboard的设计思路和HTML/CSS是一回事


## 动态界面，可以界面热更新，但不是app功能热更新

本文从开头到现在，重点围绕着WebCore的设计思路，讲了N多，但是看到Webkit结构图的时候，你会发现，有个东西我始终没提到过--JSCore，但我在开头提到了一句话

>Jasonette牛皮其实有点大，其实只是写动态界面，完全不是写动态App

`界面动态`这个词与`App功能动态`有什么区别呢？

一个APP不仅仅需要有漂亮的界面，还需要有业务处理的逻辑。

- 一个按钮点击后怎么响应？
    - 是否要执行一些业务逻辑，处理一些数据，然后返回来刷新界面？
    - 是否要保存一些数据到本地存储？
    - 是否要向服务器发起请求？
- 服务器请求回来后怎么做？
    - 是否刷新数据和界面？
    - 发现服务器接口请求错误，客户端做业务处理？

Jasonette号称是用json开发native app，但是json只是一种DSL，DSL是不具备命令和运算的能力的，DSL被誉为一种声明式编程，但这些业务逻辑运算，DSL这种领域专用语言是不可能满足的，他需要的是通用编程语言。

因此Jasonette对点击事件的处理，其实就是一种路由，json的对象里面有个标签约定为action，action的值是一个url字符串，url指向另一个界面的json文件，也就是说，DSL可以把这个view的点击事件写死，一旦发生点击，固定会跳转到url所指向全新的json页面，换句话说，这就是网页开发的url跳转`href`字段。

换个说法你就理解了，Jasonette在技术上相当于用iOS的native代码，仿写了一个处于刀耕火种的原始时代的浏览器内核思路，一个还没有诞生js技术，只是纯HTML的超文本链接的上个世纪的浏览器技术。那个时候网页里每一个超链接，点进去都是一个新的网页。

所以这不叫`App功能动态`，充其量只是`界面动态`。

JSCore的引入给浏览器内核注入了动态执行逻辑脚本代码的能力，先不说脚本引擎执行起来效率不如native，但脚本引擎至少是一个通用编程语言，通用编程语言就有能力执行动态的通用代码（JS/LUA等），通用代码比DSL有更强大的逻辑与运算能力，因此可以更加灵活的扩展，甚至还可以将脚本语言对接native，这就是webkit架构图里提到的jsbinding。

将脚本语言对接到本地localstorage，js就有了本地存储能力，将脚本语言对接到network，js就有了网络的能力，将脚本语言对接上dom api，js就有了修改WebCore Dom树，从而实现业务逻辑二次改变界面的能力。

因此ReactNative & Weex 可以算作`App功能动态`，他们不仅仅巨有WebCore的能力，同时还巨有JSCore的能力（这里面其实有个区别，浏览器内核的WebCore是纯native环境C++代码，不依赖js虚拟机，但RN与Weex负责实现WebCore能力的代码，都是js代码，是运行在虚拟机环境之下的，但他们的渲染部分是bridge到native调用的系统原生api，有兴趣看我写的RN源码详解吧，[ReactNative iOS源码解析（一）](http://awhisper.github.io/2016/06/24/ReactNative%E6%B5%81%E7%A8%8B%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90/)，[ReactNative iOS源码解析（二）](http://awhisper.github.io/2016/07/02/ReactNative%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%902/)）


阿里的LuaView我没细看过源码，但其实内部机制和RN&WEEX没啥区别，用的是FlexBox排版，但是选用的是Lua Engine这个脚本引擎，而非JSCore

>在native动态化的道路上，不论大家走哪条路，有一个共识还是大家都找到了的，那就是看齐Web的几个标准。因为Web的技术体系在UI的描述能力以及灵活度上确实设计得很优秀的，而且相关的开发人员也好招。所以，如果说混合开发指的是Native里运行一个Web标准，来看齐Runtime来写GUI，并桥接一部分Native能力给这个Runtime来调用的话，那么它应该是一个永恒的潮流。

>from [“站在10年研发路上，眺望前端未来”：读后感](http://awhisper.github.io/2016/06/16/%E5%89%8D%E7%AB%AF10%E5%B9%B4%E8%AF%BB%E5%90%8E%E6%84%9F/)


虽然有点扯远了，但是这句话确实又回到响马叔的那个思路，Jasonette用json写出native app，他的思路依然是web思路，RN用js写出native app，也不能改变他一整套web技术的基因。一个界面最终渲染是以native系统级Api实现，并不能说明什么，渲染只是庞大Web内核技术的末端模块，把末端渲染模块换成native的，其实说明不了什么。

## webview性能真的比native慢很多么？

这里就要强调一下了，浏览器内核在界面这块是纯C++实现，没有使用任何虚拟机，所谓的浏览器内核下的Dom环境是纯C++环境，也就是纯native环境，所以浏览器在单次渲染性能上，不见得比native慢。

CSS的布局排版兼容很多种布局算法，有些算法在保证前端开发人员以高素质高质量的开发前提下，同样的界面，其性能是完全可能碾压autolayout的，所以单说布局这块，webview也不见得慢。

webview的渲染的时候还存在很多异步资源加载，但这个问题是动态能力带来的代价，啥都远端实时拉最新的资源当然会这样，如果在App下以hybrid的形式，内置本地静态资源，通过延迟更新本地资源缓存的方式，设计hybrid底层app框架，那么这种开销也能减少。更何况浏览器新技术PWA也好SW也好都从浏览器层面深度优化了WAP APP的资源与缓存。

webview性能慢的原因很多，多方面综合来看确实很容写出性能不佳的页面，但话也不能绝对了，web技术所带来的灵活多变，是会给业务带来巨大收益的。在需要灵活多变，快速响应，敏捷迭代的业务场景下，web技术（泛指这类用web的思路做出来的范hybrid技术）所带来的优势也是巨大的


# 动态界面没那么神秘，意义并不在技术实现

Jasonette写了这么多，虽然没有深度剖析每一行源码，但把他的实现思路讲解了一下，其实自己实现一个动态界面也不是不可以。

我们的工作业务需要深度处理文字，我们也有一套跨平台的C++排版引擎内核，思路是一脉相承的，区别是文字排版会比界面区块盒子排版更复杂的多，用的也是json当做DSL，但是我们利用我们的文字排版引擎，去实现相对简单的各种在native系统上的什么图片环绕，图文绕排，瀑布流界面UI等，其实非常的容易，甚至还是跨平台的（比native代码实现要容易的多）。就连Jasonette代码里也就只支持section（tableview布局）和layer（盒子模型）2中常见形式，复杂页面一样实现不了。

但是！但是！但是！

DSL是领域专业语言，DSL就注定巨有着局限性，你为自己的排版引擎设计出一套DSL规则，就算都使用的是json，那又如何，新来的一个人能很快上手写出复杂页面？DSL的规则越庞大，引擎支持的能力越强，越代表着DSL的学习成本直线加大。

HTML/CSS已经发展成为一个国际标准，甚至是一种被广泛传播和学习的DSL，因此他有着很多技术资料，技术社区，方便这门语言的发展，并且随着应用越广，语言层面的抽象越来越合理，扩展能力也越来越强。

但是你自己设计出来的DSL能走多远？能应用多远？

- 学习成本大，哪怕只是在自己业务内，也很大的，需要有效的建立文档说明，维护业务迭代带来的功能变化，还要给新来的同事培训如何写这种DSL。

- 应用范围小，想应付自己一个业务，可能初步设计出来的接口和功能就满足需求了，但也只能自己使用，如果想推广，必然会带来更大的维护成本，需要更加精细化合理化的API设计，扩展性设计

- 人员的迁移成本大，DSL的特点是会让写DSL的人员屏蔽对底层代码的理解，甚至一些初中是为了能给一些不会编码的专业领域人员学习和运用，如果编程的人员长时间写这种专有的DSL，迁移到别的公司以后，该公司不用这种DSL，那么这些技能就彻底废掉，如果开发者自身不保持一些对底层源码的自行探索，那么换工作将会带来很大的损失

_前端人员在写各种HTML/CSS的时候，想要深刻理解透其中的作用机制，也是需要深入到浏览器内核层面去了解内部机制的_

所以我觉得天猫的[Tangram](http://tangram.pingguohe.net/)，是很值得尊敬的，因为想做出一个动态界面框架，没那么难，想做大，做到通用性，扩展性，做到推广，做到持续维护，是非常艰难的，真的很赞！

# 参考文献


[谈谈 DSL 以及 DSL 的应用（以 CocoaPods 为例）](http://draveness.me/dsl.html)

[DSL（五）-内部DSL vs 外部DSL (N篇系列文章)](http://xfhnever.com/2014/08/09/dsl-internalvsouter/)

[由FlexBox算法强力驱动的Weex布局引擎](http://www.jianshu.com/p/d085032d4788)

[从 Auto Layout 的布局算法谈性能](http://draveness.me/layout-performance.html)

[CSS布局模块](http://www.w3cplus.com/css3/css3-layout-modules.html)

[走进Webkit](http://blog.csdn.net/tuhuolong/article/details/5878029)

[WebCore中的渲染机制（一）：基础知识](http://blog.csdn.net/tuhuolong/article/details/5879094)

[理解WebKit和Chromium: WebKit布局 (Layout)](http://blog.csdn.net/milado_nju/article/details/7854312)

[浏览器渲染原理简介](http://www.cnblogs.com/aaronjs/archive/2013/06/27/3159789.html)

[ReactNative iOS源码解析（二）](http://awhisper.github.io/2016/07/02/ReactNative%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%902/)

[Weex 是如何在 iOS 客户端上跑起来的](http://www.jianshu.com/p/41cde2c62b81)

[How Rendering Work (in WebKit and Blink)](http://blog.csdn.net/rogeryi/article/details/23686609)

[“站在10年研发路上，眺望前端未来”：读后感](http://awhisper.github.io/2016/06/16/%E5%89%8D%E7%AB%AF10%E5%B9%B4%E8%AF%BB%E5%90%8E%E6%84%9F/)

[ReactNative iOS源码解析（一）](http://awhisper.github.io/2016/06/24/ReactNative%E6%B5%81%E7%A8%8B%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90/)

[ReactNative iOS源码解析（二）](http://awhisper.github.io/2016/07/02/ReactNative%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%902/)