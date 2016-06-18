const fs = require('fs');
var path = require('path');
const os = require('os');
const child = require('child_process')
const config = require('../config')

let lastUpdateTime = 0,
    lastExecTime = 0,
    lastCmdKey,
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
  exec: (cmd, cb) => {

    let cmdInfo = parseCmd(cmd)
    let plugin = require(cmdInfo.script)
    plugin.setConfig && plugin.setConfig(cmdInfo.config)
    let update_delay = cmdInfo.config.hasOwnProperty('update_delay')?
      cmdInfo.config.update_delay:
      config.update_delay
    console.log('update_delay',update_delay, isUpdateing, lastCmdKey, cmdInfo.key,Date.now()-lastUpdateTime, update_delay);
    if (!isUpdateing && (lastCmdKey !== cmdInfo.key
      || Date.now() - lastUpdateTime > update_delay)) { //没有更新且切换插件或者超时时才更新
      isUpdateing = true
      console.log('update');
      plugin.update && plugin.update(function () {
        isUpdateing = false
        console.log('updated');
      })
      lastUpdateTime = Date.now()
    }
    lastCmdKey = cmdInfo.key

    plugin.exec(cmdInfo.args, function (items) {
        cb && cb.apply(null, arguments)
      })
      // child.exec(`${cmdInfo.script} ${cmdInfo.args.join(' ')}`, (error, stdout, stderr)=>{
      //   if(error) console.error(error);
      //   cb(stdout)
      // })
  },
  execItem: function (cmd, item, cb) {
    let cmdInfo = parseCmd(cmd)
    let plugin = require(cmdInfo.script)
    plugin.execItem(item, function () {
      cb && cb.apply(null, arguments)
    })
  }
}
