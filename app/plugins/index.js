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
  const pluginFile = path.normalize(pluginInfo.path)
  const pluginIsRequiredBefore = !!require.cache[pluginFile]
  const plugin = require(pluginFile)
  if (!pluginIsRequiredBefore) {
    try {
      // make setConfig once
      plugin.setConfig && plugin.setConfig(pluginInfo.config, config, config.context)
    } catch (e) {
      console.error('Plugin [%s] setConfig failed!!', pluginInfo.name, e)
    }
  }
  return plugin
}

function getMergedPluginInfo(pluginInfo, cmdConfig) {
  cmdConfig = cmdConfig || {}
  pluginInfo.config = pluginInfo.config || {}
  const platform = process.platform
  const mergedCmdConfig = config.merge({},
    pluginInfo.config, pluginInfo.config[platform],
    cmdConfig, cmdConfig[platform])

  // console.log(mergedCmdConfig);
  const mergedPluginInfo = config.merge({}, pluginInfo, {
    config: mergedCmdConfig
  })

  return mergedPluginInfo
}

function loadPluginMap() {
  pluginMap = {}
  Object.keys(config.plugins).forEach(pluginName => {
    const pluginInfo = config.plugins[pluginName]
    pluginInfo.name = pluginName
    const cmdConfigMap = pluginInfo.command || { [pluginName]: {} }

    Object.keys(cmdConfigMap).forEach(cmd => {
      if(cmdConfigMap[cmd] && cmdConfigMap[cmd].enable === false) return
      pluginMap[cmd] = getMergedPluginInfo(pluginInfo, cmdConfigMap[cmd])
    })

    if(pluginInfo.config && pluginInfo.config.init_on_start){ //init plugin on program start
      const plugin = getPlugin(pluginInfo)
      try {
        plugin.initOnStart && plugin.initOnStart(pluginInfo.config, config)
      } catch (e) {
        console.error('Plugin [%s] initOnStart failed!', pluginName, e)
      }
    }
  })
}

// console.log(pluginMap);
config.on('app-ready', loadPluginMap) // make config ready before set plugin config
config.on('reload-config', loadPluginMap)

function parseCmd(data) {
  const args = data.cmd.split(' ')
  let key = 'app'
  if (args.length > 1 && (args[0] in pluginMap)) {
    key = args.shift()
  } else {
    key = Object.keys(pluginMap).find(k => pluginMap[k].default)
  }
  const plugin = pluginMap[key]
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
    const cmdInfo = parseCmd(data)
    const plugin = getPlugin(cmdInfo.plugin)
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
    const cmdInfo = parseCmd(data)
    const plugin = getPlugin(cmdInfo.plugin)
    try {
      plugin.execItem(data.item, event, cmdInfo)
    } catch (e) {
      console.error('Plugin [%s] execItem failed!', cmdInfo.plugin.name, e)
    }
  }
}
