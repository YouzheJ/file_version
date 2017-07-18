﻿
一个简单的版本替换npm包

---

#### 使用场景


> 在jsp等页面中需要对引入的文件进行版本控制


注意：此包需要搭配 assests-webpack-plugin 结合使用

#### 具体使用流程（一个简单的例子）

- 安装

```bash

npm install assets-webpack-plugin --save-dev
npm install file-version --save-dev

```

- 配置 webpack.config.js

```javascript

// 加载依赖
var AssetsPlugin = require('assets-webpack-plugin');
var AssetsReplaceVersion = require('file_version');

```

```javascript

// 配置plugins
plugins: [
    new AssetsPlugin({
      filename: 'public/asset.js',
      processOutput: function (assets) { 
        /* 
        * 由于 AssetsReplaceVersion 直接读取文件内容
        * 此处请不要进行修改
        */
        return JSON.stringify(assets);
      }
    }),
    new AssetsReplaceVersion({
      filename: 'public/asset.js',
      includePath: 'public/include' // 请确保include中没有文件夹，否则读取失败
    })
    ...
]

```

- jsp

```jsp

// 在jsp中引入带有版本信息的html片段
<%@ include file="public/include/header.html" %>

```

- header.html

```html

// 待替换的目标文件
// 此处，存放在include文件夹中
<script src="build/js/bundle.js?v=b02348e10dd02f729e9c"></script>
<link rel="stylesheet" type="text/css" href="static/css/style.css?v=b02348e10dd02f729e9c">

```

- assets.js

```javascript

// 由 assets-webpack-plugin 生成
{"main":{"js":"build/js/bundle.js?v=b02348e10dd02f729e9c", "css":"static/css/style.css?v=b02348e10dd02f729e9c"}}

```

> 以上面的例子为例： 使用webpack进行打包后，assets-webpack-plugin会先生成一个记录各文件版本信息的assets.js文件，然后 file-version 会读取 assets.js中的json字符串，然后遍历include中的文件，替换相应的字段。

#### 由于插件功能简单，适用场景有限

