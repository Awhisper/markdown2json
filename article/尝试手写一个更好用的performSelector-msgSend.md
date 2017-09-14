---
title: 尝试手写一个更好用的performSelector-msgSend
date: 2015-12-31 14:05:42
categories: 技术感悟
tags: [runtime]
---

这其实是一个NSInvocation练习作业

尝试手写一个更好用的performSelector/msgSend

## 引子
- 工作中难免会遇到一些场景，开发的时候不想引入整个头文件，但是又想调用一些方法
- 动态创建，动态调用看起来比较酷
- 这种使用场景确实不常见，导入了头文件最省事，最直接，但是这种方式我觉得能搞出很多好玩的东西

一个群里聊天的时候聊到了一个场景，tableView内的cell有N种样式，在`cellForRow`的时候，通过`NSClassFromString`从字符串创建对象，然后挨个对Cell的UI赋值，接下来问题就来了。

实在不想import如此繁多`cell.h`头文件应该怎么办？

- 有一个办法，所有cell都有个基类，基类统一所有UI赋值的接口，子类重载这些UI赋值，这样创建出来的对象强转成基类，调用基类的接口。这样只需要import一个基类头文件就够了
  - 这样要求子类的接口必须和基类完全一致
  - 如果子类设计很多样，赋值UI的元素更多，就会不太合理
- 还有一个办法performSelector，恩说实话，我觉得很不好用
- 会有人说用运行时Objc_msgSend，恩，这个靠谱，听起来也挺易用的
- 老老实实引入各种头文件，别搞什么动态创建，动态调用的花样了

## 聊聊performSelector
这里不是说`performSelector`中关于异步调用的那一部分，而是单说同步的：
```objectivec
- (id)performSelector:(SEL)aSelector;
- (id)performSelector:(SEL)aSelector withObject:(id)object;
- (id)performSelector:(SEL)aSelector withObject:(id)object1 withObject:(id)object2;
```
这个是`NSObject`系统开放的`performSelector`同步接口，这个好用么？我以前觉得很不好用

- 参数类型：我凑，不需要参数的接口用起来最直观，我也觉得还算好用，一旦需要参数，withObject：id是什么鬼？我传BOOL，传NSInteger怎么传啊？我包装成NSNumber对面能认识么？
- 参数个数：为毛只能不带参数，1个参数，2个参数呢？我想调用的东西含参数特别多咋办啊？
- 调用写法：每个参数还得用withObject来传，写出来一点都不酷

就像我说的，以前我几乎只会去用performSelector调用无参数的函数，一旦有参数，我都不爱用performSelector

## 聊聊objc_msgSend
大家都知道OC的消息机制，函数调用其实都是发送消息，这个太多的地方有讲了，我就不多说了。

一个我们想要调用的函数
```objectivec
- (int) doSomething:(int) x { ... }
```
在32位的时代，想要实现我要的效果，可以直接使用objc_msgSend
```objectivec
objc_msgSend(self,@selector(doSomething:), 0);
```
但是一旦在64位设备上执行，就会产生崩溃，原因参见[苹果Converting Your App to a 64-Bit Binary](https://developer.apple.com/library/ios/documentation/General/Conceptual/CocoaTouch64BitGuide/ConvertingYourAppto64-Bit/ConvertingYourAppto64-Bit.html),中Take Care with Functions and Function Pointers，这一部分。

简单的说，64位下runtime调用和32位变化十分大，尤其是读取函数参数列表，进行传参这部分，所以苹果列出了一句话

Always Define Function Prototypes

Function Pointers Must Use the Correct Prototype

直接的调用C函数指针的时候必须先进行严格的类型匹配强转，不能直接使用`Imp`这个通用型的指针。

而objc_msgSend的内部实现也是一个这样的过程，[objc_msgSend学习](http://blog.cocoabit.com/dong-shou-shi-xian-objc-msgsend/)

- 先从runtime method cache里面查找selector，
- 找不到再从 method list里查找，
- 找到selector，获取具体实现的`Imp`C函数，
- 调用`Imp`

所以在64位下，直接使用objc_msgSend一样会引起崩溃，必须进行一次强转
```objectivec
((void(*)(id, SEL,int))objc_msgSend)(self, @selector(doSomething:), 0);
```
所以以前32位的时候objc_msgSend是我们最方便的做法，现在64位了，他已经不是那么方便了，毕竟使用起来还需要人自行手写这部分强转工作

### 本着程序员偷懒大法，这部分能不能也省略了？变得更方便一些？


<!-- more -->
## 设计我的callSelector的接口

我希望我设计的接口是这样的
```objectivec
Class cls = NSClassFromString(@"testClassA");
id<vk_msgSend> abc = [[cls alloc]init];
NSError *err;
NSString *return1 = [abc vk_callSelector:@selector(testfunction:withB:) error:&err,4,3.5f];
```
- 它是一个NSObject的Category，只要你对强转成遵从`<vk_msgSend>`的id对象，就能直接调用
- 它像performSelector一样输入`SEL`做参数执行，但是传参非常容易，基础类型，struct都支持，不需要`withObject`，不需要转成`id`，只需要像NSLog()一样，按顺序输入可变参数就好。
- 有一个error指针可以用来返回错误信息，也可以填nil不传
- 它支持类方法
- `SEL`参数还可以改传字符串

所以他的定义是这样的
```objectivec
+ (id)vk_callSelector:(SEL)selector error:(NSError *__autoreleasing *)error,...;

+ (id)vk_callSelectorName:(NSString *)selName error:(NSError *__autoreleasing *)error,...;

- (id)vk_callSelector:(SEL)selector error:(NSError *__autoreleasing *)error,...;

- (id)vk_callSelectorName:(NSString *)selName error:(NSError *__autoreleasing *)error,...;
```
## 实现这样的callSelector

### 可变参数接口透传的问题
既然接口设计的希望使用者怎么简单怎么来，使用者用可变参数的方式一字罗列所有参数，无需转id之类的。那我们也得按照可变参数去处理。

这里我遇到了一个问题，我一共设计4个接口，这4个接口其实大同小异，核心逻辑是一样的，所以我肯定是用一个公共的方法进行处理，但是，可变参函数怎么透传呢？
```objectivec
- (id)vk_callSelectorName:(NSString*)selName error:(NSError*__autoreleasing*)error,...{
    SEL selector = NSSelectorFromString(selName);
    [self vk_callSelector:selector error:error,...];
}
```
我希望这样就能搞定，把...原封不动的塞到下面那个函数，可是xcode不认呐亲╮(╯_╰)╭

后来公司讨论组里有位大神给出了建议，直接把`va_list`当做公共函数的参数，进行透传

设计公共方法的接口声明为，第一个参数就是`va_list`
```objectivec
static NSArray *vk_targetBoxingArguments(va_list argList, Class cls, SEL selector, NSError *__autoreleasing *error)
```
然后在调用的时候
```objectivec
va_list argList;
va_start(argList, error);
SEL selector = NSSelectorFromString(selName);
NSArray *boxingAruments = vk_targetBoxingArguments(argList, [self class], selector, error);
va_end(argList);
```
用`va_start`获取`va_list`然后就可以一层层的透传给公共方法进行处理了

### 参数包装
虽然输入接口可以支持任意的类型，基础类型，struct，id，但是我内部实现的时候，还是把它们统一转换成了id，方便后续传递处理，这个步骤就是包装一下所有传进来的参数,也就是上面提到的`vk_targetBoxingArguments`

这个包装的过程涉及到`va_list`的取值过程`va_arg`了，这里我也踩了个大坑。容我细细道来

- 从va_list里面一个一个的取出参数需要明确知道，每一个参数的类型，但是我们想做的是一个通用型的方法，这块就不能写死，可是从哪知道参数类型呢？ -- `NSMethodSignature`

`NSMethodSignature`我理解他其实就是SEL的typeEncode的对象封装，分别记录了这个SEL的返回值类型和各个参数类型

我们有调用对象，就能获取到对象的Class，我们有SEL，就能获取到`NSMethodSignature`

```objecitvec
 methodSignature = [cls instanceMethodSignatureForSelector:selector];
 ```
- 有了`NSMethodSignature`我们就能按着循环去获取每个参数类型，从而读取`va_list`了。

```objectivec   
for (int i = 2; i < [methodSignature numberOfArguments]; i++) {
    const char *argumentType = [methodSignature getArgumentTypeAtIndex:i];
    switch (argumentType[0] == 'r' ? argumentType[1] : argumentType[0]) {
    	//抽取参数
}        
```
`NSMethodSignature`中前两个分别代表返回值和reciever，我们在抽取参数，所以直接从[2]下标开始取值，剩下的就是一个根据typeEcode，从`va_list`取值，然后包装成id，塞入数组的过程了，具体到每一种类型的case，可以参见源码。

1）取基础类型int,va_arg(argList, int)取值，包装成NSNumber（只举一个例子，其他见源码）
```objectivec
int value = va_arg(argList, int);
[argumentsBoxingArray addObject:@(value)];
break; 
```
2）取CGSize,va_arg(argList, CGSize)取值，包装成NSValue（只举一个例子，其他见源码）
```objectivec
CGSize val = va_arg(argList, CGSize);
NSValue* value = [NSValue valueWithCGSize:val];
[argumentsBoxingArray addObject:value];
break;
```
3）取id,va_arg(argList, id)，不包装，直接塞进去啦

这里要注意，如果传入的参数为nil，需要特殊处理一下，nil无法放入数组，所以我创建了一个vk_nilObject对象，来表明这个位置传进来nil了
```objectivec
id value = va_arg(argList, id);
if (value) {
	[argumentsBoxingArray addObject:value];
}else{
	[argumentsBoxingArray addObject:[vk_nilObject new]];
}
```
4）取SEL,va_arg(argList,SEL),处理成string

因为SEL本身的意义就是一个函数的名字类似string一样的键值，是用来查找函数用的，所以当成字符串处理啦
```objectivec
SEL value = va_arg(argList, SEL);
NSString *selValueName = NSStringFromSelector(value);
[argumentsBoxingArray addObject:selValueName];
```

5）取block，其实block就是id，所以和id的处理一模一样
```objectivec
//同id
```
6）取id\*，va_arg(argList, void\*\*)

这里需要注意一下，因为我取出来的是一个pointer，是不能直接放入数组里的，所以我创建了一个vk_pointer对象，持有一个void*属性，然后就可以塞进数组了
```objectivec
void *value = va_arg(argList, void**);
vk_pointer *pointerObj = [[vk_pointer alloc]init];
pointerObj.pointer = value;
[argumentsBoxingArray addObject:pointerObj];
```

- 遇到了一个va_arg()的坑

我在调试中，发现当我对typeEncode的`f`取参数的时候
```objectivec
va_arg(argList, float)
```
xcode报了个warning

	/Users/Awhisper/Desktop/GitHub/vk_msgSend/vk_msgSend/NSObject+vk_msgSend.m:280:49: Second argument to 'va_arg' is of promotable type 'float'; this va_arg has undefined behavior because arguments will be promoted to 'double'
	
一开始我看到warning没管，就继续编码去了，结果运行的时候,参数里含有float，发现了大问题

正如warning所说，此处编译器是按着double实现的，但是我用va_arg()取的时候按着float取，就直接导致我取出来的float值不对，是0，（一个比较小的double值取了前面几位自然都是0）

而float后面那个参数，id用va_arg(argList, id)取的时候直接崩溃，（指针已经乱了，从double的中间开始，按着id的长度取id，直接崩溃）

老老实实的修掉warning，改成用`va_arg(argList, double)`处理`f`,一切正常。

### 实现调用：NSInvocation
我们现在已经拿到了包装好的参数数组NSArray，可以开始调用函数了，使用NSInvocation

#### 1 首先先要生成NSInvocation
```objectivec
Class cls = [target class];
NSMethodSignature *methodSignature = vk_getMethodSignature(cls, selector);
NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:methodSignature];
```
#### 2 设置target和SEL
```objectivec
[invocation setTarget:target];
[invocation setSelector:selector];
```
#### 3 循环压入参数

具体过程和Boxing一样，遍历methodSignature，按着typeEncode来从数组中取出id类型的参数，还原参数，压入invocation。

遍历的时候肯定是根据每个参数的typeEncode，去switch处理不同类型
```objectivec
for (int i = 2; i< [methodSignature numberOfArguments]; i++) {
    const char *argumentType = [methodSignature getArgumentTypeAtIndex:i];
    id valObj = argsArr[i-2];
    switch (argumentType[0]=='r'?argumentType[1]:argumentType[0]) {
    	//switch case
    }
}
```
这里我会详细分类别举例如何压入各种不同类型的参数，从[2]下表开始的原因和前边一致
```objectivec
[invocation setArgument:&value atIndex:i];`的作用就是压入参数
```
1）int等基础类型参数，对应上文的参数包装（只举一个例子，其他见源码）
```objectivec
int value = [valObj intValue];
[invocation setArgument:&value atIndex:i];
break; 
```
2）CGSize基础结构体参数，对应上文参数包装（只举一个例子，其他见源码）
```objectivec
CGSize value = [val CGSizeValue];  
[invocation setArgument:&value atIndex:i];
```
3）id参数，对应上文参数包装

上文提到如果传入的id为nil，被上文包装成了vk_nilObject对象扔进数组的，所以这里要针对这个处理一下

不是vk_nilObject的照常处理

是vk_nilObject,证明这个位置的参数传入方为空，所以我准备了一个空指针
```objectivec
static vk_nilObject *vknilPointer = nil;
```
把这个空指针传进去
```objectivec
if ([valObj isKindOfClass:[vk_nilObject class]]) {
    [invocation setArgument:&vknilPointer atIndex:i];
}else{
    [invocation setArgument:&valObj atIndex:i];
}
```
4）SEL参数，对应上文包装

上文提到，SEL被直接转成了string，所以我们这里要还原成SEL，然后直接压入参数
```objectivec
NSString *selName = valObj;
SEL selValue = NSSelectorFromString(selName);
[invocation setArgument:&selValue atIndex:i];
```
5）block参数，对应上文包装

上文提到block和id是一回事
```objectivec
//同id
```
6）id\*的处理，对应上文包装，这里极其恶心，我会专门写一篇详细说一下，这里只写个大概吧
上文已经把void\*包装成了 vk_pointer，所以我们取出vk* 然后压入参数
```objectivec
vk_pointer *value = valObj;
void* pointer = value.pointer;
[invocation setArgument:&pointer atIndex:i];
```
#*你以为这样就可以了么？你太天真了*

如果断点调试，整个call_selector的过程完全走完都不会有事，但是一旦放开断点，彻底走完就崩溃。
为啥呢？因为在使用invocation的时候 invoke的过程中，如果对象在invoke内被创建初始化了，invoke结束后，在下一个autorelease的时间点就会产生zombie的crash，`send release to a dealloc object`

为什么会这样，简单的说下我的理解不细说吧，invoke和直接函数调用不太一样，如果发生了alloc对象，那么这个对象系统会额外多一次autorelease，所以，不会立刻崩溃，但当autoreleasepool释放的时候，就会发生过度release。

给几个LINK有兴趣大家可以深入探讨一下
[栈溢出1](http://stackoverflow.com/questions/10002538/nsinvocation-nserror-autoreleasing-memory-crasher),[栈溢出2](http://stackoverflow.com/questions/9986899/how-to-create-an-nsinvocation-object-using-a-method-that-takes-a-pointer-to-an-o/16027886#16027886)

看一下我的解决办法
```objectivec
vk_pointer *value = valObj;
void* pointer = value.pointer;
id obj = *((__unsafe_unretained id *)pointer);
if (!obj) {
    if (argumentType[1] == '@') {
        if (!_vkNilPointerTempMemoryPool) {
            _vkNilPointerTempMemoryPool = [[NSMutableDictionary alloc] init];
        }
        if (!_markArray) {
            _markArray = [[NSMutableArray alloc] init];
        }
        memset(pointer, 0, sizeof(id));
        [_markArray addObject:valObj];
    }
}
[invocation setArgument:&pointer atIndex:i];
```

我会先判断一下 void*指向的对象是否存在，如果传入的是一个已经alloc init 好了的 mutableArray之类的对象，我会直接压入参数，因为invoke过程内，只是往mutableArray里面执行操作，并没有在void\*指针处重新new的操作的话，是安全的不会崩溃的。

如果void\*指向的对象不存在，相当于我传入了一个 NSError\*，等着由invoke内部去创建，这样外面可以捕获，这种使用场景，就会导致crash，是因为过度release，那我的思路就是先把他持有一下。。。因为多了个release，那我再arc下不能强制retain，那我就add到一个字典里，让他被arc retain一下。
```objectivec
if ([_markArray count] > 0) {
    for (vk_pointer *pointerObj in _markArray) {
        void *pointer = pointerObj.pointer;
        id obj = *((__unsafe_unretained id *)pointer);
        if (obj) {
            @synchronized(_vkNilPointerTempMemoryPool) {
                [_vkNilPointerTempMemoryPool setObject:obj forKey:[NSNumber numberWithInteger:[(NSObject*)obj hash]]];
            }
        }
    }
}
```
这段代码放在`[invocation invoke]`之后，因为只有执行之后我们才知道void\*指向的位置是否创建了新对象，判断`obj`是否存在，如果存在则向一个全局的static字典`_vkNilPointerTempMemoryPool`写入这个对象。

 - 有人说？我为什么不是用栈溢出的答案？，栈溢出的答案却是是保证不crash了，但是传入的参数已经不是void\*\* 而是一个 void\*\*\*了，这样会导致被调用的函数虽然创建了NSError，但是执行完毕后，并没有赋值给有的指针，会导致外面看NSErro还是空（这么表述可能不对，这几天啃指针，这块已经把我弄得有点乱了，但是大家在函数外取个地址&error看一下，然后在函数内看传入的error地址，就会发现已经不对了）
 
 - 有人说，你这样不是内存泄露了么？一个对象在用过以后就永久被添加进了一个static字典里，我只能说`是的`，但是情况不是那么绝对，crash的原因是系统的一次额外的release，并且还发生在代码操作者无法掌控的autoreleasepool的`drain`时机，也就是说，在`drain`前，这个字典里的这个值是正常的（如果没有字典，此时并没崩溃），在`drain`后，这个字典里的值因为一次额外release了，此时这个字典内这个key还存在，但是他指向的对象已经野指针了（如果没有字典，此时就崩溃了，因为对一个dealloc对象 release），我试过在几秒之后肯定保证`drain`结束了，对字典执行`removeAll`，还是会崩溃！因为removeall的时候处理里面的值，发现那个值野指针了。
 - 有人有更好的办法不？我想不到了，也球建议

#### 4 执行NSInvocation

```objectivec
[invocation invoke];
```
注意上文提到的invoke后处理一下 id* 的内存问题
	
#### 4 取出返回值 具体可以看下一篇 NSInvocation内存处理

如同压入参数一样，还是通过typeEncode来判断返回类型
```objectivec
const char *returnType = [methodSignature methodReturnType];
 ```
从invocation按类型取出返回值，返回

1）int 等基础类型，注意我包装成了NSNumber* 返回的，后文有讲（只举一个例子，其他见源码）
```objectivec
int returnValue;
[invocation getReturnValue:&returnValue];
return @(returnValue);
break;
```
2）CGSize等基础类型，注意我包装成了NSValue* 返回的，后文有讲（只举一个例子，其他见源码）
```objectivec
CGSize result;
[invocation getReturnValue:&result];
NSValue * returnValue = [NSValue valueWithBytes:&(result) objCType:@encode(CGSize)];\
return returnValue;
```
3）id类型，这里面也有个坑
我是这么做的
```objectivec
void *result;
[invocation getReturnValue:&result];

if (result == NULL) {
	return nil;
}

id returnValue;
returnValue = (__bridge id)result;
return returnValue;
```
为什么这么做，是因为getReturnValue只是拷贝返回值到指定的地址，你现在返回的是一个id，是一个指针，那么实际对象会在函数runloop结束后自动释放的，原因很类似之前的id*参数问题，但是这里是返回值。

[一个详细介绍这一块的博客](http://blog.csdn.net/zengconggen/article/details/38024625)
## 还有一点瑕疵

注意我的返回值被强迫指定成了id，也就是说，如果原函数返回的是NSInteger，我会返回一个NSNumber。

为什么会这样？我搞不定如何在声明函数的时候，用一个兼容基础和id，所有类型的符号来定义函数。。

参数之所以可以兼容id与基础类型，是因为我用可变参数...绕过去了。。

但是返回值我就搞不定了，有人说用`void *`但我的初衷是希望使用者直接拿到最终的值，目前的困难不是如何把值传出去。而是传出去一个使用者不需要手动转换的最终结果。

用`void *`这么看和用id 其实也差不多，使用者拿到后都得转一下。。。

