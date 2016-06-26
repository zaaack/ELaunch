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
  setConfig: function (pConfig) {
    let plugin  = require('./mdfind')
    switch (pConfig.type) {
      case 'locate':
        plugin  = require('../linux/locate')
        break;
      case 'find':
        plugin  = require('../linux/find')
        break;
      default:
    }
    plugin.setConfig && plugin.setConfig(pConfig)
    Object.assign(module.exports, plugin)
  },
  update: function (cb) {
  },
  exec: function (args, event) {
  },
  execItem: function (item, event) {
  }
}
