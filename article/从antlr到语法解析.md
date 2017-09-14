---
title: 从antlr扯淡到一点点编译原理
date: 2016-11-18 12:51:38
categories: 技术感悟
tags: [编译原理]
---

网上我们看到很多看起来很神奇的，能做到各种语言之间转换的东西

- 比如[JSPatchConvertor](http://bang590.github.io/JSPatchConvertor/)，他可以做到把OC代码输入后直接转化成JSPatch代码，

- 比如[objc2swift](http://objc2swift.yahoo-labs.jp/)，他可以做到把OC代码输入后直接转化为Swift代码

这些看起来很酷炫的东西是怎么做的？Bang哥写的这篇[JSPatchConvertor实现原理](http://blog.cnbang.net/tech/2915/)，我们可以好好看看。

从这篇文章里，我们看到了一个工具，一个看起来很牛逼很厉害的工具，__antlr__，JSPatchConvertor通过它来实现的语法转换，我们先看看这玩意怎么玩？

# antlr的概述

antlr是一个包含了`词法分析`,`语法分析`两大模块的工具，并且提供了大量主流语言的现成的语法描述`grammar`文件

使用antlr你可以将某种语言的代码文件，以纯文本字符串的方式输入，被antlr整理分析成一个语法树，一个可以清晰地从树状结构里，看到代码真正的逻辑的结构化数据。

通俗易懂的说，antlr的作用就是将计算机不明白，无法读取，无法执行的字符串代码，一个字一个字`读`，一行一行的`分析`，最后把`字符串`读明白了，分析明白了，转化成了计算机程序能`弄懂`(也就是能遍历，能执行，能运行的)的结构化数据`语法树`

听起来是不是很神秘？没错，这里面其实是编译原理里面的概念，我们所写的C++,OC,JAVA各种知名语言，我们其实写的都是一行一行字符串，这一行行的字符是怎么编译成可以运行的app的，这都是要经过这样的一个步骤，但这也只是编译原理中的一环，经过了`词法,语法解析`，后面还有很多重要的环节

- 有了`词法,语法解析`，我们甚至还可以独创我们自己的语言

- 有了`词法,语法解析`，再引入编译原理中的其他概念，我们甚至还可以自己写我们独创语言的编译器

看起来是不是很神秘很牛逼~我们今天深入讨论一下

# antlr的基本使用

antlr包含以下几个部分

- antlr 主工程 
- antlr 语法描述 grammer
- antlr 运行时 runtime


<!--more-->


antlr主工程是Java写的，所以想要运行起来必须安装Java也就是JDK，使用antlr主工程可以输入目标语言的语法描述grammer，生成对应运行时的parser。

目标语言的语法描述grammer文件，在antlr官网可以下载,[https://github.com/antlr/grammars-v4](https://github.com/antlr/grammars-v4)，从里面可以看到，我们可以找到几乎所有主流语言的语法描述，换句话说，如果我们要分析的语言有现成的grammar文件，那我们可以直接拿来输入给antlr就能搞起词法语法分析。

antlr主工程虽然是Java，但是antlr运行可以在Java，JavaScript，Python，C#等语言里，原因就是官网开放了这四种语言的antlr运行时，[www.antlr.org/download](http://www.antlr.org/download.html)。

举个通俗点的例子，如果我打算用JavaScript语言，用来分析Oc语法，那么

- 我需要先去官网下载`ObjectiveC.g4`grammer语法描述文件
- 我需要用antlr的Java主程序，输入OC的grammer，选择JavaScript语言输出，生成`ObjectiveCParser.js`这个用js代码写出来的，OC解析器
- 我需要开始搭建我的JS程序，将一整个antlr的JavaScript运行时都import进来，并且import进来刚刚生成的`ObjectiveCParser.js`，在JS代码里开始编写JSPatchConvertor的代码逻辑

## antlr的部署

[Getting Started with ANTLR v4](https://github.com/antlr/antlr4/blob/master/doc/getting-started.md)

- 首先要自行安装Java，至少JDK 1.6以上
- 安装antlr，在终端中执行

```
$ cd /usr/local/lib
$ curl -O http://www.antlr.org/download/antlr-4.5.3-complete.jar
```
- `antlr-4.5.3-complete.jar `拷贝到`/usr/local/lib`目录下供使用
- 添加环境变量，CLASSPATH，在终端中执行

```
export CLASSPATH=".:/usr/local/lib/antlr-4.5.3-complete.jar:$CLASSPATH"
```
- 编辑`.bash_profile`文件，加入下面的代码（用vi ~/.bash_profile 编辑系统bashprofile）

```
$ alias antlr4='java -Xmx500M -cp "/usr/local/lib/antlr-4.5.3-complete.jar:$CLASSPATH" org.antlr.v4.Tool'
$ alias grun='java org.antlr.v4.gui.TestRig'
```
- 在终端输入 antlr4 能看到输出，则说明安装成功

## antlr生成ObjectiveC的Parser

[Antlr Javascript Target Getting Start](https://github.com/antlr/antlr4/blob/master/doc/javascript-target.md)

如果antlr已经安装成功，我们就应该去下载对应的语法描述文件，去生成js的parser了。

[官方的主流各大语言的语法描述下载地址](https://github.com/antlr/grammars-v4)

从这里面我们可以找到`Objc`的语法文件，下载下来后就发现，里面一共有一个Java文件和4个g4文件

![grammerfile](http://o8n2av4n7.bkt.clouddn.com/grammerpng.png)


我们需要对每一个文件执行一次，就看到生成了这些文件
```
$ antlr4 -Dlanguage=JavaScript xxxxx.g4
```

![](http://o8n2av4n7.bkt.clouddn.com/grammerparser.png)


## 下载Antlr JavaScript Runtime
- 可以去官网下载 [Antlr Downloads](http://www.antlr.org/download.html),然后倒入自己的工程

- 如果你开发的是网页程序可以直接在Html中引入Antlr Runtime

```html
<script src='lib/require.js'>
<script>
    var antlr4 = require('antlr4/index');
 </script>
```

- 如果你打算在Node中使用Antlr JavaScript Runtime 可以直接运行

```
$ npm link antlr4
```
这样你就能看到一整个antlr4的文件夹，里面都是Antlr JavaScript Runtime的运行源代码

## 开始在Node中运行起来antlr

我的GitHub上有一个现成的，已经可以运行的，在Node环境下的，[antlrDemo](https://github.com/Awhisper/antlrDemo)

我们从头创建一个全新的antlrDemo工程其实需要这样的文件结构

- `antlr4`目录就是刚刚npm link出来的一整个antlr4运行时
- `antlrLib`目录我放的是刚刚，grammer生成的一大坨js lexer parser
- `helloworld.js` 我们node程序的入口
- `test.m` 一个oc的代码文件

我们开始编辑`helloworld.js`，来写antlr啦

首先我们先要以字符串的形式，读取出`test.m`的代码字符串

```javascript
var rf = require("fs");
var source = rf.readFileSync("test.m","utf-8");
```

导入antlr基础库

```javascript
 var antlr4 = require('.././antlr4/index');
 var ObjCLexer = require('.././antlrLib/ObjectiveCLexer').ObjectiveCLexer
 var ObjCParser = require('.././antlrLib/ObjectiveCParser').ObjectiveCParser
 var ConsoleErrorListener = require('.././antlr4/error/ErrorListener').ConsoleErrorListener.INSTANCE

```

因为只是初级，我自己也只探索到`ObjectiveCParserListener.js`这个由grammer.g4自动由antlr生成的js文件。

打开看一下可以看到里面是无数个空实现，例如：

```javascript
// Enter a parse tree produced by ObjectiveCParser#importDeclaration.
ObjectiveCParserListener.prototype.enterImportDeclaration = function(ctx) {
};

// Exit a parse tree produced by ObjectiveCParser#importDeclaration.
ObjectiveCParserListener.prototype.exitImportDeclaration = function(ctx) {
};


// Enter a parse tree produced by ObjectiveCParser#classInterface.
ObjectiveCParserListener.prototype.enterClassInterface = function(ctx) {
};

// Exit a parse tree produced by ObjectiveCParser#classInterface.
ObjectiveCParserListener.prototype.exitClassInterface = function(ctx) {
};


// Enter a parse tree produced by ObjectiveCParser#categoryInterface.
ObjectiveCParserListener.prototype.enterCategoryInterface = function(ctx) {
};

// Exit a parse tree produced by ObjectiveCParser#categoryInterface.
ObjectiveCParserListener.prototype.exitCategoryInterface = function(ctx) {
};
```
这就是一个监听器，当antlr解析一整个oc代码字符串的时候，就会不断的解析到`定义了一个类`，`实现了一个类`，`定义了一个方法`，`实现了一个方法`，`调用了一个函数`，`传入了一个参数`，`进入了一个for循环`，`进入了一个if选择`，这就是antlr在遍历一整个你写出来的oc语法树，每当遍历到一个节点的时候，就会触发到这个`ObjectiveCParserListener`，我们就可以在触发这些关键节点的时候执行我们的逻辑，比如记录语法树，把OC语法树，转换成JSPatch语法，于是这就是Bang哥的JSPatchConvertor了


理解了概念以后我们看看，antlr如何把这个语法树run起来，说明我写在代码注释里了

```javascript
//使用ObjectiveCParserListener
var VKObjCParserListener = require('./VKObjCParserListener').VKObjCParserListener

//输入代码字符串生成流
var chars = new antlr4.InputStream(content);
//用流来生成lexer 词法分析器，并且添加出错监听
var lexer = new ObjCLexer(chars);
lexer.addErrorListener(ConsoleErrorListener);

//用词法分析器生成token
var tokens  = new antlr4.CommonTokenStream(lexer);
//用token生成parser
var parser = new ObjCParser(tokens);
//添加parser错误监听
parser.addErrorListener(ConsoleErrorListener);
//配置parser 生成语法树
parser.buildParseTrees = true;
var tree = parser.translationUnit();

//生成语法树遍历监听器
var listener = new VKObjCParserListener(function(tree){
        console.log('parse final!!!!');
        callback(tree);
});
    
try {
	//遍历语法树，触发遍历监听器
    antlr4.tree.ParseTreeWalker.DEFAULT.walk(listener, tree);
} catch(e) {
    console.log('listener error')
    console.log(e)
}
```

这样整个antlr的Demo就run起来了，我就不深入详解如何实现JSPatchConvertor了，转换这一步的逻辑可以直接看[JSPatchConvertor的源码]()，还有[JSPatch Convertor 实现原理详解](http://blog.cnbang.net/tech/2915/)，我这里主要再讲antlr这个东西如何运作起来
# 词法分析+语法分析

上面聊过，antlr所干的事情叫，`词法分析`和`语法分析`，这里面其实是编译原理中的一个环节，各大语言都是要经历这么一个环节

试想一下，如果你能够自己定义个`niubi`语言（想到易语言了没？你也能写！），定义出他的语法和关键字，然后你写出你自己语言的语法描述`grammar`文件，将他按着一样的流程交给antlr（其实还有别的更历时悠久的工具），形成了语法树，然后你就可以在某种运行环境下(比如像本文就是借助js运行环境)，运行自己的语言了！

再试想一想，如果我们将分析出来的最终语法树，和`LLVM`结合起来，将一个树状逻辑结构信息，编译链接成可执行的二进制，那我们是不是可以自己开发IDE了，自己开发一个XCode感觉怎么样？

上面的脑洞确实很大，想要完成，还需要补很多很多的编译原理相关的知识。但是这些神秘的东西，是不是略微有了一点轮廓，不再是那么的渴望不可及？

## 概念
以下概念摘录自[编译原理之词法分析、语法分析、语义分析](http://blog.csdn.net/nic_r/article/details/7835908)


__词法分析（Lexical analysis或Scanning）和词法分析程序（Lexical analyzer或Scanner__

　　词法分析阶段是编译过程的第一个阶段。这个阶段的任务是从左到右一个字符一个字符地读入源程序，即对构成源程序的字符流进行扫描然后根据构词规则识别单词(也称单词符号或符号)。词法分析程序实现这个任务。词法分析程序可以使用lex等工具自动生成。
　　
>点评解释：
>
>比如for 比如if 比如oc的implement 比如各种oc的关键字selector，其实都是词法分析中在识别，识别出巨有核心意义的单词

__语法分析（Syntax analysis或Parsing）和语法分析程序（Parser）__
 
　　语法分析是编译过程的一个逻辑阶段。语法分析的任务是在词法分析的基础上将单词序列组合成各类语法短语，如“程序”，“语句”，“表达式”等等.语法分析程序判断源程序在结构上是否正确.源程序的结构由上下文无关文法描述.
　　
>点评解释：
>
>虽然我们通过词法明白if，for，或者[]是oc中有关键意义的词，但这些词所组成的语法到底是循环，还是调用，还是声明，还是选择，这些都是通过语法分析

__语义分析（Syntax analysis）__


　　
```objectivec
int arr[2],b;　　
b = arr * 10; 
```

　　语义分析是编译过程的一个逻辑阶段. 语义分析的任务是对结构上正确的源程序进行上下文有关性质的审查, 进行类型审查.例如一个C程序片断:源程序的结构是正确的. 语义分析将审查类型并报告错误:不能在表达式中使用一个数组变量,赋值语句的右端和左端的类型不匹配.
　　



>点评解释：
>
>大概是处理语法分析中一些不完美，有错误的地方

__文法（Grammars）__
 
　　文法是用于描述语言的语法结构的形式规则。文法G定义为四元组(，，，)。其中为非终结符号(或语法实体，或变量)集；为终结符号集；为产生式(也称规则)的集合；产生式(规则)是形如或 a ::=b 的(a , b)有序对,其中(∪)且至少含有一个非终结符，而(∪)。，和是非空有穷集。称作识别符号或开始符号，它是一个非终结符，至少要在一条规则中作为左部出现。 一个文法的例子: G=(={A，R},={0,1} ，={A?0R，A?01,R?A1},=A) 
　
>点评解释：
>
>就是上文中的grammer.g4文件，如果你打算独创自己的语言，那么你就要自己去编写一个g4文件，他可以算是一种用来编写语言的`语言`

## 历史悠久的词法分析，语法分析器

antlr是一个包含了词法分析，语法分析2大内容的工具，但其实伟大的C++早就有被运用的非常广泛的2套工具

- Lex（词法）/Yacc（语法）  
- Flex（词法）/Bison（语法）

这两个工具都很底层，但是相关的资料都比较少，相关的资料都是教你如何写各种类似这样`鸟语`一样的grammar文件，然后教你用Lex/Yacc或者Flex/Bison去分析生成语法树，也就是说，网上关于Lex/Yacc或者Flex/Bison的中文资料，绝大部分都是教你如何`独创一个语言`

``` 
%{
	int wordCount = 0;
	%}
	chars [A-za-z\_\'\.\"]
	numbers ([0-9])+
	delim [" "\n\t]
	whitespace {delim}+
	words {chars}+
	%%
```

而antlr是我能找到的，有现成的各大主流语言的grammar文件的唯一工具。所以更适合你直接拿来解析现有语言而不是，完全自己重头从写grammar文件

>世界上最好的语言 PHP
>
>据说就是使用了 re2c/Bison 进行的语法分析
>
>据说的，说错了不要打我

## 使用Flex Bison 和LLVM编写自己的编译器

怎么样，刚才说了，别说独创自己独有的语言，编写一个编译器都不在话下

好吧，其实我在扯淡。这块我也不懂，太深入了

但是这里有一篇文章，有兴趣的话，少年们上吧

[使用Flex Bison 和LLVM编写自己的编译器](http://blog.csdn.net/wz3118103/article/details/26616267)


[用 Swift 搭建一个微型编译器](https://realm.io/cn/news/tryswift-samuel-giddins-building-tiny-compiler-swift-ios/)