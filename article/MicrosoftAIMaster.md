---
title:  微软AI大师会参会小记
date: 2017-08-20 15:35:37
categories: 技术感悟
tags: [人工智能, AI]
---

# 微软AI大师会系列|人工智能商业落地之旅

周五参加了这个微软的AI大师会，会议的主题主要是由几位微软在AI方面的重量级大师来介绍微软目前在AI赋能商业落地方面的进展，主要围绕着`知识图谱`，`智能问答`，`用户画像`几个方向来介绍了一些微软目前的商业落地的进展

![WechatIMG63](http://ouz34cilp.bkt.clouddn.com/WechatIMG63.jpeg)

![WechatIMG65](http://ouz34cilp.bkt.clouddn.com/WechatIMG65.jpeg)

会场并没有留下ppt等资料，于是我就把我拍到的照片和做的笔记分享一下，说实话整个大会听得我有点尴尬，所有吐槽都写在最后面

# 第一场 微软人工智能赋能商业


第一场主要由张祺博士讲一讲现微软人工智能在toB这方面的整体布局和已有的一些成果。

## 微软AI三大生产线

- 第一方AI产品
    - 必应搜索
    - 微软小娜（智能助理）
    - 微软小冰（聊天机器人）
- 将AI融入微软所有产品与服务
    - 微软 Office系列产品
    - Azure 认知智能服务
- AI商业化产品线
    - 纵向行业方案
    - 横向行业方案


<!--more-->

搜索引擎是最早的人工智能产品，这个就不用说了，微软借助bing搜索，积累了很多数据。微软小娜，微软小冰这个就是对话机器人，但这俩我的感觉更多的还是新鲜和玩具

比较牛逼的是第二大类，将AI融入微软所有产品与服务！

__微软 Office系列产品 AI插件__

大会上主要讲了word ppt在AI方面的最新成果，都是以office插件的形式，目前已经开放上线，用户可以直接去下载（然而我并没有搜到Mac版，现场有演示WIN下的插件）

>Word的插件就是比较常规的智能翻译，得益于微软面向全球的office服务，微软的翻译支持60多种语言

>比较牛逼的是PPT插件，可以支持在PPT演讲模式，实时听演讲者的讲话，实时的进行字母展现+60多种语言的翻译，这个相当的实用啊

__Azure 认知智能服务__

Azure其实就是微软的云计算平台，提供各种云服务，但是这里的认知服务单指[Azure国际官网提供的](https://azure.microsoft.com/zh-cn/) AI和认知服务API

![azureAI](http://ouz34cilp.bkt.clouddn.com/azureAI.png)

看着就像厂里ai.baidu.com一样，把大厂的一些成熟AI的功能开放成api服务，适当的收费/免费提供（Azure收费，厂里的ai.baidu.com免费的）

顺带一提Azure国内也有个官网，但是国内的官网看不到这个AI和认知服务。

>坦白说，身为开发者，我更关注这个Azure认知服务相关的会，因为他清楚地以API的形式介绍清楚了，如果三方厂家想接入，可以清楚的知道我能做什么？多少钱？可以用API去评估准确性，可以用量级来评估成本。


## 数据化人工智能转型

这个题目，微软对各大行业商业落地需要面临的，数据化/人工智能化转型，做了一些分析

目前人工智能在商业落地上走的比较快的几个方向是

- 客户沟通
	- 智能客服
	- 定制化体验
	- 客户分析

智能客服这个话题，后面有案例单独深入介绍

- 赋能员工
	- 员工生产力
	- 商业分析
	- 知识图谱

这块主要讲的是每个公司在员工培训，以及员工高效工作上，可以借助数据挖掘/知识图谱构建/辅助分析，等AI方案来提高生产力，这里面`知识图谱`后面有单独一讲，这个知识图谱也是当下我最关注的

- 优化运营
 	- 智能预测
	- 深度分析
	
基本上是说，从大数据分析预测的角度，来辅助运营手段，这里面后续没深入展开

- 转型升级产品
	- 产品创新
	- 差异化体验
	- 新的用户场景
	
所谓创新，都是挂在嘴边，真正用AI创新出来的又有啥？反正本次分享会没深入提，不过演讲嘉宾倒是说，从人机交互的角度，视频捕捉/声音识别/AR 等方式是值得做创新和差异化的，但可惜，不在今天演讲范围内

>坦白说微软的AR Hololens 真的是堪称AR界的霸主，无人能撼动的地位，有相关讲座真的很想听


## 智能客服市场的一些前景

然后就开始介绍市场了，无非是众多行业/众多场景都需要智能客服，而微软拥有海量数据，来自Office Bing LinkdIn，微软很有优势

- 行业 金融/健康/零售/电信/制造
- 场景 销售/导购/视频/市场
- 数据 Office  Bing  Linkedin

而中国有个最大最牛逼的优势是中国的体量非常大

- 中国移动的一个省一星期的客服数据，是美国梅西百货一年的数据量
- 客服这个事情，在中国有着3000亿的人力成本规模


# 第二场 人工智能商业落地

整场介绍了微软为一个保险行业做的智能客服这一个项目

## 客服市场所面临的难点和问题

当前自动客服市场，基于以下几个原因，导致的有很大的瓶颈和问题

- 根本原因
    - 基于FAQ 问答
    - 人工录入
    - 定制模板 穷举问法

- 问题和瓶颈
    - 大量人工工作
    - 维护成本高
    - 知识更新慢
    - 多渠道信息不一致
    - 扩展性，敏捷性不够

AI能赋予自动客服的

- 懂知识，能推理
    - 建立结构化知识体系
    - 冬天产生答案
    - 推理回答复杂问题

> 构建结构化知识体系，其实就是所谓的专业领域知识图谱
> 
> 知识图谱构建背后面临很大的难题
> 
> 微软有个服务化知识图谱团队，但这种把知识图谱对接如何落地，本次分享并没有讨论，不过后面倒是介绍了一些定制知识图谱的难点
> 
> 非结构化数据/半结构化数据/结构化数据-知识图谱

![WechatIMG68](http://ouz34cilp.bkt.clouddn.com/WechatIMG68.jpeg)


- 懂客户，会沟通
    - 用户意图理解
    - 客户深度理解
    - 多轮对话能力

> 这里面有很多难点，其实都围绕着自然语言处理NLP，简单的说就是理解用户意图，多轮对话，深度理解等。其实对标厂里的就是Unit多轮对话技术，也是众多Bot服务都必须要解决的最难得问题

- 懂产品，善推荐
    - 产品理解
    - 用户理解
    - 个性化推荐

>这里面的难点在于，特定领域的客服需要理解特定领域，还需要结合用户画像、个性化推荐

- 能进步，善学习
    - 大规模离线学习
    - 在线快速学习
    - 自我学习

> 这里面其实技术专家充分讲了这里面面临的问题
> - 大规模数据
> - 离不开人工的标注 
> - 人工的监督
> 这背后面临的各种成本，但其实并没有量化，也没有举例在这个保险客服的实际案例中，人工训练AI成本到底有多少

![WechatIMG67](http://ouz34cilp.bkt.clouddn.com/WechatIMG67.jpeg)

这是一个整个保险客服案例的技术难点回放，其实能感知到AI对客服这块是一个很好的战场，有很多AI技术值得推进。

但关于这个保险客服的现场演示，槽点挺多的，中场休息环节，由一个主持人带着大家在网页上体验了这个保险客服，但是这个体验很sb，全程对于一次保险对话，都是基于FAQ式的传统客服模式

- 问：我要买保险
- 答：你要哪种？三选一
- 问：我要A
- 答：你有个女儿是否一起投保
- 问：可以
- 答：请上传照片
- 问：传个小狗的照片
- 答：你上传的是动物，不是小狗，请正确上传（后面还传了个王力宏的照片也识别出来了）

看着在场的人觉得，哇！好厉害！都能图像识别出错误的照片，但整个过程这个客服问答应该凸显的，`多轮对话`，`自然语言理解`，`上下文场景推理`一概没表现出来，除了附加了一个图像识别，整个case，可以说一点AI的技术含量都没有，完全可以通过基于FAQ式的问答方式实现，但对于现场不懂的其他行业人来说看似好AI，好厉害。

这TM到底是推广AI呢，还是给不懂的麻瓜洗脑AI呢？


# 第三场 知识挖掘以及智能应用

这是我最感兴趣的一场，里面详细介绍对于专业领域，如何通过挖掘的方式，去构建一套属于专业领域的`知识图谱`，也是上一场提到的
 
__建立结构化知识体系__

人类的知识是通过经验规律得到的总结

但计算机需要的是

- 有结构的知识
- 可计算的知识
- 也就是知识图谱

![WechatIMG69](http://ouz34cilp.bkt.clouddn.com/WechatIMG69.jpeg)

图中就是一个双向知识图谱

- 左边是关于神经疾病相关知识图谱，介绍了神经疾病都有哪些分类，相关，延展。是从大量医术，医用文献中挖掘出来的

- 右边是医院针对病人的一些处理规则，如何确诊？怎么治疗？能手术么？哪种治疗？应该是从医院的看病大数据中挖掘出来的

中间通过算法，将2套可计算的知识数据进行推理，进行关联，形成了微软介绍的一个医用大数据知识图谱例子

## 知识图谱研究的是什么问题？

- 知识发现
- 抽取融合
- 知识表示
- 知识推理/语义计算
- 恰当使用

![WechatIMG71](http://ouz34cilp.bkt.clouddn.com/WechatIMG71.jpeg)

计算机可计算的知识分为

- 结构化数据

>那些我们存在我们自己数据库中的有自己专属定义字段的数据都叫结构化数据，可以查找，可以索引，可以分类，可以进行计算机所能操作的各种行为

- 半结构化数据

>那些存在别人数据库中本身已经被结构化的数据，但因为别人并不对外直接提供数据库，而是以网页，表格等形式进行输出，可以通过人工的策略，人工的评估抓取，将他们重新结构化构建成为自己的数据库的数据，简单的说就是抓取别人数据后人工+机器策略可以复原结构化

![WechatIMG74](http://ouz34cilp.bkt.clouddn.com/WechatIMG74.jpeg)

- 无结构化数据

>纯自然文本，语义理解后进行结构化抽取，这才是最难的，也是最难统一，根据文本样本需要定制训练的，也是需要投入最多人力进行结果校准，训练校准的，但这块丝毫没提这里面的成本和质量效果问题


![WechatIMG72](http://ouz34cilp.bkt.clouddn.com/WechatIMG72.jpeg)

知识的表示/集成，最终形成网状图谱

![WechatIMG73](http://ouz34cilp.bkt.clouddn.com/WechatIMG73.jpeg)

通过网状的图谱，可以进行推理和语义计算，这里有一个通俗易懂的例子可以说明基于图谱的语义计算


- A欢乐喜剧人，那个秃子他儿子很帅
- B这期欢乐喜剧人的主持人郭德纲是个秃头，但很棒
- C郭德纲的孩子英俊，比他爹强多了
- D看了最强大脑，里边嘉宾主持都不错，帅

选出和A表达意思最相近的选项

如果是老的语义计算都是基于词向量的近似性，因此一定是得出B这个大难，但是拥有知识图谱，并且能通过知识图谱进行推力计算的（需要欢乐喜剧人的主持人是郭德纲这一背景关系），会得出C这个答案

## 知识的应用

演讲嘉宾介绍了关于这种推理问答的应用

人物关系/图谱

Bing搜索搜`奥巴马的老婆是谁`，直接展现出`米歇尔.奥巴马`，看似是一个精准展现出这门深奥技术的效果的一个case，但槽点来了

- 这例子被人举了无数次了吧
- 在AI没爆发的时代，各大搜索引擎都早就支持了吧
- 你们家的Bing在这块也没啥显著优势吧

![baiduaobama](http://ouz34cilp.bkt.clouddn.com/baiduaobama.png)

![googleaobama](http://ouz34cilp.bkt.clouddn.com/googleaobama.png)

## 知识图谱的蓝图远景

- 让计算机掌握知识
>微软开放的 microsoft concept graph  英文已经release
>全互联网级别的广度知识图谱

- 让计算机学会联想
> 网游 - 毒品，让计算机通过学习能理解这种比喻知识图谱

- 让计算机学会创造
>假设知识图谱
>例子：药品/数据/成分/病理 我们拥有这些知识图谱
>假设检验 预测 药与治病之间的关系 
>科研人员那几年前的药理病例数据进行海量预测，然后查找近几年里药品论文发表情况，发现计算机蒙对了20%

# 第四场 构建智能的问答机器人

这一场更加的学术范儿，更加的算法范儿了！


- 问答机器人分层
    - 闲聊层 微软小冰
    - 信息层 精准信息需求
    - 任务层 完成特定目标

- 智能问答及问题生成
    - FAQ式
    - 基于资料
        - 无结构化 - 文档
        - 半结构化 - 表格
        - 结构化 - 知识图谱
    - 人工辅助/监测
    
![WechatIMG75](http://ouz34cilp.bkt.clouddn.com/WechatIMG75.jpeg)

## 微软必应搜索 passage-based 

基于必应搜索，会阅读网页搜索中结果，直接找到网页中找到能够回答搜索问题的那句话，在搜索结果页直接展现，无需用户点到该网页里再全文阅读寻找到岸

![WechatIMG76](http://ouz34cilp.bkt.clouddn.com/WechatIMG76.jpeg)

## 微软必应搜索 table-based QA

对于股票行情，体育竞赛得分等query，可以在搜索到直接结果的同事，把相关其他信息，以结构化表格的形式呈献给搜索用户，从而得到丰富的结果展现

## 微软必应搜索 Question Generation

搜索的反向，海量的抓取网页内容or数据内容，通过分析内容本身，预先的生成一些搜索问答对，从而进行快速的QA 问答结果和匹配

给予任何一个文本，就可能提前生成可能问的问题，预先知道针对文本能问啥

![WechatIMG78](http://ouz34cilp.bkt.clouddn.com/WechatIMG78.jpeg)



![WechatIMG79](http://ouz34cilp.bkt.clouddn.com/WechatIMG79.jpeg)

## 大难题

- Domain Adaptation is one Big Challenge 

>用开放领域(搜索)的大量数据，无法解决专有领域的问题
>如果没有标注数据，或者只有大量无结构化数据，则面临很大问题


- 上下文 多轮对话

>如果拥有大量对话数据，可以深度学习
>缺乏大量对话数据
>只好利用逻辑，利用语义推理，语义理解，然后进行回答生成
>目前准确度满意度都是难题



# 第五讲 基于大规模行为数据的用户画像

这一讲大概是在扫盲用户画像

- 用户画像，就是打标签
 
![WechatIMG81](http://ouz34cilp.bkt.clouddn.com/WechatIMG81.jpeg)


- 用户画像 6个维度/图标 
    - 远远不止6个维度
    - 每个维度有相关属性


![WechatIMG80](http://ouz34cilp.bkt.clouddn.com/WechatIMG80.jpeg)


- 跨平台用户行为数据集！！！！

>这个其实还是挺牛逼的，他可以跨越豆瓣/微博等跨公司之间的用户数据进行画像，并且将这些画像进行统一，最终能描述一个人在互联网上的全面画像
>没错这里有很多隐私问题，不讨论了
>和厂里的GlobalSession 以及IDMapping 很是类似
>我曾一度怀疑微软是怎么做到的，毕竟他的搜索和广告模式，推广度远不及Google和厂里
>后来同事说，他有操作系统，好吧，无话可说，操作系统可以记录一切哈哈哈哈哈

- 用户移动规律与位置预测

>仅用位置信息，用用户移动规律，推测用户年龄/工作，属性

- 用户心理特征 （用户心里画像）
    - 四体液假说（心理学）
    - 词汇学假说（心理学）

用户画像不仅仅描述一个人的客观属性，还通过人在社交网络里留下的对话信息，来描述用户的人格星哥

- 用户的大五人格准则
    - 外向性
    - 随和性
    - 神经质
    - 尽责性
    - 开放性 

![WechatIMG82](http://ouz34cilp.bkt.clouddn.com/WechatIMG82.jpeg)

## 微软小冰

- 基于微博微信的大数据匹配指数，微软小冰直接在天津卫视的非你莫属节目中，对应聘者进行人工AI性格画像

- 微软小冰写诗，用几十位民国诗人的诗词当做训练集
    - 识别照片
    - 内容分析提取
    - 提取出批量关键词
    - 过滤出适合写诗的关键词
    - 写诗

![WechatIMG83](http://ouz34cilp.bkt.clouddn.com/WechatIMG83.jpeg)

> 为什么`忙碌`这种词适合写诗？`红绿灯`不适合？因为民国诗人那会就是这个套路
> 为什么`嘴边挂着虚假的笑容`？因为民国诗人就是这个套路
> 哈哈哈哈

# 互动体验环节

## 语音实时识别

现场主持人打开录音软件，一边说话，一边屏幕上实时的把说的话录入，底下的观众一片叫好（我的尴尬症都犯了），纷纷激动的提问能识别方言么？能识别英文么？

>语音录入这程度，无数公司N年前就做到这种水准了吧，都不用AI大公司出马，科大讯飞，汉王都能做的非常非常好了，这果真是给麻瓜开的大会么？
>识别方言，识别英文，语音录入，这已经是很多输入法软件都已经支持的了吧

## 视频分析

这个例子就很酷炫，很像厂里AI大会上，视频分会场所展现的对外免费开放的视频结构化AI开放API，但是这个demo更接地气！！感觉还是挺牛逼的


![WechatIMG84](http://ouz34cilp.bkt.clouddn.com/WechatIMG84.jpeg)

主持人输入了一段新闻联播的节选，直接就人脸识别分析出整个新闻联播中出现的人脸，这里面是彭麻麻，微软Bing有自己的一大堆名人库和名人图谱，因此点开详细介绍，可以看到相关名人信息，并且还可以精确跳转到彭麻麻所出现的时间点

![WechatIMG85](http://ouz34cilp.bkt.clouddn.com/WechatIMG85.jpeg)

主持人把界面切到内容识别，可以看到，整个视频的声音音轨都被一一识别出来，转化成文字，以时间轴的方式，记录成可检索，可挖掘的非结构化文字信息，不仅仅是声音音轨，就连视频中出现的字幕信息，也被OCR识别转化成文字，记录进入时间轴。

这个demo还是相当酷炫的！类似的技术厂里在AI开放平台的视频API，都大概能实现，但还没有见到这么接地气的落地demo，感觉这个demo是整个`微软AI落地大会`里，最落地的一个东西了。

但是，会场来的嘉宾专家，都是NLP/语音语言/知识图谱相关的专家，这个视频只演示demo，完全没有在本次的议程中内。




# 吐槽：AI 还是 PR？

整个大会更像是一个宣传分享会，在微软大厦自己的报告厅举办，面向的也都是一些传统行业，非计算机行业内的人士，但整个分享会最后给我的感觉略微`尴尬`：

坦白说几位大师讲的内容相对来说更技术一些，围绕着一堆自然语言处理方面深入的技术，这里面每一个方向都是值得深入去探讨的技术难题，这些技术难题背后一定是面临着目前AI能力不完善所存在的一些短板或者说不足，因此这些AI如何对商业赋能这个话题，我个人觉得，应该是充分的了解当前所拥有的AI能力和应用范围后，由最了解AI的人与不懂AI的传统商业人士一起去寻求切合的适当的商业落地方案。

但这次的分享会完全不是这个基调，几位博士用稍微通俗易懂的词汇给在场的传统人士传达一个个其实根本听不懂的概念，现场的传统人士纷纷觉得高大上，好牛逼，然后会畅想orYY出很多AI赋能商业场景，真正落地的有几个？大会上并没有引导讨论这一个个方案背后落地所面临的成本，光是在介绍美好的前景。


给传统行业人士用通俗易懂的解释AI的时候都是这么说的:

>机器可以自主的学习，能让机器学会人的对话，学会理解人的知识和意识，我们有大数据，我们可以交给机器，让机器去自己从大数据中训练+学习

听到这样AI的结论，不懂的人们于是开始畅想赋能商业落地美好的未来，但是AI真的能做到么？真的能不用花费额外代价能做到么？需要花费代价才能做到的话？代价到底有多少？钱？还是人力辅助？

有一句不恰当的话叫

>人工智能：有多少智能，背后就有多少人工

AI可以让机器像人一样自己去学习，但有没有想过人在从小到大的学习过程中经历了多少老师的辅助？听过多少的课，做过多少道题？多少老师亲自告诉你这道题错了，那么理解不对，你这么想走进了死胡同。人的学习过程中是不断通过人来校正认知的，机器也一样。

现在机器学习最大的成本难道不是对所有机器学习的模型进行海量的标注/校对，重复训练，重复校对，这背后的成本是多少？难道不是商业落地方面最需要考虑的么？是你已经训练好了，商业落地直接付诸资金，直接拿来就用？还是说得让商业合作方一起和你出人出力去训练优化在特有商业场景下的人工智能？

说实话，如果是前者，早就拿出来宣传服务直接卖钱了，而不是寻求商业落地合作。

现在所有的AI厂商都面临一个问题，手头有AI的能力，但这个能力都不是完美的，都有缺陷和短板，不能直接商业化，因此需要坐下来和各大垂直领域行业进行深入洽谈和思考，如何将能力有限的AI应用进垂直领域中去，从而解决效率/成本等问题。

AI现在就像是个锤子，他不是万能工具箱，什么都能解决，他就只能砸一些特殊钉子，但是AI厂商根本不知道哪里存在这种巨有商业落地价值的特殊钉子，所以AI厂商抱着拿着锤子找钉子的方式开放能力去寻找合作，在我看来这样的合作就要充分的说明，什么钉子可以砸，什么钉子不能砸，这才是有价值有意义的商业落地讨论

但这次大会并不是这种feel，在宣传着一个个很学究很算法的NLP技术，宣传着这些技术有多牛逼（真的很牛逼，每个嘉宾都是当之无愧的大师级），面向的确实一群完全不了解的计算机行业外人士，商讨的却不是这些技术的具体提供形态，提供服务or对接的落地方式，而是画出了一个大饼，所有不懂得人在现场一起high，提问问一些不着调的东西，诸如 `AI/大数据，有没有个人隐私问题`， `AI来了后，工人失业咋办？`甚至有些现场示例，智能问答客服体系，采用的根本是非AI的方式，而是传统的FAQ式的自动客服，反正在场的传统行业认识根本分辨不出来这里面的区别。

专家大师们，讲着非常有价值有意义的技术方案和成果，台下的观众们一脸懵逼的YY不着边际的畅享，AI怎么落地？这个话题感觉在鸡同鸭讲的气氛中和谐的结束了

我是真的期待一些面向开发者，或者面向各行业人士，能解答下面这些问题的AI大会

- 这么些真的很厉害的技术方案怎么落地？
- 这些个方案，我们应该怎么对接？
- 对接的服务有哪些，对接的形式是怎样？
- 对接的过程中需要付出哪些成本和代价，在落地的过程中，哪些是当下AI方案的短板和不足？
- 需要用绕路or人工的方式去cover和弥补？
- 这种人工的方式又需要多大投入？

这些商业落地所真正要考虑的问题，这次大会其实都没体现，更像pr show肌肉，让不明觉厉的观众high起来的一次会。
