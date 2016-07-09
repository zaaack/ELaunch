var fs = require('fs')
var path = require('path')
var fs = require('fs-extra')
var child = require('child_process')
var config = require('../../../config')
var os = require('os');
var pluginConfig = {
  limit: 20
}
let findProcess
module.exports = {
  setConfig: function (pConfig, gConfig) {
    let plugin  = require('./find')
    switch (pConfig.type) {
      case 'locate':
        plugin  = require('./locate')
        break;
      default:
    }
    plugin.setConfig && plugin.setConfig.call(plugin, ...arguments)
    Object.assign(module.exports, plugin)
  },
  update: function (cb) {
  },
  exec: function (args, event) {
  },
  execItem: function (item, event) {
  }
}
