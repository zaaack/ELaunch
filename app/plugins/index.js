const fs = require('fs');
let path = require('path');
const os = require('os');
const child = require('child_process')
const config = require('../config')

let lastUpdateTime = 0
let lastExecTime = 0
let isUpdateing = false
let isExecing = false
let pluginMap



function getPlugin(pluginInfo) {
  let isPluginRequired = !!require.cache[pluginInfo.path]
  let plugin = require(pluginInfo.path)
  if (!isPluginRequired) {
    try {
      plugin.setConfig && plugin.setConfig(pluginInfo.config, config)
    } catch (e) {
      console.error('Plugin [%s] setConfig failed!!', pluginInfo.name, e)
    }
  }
  return plugin
}

function getMergedPluginInfo(pluginInfo, cmdConfig) {
  cmdConfig = cmdConfig || {}
  pluginInfo.config = pluginInfo.config || {}
  let platform = process.platform
  let mergedCmdConfig = config.merge({},
    pluginInfo.config, pluginInfo.config[platform],
    cmdConfig, cmdConfig[platform])

  // console.log(mergedCmdConfig);
  let mergedPluginInfo = config.merge({}, pluginInfo, {
    config: mergedCmdConfig
  })

  return mergedPluginInfo
}

function loadPluginMap() {
  pluginMap = {}
  Object.keys(config.plugins).forEach(pluginName => {
    let pluginInfo = config.plugins[pluginName]
    pluginInfo.name = pluginName
    let cmdConfigMap = pluginInfo.command || { [pluginName]: {} }

    Object.keys(cmdConfigMap).forEach(cmd => {
      if(cmdConfigMap[cmd] && cmdConfigMap[cmd].enable === false) return
      pluginMap[cmd] = getMergedPluginInfo(pluginInfo, cmdConfigMap[cmd])
    })

    if(pluginInfo.config && pluginInfo.config.init_on_start){ //init plugin on program start
      let plugin = getPlugin(pluginInfo)
      try {
        plugin.initOnStart && plugin.initOnStart(pluginInfo.config, config)
      } catch (e) {
        console.error('Plugin [%s] initOnStart failed!', pluginName, e)
      }
    }
  })
}

loadPluginMap()

// console.log(pluginMap);

config.on('reload-config', loadPluginMap)

function parseCmd(data) {
  let args = data.cmd.split(' ')
  let key = 'app'
  if (args.length > 1 && (args[0] in pluginMap)) {
    key = args.shift()
  } else {
    key = Object.keys(pluginMap).find(k => pluginMap[k].default)
  }
  let plugin = pluginMap[key]
  if (!plugin) {
    console.log(key, pluginMap);
  }
  return {
    key: key,
    path: path.resolve(config.dataPath, plugin.path),
    args: args,
    type: data.type,
    plugin: plugin,
    config: plugin.config || {}
  }
}
module.exports = {
  exec: (data, event) => {
    let cmdInfo = parseCmd(data)
    let plugin = getPlugin(cmdInfo.plugin)
    try {
      plugin.exec(cmdInfo.args, event, cmdInfo)
    } catch (e) {
      console.error('Plugin [%s] exec failed!', cmdInfo.plugin.name, e)
    }
      // child.exec(`${cmdInfo.path} ${cmdInfo.args.join(' ')}`, (error, stdout, stderr)=>{
      //   if(error) console.error(error);
      //   cb(stdout)
      // })
  },
  execItem: function (data, event) {
    let cmdInfo = parseCmd(data)
    let plugin = getPlugin(cmdInfo.plugin)
    try {
      plugin.execItem(data.item, event, cmdInfo)
    } catch (e) {
      console.error('Plugin [%s] execItem failed!', cmdInfo.plugin.name, e)
    }
  }
}
