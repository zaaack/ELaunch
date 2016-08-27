'use strict'
const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
let isDev = process.env.NODE_ENV === 'development'

//设置css modules的模块名更可读，由于我们使用了sass，所以只需要模块话根类名就行了。如果设置了modules参数会默认全局使用模块化类名，没有设置则可以通过:local(className){} 手动指定
const baseCssLoader = 'css?souceMap&localIdentName=[local]__[hash:base64:5]!postcss-loader!sass-loader?souceMap'
let cssLoader = ExtractTextPlugin.extract('style', baseCssLoader)
let debug = false
let devtool = '#source-map'

let buildPlugins = []
let devPlugins = []

if (isDev) {
  debug = true
  devtool = '#inline-source-map'
  cssLoader = 'style!' + baseCssLoader
  devPlugins = []
} else {
  buildPlugins = [
    //生成html上的模块的hash值，但是只包括当前打包的模块，不支持dll文件，不过由于它默认支持ejs模版，因此我们可以通过模版实现。
    new HtmlWebpackPlugin({
      filename: '../index.html',
      template: 'src/index.ejs',
      hash: true,
      excludeChunks: ['../bg/bg']
    }),
  ]
}


module.exports = {
  // 需要打包的文件配置
  entry: {
    app: './src/app.jsx', //通过key value的形式配置了需要打包的文件,
  },
  debug: debug,
  devtool: devtool,
  // 输出文件配置
  output: {
    path: './extension/dist', // 输出的目录，我们是配置为当前目录下的dist目录
    publicPath: 'dist/', // 发布后的服务器或cdn上的路径, 配置这个后webpack-dev-server会自动将html中引用的部署路径自动路由到本地的开发路径上
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
        test: /\.(css|scss)$/,
        // 使用ExtractTextPlugin,将样式抽出到单独的文件中，
        // webpack默认是构建html的style标签; 多个loader可以通过!连接起来，
        // 相当于管道一样，最后面的loader先传入文件，然后再传出给前面的loader
        loader: cssLoader,
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
  // postcss-loader 的配置，这里我们主要是使用autoprefixer
  postcss: [autoprefixer({
    browsers: ['last 2 version', 'Explorer >= 9']
  })],
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
    // 抽取样式到单独的 文件中，文件名称则为[name].css
    new ExtractTextPlugin('[name].bundle.css'),
    // 定义变量,这些变量会在build的时候执行，可以给不同的命令传入不同的env，
    // 这样就能实现服务端与本地的配置不同了。
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
      },
    }),
    // 将文件打包为后通过manifest.json在require时判断是否包含，这样比起common trunk plugin
    // 就彻底不需要每次编译分析第三方库了，节省了编译时间
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require("./extension/dist/dll/vendor-manifest.json")
    }),
  ].concat(buildPlugins).concat(devPlugins),

  // webpack-dev-server配置
  // http://webpack.github.io/docs/webpack-dev-server.html#api
  devServer: {
    contentBase: './extension', //serve 的html的路径
    hot: true, //用于react-hot-loader实现热更新（其实我在命令行中已经加上--hot就不是必要的了 ）
  },
}
