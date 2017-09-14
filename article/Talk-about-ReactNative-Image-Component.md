---
title: Talk about ReactNative Image Component
date: 2016-07-17 10:31:23
categories: 技术感悟
tags: [Hybrid]
---

相关系列文章

- [ReactNative iOS源码解析（一）](http://awhisper.github.io/2016/06/24/ReactNative%E6%B5%81%E7%A8%8B%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90/)
- [ReactNative iOS源码解析（二）](http://awhisper.github.io/2016/07/02/ReactNative%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%902/)
- [Talk about ReactNative Image Component](http://awhisper.github.io/2016/07/17/Talk-about-ReactNative-Image-Component/)

最近好像唠叨了好多RN的东西╮(╯_╰)╭，唠叨的我都觉得有点贫，就当随手记笔记吧

关于ReactNative的Image组件，我一直很好奇他内部具体的工作过程，这里面有很多有意思的东西，毕竟Image这个东西即便是纯源生开发也可以做的很复杂很精妙，比如`SDWebImage`的无比强大的网络缓存，网图控制，比如`ASDK`里面的asyncDisplay，比如`YYWebImage`中身兼网络缓存控制与异步高效解码绘制。今天我们来看看ReactNative是如何处理Image的

# ImageComponent的基本用法

[Facebook的官方文档：ImageComponent](https://facebook.github.io/react-native/docs/images.html)

从文档中我们可以看到ImageComponent一共可以读取三种图片，无论用那种方式，只要把他们赋值给source，好像图片就能自然生效了

- 与jsbundle一起打包packag的资源文件（require方式）
- iOS源生APP的ImageAsset内部被iOS管理的资源文件（{uri:name}方式）
- 网络上的图片（{uri:url}方式）

## 静态图片资源

随着jsbundle一起打包的资源文件，在文档中以这种方式`require('./img/check.png')`使用，其中的路径是图片小相对于`index.ios.js`这个文件的路径。

静态图片资源是什么意思呢？我们用RN肯定是期望热更新的，肯定期望rn的js代码与功能所需要用到的图片，一起随着网络下载的客户端本地，从而生效，从而展现，所以这些图片需要随着js一起被打包，当执行了node.js的打包命令后，会生成一个bundle目录，这里面有最核心的jsbundl也就是js代码包，同时这里面还有个asset目录，里面放着所有一起打包的资源文件，这就是RN的静态图片资源的概念

## APP的图片资源

这里要提到iOS的图片资源管理，iOS会把所有的图片打包进入app自己独有的资源文件包之中，这部分图片属于APP管理，是随着每个app的包一起提审，一起发版，简单地说这部分图片的管理，不能随着网络下载随意存放和读取和更新，是纯源生iOSAPP的资源管理与读取的方案

如果想在RN里面，显示这种源生APP资源的话就要通过`{uri:name}`的方式，其中name是资源文件在源生管理器里面的名字，这样就可以在RN的环境里，读取出native环境里的资源

## 网络图片

这个就很好理解了，恩，不从APP本地无论是RN包还是native包里面读图，直接从网络里拉图，`{uri:url}`其中url是图片的网络地址

# 图片是如何读取的
<!--more-->

读了之前的文章，我们应该清楚，所有的RN的ImageComponent最终都会通过源生的UIModule，实现最终的源生的展现效果，那么这个UIModule就是RCTImageView，大家可以从源码中看到这个类

关注一下这个类的`- (void)setSource:(RCTImageSource *)source`方法，看起来所有在JS里赋值给Image的Source的属性，都会传过来通过这个方法传给RCTImageView，然后再通过RCTImageView的`reloadImage`方法去读取图片内容，这部分后面还会讲。

但我很惊讶与这里面的代码，刚才我们讲到，RN是有三种截然不同的图片读取方式的，传入的是三种截然不同的数据，而且是读取截然不同的三种类型的图片

在我的认知里面，完全不同的三种方案，在`setSource`与`reloadImage`里面应该会按着三种方式，至少有个`if else`之类的差异化处理，但出乎我的意料，RN在这两处的代码是完全一致并且统一的，代码一气呵成没有任何分支处理

我们写这样一段JS代码，在一个页面里同时展现3种图片

```javascript
render() {
    return (
      <View>
        <Image source={require('./res/kakaka.jpg')}/>
        <Image source={{uri: 'ScreenCover_night'}}
              style={{width: 40, height: 40}}/>
        <Image source={{uri: 'https://facebook.github.io/react/img/logo_og.png'}}
              style={{width: 50, height: 50}}/>
      </View>
    );
  }
```
这3个文件真正执行的时候，在OC的setSource处打断点却发现截然不同的景象

原本的输入参数

- require('./res/kakaka.jpg')
- {uri: 'ScreenCover_night'}
- {uri: 'https://facebook.github.io/react/img/logo_og.png'}

在setSource断点里完全变了，完全变成了imageURL

- http://localhost:8081/assets/res/kakaka.jpg?platform=ios&hash=319fbd6959f45c18b1843e71d3bdd991
- file:///Users/Awhisper/Library/Developer/CoreSimulator/Devices/2D84E82E-AEDD-4B7B-A59A-F44C3B6721F2/data/Containers/Bundle/Application/B80C514C-639F-42FE-812F-3ECF457BFEC8/yuedu.app/ScreenCover_night
- https://facebook.github.io/react/img/logo_og.png

这太不符合我的认知了，为什么输入参数会如此整齐划一的通通变成了iOS下的URL？无论是本地URL还是远程URL，因为他们完全被统一成了同一种URL类型，从而iOS的这两处OC代码完全不需要if分支就能一个逻辑处理所有图片

__我很好奇到底是哪段代码处理了这种统一化？__

# 图片源Source输入参数在JS里的归一化处理

如果想弄明白rn是如何把这三种方案统一的，那自然得从JS源码入手看起，我们将要很大程度的关注`/node_module/react-native/Libraries/Image`这个目录下的几个关键JS文件。

想弄明白这里面的运作过程，最好的办法就是利用RN的chrome-debug方案，在关键位置上打上断点，看看到底代码调用栈是如何一步步执行的

那我们的焦点就落在了目录下这个`Image.ios.js`的文件上，可以看出来没错，这就是Image组件的JS源码，我们会看到这么几行

```javascript
render: function() {
    var source = resolveAssetSource(this.props.source) || {};

    //balabalabala
    //....中间代码略去
    }

    return (
      <RawImage
        {...this.props}
        style={style}
        resizeMode={resizeMode}
        tintColor={tintColor}
        source={source}
      />
    );
  },
```

可以知道，我们传给JS的Source属性的输入参数`this.props.source`，究竟是如何处理的
他看起来就是`resolveAssetSource()`处理了一下原封不动的就进入后面的流程了，传递数据给native进行渲染的流程

这部分流程在这里，我们需要看一下`/node_module/react-native/Libraries/ReactNative/ReactNativeBaseComponent.js`文件，所有的RN界面组件，无论是标签文字，还是图片，地图，转菊花，都是通过这个BaseComponent来调用UIManger（也就是APIModule RCTUIManager的JS侧入口）绘制到native上的。大家只关注`mountComponent`这个方法就好了

```javascript
mountComponent: function(rootID, transaction, context) {
    //balabalabala
    //....中间代码略去

	//...用来获取Component的props
    var updatePayload = ReactNativeAttributePayload.create(
      this._currentElement.props,
      this.viewConfig.validAttributes
    );

    //balabalabala
    //....中间代码略去 用来获取nativeTopRootID
    
    //... call OC 创建native界面组件
    UIManager.createView(
      tag,
      this.viewConfig.uiViewClassName,
      ReactNativeTagHandles.rootNodeIDToTag[nativeTopRootID],
      updatePayload
    );

    //balabalabala
    //....中间代码略去
    
    return {
      rootNodeID: rootID,
      tag: tag
    };
  }
```

我们梳理一下过程

首先我们三种example的输入参数是

- require('./res/kakaka.jpg') 
- {uri: 'ScreenCover_night'}
- {uri: 'https://facebook.github.io/react/img/logo_og.png'}

在最终mountComponent的时候，updatePayload获取到的props里面，我们打断点查看一下，看看经过了无数的JS代码处理后，对于Image组件这块的内存数据是怎样的，实践过后会发现，这里的props一定会还有一个uri属性，三种example此时的uri属性分别是

- http://localhost:8081/assets/res/kakaka.jpg?platform=ios&hash=319fbd6959f45c18b1843e71d3bdd991
- ScreenCover_night
- https://facebook.github.io/react/img/logo_og.png

JS代码就到此为止，走过`UIManager.createView`之后，就进入了OC的代码逻辑了，这个放在后面细说。

于是我们会发现除了require的静态图片资源，输入参数和输出结果变化非常大以外，另外两种example基本没啥变化，我们先从简单的下手，看一看后两种example是如何简单处理的

## {uri:xxx}的处理过程

顺着刚才贴出的代码可以知道，`Image.ios.js`只是简单的把`{uri:xxx}`的输入参数传给`resolveAssetSource.js`的`resolveAssetSource方法`，处理一下，然后添加了几个额外属性，然后直接复制给this.props.source，之后就传给了`ReactNativeBaseComponent.js`了。

`resolveAssetSource.js`的`resolveAssetSource方法`更是简单粗暴，因为我们输入的是`{uri:xx}`他就是一个对象，这方法什么也不做直接返回

```javascript
if (typeof source === 'object') {
    return source;
}
//其他处理
```

所以我们在UIManager最终传值的时候，会看到一个跟我们输入数据没啥变化的一个JS Object，只是多了几个属性而已

## require(imagepath)的处理过程

这个过程就比较复杂了，而且这个过程会涵盖rn的打包，执行，两大重要环节

- 一. RN的打包环节

rn的打包是通过在rn根目录下，执行node.js的一行打包脚本命令，最终把我们编辑过程中的js业务文件，js框架文件，res资源文件，整体打包到bundle目录之下，对于图片来说，我本以为只是把图片换个打包目录另存为而已，但当我一步一步追踪源码的时候，我发现我错了。
	
`require('./res/kakaka.jpg')` 举例来说，在这个目录下的kakaka.jpg文件会另存为到`bundle/asset/res/kakaka.jpg`这个位置，成为rn包中的一部分。
	
但绝不仅仅是另存为，打包脚本还会在图片文件中植入一行js代码，如果你在`AssetRegistry.js`的`registerAsset`方法打上断点，去查看调用栈，你会发现，居然调用栈里的一行JS代码，来自这个图片文件，有图为证（床说中贴吧各种往图片里藏老司机开车的种子连接，就是用这种方式╮(╯_╰)╭）
	
![chrome 断点](http://o8n2av4n7.bkt.clouddn.com/10AD9595-5A1C-4633-856D-283B75FDF578.png)
	
这行JS代码是
	
```javascript
module.exports = require("react-native/Libraries/Image/AssetRegistry").registerAsset({"__packager_asset":true,"fileSystemLocation":"/Users/Awhisper/Desktop/yuedu_RN_BRANCH/Main/YDReactNative/res","httpServerLocation":"/assets/res","width":1242,"height":150,"scales":[1],"files":["/Users/Awhisper/Desktop/yuedu_RN_BRANCH/Main/YDReactNative/res/kakaka.jpg"],"hash":"319fbd6959f45c18b1843e71d3bdd991","name":"kakaka","type":"jpg"});
```
	
这说明，在打包脚本执行的时候，打包脚本会把这个图片的所有信息，包括打包前原来的绝对路径，打包后的相对路径，打包后的host路径，打包后的文件hash，打包后的文件名全都以源码js写入的方式，写进图片文件里。并且这个图片文件还执行了一行代码`AssetRegistry. registerAsset`
	
这个图片虽然被植入了JS代码，但是他并没有立刻生效，但正因为图片内部存在JS代码，所以他可以通过`require(xxx)`的方式进行加载（其实RN也扩写了require.js这个库），也就是说当我们在RN运行环节，一旦执行了`require(图片)`这行代码，`AssetRegistry. registerAsset`就会立刻被执行
	

- 二. RN的运行环节

打包完成了，图片已经被植入了JS代码，现在RN该开始运行了，一旦运行到`<Image source={require('./res/kakaka.jpg')}/>`这句话时候，就相当于require了图片内的js代码，于是就执行了`AssetRegistry. registerAsset`。
	
这个函数干了些啥呢？他把图片内被植入的js代码中的一大堆图片信息参数，全都push进了一个全局的数组里，并且返回了一个索引值index
	
```javascript
function registerAsset(asset: PackagerAsset): number {
  return assets.push(asset);
}
```

当我们`Image.ios.js`获取this.props.source的时候，我们断点查看`var source`的值你会发现他是一个数字也就是1！这就是index

回到`resolveAssetSource.js`的`resolveAssetSource方法`，此时我们的输入参数已经不是一个JS Object了，而是一个数字1，于是自然也就没有直接return，而是进一步处理

```javascript
if (typeof source === 'object') {
    return source;
}
//其他处理
var asset = AssetRegistry.getAssetByID(source);
  if (!asset) {
    return null;
  }

  const resolver = new AssetSourceResolver(getDevServerURL(), getBundleSourcePath(), asset);
  if (_customSourceTransformer) {
    return _customSourceTransformer(resolver);
  }
  return resolver.defaultAsset();
```

没错他从全局的资源数组里，按着index取出来那个含有资源详细信息的字典，并且稍加处理和改造，返回给了`Image.ios.js`

这就是为啥我们从这个JS层的输入参数

- require('./res/kakaka.jpg') 

变成了这样的JS层的输出参数

- http://localhost:8081/assets/res/kakaka.jpg?platform=ios&hash=319fbd6959f45c18b1843e71d3bdd991



# 图片源Source输入参数在OC里的归一化处理

上文提到三种example在JS层最终输出参数是这样的

- http://localhost:8081/assets/res/kakaka.jpg?platform=ios&hash=319fbd6959f45c18b1843e71d3bdd991
- ScreenCover_night
- https://facebook.github.io/react/img/logo_og.png

他们会通过UIManager传给OC的RCTUIManager从而进行创建和绘制，此时此刻你会发现，（1）与（3）已经变成了URL的样式，已经可以直接进行URLLoad了，但是(2)还不是一个URL，说明（2）还需要在OC层面进行转换统一，这个转换过程又发生在哪呢？


这我们就要顺着OC的RCTUIManager去追踪了，在`createView`方法里面（上一篇源码分析提到过RCTUIManager与RCTComponentData的关系，我就不细讲了）

- `RCTUIManager-createView:xxxx`方法
	- `RCTComponentData-setProps:forView:`方法(RCTUIManager line:910)
		- `RCTComponentData-propBlockForKey:inDictionary:`方法(RCTComponentData line:343) (此处代码有点绕，函数的作用是取出block，真正要看的是函数后面的括号执行block)
		- invocation(invocation去执行setter，真正的setSource，并且伴随着复杂切晦涩的宏处理，在宏的处理过程中，把js传过来的json字典会通过RCTConvert转换成RCTImageSource，推荐直接在下面的位置断点看效果)
			- `RCTImageSource-RCTImageSource`方法
				- `RCTImageSource-NSURL`方法

没错，`RCTImageSource-NSURL`就是关键，在这个函数里如果发现url字符串可以被转化成NSURL，则直接return该NSURL（所以例子1，3没有任何变化直接return），如果传来的是像2例子那样一个名字`ScreenCover_night`，在这段代码里，会主动向iOS独有的资源管理类`[NSBundle mainBundle].resourcePath`来申请iOS本地资源路径，从而将`ScreenCover_night`转化成真正意义上的URL

```
file:///Users/Awhisper/Library/Developer/CoreSimulator/Devices/2D84E82E-AEDD-4B7B-A59A-F44C3B6721F2/data/Containers/Bundle/Application/B80C514C-639F-42FE-812F-3ECF457BFEC8/yuedu.app/ScreenCover_night
```

# 图片源Source输入参数归一

输入

- require('./res/kakaka.jpg')
- {uri: 'ScreenCover_night'}
- {uri: 'https://facebook.github.io/react/img/logo_og.png'}

经过了JS层的初步归一，归一处理了example(1)的情况，变成了

- http://localhost:8081/assets/res/kakaka.jpg?platform=ios&hash=319fbd6959f45c18b1843e71d3bdd991
- ScreenCover_night
- https://facebook.github.io/react/img/logo_og.png

经过RCTConvert，OC层的二次归一，归一处理了example(2)的情况，变成了

- http://localhost:8081/assets/res/kakaka.jpg?platform=ios&hash=319fbd6959f45c18b1843e71d3bdd991
- file:///Users/Awhisper/Library/Developer/CoreSimulator/Devices/2D84E82E-AEDD-4B7B-A59A-F44C3B6721F2/data/Containers/Bundle/Application/B80C514C-639F-42FE-812F-3ECF457BFEC8/yuedu.app/ScreenCover_night
- https://facebook.github.io/react/img/logo_og.png

现在所有的输入source都已经彻彻底底统一成了url，无论是远程url，还是本地磁盘文件url，所以后续的loadImage过程，就无需特别针对处理了，直接可以进行load了

# 关于RCTImageView的缓存

这是一个很有趣的事情！

我们都知道RN的网络图片是有缓存的，但是今天在群里讨论的时候，却发现了一个很有意思的事情，我发现RN内部，不止一种图片缓存的方案。

## RN的源生native缓存方案（存在感极低）

对于源生客户端来说，通常会使用`SDWebImage`这样的第三方库去处理网络图片，因为他有着非常强大的内存缓存，磁盘缓存，有着灵活的缓存管理手段，以图片url为key，统一在一个字典表里进行存储，无论是内存还是磁盘。

RN也不例外，你可以找到一个`RCTImageStoreManager`的类，干着类似的事情，以字典+urlKey的方式管理一堆UIImage，但奇怪的是，这个类居然没有任何方法调用。

`RCTImageStoreManager`是一个APIModule，他含有`RCT_EXPORT_MODULE()`代码。也就是说JS层是可以直接操作`RCTImageStoreManager`的，但是顺藤摸瓜寻找JS层是如何使用却发现，只有2个JS文件使用了它，`ImageStore.js`与`ImageEditor.js`，有趣的事情来了，这两个JS组件就好端端的躺在rn框架代码里，但是并没有被任何人使用，没有被Image组件直接使用，网上google了一下发现相关内容非常之少，只有极个别人会用一下。RN的英文官网也搜不到这两个组件的介绍。

但正如我说，这一整套源生native缓存方案，无论是OC侧的源码还是JS测的源码就这么好端端的呆在RN的框架源码里面，等待着被人使用，虽然几乎没有。如果你尝试一下，发现一切都运作正常

## 第三方扩展的native缓存方案

搜`reactnative image cache`相关字样的时候，你可以发现github上有很多第三方从新写的一套类似`ImageStore.js`与`ImageEditor.js`的解决方案，看来要么是有人觉得facebook写好的现成的不够牛逼，基于数据库重新封装了一套，要么是有人压根都不知道facebook写好了一个，于是自己重写了一遍，哈哈

总之fb自己写好的那一套native缓存方案，存在感异常的低啊哈哈哈哈哈

## RN的http图片缓存方案

都说了，fb自己的native缓存方案存在感如此之低，太多的人都不知道，github上的开源的解决方案其实普及率也没那么大，很多人用RN也没用github上的三方缓存也没用fb提供的缓存，但RN的图片依然还是有缓存功能的，这是为啥？

这就回到了RCTImageView的`reloadImage`函数了，它里面会起一个NSURLSession去拉取网络图片数据，当拉取到图片缓存数据后，会使用OC源生的NSURLCache缓存整个URLRequest

```objectivec
//RCTImageLoader-loadImageOrDataWithTag:xxx(line:390)

dispatch_async(_URLCacheQueue, ^{
    // Cache the response
    // TODO: move URL cache out of RCTImageLoader into its own module
    BOOL isHTTPRequest = [request.URL.scheme hasPrefix:@"http"];
    [strongSelf->_URLCache storeCachedResponse:
     [[NSCachedURLResponse alloc] initWithResponse:response
                                              data:data
                                          userInfo:nil
                                     storagePolicy:isHTTPRequest ? NSURLCacheStorageAllowed: NSURLCacheStorageAllowedInMemoryOnly]
                                    forRequest:request];
    // Process image data
    processResponse(response, data, nil);

    //clean up
    [weakSelf dequeueTasks];

});
```
所以说，如果你没有使用任何的native图片cache方案，无论是fb提供的还是三方的，rn依然会帮助你进行图片缓存，使用的方法就是系统级NSURLCache的整个URLRequest的缓存，这个缓存是系统级的，会和你其他的非rn的native的http缓存请求混在一起处理（具体看NSURLCache的使用，native可以自由的单开和共用）


			
		