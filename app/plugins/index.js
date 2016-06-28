const fs = require('fs');
var path = require('path');
const os = require('os');
const child = require('child_process')
const config = require('../config')

let lastUpdateTime = 0,
    lastExecTime = 0,
    isUpdateing = false,
    isExecing = false,
    pluginMap


function loadPluginMap() {
  pluginMap = {}
  Object.keys(config.plugins).forEach(pluginName=>{
    let pluginInfo = config.plugins[pluginName], cmds
    pluginInfo.config = pluginInfo.config || {}
    pluginInfo.config = config.merge(pluginInfo.config,
      pluginInfo.config[process.platform] || {})
    cmds = pluginInfo.command || {pluginName:{}}
    Object.keys(cmds).forEach(key=>{
      if(cmds[key] && cmds[key].enable === false) return
      pluginMap[key] = config.merge({}, pluginInfo)
      if(cmds[key]){
        pluginMap[key] = config.merge(pluginMap[key], {config: cmds[key]},
          {config: cmds[key][process.platform] || {} })
        }
      })
      if(pluginInfo.config.init_on_start){ //init plugin on program start
        let plugin = require(pluginConfig.path);
        plugin.initOnStart && plugin.initOnStart(pluginConfig, config)
      }
    })
}

loadPluginMap()
config.on('reload-config', loadPluginMap)

function parseCmd(data) {
  let args = data.cmd.split(' ')
  let key = 'app'
  if (args.length > 1 && (args[0] in pluginMap)) {
    key = args.shift()
  } else {
    key = Object.keys(pluginMap).find(k=>pluginMap[k].default)
  }
  let plugin = pluginMap[key]
  return {
    key: key,
    path: path.resolve(config.dataPath, plugin.path),
    args: args,
    type: data.type,
    config: plugin.config || {}
  }
}
module.exports = {
  exec: (data, event) => {
    let cmdInfo = parseCmd(data)
    let plugin = require(cmdInfo.path)
    plugin.setConfig && plugin.setConfig(cmdInfo.config, config)

    plugin.exec(cmdInfo.args, event, cmdInfo)
      // child.exec(`${cmdInfo.path} ${cmdInfo.args.join(' ')}`, (error, stdout, stderr)=>{
      //   if(error) console.error(error);
      //   cb(stdout)
      // })
  },
  execItem: function (data, event) {
    let cmdInfo = parseCmd(data)
    let plugin = require(cmdInfo.path)
    plugin.execItem(data.item, event, cmdInfo)
  }
}
