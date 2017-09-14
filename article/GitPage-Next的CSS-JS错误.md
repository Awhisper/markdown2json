---
title: GitPage部署Hexo NexT主题的CSS/JS错误
date: 2016-11-21 13:53:54
categories: 技术感悟
tags: [Github,GitPage,Hexo]
---

# GitPage 升级，旧版NexT不支持

我的博客使用的是GitPage，域名直接就是`github.io`,用的Hexo博客，并且选了一个觉得很好看的NexT主题，这个主题现在还挺火，用的人挺多的，清新简约

直到上周五，我更新了一波博客，当本地调试完毕后，`sudo hexo d`部署到GitPage的时候，发现所有的博客界面都无法访问了，用chrome一查发现，github的vendor目录下的所有无论是js文件还是css文件，通通的404报错了，所以导致整个页面的数据完全出不来了

查了一下 发现是这个原因

![gitissue](http://o8n2av4n7.bkt.clouddn.com/gitpageissue.png)

简单的说GitPage进行了一次升级，Next使用了`jekyll`这个东西，而这个东西目前GitPage是不支持的，因此导致了博客无法正常加载。

# 解决办法 .nojekyll

__有一个很糙快猛的方法__

- 找到你博客的GitPage的Github仓库
- 在xxx.github.io这个仓库的根目录下，选择`create new file`
- new file 的名字起名`.nojekyll`
- new file 里面的内容就一行`!vendors/*`

通过上面的方法，可以让GitPage对vendor目录禁止jekyll，这样就一切顺利了。

但是存在一个问题，每次deploy，这个仓库都会完全重新clean后生成，因此每次deploy都得这么改一次就太麻烦了

__解决Hexo的Deploy__

修改Hexo的Deploy过程，让Deploy的时候自动处理这些

- .deploy_git 目录, 添加 .nojekyll 空文件
- source目录, 添加.nojekyll 空文件
- 修改 Hexo 上层_config.yml配置文件, 添加

```
include:
  - .nojekyll
```

之后就解决了，我就是这么干的~

# 另一个解决方案


- 首先修改source/vendors为source/lib
- 然后修改_config.yml， 将 _internal: vendors修改为_internal:lib 
- 然后修改next底下所有引用source/vendors路径为source/lib。

这些地方可以通过文件查找找出来。主要集中在这几个文件中。
- 1. Hexo\themes\next.bowerrc 
- 2. Hexo\themes\next.gitignore 
- 3. Hexo\themes\next.javascript_ignore 
- 4. Hexo\themes\next\bower.json 

修改完毕后，刷新重新g一遍就ok啦。



# 解决方案出处

[hexo文章发布到github后部分文件404了](https://www.zhihu.com/question/52268353)

[Hexo+Github博客css js404导致博客页面空白](http://blog.csdn.net/zhouzixin053/article/details/53038679)