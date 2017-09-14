---
title: 混编ObjectiveC++
date: 2016-05-01 20:21:41
categories: 技术感悟
tags: [C++,混编]
---

最近有点炒冷饭的嫌疑，不过确实以前没有Git Or Blog的习惯，所以很多工作上的技术分享就存留在了电脑的文档里，现在还是想重新整理一下，再分享出来。

混编C++也是以前工作中需要用到的，于是被我炒冷饭翻了出来，不过确实有重新整理了一下

# 为什么要使用C++混编

## 1）需要使用工具库或者源码是C++的

各个平台，各种语言，都会有很多开源的工具和库文件方便大家学习和使用，但如C与C++这版经典的语言，很多底层的，算法型的库都是用C++实现的，尤其是很多人脸识别，图形滤镜算法，视频处理算法，甚至底层图形渲染OpenGL

## 2）C++执行效率快

大家都知道C++的执行效率快，所以在高复杂度高算法层面的开发内容里，大多都选择使用C++来完成，我是做客户端的，虽然不像做机器学习，大数据处理等在工作中需要广泛运用高效算法，但上面提到的人脸识别，图形滤镜算法，甚至视频处理，还有很多游戏内部需要的游戏AI，都是有可能运用在我们熟知的客户端开发之中

## 3）跨平台

C++是编译型跨平台的，C++的代码编译出来的二进制文件可以在android，iOS，甚至WP上都可以正常运行，可谓是真·跨平台

说到跨平台，肯定不少人提起H5跨平台呀，ReactNative跨平台呀，这类通常属于解释型跨平台，约定好一种脚本语言，底层辅助以各平台的基础实现，甚至底层就是借助C++实现，通过底层解读脚本语言，在运行时进行解释实现逻辑，就好比webkit作为浏览器的核心，JavaScriptCore作为RN的核心，虽然开发中使用了js进行写代码，但是究其本质还是在运行时解释js在进行native执行的。js代码并不参与编译，这类跨平台在编译时参与编译的，正是那套语法解释器+NA底层代码，他们或多或少还是通过C++实现的

## 我们使用C++做逻辑的原因

我们做客户端，核心模块使用C++的原因其实就是出自（2）（3）两点，因为我们的业务涉及极其复杂的文字排版，而无论是iOS平台还是安卓平台，基础排版是很难满足中文甚至我大天朝独有政治要求的，想要实现势必要在每个平台上分别封装一套极度复杂的排版策略控制，因此我们放弃了使用CoreText的基础排版API（安卓上用啥排版不知道），而选择用C++实现一套通用于两个平台的排版策略，当然在排版速度效率上也是要很高要求的



# ObjectiveC 与 C++ 的共同点
<!-- more -->
在iOS开发之中，OC代码与C++代码可以完美的融合在一块，何谓完美？你甚至可以上一行刚敲完`[NSArray objectAtIndex:xx]`（OC代码）下一行就使用STL构建一个C++的List<Object>数组（C++代码），他们之间可以完美编译，生成正常的程序，并且还可以单步debug，随时跟进一层一层的方法，刚刚单步跳出一个OC的messageSend，马上就可以单步跟进一个C++ Class的function，这之间没有一点障碍，所有变量，指针，结构体，数据，都可以任意查看，二者之间畅通无阻

## 向下完全兼容C是他们的共同点和纽带

为什么会这样？因为C++与OC都完全向下兼容C
所有的OC对象，虽然有ARC辅助内存管理，但他本质上还是一个`void *`，同理C++也一样是`void *`，OC之所以调用函数叫做发送消息，是因为封装了层独有的runtime机制（这机制还是C的），但归根结底每个函数实体依然是一个IMP，依然是一个函数指针，这一点和C++也一样，所以他们之间的衔接才会如此通畅

## 其他混编情况可就没那么容易了

- android混编C++，恩很麻烦，只能先编译成so，两个环境如果要交互，要先手写一套JNI，把C++环境下的数据和java环境下的数据进行手动转换，并且断点调试没法断点进入so内，想要debug调试，必须靠fwrite写log到本地磁盘调试╮(╯_╰)╭

- 我以前搞过游戏，做过C++内混编lua脚本，这俩互通更蛋疼，虽然lua的解释器底层是用C写的，但是所有的内存都是lua解释器（或者叫虚拟机）内的数据，因此如果二者要互通，也要写一个通道来交换数据，这个交换数据，就是通过超级烦琐的数据对齐，压栈，出栈来互通。

- 前一阵子也学习了一些JSPatch，他其实可以看做是js代码混编Oc的模范工程，同lua一样，整个js的运行环境也是依赖于JavaScriptCore提供的一套JS虚拟机来执行，他有着自己的上下文JSContext，虽说简单的通用数据，字符串，数组，字典，被JavaScriptCore自动的执行完了转换，但一旦需要两个环境交换独有数据类型，例如js里面的function，例如oc里面的自定义NSObject，那么就需要JSValue这个对象起到转换和传递的作用

# ObjectiveC如何混编C++

- 想要创建一个纯C++类，你只需要创建.h开头和.cpp开头的文件，直接导入工程就好，如果需要使用一些C++的标准库，可以直接从Xcode导入libstdC++

- 如果你想创建一个能即识别C++又识别OC的对象，只需要照常创建一个.h 文件和.m文件，然后将.m文件重命名成.mm文件，就是告诉编译器，这个文件可以进行混编 — ObjectiveC++（名字是不是有点酷）

- 如果你想创建一个纯OC类，那这还需要用我说么？

现在你的工程里，可以有这三种文件存在，基本上就可以满足我们的混编需求了。

怎么样是不是很想赶快试试了？

# 例子：在一个OC环境里调用C++

我的例子会一步一步来，甚至有的步骤中可能是错误的代码，给大家展示完错误的代码后，进行说明，再放上正确的代码,

代码也不全是完整代码


CppObject.h C++的头文件 .cpp文件留空，先不写逻辑

```c++
#include <string>
class CppObject
{
public:
    void ExampleMethod(const std::string& str){};
    // constructor, destructor, other members, etc.
};

```

OCObject.h OC的头文件 .m文件先改为.mm，但先不写逻辑

```objectivec
#import <Foundation/Foundation.h>
//#import "CppObject.h"

@interface OcObject : NSObject {
    CppObject* wrapped;
}

@property CppObject* wrapped2;

- (void)exampleMethodWithString:(NSString*)str;
// other wrapped methods and properties
@end

```
头文件准备完毕，实现文件，我先不写逻辑，先跑一下看看会有什么问题？

跑完了以后会编译报错，报错的原因很简单，你在`OCObject.h `中引用了C++的头文件，xcode不认识，无法编译通过。

咦？刚刚不是说好了C++和OC无缝互通了么，这咋又不认识了？原因很简单，我们通过修改.m为.mm文件，能让编译器xcode知道这是一个混编文件，但是我可没说修改.h为.hh文件哟，是这样的，对于xcode来说，可以认识.mm的混编语法，但是不认识.h文件中的混编语法，如果.h全都是C++的写法，没有问题，如果.h全都是OC的写法，没有问题，如果.h里面有C++又有OC？那妥妥的有问题（.h中引入的其他头文件也算在内）


怎么处理呢？两个办法

- 不在.h里写混编了，那我移到.mm里呗~~~

- 不让我写c++？ok，我写C，反正写C是没错的，所以老子写`void *`写`id`



这里的例子我先写到.mm文件里

```objectivec
#import "OcObject.h"
#import "CppObject.h"
@interface OcObject () {
    CppObject* wrapped;
}
@end

@implementation OcObject

- (void)exampleMethodWithString:(NSString*)str
{
    // NOTE: if str is nil this will produce an empty C++ string
    // instead of dereferencing the NULL pointer from UTF8String.
    std::string cpp_str([str UTF8String], [str lengthOfBytesUsingEncoding:NSUTF8StringEncoding]);
    wrapped->ExampleMethod(cpp_str);
}
```

这不~妥了没问题了~，我们再去补上CPP文件中的函数实现，随便写个printf()，输出个string，例子就完成了

# 例子：在一个C++环境里调用OC
首先我们要打造一个C++的环境

```c++
--AntiCppObject.h

#include <iostream>

class AntiCppObject
{

public:
    AntiCppObject();
    void ExampleMethod(const std::string& str){};
    // constructor, destructor, other members, etc.
};


--AntiCppObject.cpp

#include "AntiCppObject.h"

AntiCppObject::AntiCppObject()
{
    
}
```

然后我们再准备一个OC类接入C++，m文件我就不补充完了，随便写个NSLog就好

```objectivec
--AntiOcObject.h

#import <Foundation/Foundation.h>

@interface AntiOcObject : NSObject

- (void)function;

@end
```

现在打算接入C++环境了，首先先把.CPP改成.mm文件，妥妥哒

然后修改头文件

```c++
--AntiCppObject.h
#import "AntiOcObject.h"
class AntiCppObject
{
    AntiOcObject* AntiOc;
public:
    AntiCppObject();
    void ExampleMethod(const std::string& str){};
    // constructor, destructor, other members, etc.
};
```

经过了刚才的例子，看到这应该立马反应过来，这不对，头文件不能混编，会报错的。那应该怎么做呢？

做法还是上面提到的，要么`void *`，要么想办法把定义写在.mm文件里，老规矩，`void *`先不提，我们先在.h中写个结构体，藏起来那个oc的对象，在mm文件中进行声明

```c++
--AntiCppObject.h

#include <iostream>
struct sthStruct;
class AntiCppObject
{
    sthStruct* sth;
public:
    AntiCppObject();
    void function();
    // constructor, destructor, other members, etc.
};

---AntiCppObject.cpp

#include "AntiCppObject.h"
#import "AntiOcObject.h"

struct sthStruct
{
    AntiOcObject* oc;
};

AntiCppObject::AntiCppObject()
{
    AntiOcObject* t =[[AntiOcObject alloc]init];
    sth = new sthStruct;
    sth->oc = t;
}

void AntiCppObject::function()
{
    [this->sth->oc function];
}
```

你看这样就实现了在C++中调用OC


# ObjectiveC++混编注意事项
- 只需要将.m文件重命名成.mm文件，就是告诉编译器，这个文件可以进行混编 — ObjectiveC++
- 在一个项目里使用两种语言，就要尽可能的把这两种语言分开，尽管你可以一口气将所有的文件重命名，但是两种语言差异性还是很大，混乱使用，处理起来会很困难
- header文件没有后缀名变化,没有.hh文件^_^。所以我们要保持头文件的整洁，将混编代码从头文件移出到mm文件中，保证头文件要么是纯正C++，要么是纯正OC，（当然，有C是绝对没问题的）
- Objective-C向下完全兼容C，C++也是，有时候也可以灵活的使用`void *`指针，当做桥梁，来回在两个环境间传递（上面的例子没有体现）

# 小心你的内存

- 按着之前的原则，C++和OC两部分尽量区分开，各自在各自的独立区域内维护好自己的内存，Objective-C可以是arc也可mrc，C++开发者自行管理内存
- 在.mm文件中，OC环境中在init 和dealloc中对C++类进行 new 和 delete操作
- 在.mm文件中，在C++环境中构造和析构函数中进行init 和 release操作

```
--OcObject.mm
-(id)init
{
    self = [super init];
    if (self) {
        wrapped = new CppObject();
    }
    return self;
}

-(void)dealloc
{
    delete wrapped;
}

--AntiCppObject.mm
AntiCppObject::AntiCppObject()
{
    AntiOcObject* t =[[AntiOcObject alloc]init];
    sth = new sthStruct;
    sth->oc = t;
}

AntiCppObject::~AntiCppObject()
{
    if (sth) {
        [sth->oc release];//arc的话，忽略掉这句话不写
    }
    delete sth;
}

```
这个例子告诉我们什么？

如果我们通过oc的方式创建出来的，他的内存自然归OC管理，如果是mrc，请使用release，如果是arc，只要置空，自然会自动释放

如果我们通过C++的方式，构造函数new出来的，那我们就要手动的使用析构函数就释放他

其实很多事情原理是一样的

- 我们在iOS开发使用CF函数的时候，但凡使用CFCreateXX的一定要手动自己调用CFRlease
- 我们在编写C++的时候，使用malloc的一定要自己free，使用new的一定要自己delete

# id的妙用

刚才的例子中，我虽然频繁提到`void *`但是并没有详细加以说明，神奇的东西应该放在最后

首先说一下id这个很特殊的东西

前面第二个例子，我们是借助一个结构体struct把oc代码隐藏到.mm文件里，那么我们可以不借助struct么？当然可以

```
--AntiCppObject.h
#include <iostream>
struct sthStruct;
class AntiCppObject
{
    id sthoc;
    sthStruct* sth;
public:
    AntiCppObject();
    ~AntiCppObject();
    void function();
    // constructor, destructor, other members, etc.
};

--AntiCppObject.cpp
#include "AntiCppObject.h"
#import "AntiOcObject.h"

struct sthStruct
{
    AntiOcObject* oc;
};

AntiCppObject::AntiCppObject()
{
    AntiOcObject* t =[[AntiOcObject alloc]init];
    sth = new sthStruct;
    sth->oc = t;
    
    sthoc = [[AntiOcObject alloc]init];
}

AntiCppObject::~AntiCppObject()
{
    if (sth) {
        [sth->oc release];
        
        [sthoc release];
    }
    delete sth;
}

void AntiCppObject::function()
{
    [this->sth->oc function];
    [this->sthoc function];
}
```

可以看到这个例子中，那个struct还在，旧的方案仍然保留，但是我们在头文件里写了一个id类型，xcode编译器在全都是C++代码的.h文件里虽然不认识oc对象，但是其实是认识id的，我们借助这个id，就可以不借助struct隐藏oc对象声明了

# 神奇的void *
终于说到这个`void *`了，首先我们写个oc对象，可以持有`void *`，写个C++也可以持有，甚至我们不写任何对象，在写一个static的C代码，也可以在一个全局控件保存一个`void *`对象，正是这个`void *`对象，可以灵活的组合出各种混编用法

`void *`是什么？就是指针的最原本形态，利用它我们可以各种花式的进行混编OC与C++

唯一需要注意的就是`id`(即oc对象)与`void *`的转换，要知道arc是有内存管理的，而C++是没有的，如果都一股脑的随便二者转来转去，那内存管理到底该如何自动进行释放？（mrc下二者转换是不需要特别处理的）

因此Arc下二者进行转换经常伴随着一些强转关键字

- __bridge          
- __bridge\_retained 
- __bridge\_transfer 

其实是从内存安全性上做的转换修饰符，相关搜索id与`void *`转换可以自行查阅，而且在iOS的core fundation开发中非常常见，简单的说就是bridgeretained会把内存所有权同时归原对象和变换后的对象持有（只对变换后的对象做一次reatain），bridgetransfer会把内存所有权彻底移交变换后的对象持有（retain变换后的对象，release变换前的对象）


这里面我会贴一段代码，这段代码只为展示一些使用，因此，设计上可能有点绕，和扯淡，只为展示混编

```
--TrickInterface.h
typedef void (*interface)(void* caller, void *parameter);



--TrickOC.h
#import <Foundation/Foundation.h>
#import "TrickInterface.h"

@interface TrickOC : NSObject
{
    int abc;
}

-(int)dosthing:(void*)param;
@property interface call;
@end

--TrickOC.m
#import "TrickOC.h"
#import "TrickInterface.h"

void MyObjectDoSomethingWith(void * obj, void *aParameter)
{
    [(__bridge id) obj dosthing:aParameter];
}

@implementation TrickOC

-(id)init
{
    self = [super init];
    if (self) {
        self.call = MyObjectDoSomethingWith;
    }
    return self;
}

-(int)dosthing:(void *)param
{
    NSLog(@"111111");
    return 0;
}

@end

--TrickCpp.cpp
#include "TrickCpp.h"
#include "TrickInterface.h"

TrickCpp::TrickCpp(void* oc,interface call)
{
    myoc = oc;
    mycall = call;
}

void TrickCpp::function()
{
    mycall(myoc,NULL);
}

--TrickCpp.h
#include <iostream>
#include "TrickInterface.h"
class TrickCpp
{
    void* myoc;
    interface mycall;
public:
    TrickCpp();
    TrickCpp(void* oc,interface call);
    ~TrickCpp();
    void function();
    // constructor, destructor, other members, etc.
};


--使用样例

TrickOC* trickoc = [[TrickOC alloc]init];
    void* pointer = (__bridge void*)trickoc;
    TrickCpp * trick = new TrickCpp(pointer,trickoc.call);
    trick->function();

```


这段代码中首先在全局区域声明了一个全局的cfunction`interface `，起名叫接口顾名思义是打算把它当做C++传递OC的通道，所有跨C++回调OC都通过这个通道来通信


在TrickOc.m文件中也实现了这一个全局的cfunction`MyObjectDoSomethingWith`，这个cfunction实体就是我们的接口通道

当创建TrickCpp的时候，将以创建好的TrickOc和这个cfunction一并传入，当Cpp需要调用Oc的时候，直接使用cfunction与TrickOc的对象


- 本着代码上尽量隔离两种语言避免开发上的混乱和困难，有时候需要一些设计，比如C++做三方库在一个以OC为主的环境中进行使用，OC需要任意调用C++的各种接口和对象，但是不希望三方库直接引用oc头文件，希望三方库解耦，只通过固定回调或者协议来通信
- 这demo代码仅仅是一种刻意设计，为了展示故意而为的，真正开发的时候需要根据自己情况好好进行设计



# 参考文献

[http://blog.csdn.net/weiwangchao_/article/details/7895949](http://blog.csdn.net/weiwangchao_/article/details/7895949) 

[http://www.philjordan.eu/article/mixing-objective-c-c++-and-objective-c++](http://www.philjordan.eu/article/mixing-objective-c-c++-and-objective-c++)

[http://bbs.9ria.com/thread-229773-1-1.html](http://bbs.9ria.com/thread-229773-1-1.html)
