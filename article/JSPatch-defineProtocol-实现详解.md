---
title: JSPatch defineProtocol 实现详解
date: 2015-12-25 14:01:25
categories: 技术感悟
tags: [JSPatch,runtime]
---

这是上一篇博客提到的代码的深入剖析

note:这个是JSPatch附属新增的小功能点，想要详细了解JsPatch整体部分的工作及原理戳这个wiki [JSPatch实现原理详解](https://github.com/bang590/JSPatch/wiki/JSPatch-%E5%AE%9E%E7%8E%B0%E5%8E%9F%E7%90%86%E8%AF%A6%E8%A7%A3)


## 出发点

### 一个不小心引发的bad case
工作中遇到了一个case，有一部分代码被重构了，一个函数被彻底的废弃并且.m文件中的具体函数实现已经被整体注释掉了，但是.h文件这个函数还存在.

由于被重构的那部分在客户端很多处代码都有调用，没有及时的替换成最新的函数，导致造成了线上crash，`unrecognized selector`.

我最开始想用JsPatch发出一个hotfix，既然是`unrecognized selector`，具体的函数实现不存在，那么我用JSPatch动态补上这个函数实现，就可以封住crash了.

结果操作后发现，无法实现，原因是.h文件中这个selector里面有一个非id类型的参数.

### JSPatch只能新增参数类型为id的方法

在JsPatch的Wiki中[defineClass](https://github.com/bang590/JSPatch/wiki/defineClass%E4%BD%BF%E7%94%A8%E6%96%87%E6%A1%A3）) 有一句说明

> 可以给一个类随意添加 OC 未定义的方法，但所有的参数类型都是 id:

为什么会这样，探究其源码可以发现

```objectivec
if (!overrided) {
     NSMutableString *typeDescStr = [@"@@:" mutableCopy];
     for (int i = 0; i < numberOfArg; i ++) {
         [typeDescStr appendString:@"@"];
     }
     overrideMethod(currCls, selectorName, jsMethod, !isInstance, [typeDescStr cStringUsingEncoding:NSUTF8StringEncoding]);
}
```

当使用defineClass对新方法命名的时候，defineClass能通过`_`自动识别参数的位置和个数，但是并没有能识别参数的类型。

而在通过这段代码创建新方法的时候，需要输入方法的`type encode`，由于defineClass只有参数的个数和位置信息，并未获得参数的类型，因此JsPatch默认要求新方法所有输入的参数都是id类型，返回的参数也必须是id类型，通过`@@:`+参数数量个`@`来生成，只允许id类型的参数及返回的新方法

关于`type encode`后面会详细解释

当我在尝试通过JsPatch修复我的case的时候，由于我希望新增的方法是一个含有非id类型参数的方法，而JsPatch最终添加的新方法的参数都是id，所以程序运行的时候依然会crash，因为他还是找不到那个他想要的方法，依然是`unrecognized selector`


<!-- more -->

## 修改思路


### 知道原因，寻找思路

- defineClass为覆盖修改方法而设计，对于新增方法，传入的信息不足，不能生成正确的`type encode`，所以无法正确的添加任意参数类型的方法，于是统一设定为id类型
- 如果由使用者传入足够的信息，借而生成正确的`type encode`，则我们的目的就可以达成


我们可以考虑修改defineClass的input，专门在新增方法处开新的接口传入参数，从而使得一切信息都能到手，正常生成正确的新方法。

但是眼下还有2个问题

- defineClass在设计上，新增方法和覆盖修改方法走的是同一个输入口，单独为新增方法而重新调整输入接口，会使代码逻辑和设计模式变化比较大
- 在用户已经养成的JsPatch编写习惯上，新增和覆盖二者本是统一的，为新增方法而大改defineClass的输入模式，势必会让已经习惯使用的用户有很大不便
- 寻找一个合适的方案，能不大范围影响现在的设计模式，又能完成我的想法

### defineClass的Protocol

JsPatch的[defineClass](https://github.com/bang590/JSPatch/wiki/defineClass%E4%BD%BF%E7%94%A8%E6%96%87%E6%A1%A3）) 中提到的Protocol的作用

> 可以在定义时让一个类实现某些 Protocol 接口，写法跟 OC 一样:


> defineClass("JPViewController: UIViewController<UIScrollViewDelegate, UITextViewDelegate>", {})

 
> 这样做的作用是，当添加 Protocol 里定义的方法，而类里没有实现的方法时，参数类型不再全是 id，而是自动转为 Protocol 里定义的类型:


看到原作者bang的说明我们就可以明白，defineClass中的Protocol的作用本是借助已经存在的Protocol的定义，从已经存在的Protocol中就可以抽取出描述selector的`type encode`，进而生成含有非id参数的方法描述，从而能新增出正确的方法。

我们还可以看下源码，就一清二楚
```objectivec
if (class_respondsToSelector(currCls, NSSelectorFromString(selectorName))) {
                overrideMethod(currCls, selectorName, jsMethod, !isInstance, NULL);
} else {
    BOOL overrided = NO;
    for (NSString *protocolName in protocols) {
        char *types = methodTypesInProtocol(protocolName, selectorName, isInstance, YES);
        if (!types) types = methodTypesInProtocol(protocolName, selectorName, isInstance, NO);
        if (types) {
            overrideMethod(currCls, selectorName, jsMethod, !isInstance, types);
            free(types);
            overrided = YES;
            break;
        }
    }
    if (!overrided) {
        NSMutableString *typeDescStr = [@"@@:" mutableCopy];
        for (int i = 0; i < numberOfArg; i ++) {
            [typeDescStr appendString:@"@"];
        }
        overrideMethod(currCls, selectorName, jsMethod, !isInstance, [typeDescStr cStringUsingEncoding:NSUTF8StringEncoding]);
    }
}
```
源码中先判断是否该方法已经存在，存在的情况下进行覆盖，如果不存在，先判断defineClass中是否指定了Protocol，指定了的话从Protocol中寻找匹配的Method进行覆盖和新增，如果在指定Protocol中也找不到，才进行强制id参数类型的方法新增。

所以我选一个比较好的角度，既不破坏原本defineClass的设计逻辑，又能将新的参数传入其中。

那就是设计一个全新的接口defineProtocol，在这个全新的接口里面输入足够多的参数信息，进而通过运行时创建全新的Protocol，创建完成的新Protocol就自然可以借助defineClass里面的功能，引入正确的新增方法

## 具体实现

### JS接口设计

一开始我是想直接让使用者输入`type encode`这样也省了我的事，后来和原作者交流觉得，尽可能的节省使用者的学习成本，毕竟`type encode`不知道的人还真不太能很快搞明白这一大堆`: # @ v b i`的乱七八糟字符到底该怎么写，如果输入接口这样，就会比较直观
```javascript
defineProtocol('lalalala',{
  testProtocol: {
    paramsType:"int, id",
    returnType:"BOOL"
  },
  ...
}, {
  ...
});
```
使用者直接输入int,float,id,void等，由代码自动识别生成最终的`type encode`，而且因为自动识别需代码进行逐一的支持和转换，有些特殊的参数类型，代码转换并不能完全覆盖，于是还添加了一个可选的参数typeEncode，一旦自动转换无法支持的参数类型，就可以通过可选参数，需要使用者自己想办法手写`type encode`了，主要无法支持的参数是用户自定义的struct

### 代码实现
JS接口这部分实现就不详细描述了，和JSPatch其他接口完全一致，

看下对比是不是和defineClass一模一样？^_^
```objectivec
	context[@"_OC_defineProtocol"] = ^(NSString *protocolDeclaration, JSValue *instProtocol, JSValue *clsProtocol) {
        return defineProtocol(protocolDeclaration, instProtocol,clsProtocol);
    };


	context[@"_OC_defineClass"] = ^(NSString *classDeclaration, JSValue *instanceMethods, JSValue *classMethods) {
        return defineClass(classDeclaration, instanceMethods, classMethods);
    };
```
    
通过运行时`objc_allocateProtocol`创建新Protocol，通过`protocol_addMethodDescription`来为新Protocol增加方法，通过`objc_registerProtocol`来注册新Protocol，这是基本的runtime代码，不多描述了，源码里都可以看到

唯一需要注意的是新protocol一经注册生效`objc_registerProtocol`，就不可在更改了，所以defineProtocol不能修改已经存在的Protocol

`protocol_addMethodDescription`需要输入seletorName和type encode，接下来重点说下如何在js返回的字典里识别这两个参数

### 识别selector
如接口设计里面的样例testProtocol，是被当做字典中的key，可以直接取出来的，因为我们设计defineProtocol中Js新方法的命名和defineClass一致，都是参数用`_`代替，原本的_下划线用`__`代替，所以解析key这个字符串的步骤和defineClass也一致

NOTES:源码中需要用paramsType的个数来判断函数名结尾是否存在参数，所以在typeEncode可选参数使用的情况下，paramsType可以随意输入任意的字符串，但是必须保证数量匹配

### 识别type encode
如接口设计里面的样例，参数会输入"int, id"这样的字符串，返回值会输入"void"这样的字符串，前者再通过`,`号拆分成字符串数组，就接下来就可以通过代码获取了，我打算构建一个有限字符串映射表typeEncodeDic，以type字符串为key，映射`int`到`i`这样。

typeEncodeDic这个表已经构建好了，这样从js传来的type字符串当做key，直接从这个表里就能get到编码。

人肉去写这个表太low了，怎么也得用酷炫一点的方式支持一下，看到原作者bang，在JsPatch里面风骚的宏的用法，我也照猫画虎了一个

```objectivec
NSMutableDictionary* typeEncodeDic = [[NSMutableDictionary alloc]init];
#define JP_DEFINE_TYPE_ENCODE_CASE(_type) \
if ([@#_type length] > 0) {\
    char* encode = @encode(_type);\
    NSString * encodestr = [NSString stringWithUTF8String:encode];\
    [typeEncodeDic setObject:encodestr forKey:@#_type];\
}
JP_DEFINE_TYPE_ENCODE_CASE(id);
```

`JP_DEFINE_TYPE_ENCODE_CASE`这个宏就自动的将输入参数`_type`通过语法糖`@encode()`写入字典，这里面还有一处很nb的地方

### 宏里面用参数生成静态字符串
这是一个很trick的地方，原本我的宏是这么设计的`JP_DEFINE_TYPE_ENCODE_CASE(@"id",id)`为什么这么设计？因为我搞不定怎么在宏里将id转成@“id”,试了很多种方法都不行╮(╯_╰)╭

后来原作者bang交流，他给了解决办法，`@#_type`他在JsPatch里已经用到了，说他当初也遇到一样的困扰，然后查到的。

所以最终这个宏被设计成了这样。

		   JP_DEFINE_TYPE_ENCODE_CASE(id);
		   JP_DEFINE_TYPE_ENCODE_CASE(BOOL);
		   JP_DEFINE_TYPE_ENCODE_CASE(int);
		   JP_DEFINE_TYPE_ENCODE_CASE(void);
		   JP_DEFINE_TYPE_ENCODE_CASE(char);
		   JP_DEFINE_TYPE_ENCODE_CASE(short);
		   JP_DEFINE_TYPE_ENCODE_CASE(unsigned short);
		   JP_DEFINE_TYPE_ENCODE_CASE(unsigned int);
		   JP_DEFINE_TYPE_ENCODE_CASE(long);
		   JP_DEFINE_TYPE_ENCODE_CASE(unsigned long);
		   JP_DEFINE_TYPE_ENCODE_CASE(long long);
		   JP_DEFINE_TYPE_ENCODE_CASE(float);
		   JP_DEFINE_TYPE_ENCODE_CASE(double);
		   JP_DEFINE_TYPE_ENCODE_CASE(CGFloat);
		   JP_DEFINE_TYPE_ENCODE_CASE(CGSize);
		   JP_DEFINE_TYPE_ENCODE_CASE(CGRect);
		   JP_DEFINE_TYPE_ENCODE_CASE(CGPoint);
		   JP_DEFINE_TYPE_ENCODE_CASE(CGVector);
		   JP_DEFINE_TYPE_ENCODE_CASE(UIEdgeInsets);
		   JP_DEFINE_TYPE_ENCODE_CASE(NSInteger);
		   JP_DEFINE_TYPE_ENCODE_CASE(Class);
           JP_DEFINE_TYPE_ENCODE_CASE(SEL);

从这可以看出来，想要扩展支持更多的参数类型？没问题，在这里添加就好了（不想修改源码，动态添加就走之前说的可选参数typeEncode）

### 处理id类型参数
看到上面我们知道，如果我的新函数中存在id类型，无论是系统类型NSArray还是用户自己写的CustomObject，在使用我们的defineProtocol的时候用户需要自己记得所有的NSObject都要输入`id`,仔细想想这也挺不方便的对吧？

所以我额外做了一个处理，当从typeEncodeDic表里面找不到对应的key的时候，就会`NSClassFromString`来判断是否是一个Oc对象，如果是自动转换为id的类型编码`@`
```objectivec
NSString* argencode = [typeEncodeDic objectForKey:argstr];
if (argencode.length <= 0) {
    Class cls = NSClassFromString(argstr);
    if ([(id)cls isKindOfClass:[NSObject class]]) {
        argencode = @"@";
    }
}
```
这样无论用户输入`类名`还是`id`,我这边的处理都是完全一样，等效的

	paramsType:"id"
	paramsType:"CustomObject"


### 生成SEL的类型编码
SEL的类型编码命名方式是这样的
```objectivec
- (void) setSomething:(id) anObject
```
这个函数他的类型编码是

	v@:@
	
- 第一个`v`代表返回值是void即void的类型编码
- 第二个`@`代表self（其实是第一个参数 Self和SEL是任何oc函数的隐藏参数），这个基本是固定的
- 第三个`:`代表SEL（其实是第二个参数 Self和SEL是任何oc函数的隐藏参数），这个基本是固定的
- 第四个`@`代表Oc函数第一个参数的类型即id的类型编码

通过这些规律，我们可以手写SEL的类型编码了,每一种参数类型可以查询苹果的定义

代码中可选参数typeEncode优先级最高，如果用户手写了可选参数，则不会执行代码自动生成，直接使用用户输入的typeEncode，生成Protocol。

```objectivec
if (typeEncode) {
    addMethodToProtocol(protocol, selectorName, typeEncode, isInstance);
}else
{
    //type encode string automatic create
}
```

### 详探TypeEncode
我们可以手写typeEncode，其实也可以借助oc代码生成typeEncode

我们先在代码中实现`- (void) setSomething:(id) anObject`这个方法，然后使用下面的代码，就能通过系统取出SEL的typeEncode

```objectivec
Class cls = self.class;
SEL selstr = NSSelectorFromString(@"setSomething:");
Method method = class_getInstanceMethod(cls, selstr);
const char* type = method_getTypeEncoding(method);
```
经过系统的读取，惊讶的发现，系统算出来的type居然是`v12@0:4@8`，这他喵的一堆数字是什么鬼！，刚才不是说`v@:@`嘛？？？？？？？？！！！！！！

经过我反复地测试，发现无论是输入`v12@0:4@8`还是`v@:@`，Protocol都能正常的生成，一点区别也没有，完全不影响使用，但是他喵的为什么系统就会多出来这么多数字？

栈溢出的一个回答似乎能解释 [StackOverFlow-What are the digits in an ObjC method type encoding string?](http://stackoverflow.com/questions/11491947/what-are-the-digits-in-an-objc-method-type-encoding-string)

和gitHub上的@DevSonw聊，觉得这可能是一个字节补齐的过程，并不影响使用