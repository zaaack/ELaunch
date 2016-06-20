const fs = require('fs');
var path = require('path');
const os = require('os');
const child = require('child_process')
const config = require('../config')

let lastUpdateTime = 0,
    lastExecTime = 0,
    isUpdateing = false,
    isExecing = false,
    pluginMap = {}

Object.keys(config.plugins).forEach(pluginName=>{
  let plugin = config.plugins[pluginName],
      cmds = plugin.command
  cmds && Object.keys(cmds).forEach(key=>{
    pluginMap[key] = config.merge({}, plugin, {config: cmds[key]})
  })
})

function parseCmd(cmd) {
  let args = cmd.split(' ')
  let key = 'app'
  if (args.length > 1 && (args[0] in pluginMap)) {
    key = args.shift()
  } else {
    key = Object.keys(pluginMap).find(k=>pluginMap[k].default)
  }
  let plugin = pluginMap[key]
  return {
    key: key,
    script: path.resolve(config.dataPath, plugin.script),
    args: args,
    config: plugin.config || {}
  }
}
module.exports = {
  exec: (cmd, event) => {

    let cmdInfo = parseCmd(cmd)
    let plugin = require(cmdInfo.script)
    plugin.setConfig && plugin.setConfig(cmdInfo.config, config)

    plugin.exec(cmdInfo.args, event, cmdInfo)
      // child.exec(`${cmdInfo.script} ${cmdInfo.args.join(' ')}`, (error, stdout, stderr)=>{
      //   if(error) console.error(error);
      //   cb(stdout)
      // })
  },
  execItem: function (cmd, item, event) {
    let cmdInfo = parseCmd(cmd)
    let plugin = require(cmdInfo.script)
    plugin.execItem(item, event, cmdInfo)
  }
}
