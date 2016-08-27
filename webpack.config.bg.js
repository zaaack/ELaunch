'use strict'
const path = require('path')
const webpack = require('webpack')
let isDev = process.env.NODE_ENV === 'development'

//设置css modules的模块名更可读，由于我们使用了sass，所以只需要模块话根类名就行了。如果设置了modules参数会默认全局使用模块化类名，没有设置则可以通过:local(className){} 手动指定
let debug = false
let devtool = '#source-map'

let buildPlugins = []
let devPlugins = []

if (isDev) {
  debug = true
  devtool = '#inline-source-map'
}


module.exports = {
  // 需要打包的文件配置
  entry: {
    'bg': './src/bg/index.js'
  },
  debug: debug,
  devtool: devtool,
  // 输出文件配置
  output: {
    path: './extension/bg/', // 输出的目录，我们是配置为当前目录下的dist目录
    filename: '[name].bundle.js', // 输出的文件名，[name]就是entry的key
  },

  // 模块加载器
  module: {
    loaders: [ // 加载器数组
      {
        test: /\.(png|jpg|jpeg|gif|ttf|eot|woff|woff2|svg)(?:\?.*?){0,1}$/, // 用来匹配文件的正则
        // 加载器的名称，此处为url-loader,`?`后面可以添加loader的参数，
        // 具体得参考loader的github主页。
        loader: 'url?limit=10000&name=files/[name].[ext]?[hash]',
      }, {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        // loader也可以使用使用数组进行配置, loaders:['babel','...']
        // 参数可以用querystring: 'babel?presets[]=es2015&presets[]=react'
        // 或query字段： loader: 'babel', query: {presets: ['es2015', 'react']}
        // 或参数传json:
        // 'babel?{presets:["es2015", "react"]}'
      }, {
        test: /\.jsx$/,
        exclude: /(node_modules|bower_components)/,
        loaders: ['react-hot', "babel"]
      },
    ],
  },
  //babel 配置
  babel: {
    presets: ['es2015', 'react'],
    plugins: ['transform-runtime', 'transform-flow-strip-types', 'transform-class-properties'], // 为了autobind也是拼了。。
  },
  resolve: {
    extensions: ['', '.jsx', '.js']
  },
  // webpack 插件配置
  plugins: [
    // 定义变量,这些变量会在build的时候执行，可以给不同的命令传入不同的env，
    // 这样就能实现服务端与本地的配置不同了。
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
      },
    }),
  ].concat(buildPlugins).concat(devPlugins),
}
