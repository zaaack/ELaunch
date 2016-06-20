const fs = require('fs');
var path = require('path');
const os = require('os');
const child = require('child_process')
const config = require('../config')

let lastUpdateTime = 0,
    lastExecTime = 0,
    isUpdateing = false,
    isExecing = false

function parseCmd(cmd) {
  let args = cmd.split(' ')
  let key = 'app'
  if (args.length > 1 && (args[0] in config.plugins)) {
    key = args.shift()
  } else {
    console.log(args, 'cmd');
    for (let k in config.plugins) {
      if (config.plugins[k].default) {
        key = k
        break
      }
    }
  }
  console.log(config);
  let plugin = config.plugins[key]
  console.log(path.resolve(path.dirname(config.userConfigFile), plugin.script));
  return {
    key: key,
    script: path.resolve(path.dirname(config.userConfigFile), plugin.script),
    args: args,
    config: plugin.config || {}
  }
}
module.exports = {
  exec: (cmd, event) => {

    let cmdInfo = parseCmd(cmd)
    let plugin = require(cmdInfo.script)
    plugin.setConfig && plugin.setConfig(cmdInfo.config, config)

    plugin.exec(cmdInfo.args, event)
      // child.exec(`${cmdInfo.script} ${cmdInfo.args.join(' ')}`, (error, stdout, stderr)=>{
      //   if(error) console.error(error);
      //   cb(stdout)
      // })
  },
  execItem: function (cmd, item, event) {
    let cmdInfo = parseCmd(cmd)
    let plugin = require(cmdInfo.script)
    plugin.execItem(item, event)
  }
}
