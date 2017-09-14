---
title: 为JSPatch新增defineProtocol功能
date: 2015-12-20 11:51:45
categories: 工具代码
tags: [JSPatch,Github,runtime]
---

defineProtocol功能已经merge进入[JSPatch原作者Github](https://github.com/bang590/JSPatch)主干

## 使用文档

## API

	defineProtocol(protocolDeclaration, instanceMethods , classMethods)

@param `protocolDeclaration`:字符串，新增protocol的名字
@param `instanceMethods`:字典，要添加到protocol的实例方法
@param `classMethods`:字典，要添加到protocol的类方法

## 新增协议 Protocol



需要说明的是，在runtime中，协议一旦注册后就不可再修改，所以只能新增协议

1.在defineProtocol中`protocolDeclaration`参数输入协议名称

2.在defineProtocol中`instanceMethods`参数输入协议内实例方法的字典，以方法名为Key，Value也是一个字典，是实例方法的信息

3.在defineProtocol中`classMethods`参数输入协议内类方法的字典，以方法名为Key，Value也是一个字典，是实例方法的信息


## 定义Protocol中的实例方法



1.key为方法名，字符串，命名方式和JsPatch的defineClass一致

2.Value是个字典，包含3个key，`paramsType``returnType`为必备参数，`typeEncode`为可选参数，都是字符串。

	- paramsType：顺序输入参数类型，用“,”逗号来分隔
	
	- returnType：输入返回值类型
	
	- typeEncode：可选，对于不支持的类型，可以通过这个字段手动填写
	
3.在OC中定义的协议实例方法
	
```objectivec
@protocol JPProtocol <NSObject>

-(int)testProtocol:(BOOL)oye;

-(NSString*)testProtocol:(CGRect)rect withB:(float)f withC:(NSArray*)arr;

@end
```


4.在Js中定义协议实例方法
```javascript
defineProtocol('JPProtocol',{
       testProtocol:{
           paramsType:"BOOL",
           returnType:"int",
       },
       testProtocol_withB_withC:{
           paramsType:"CGRect,float,NSArray",
           returnType:"id",
       },
}
```
    
<!-- more -->

## 定义Protocol中的类方法

	defineProtocol() 

第三个参数就是要添加或覆盖的类方法，规则与上述实例方法一致。




```	
Oc代码

@protocol JPProtocol <NSObject>

+(int)testProtocol:(BOOL)oye;

@end
	
  
Js代码

defineProtocol('lalalala',{
   //实例方法
},{
   //类方法
   testProtocol:{
       paramsType:"BOOL",
       returnType:"int",
   },
})
```

## 参数类型


1.paramsType和returnType中可以直接使用的参数类型位包括`id`,`BOOL`,`int`,`void`,`char`,`short`,`unsigned short`,`unsigned int`,`long`,`unsigned long`,`long long`,`float`,`double`,`CGFloat`,`CGSize`,`CGRect`,`CGPoint`,`CGSize`,`CGVector`,`UIEdgeInset`,`NSInteger`,`SEL`,`block`

2.参数是Oc对象NSObject，比如`NSArray`，`CustomObject`，可以写作`id`，也可以直接写类名,效果一样

	paramsType:"id"
	paramsType:"CustomObject"
	
3.对于无法支持的参数，比如其他结构体，`customStruct`，可以使用`typeEncode`可选字段


```javascript
testProtocolConstumStruct:{
   paramsType:"unknown",
   returnType:"int",
   typeEncode:"i@:{CGVector=dd}"
}	       	       	       
```


4.当使用`typeEncode`时，类型字符串可以不必匹配任意填写，比如填写unknown，比如填写xxx,但是要求`paramsType`的个数必须保证准确

5.自行填写的`typeEncode`，可以通过在项目中使用OC代码，在运行时通过系统获取


```objectivec
SEL selstr = NSSelectorFromString(@"testProtocolConstumStruct:");

Method method = class_getInstanceMethod(class, selstr);

const char* type = method_getTypeEncoding(logmanagermethod);
```
    
 ## 更多使用Case参见newProtocolTest.js
 
 ## 使用defineProtocol为defineClass新增含有非id类型的方法
 
 defineClass新增不存在的方法的时候要求参数均为id类型，当使用defineProtocol新增含有任意类型参数方法的协议的时候，defineClass遵守新增协议，即可添加任意类型参数方法

```javascript
defineClass('WKAboutViewController:UIViewController <lalalala>', {
        testProtocolConstumStruct:function(oye){
            return 6;
        },
}
```