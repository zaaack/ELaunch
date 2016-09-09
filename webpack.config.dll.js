const webpack = require('webpack');
const path = require('path');

const baseDir = './app/browser/pref'

module.exports = {
  entry: {
    vendor: ["react", "react-dom", "redux", "react-redux", "redux-thunk", "react-router", "react-router-redux", ]
  },
  devtool: '#source-map',
  output: {
    filename: '[name].dll.js',
    path: path.resolve(__dirname, `${baseDir}/dist/dll`),
    library: "[name]"
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.resolve(__dirname, `${baseDir}/dist/dll/[name]-manifest.json`),
      name: "[name]"
    }),
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      output: {
        comments: false
      }
    }),
  ]
}
