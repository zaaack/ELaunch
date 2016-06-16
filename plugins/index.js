const fs = require('fs');
const os = require('os');
const child = require('child_process')

let config

function loadConfig() {
  config = Object.assign({}, require('../config.default.js'))
  let usrCfgFile = `${os.homedir()}/ELaunch/config.js`
  if (fs.existsSync(usrCfgFile)) {
    config = Object.assign(config, require(usrCfgFile))
  }
}

loadConfig()

function parseCmd(cmd) {
  let args = cmd.split(' ')
  if (args.length > 1 && (args[0] in config.plugins)) {
    let key = args.shift()
    return {
      script: config.plugins[key].script,
      args: args
    }
  } else {
    console.log(args, 'cmd');
    for (let cmd in config.plugins) {
      if (config.plugins[cmd].default)
        return {
          script: config.plugins[cmd].script,
          args: args
        }
    }
    return {
      script: config.plugins['app'].script,
      args: args
    }
  }
}
isExecing = false
module.exports = {
  exec: (cmd, cb) => {
    let cmdObj = parseCmd(cmd)
    let plugin = require(cmdObj.script)
    if (isExecing) return
    isExecing = true
    plugin.exec(cmdObj.args, function(items) {
      cb && cb.apply(null, arguments)
      isExecing = false
    })
    // child.exec(`${cmdObj.script} ${cmdObj.args.join(' ')}`, (error, stdout, stderr)=>{
    //   if(error) console.error(error);
    //   cb(stdout)
    // })
  },
  execItem: function (cmd, item, cb) {
    let cmdObj = parseCmd(cmd)
    let plugin = require(cmdObj.script)
    if (isExecing) return
    isExecing = true
    plugin.execItem(item, function() {
      cb && cb.apply(null, arguments)
      isExecing = false
    })
  }
}
