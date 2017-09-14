---
title: 前端外行的微信小程序瞎折腾之旅
date: 2016-09-30 11:02:32
categories: 技术感悟
tags: [FrontEnd]
---

# 前言

惭愧，最近下班回家沉迷山口山了，前一阵子搞antlr语法转换，这一阵子搞微信小程序，一直拖着没写点啥，一步一步来吧，肯定都得总结点东西留给自己看的。

## 新技术尝鲜
我一直是一个iOS客户端开发，前端经验只停留在w3cschool上面很基础的最初版本html,css,js学习，纯helloworld水准，就学了不到10分钟。所以这里也算是给客户端开发们打点气，新的东西阻碍的永远是你上手的动力，而不是这个东西的难易。顺带强调自己是前端外行，也是希望各位看官关于内容里如果有很多关于前端理解的偏差，帮我指正和修改。

<!--more-->

加了一些小程序开发群，发现很多常问的问题是：

- 我想上手小程序，需要先学啥语言，先学习html css js吗？
- 小程序是用js开发吗？那我是不是要去先学js？
- 想上手学小程序，需要什么知识储备吗？

我的看法是，我反正从来都不是这样学任何一个新东西的，我就一句话

- 直接开干啊!遇到啥问题再具体查啥问题。

这也跟个人接触新东西的习惯有关，反正我是完全不喜欢那种打算学个新东西（注意是'新'东西），然后就问一下有啥经典书籍么？先抱着一本16开，三四厘米厚的一本大厚书，（我习惯叫砖书，很厚很大砸人很疼），看个好几天一个礼拜的，然后还没上手。或者听到个新东西技术是html，然后美名其曰技术储备，俩仨礼拜略微看明白点html，css，但也毫无实战经验，俩仨礼拜，连小程序的边都没摸到。

对于'新'东西，等系统化的出书，黄花菜都凉了啊，以前捣鼓RN的时候，无数人问RN有什么好书看，现在RN书停留的版本都是0.2X之前，并且一个个都很浅，现在0.3X已经天翻地覆了，这种啥都等系统化整理文章，做好技术储备，再开始动手，完全不是我的个人学习风格。

直接上手是最快的，虽然资料少，但是有源码下，源码是最好的指导方案，没源码，官方文档，Github交流，网上及时阅读最新的碎片化博客文章，这些绝对是最快的学习和了解'新'东西的手段。

光读光看是绝对没用的，最有效最有效的手段是，直接上手，上项目，哪怕是仿写一些开放API接口的app（知乎日报，豆瓣电影，有太多开放提供服务器api，让广大客户端开发者练手的）

__以上只是我的个人学习习惯，因人而异__

## 扯淡吐槽

- xx火了，客户端要完蛋，前端要火
- 小程序会不会灭掉客户端开发
- 明年培训机构大量前端要涌入了
- 小程序也不一定就会火，客户端不可代替

当初RN出来就是这样一波风气，小程序出来也是，我对任何这种话题是毫无兴趣！这种`然并卵`的话题，键盘侠们热火朝天讨论几个小时，时间就过去了，然后就可以happy下班了，有这功夫demo都写出来了，项目都上线了



# 开发环境

上面其实也扯了太多的废话，微信小程序其实有自己的IDE开发环境，一切都在这个开发环境里面，[下载官方IDE开发包](http://wxopen.notedown.cn/devtools/download.html)，开始运行，就可以直接开发预览小程序了。

但这里有个IDE开发包破解的问题，小程序目前需要是需要邀请码的，有邀请码你就会有属于你业务的微信小程序appId，有邀请码的好处是你可以把小程序部署到真机上，没有邀请码，__无论你是否破解了IDE，你都无法真机预览__，但是IDE里面的模拟器预览完全没有问题，能运行，能实现绝大部分功能，完全可以项目上先开发起来，等待一旦公测，就直接上线。

## 不破解IDE

__先说结论：现在的最新版本IDE，完全不需要破解！__

- 最新版本的92300的IDE，mac下是一个dmg包，直接安装就能使用
- 选择+号添加项目你能看到创建新项目必须填写AppID
- 在92300版本里面，已经贴心的新增了一个`无AppID`的按钮，点了后会得到提示`无AppID部分功能受限`
- 说的很吓人，这部分API很少，就2个，并且IDE提供了模拟数据返回，完全不影响绝大部分开发
- 你就是破解了，不提示部分功能受限，也是该没法正常还照样没法正常工作，毕竟微信也有自己的服务器验证，你破解后填的AppID终归是假的
- 选择工程目录，这时候切记如果你是从0开始创建工程，而不是拥有线程的wx小程序demo代码，一定要在选择工程目录的时候，创建全新文件夹
- 只有全新创建的文件夹才会开启quickstart自动创建初始工程文件功能，(如下图）自动创建好一个helloworld工程
- quickstart的自动创建工程，是可以无报错直接运行run起来的。
- 但如果文件夹内有文件，IDE就不会创建任何的初始文件的。

![init project](http://o8n2av4n7.bkt.clouddn.com/wxappinit.png)

## 破解IDE

首先，感谢`@老郭`以迅雷不及掩耳盗铃之神速第一时间破解了微信官方IDE，并且开源提供给大家使用，[GitHub weapp-ide crack](https://github.com/gavinkwoe/weapp-ide-crack)

因为在早期的版本，微信的IDE，没有AppID的人是无法体验的，必须经过破解，才能开始自己写demo进行练手。而老郭在第一时间破解了IDE，让所有人能从代码上第一时间体验这个神秘的小程序（真机就没办法了）

后来倒逼微信官方，把小程序IDE直接开放，才有了上面提到的`无AppID`模式。

但是，我使用破解IDE的时候，发现很多人遇到了个问题，按部就班一步一步把IDE破解了，创建新工程的时候，是没有quickstart这一部的，如果什么都不太懂的人做到这一部，一打开工程，一个文件没有直接点运行，直接会报错，什么`can not find app.js`之类的，`context`之类的错误，我看到这个后，直接从网上顺手找个demo（就在老郭的git里就有）扔到目录里，就一切运行了。

所以目前我的感受就是，破解倒逼了微信官方开放无AppID体验，简直太威武了，但对于经验尚浅的新手，破解的一大堆东西和步骤，很可能会出现一大堆不知道为啥的错误提示的时候，真的不如直接下最新版IDE，不破解直接`无AppID`体验。


# 开动起来
- 官方文档全在这里 [官方文档](http://wxopen.notedown.cn/)，里面包含简易教程，框架，组件，API，工具等等

官方文档其实内容真的不多，很多东西写的很浅，光看文档我是觉得很是吃力，因为很多前端开发的概念并不深入，很多标签，css的名字及其陌生，所以辅助上别人的demo食用就很赞了


- [GitLab上面比较丰富的汇总Demo](https://github.com/justjavac/awesome-wechat-weapp#%E6%95%99%E7%A8%8B) 这里面包括文章，和demo，demo有很多很赞的repo的，我这就只是搬运

	- [微信小应用示例代码(phodal/weapp-quick)](https://github.com/phodal/weapp-quick)
	- [微信小应用地图定位demo(giscafer/wechat-weapp-mapdemo)](https://github.com/giscafer/wechat-weapp-mapdemo)
	- [微信小应用- 掘金主页信息流(hilongjw/weapp-gold)](https://github.com/hilongjw/weapp-gold)
	- [微信小程序（应用号）示例：微信小程序豆瓣电影(zce/weapp-demo)](https://github.com/zce/weapp-demo)
	- [微信小程序-豆瓣电影(hingsir/weapp-douban-film)](https://github.com/hingsir/weapp-douban-film)
	- [小程序 hello world 尝鲜(kunkun12/weapp)](https://github.com/kunkun12/weapp)
	- [微信小程序版2048小游戏(jeffche/wechat-app-2048)](https://github.com/jeffche/wechat-app-2048)
	- [微信小程序-微票(wangmingjob/weapp-weipiao)](https://github.com/wangmingjob/weapp-weipiao)
	- [微信小程序购物车DEMO(SeptemberMaples/wechat-weapp-demo)](https://github.com/SeptemberMaples/wechat-weapp-demo)
	- [微信小程序V2EX(jectychen/wechat-v2ex)](https://github.com/jectychen/wechat-v2ex)
	- [微信小程序-知乎日报(myronliu347/wechat-app-zhihudaily)](https://github.com/myronliu347/wechat-app-zhihudaily)
	- [微信小程序-公众号热门文章信息流(hijiangtao/weapp-newsapp)](https://github.com/hijiangtao/weapp-newsapp)
	- [微信小程序版Gank客户端(lypeer/wechat-weapp-gank)](https://github.com/lypeer/wechat-weapp-gank)
	- [微信小程序集成Redux实现的Todo list(charleyw/wechat-weapp-redux-todos)](https://github.com/charleyw/wechat-weapp-redux-todos)
	- [微信小程序-番茄时钟(kraaas/timer)](https://github.com/kraaas/timer)
	- [微信小程序项目汇总](http://javascript.ctolib.com/categories/javascript-wechat-weapp.html)
	- [微信小程序版聊天室(ericzyh/wechat-chat)](https://github.com/ericzyh/wechat-chat)
	- [微信小程序-HiApp(BelinChung/wxapp-hiapp)](https://github.com/BelinChung/wxapp-hiapp)
	- [小程序Redux绑定库(charleyw/wechat-weapp-redux)](https://github.com/charleyw/wechat-weapp-redux)
	- [微信小程序版微信(18380435477/WeApp)](https://github.com/18380435477/WeApp)

	
- [我的Github上面的小程序Demo](https://github.com/Awhisper/MyWxApp) 这个真的只是demo，是我们业务项目的雏形代码，我文章后面介绍的截图，功能，都不是这个Demo，都是我们的项目代码的

重要的事情说三遍，后面文章的截图不是这个Demo，不是这个Demo，不是这个Demo╮(╯_╰)╭

## quickStart 工程文件基础

__项目基础文件__

- app.json 这里对小程序所有的页面进行配置，其实详细的大家可以看官方文档，跟你app界面结构相关的就是前三个
	- "pages"字段表示app包含的所有页面，只有在这里注册过的页面才会有效进行编译，如果你的app不包含"tab"字段，那么app的首页就是"pages"数组里面的第一个page
	- "window"字段是处理对于navigationbar的一些样式设置
	- "tabBar"字段如果存在，表示app开启首页面为底部tabbar的形式，这样每个tab所对应的page在"tabBar"字段里设置
	- "networkTimeout","debug"这两个字段一个配置全局网络超时，一个开启debug模式



- app.wxss 这里其实是全局的CSS，凡是在这里写过的CSS样式，在各自子page里面可以直接使用，写在其他.wxss文件里的样式是不能跨page使用的，可以通过@import进行样式导入，导入别的.wxss文件，但是目前我实践的结果@import只有在主app.wxss里才有效，路径是相对路径
- app.js 这里就是纯js代码逻辑了，官方的demo里给你展示了一些基本代码，调用了微信的login接口，回调，读取用户头像，读本地存储之类的。并且通过js的一个全局函数`getApp()`可以获得app.js的这个app对象。

__页面文件__

如果一个页面起名叫`HomePage`，那么我们就应该自行手动创建3个文件，文件名一致才会被系统正确的识别

- HomePage.js 代表着这个页面的业务逻辑，当你在空白js里面输入page的时候会自动出现代码补全，帮你补全了一个page的所有生命周期，onLoad，onHide啥的，其他的js代码提示很不完善╮(╯_╰)╭
- HomePage.wxss 这里面写这个页面的专属css，别的页面不能使用，只在这个页面下可以用，但是可以被import到app.wxss里面，实现全局通用，并且wxss的代码提示非常完善，很爽，很多文档没写的css表，可以通过ide代码提示+推测标准css3，来知道如何编写
- HomePage.wxml 这里面写这个页面了，这种WXML语法看起来就很像html，但他还真不是html，html的东西完全不能直接在这里用。你必须用wx提供的wxml相关组件完全重写，条件渲染，循环渲染，数据绑定，都得按着微信的规定来，并且提供了最简单的模板模块功能，实现一定程度的复用。

还可以有个可选的HomePage.json文件，页面也是可以拥有自己的.json文件进行一些专属配置的，但是页面的json可以配置的字段不如app.json多，职能配置关于本window相关的一些表现，比如

```json
{
    "navigationBarBackgroundColor":"#ffffff",
    "navigationBarTextStyle":"black",
    "navigationBarTitleText":"微信接口功能演示",
    "backgroundColor":"#eeeeee",
    "backgroundTextStyle":"light"
}
```

## 上手开搞

- 创建一个新目录HomePage，创建好我们页面自己的HomePage至少三个文件
- HomePage.js里面写page，自动补全好页面生命周期，其余留空
- 修改app.json里面 “pages”字段，添加进去我们最新的页面路径，并且放到最上面。
- 直接点编译，你会发现，你的微信小程序已经在模拟器里面运行起来了，没有报错，只是空白一片，什么也没有嘛。

后面开始动手画UI了，这个我没有啥教学的，因为上文提供的github各种demo里面丰富多彩的所有组件用法已经够全的了，我这手把手的教如何写一个按钮，如何写一个text，如何水平排布好几段文字，这就有点太无脑了。我举例几个项目中用到的界面，然后写点我这个小白在趟出这些界面的时候遇到的一些问题点吧

![myhomepage](http://ww1.sinaimg.cn/mw690/678c3e91jw1f8bnmg7w1zj20uh16zwm9.jpg)

![listpage](http://ww2.sinaimg.cn/mw690/678c3e91jw1f8bnmhaaqcj20u1173n4z.jpg)

## 开发小记

### 小程序的mvvm

小程序天然有一套数据和UI的绑定机制，在js文件里有如下代码，在onload里面发起网络请求，网络请求后回来，handleResponse，再之后setData，可以看到这个data其实就是一个vm

```javascript
data:{
    originData: {},
    bookList: []
  },
onLoad:function(options){
	var self = this;
	console.log()
	wx.request({
	    url:'xxxxxxxx',
	    header: {
	        'Content-Type': 'application/json'
	    },
	    success: function(res) {
	       if(res.data.status.code == 0){
	          self.handleResponse(res.data.data);
	       }
	    }
	});
	
	console.log('onLoad')
},
handleResponse:function(response){
	console.log(response);
	
	var bookList = response.content.column_data;
	
	this.setData({
	  originData:response,
	  bookList:bookList
	});
},
```
当任何时候在js逻辑里面，修改了data，这样的wxml中，`{{bookList}}`这种就是告诉负责UI的WXML，这块UI要和bookList这个data里面的一个字段进行绑定，任何时候data发生了变化，这个UI都会根据最新的数据结果刷新

```html
<view wx:for="{{bookList}}" wx:for-item="listBookItem" wx:for-index="rowIndex" class="novelBookContainer">
    <include src="../../component/novelBook/novelBook.wxml"/>
</view>
```
### 小程序的代码复用&模块化
可以看出来，我的2个页面，最重要的就是一个书籍详情Cell，进行复用，避免代码大量的机械性重复。

模块化得从3个层面，`js`，`wxss`，`wxml`来说

- js的模块化：小程序的js看起来就是最普通的js，似乎看起来是不支持ES6的，因此用传统的`module.exports`就可以封装js的api模块提供外部使用
- wxss的样式导入：上文提过，每个page只能认自己page的wxss，和全局的app.wxss，其他的wxss是不支持由别的文件直接引入的，但是可以在全局app.wxss里面使用`@import`来把别的文件的样式，导入全局，这样各自page都能使用了
- wxml的模板：官方文档里说支持`<template>`的方式创建一个模板，模板支持使用data传入数据，我的项目里没这么使用过，我用的另一种方案
- wxml的引用：官方文档里也说明了支持`<include>`他的作用其实只是原封不动的代码字符串拷贝，会拷贝目标wxml文件里除`<template>`外所有的标签，原封不动的拷贝替换到`<include>`位置（这是纯字符串复制，不能支持指定代码灵活变化，需要灵活变化请使用模板）

### 点击事件传值

下面这个代码就是我的bookCell的wxml代码，可以看到这里大量使用了{{xxx}}进行UI和data的绑定，这样每次setData，都会让ui直接生效，但我这里重点给大家看一下关于绑定点击事件。

```html
<view class="novelBookDesc" data-sectionIndex="{{sectionIndex}}" data-rowIndex="{{rowIndex}}" bindtap="tapBook" tapIndex="{{listBookIndex}}">
    <image src="{{listBookItem.small_pic_url}}" mode="scaleToFill" class="novelBookCover"/>
    <text class="novelBookTitleText">[{{listBookItem.sub_class}}] {{listBookItem.title}}</text>
    <view class="novelBookTextInfo">
        <text class="novelBookTextAuthor">{{listBookItem.author}}</text>
        <text class="novelBookTextAuthor">|</text>
        <text class="novelBookTextStatus novelBookTextStatusOver" wx:if="{{listBookItem.is_full==1}}">完结</text>
        <text class="novelBookTextStatus novelBookTextStatusNotOver" wx:if="{{listBookItem.is_full!=1}}">连载</text>
    </view>
    <text class="novelBookTextSummary">{{listBookItem.summary}}</text>
</view>
```

官方文档里面写的真是比较简单，`bindtap="tapBook"`写好了这一句后，每当这个UI元素被点击的时候，都一定会触发对应page的.js文件中tapBook这个jsfunction，看起来很容易，但传值呢？发生点击我怎么知道点击的时候是哪个book被点击了？第几个本书？书的id是啥？关键就在这里

`data-sectionIndex="{{sectionIndex}}" data-rowIndex="{{rowIndex}}"`

这一行给<view>添加了2个属性，都是以`data-`开头，自定义的名字为结束，并且绑定上了2个数据（for 循环的index，for循环后面说），这样添加自定义的`data-xx`属性就是为点击事件传递属性的关键

```javascript
tapBook:function (event){
    var section = event.currentTarget.dataset.sectionindex;
    var row = event.currentTarget.dataset.rowindex;
    var book = this.data.sectionList[section].column_list.book_info[row];
    var docid = book.doc_id;
    wx.navigateTo({
      url: '../read/read?docid=' + docid
    });
  },
```

这是对应js代码，当触发tapBook的时候，会把event当做参数传入，event.currentTarget.dataset.xxx 就能获取你刚才`data-xx`绑定的数据，我刚才把sectionIndex rowIndex的列表点击index绑上了，于是通过这个方法取出来了。

__切记，你在wxml里几遍data-xx，写了大写英文字母，此处在js里调用的时候被自动全部变成小写了，你再写大写是undefine的__

### for循环创建列表

官方文档里面给了好几种for循环的方案，什么<block> <view for>，都可以绑定上一个js数组数据，然后按着数组的个数循环渲染列表形UI，

```javascript
<view wx:for="{{listItem.column_list.book_info}}" wx:for-item="listBookItem" wx:for-index="rowIndex" class="novelBookContainer">
      <include src="../../component/novelBook/novelBook.wxml"/>
</view>
```

这就是一个for循环创建列表的例子

- `wx:for`的意思是告诉这个<view>内用循环创建内容，循环所绑定的数组是listItem.column_list.book_info
- `wx:for-item`的意思是，你在下面写当次循环需要用到的具体数组元素，你起名成listBookItem
- `wx:for-index`的意思是，你在下面写档次循环需要用到的数组下表，你起名成了rowIndex

循环内我include的代码，就是上文点击事件传值介绍的代码，这时候我们回过头去看

`<text class="novelBookTitleText">[{{listBookItem.sub_class}}] {{listBookItem.title}}</text>
`

`<view class="novelBookDesc" data-sectionIndex="{{sectionIndex}}" data-rowIndex="{{rowIndex}}" bindtap="tapBook" tapIndex="{{listBookIndex}}">`

怎么样，用到listBookItem数据在绑定上了吧，用到rowIndex在点击事件了把，同理可知sectionIndex其实是另外一个我没展示的外层循环的`wx:for-index`定义。

### wx对象提供的API
所谓API其实就是，在js文件里，微信也提供了很多native API，以wx.xxx开头，[官方API文档](http://wxopen.notedown.cn/api/)，包括很多内容，我就不一一举例了，这里举例几个比较重要的分类

- 网络
	- http请求(最常用，各大demo都是通过wx.request()来做http请求)
	- 大文件上传下载
	- websockt
- 数据
	- 数据缓存，本地key-value式数据存储
	- 各种同步，异步，数据处理接口
- 导航 页面之间各种跳转
- 动画 绘图
- 媒体
- 设备 重力感应，系统信息，网络状态，罗盘等等
- 微信支付
- 微信登陆，用户信息

可以看出，都是直接跟网络，跟设备，相关的信息。

### 界面跳转

我们在`小程序mvvm`里面已经看到了一段关于wx.request的演示，这里演示一下，界面之间跳转

- wx.nativateTo() 通过push动画打开新的页面
- wx.redirectTo() 当前页面重定向到新页面进行展示，不打开
- wx.navigatBack() 通过pop动画，弹出到上一级界面

wx.nativateTo是有数量限制的，小程序界面栈层级不能超过5的，所以很多场景可以选择使用wx.redirectTo

```javascript
//跳转到别的页面的代码，注意看如何传值
wx.navigateTo({
  url: '../topic/topic?topicid=' + topicid
});

//topic界面的js逻辑里面，onLoad生命周期函数
onLoad:function(options){
    var topic = options.topicid
}
options.topic
```

可以看到，界面跳转通过url跳转，而传值也通过url的方式传值，你传过去的值会直接写进onLoad生命周期函数的options参数里面，名字和你在url里面写的是一样的。


### CSS
说实话，一直以来都在做客户端开发，这种css式的界面开发模式，实在是太陌生了，css式的思维，css式的嵌套，对一个新手来说有点痛苦。

[我的Github上面的小程序Demo](https://github.com/Awhisper/MyWxApp) 这里面的代码其实不多，基本上是我们项目的雏形，但最让我头疼的就是那些css，我整整写了一整天，才大约摸到一丢丢前端开发，css思维的方式方法

这个我也没啥好说的，毕竟我是大大大大菜鸟，就是多写写就有感觉了。

值得一提的是IDE对于WXSS文件里，css的代码补全非常赞，各种都能第一时间补全，对于我这个根本记不住那么多css名字的新手来说，这个实在是太好了。

另外，完全支持`- position: absolute`和`- position: relative`的绝对坐标布局，也完全支持flexBox的弹性盒子布局，和我一起的小伙伴表示，基本上大部分的css都是直接可以用，我把线上项目迁移到wxss的时候也感觉到了，打开chrome的debug模式，照着线上wap站，原封不动的照着写css布局参数，基本上没有任何问题

### 调试
大家玩起来就知道了，微信小程序的调试模式，和chrome的debug模式一模一样，其实这个ide就是拿nw.js写的，里面是一套webkit，源码里面就有chrome的debug'tool的js代码哈哈


# 底层实现探讨

关于这个小程序底层是如何运作的，在刚出的第一天，就引来无数的遐想，wx独有的wxml wxss到底是拿什么做的？到底是不是h5?到底能不能做成native体验？无数人都在猜测。

在最开始的时候，ide被破解，并且被证实ide是基于webkit做的，很多人猜微信在真机上就是webview啦（后面事实证明，目前也还真是）

但我当时就觉得这其实说明不了啥，wx特别抽象出来的 wxml结构，就是想定义一个独立出来的独有抽象层，他虽然目前把这个抽象层（一种自己独有的vdom结构？我是前端新人，不一定对哈），最后又重新通过编译转成了html，最后交给webview来展现（辅助绑定上了一些native插件，比如wxapp里面的视频，tab，navi，input keyboard，map等等，都是通过addsubview的方式直接add到UI/WKwebview上的）

但是这并不代表，这样的架构就是依赖在webkit，和webview的，完全独有的抽象中间层vdom，就是为了摆脱对webkit的依赖，未来可以很轻松的切换底层架构，直接切换成reactnative or weex 那样的vdom + native渲染的模式，这样就没了webview的依赖，（虽然现在选择的方案，是又绕路回到了html和webkit，但依赖和选择权已经牢牢攥在了自己手里）


[微信小程序开发人员回答渲染机制](http://www.zhihu.com/question/39377598/answer/123247610)

这篇文章看起来官方人员态度有点遮遮掩掩，含糊其辞，通篇都没直指要害-如何渲染，但我觉得解读一下，是这样的潜台词（开玩笑！莫喷：我们很高大上，我们抽象了很多东西，其实我们还是主要用webview渲染，辅助了很多native，就是不太好意思这么直白的说出来）

但我特别认可微博上的这个回答

![](http://o8n2av4n7.bkt.clouddn.com/wxappcomment1.png)