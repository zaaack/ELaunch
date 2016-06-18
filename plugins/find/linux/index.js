var fs = require('fs')
var path = require('path')
var fsUtils = require('nodejs-fs-utils')
var child = require('child_process')
var config = require('../../../config')
var os = require('os');
var pluginConfig = {
  limit: 20
}
let findProcess
module.exports = {
  setConfig: function (pConfig) {
    let plugin  = require('./find')
    switch (pConfig.type) {
      case 'locate':
        let plugin  = require('./locate')
        break;
      default:
    }
    plugin.setConfig && plugin.setConfig(pConfig)
    Object.assign(module.exports, plugin)
  },
  update: function (cb) {
  },
  exec: function (args, cb) {
  },
  execItem: function (item, cb) {
  }
}
