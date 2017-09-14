---
title: VKMarkHelper动态标记位
date: 2016-04-16 22:32:27
categories: 工具代码
tags: [Github,runtime]
---

[VKMarkHelper Github地址](https://github.com/Awhisper/VKMarkHelper)

## 前言 - 这只是一篇工作笔记


这里面其实没啥技术含量，出发点只是工作中，关于标记位相似的需求越来越多，于是想统一写个工具进行处理。

写工具的时候又不满足于一开始简单设计一个通用API，在扩展每个具体标记使用场景的时候，还要麻烦的调用API进行二次写码（虽然就几行，也懒得写），于是想办法尽可能的动态去实现。

希望使用者只需要给标记起个名字，其他的什么都不需要管了

<!-- more -->

## 简单到不能再简单的需求

- 关于第一次特殊处理：
  - 新功能模块上线，要标红点提醒用户，用户点过以后消失
  - 新手引导，要在用户第一次打开功能的时候展现，以后再打开不展现
  - 阿西吧
  
- 关于每天一次的特殊处理：
  - 日常任务，每天第一次做给特效
  - 繁琐的Tips，Toast提示，每天只提示一次
  - 阿西吧
  
恩，无非就是写个标记位，写在本地，读这个标记位，来判断以前是不是点过，今天是不是点过。

这就不细说了，没啥技术含量。

## 怎么才能自动生成这些代码呢？

### 依然觉得麻烦的通用API设计
我会尽可能的把写标记，读标记的代码，设计成通用的API，将标记名字，当做参数传入

```objectivec
+(BOOL)isFunctionShowOnce:(NSString *)functionMark;//判断某个标记位是否标记过
+(void)markFunctionShowOnce:(NSString *)functionMark;//标记一下某个标记位
```

但是我要设计一个积分功能新手引导的时候怎么办呢？

我还要手写这么两个函数

```objectivec
+(BOOL)isScoreShowOnce;//判断积分是否标记过
+(void)markScoreShowOnce;//标记一下积分
```

我还要手写一个标记位名称

```objectivec
static const NSString *ScoreMark = @"ScoreMark"
```

然后在调用一下通用API

```objectivec
[self isFunctionShowOnce:ScoreMark];
[self markFunctionShowOnce:ScoreMark];
```

如果明天要开发个抽奖功能呢？再来一遍。。。

如果后天要开发个签到功能呢？我还要再来一遍。。。

### 我就是想省事

前面说了我的初衷，我只想写一个标记位名字`ScoreMark`，这所有的事情就都做好了。

并且在我真正想调用`ScoreMark`的接口`isScoreShowOnce`和`markScoreShowOnce`，Xcode像我真正写过这个函数一样，自动提示，自动补全。


### 用宏来声明函数

```objectivec
#define FirstLaunchVKMark(name)\
+(void)setFirstLaunchVKMark##name;\
+(BOOL)isFirstLaunchedVKMark##name;\
```

可以看到这个宏是一个自动函数声明的宏，只要输入参数name，就可以自动的生成以name作为后缀的2个函数名。其中`##`操作符就是讲参数当做字符在和前面函数名进行拼接的。

```objectivec
@interface VKMarkHelper (THIS)

FirstLaunchVKMark(gogogo);

@end
```
这样在宏的帮助下写一条`FirstLaunchVKMark(gogogo)`在头文件里，就相当于声明了2个函数

```objectivec
+(void)setFirstLaunchVKMarkgogogo;
+(BOOL)isFirstLaunchedVKMarkgogogo;
```

这样一来，有了头文件的函数声明，Xcode在调用的时候就完全可以自动补全了，我们的目标完成了一部分

### 用消息转发来动态处理逻辑

光有了函数声明是没有意义的，强行调用而不手写实现逻辑的话，就会报`unrecognized selector`crash

而这段实现逻辑，还是那句话，我依然懒得自己手写，希望自动完成。怎么做？runtime的消息转发。

消息转发的意思是，runtime在即将发生`unrecognized selector`的时候，还有3次机会阻止crash，3次机会就是3套无效消息尝试再次转发生效的补救措施，相关内容搜索`消息转发`关键字，google上一大堆，我就不细解释了

这里我用到的是第一次补救机会`resolveClassMethod:`和`resolveInstanceMethod:`，因为我的case使用的都是类方法，因此使用前者。

第一次补救：当找不到调用函数的时候，runtime会发出`resolveClassMethod:`的消息，在这个消息里，可以通过代码动态创建出不存在的函数，如果这个操作被代码捕获，并且进行了补救措施，runtime会尝试重新发送这个消息，如果依然失败，则会crash


```objectivec
+(BOOL)resolveClassMethod:(SEL)sel
{
    NSString *selstr = NSStringFromSelector(sel);
    if ([selstr rangeOfString:@"VKMark"].location != NSNotFound) {
        Class clazz = [self class];
        Class metaClazz = object_getClass(clazz);
        
        if ([selstr rangeOfString:@"set"].location != NSNotFound) {
            class_addMethod(metaClazz, sel, (IMP) dynamicVKMarkSetterIMP, "v@:");
        }
        
        if ([selstr rangeOfString:@"is"].location != NSNotFound) {
            class_addMethod(metaClazz, sel, (IMP) dynamicVKMarkBoolGetterIMP, "b@:");
        }
        
        
        return YES;
    }else
    {
        return NO;
    }
}
```

上面就是在`resolveClassMethod:`进行补救，通过名字的字符串来判断失效的selector是不是我用宏添加的，如果是则通过`class_addMethod`来用代码动态添加这个，原本失效找不到的方法，并且指向了预先准备好的函数`dynamicVKMarkSetterIMP`，返回YES则是告诉runtime，这个补救措施我执行了，请重发。


```objectivec
void dynamicVKMarkSetterIMP(id self, SEL _cmd)
{
    // implementation ....
    NSString *selstr = NSStringFromSelector(_cmd);
    if ([selstr rangeOfString:@"setFirstLaunchVKMark"].location != NSNotFound) {
        NSString * name = [selstr substringFromIndex:@"setFirstLaunchVKMark".length];
        [VKMarkHelper setFirstLaunchVKMark:name];
    }
    if ([selstr rangeOfString:@"setTodayShowOnceVKMark"].location != NSNotFound) {
        NSString * name = [selstr substringFromIndex:@"setTodayShowOnceVKMark".length];
        [VKMarkHelper setTodayShowOnceWithVKMark:name];
    }
    return;
}
```

这个函数通过对selector进行字符串提取，能提取出当初我们写宏的时候的参数，name名字，有了这个name名字，我们就可以照常去调用那个通用的API了

另外要格外注意一点，因为我们处理的都是类方法，直接用`class_addMethod`对`[self class]`添加的方法实际上添加的是实例方法，如果这样添加，即便runtime重发也依然会crash，因为我们没有成功的添加了我们想要的类方法。

所以`Class metaClazz = object_getClass(clazz);`就很重要，通过`object_getClass`获取到了类的元类`metaClazz`，对这个metaClazz进行`class_addMethod`，才能算是添加上了类方法。

## 偷懒完成了

恩，工作笔记完毕