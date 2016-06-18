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
      config.merge(pluginConfig, pConfig)
      let rep = p => fs.realpathSync(p.replace('~/', os.homedir() + '/'))
      pluginConfig.include_path = pluginConfig.include_path.map(rep) || os.homedir()
    },
    update: function (cb) {
      cb && cb()
    },
    exec: function (args, cb) {
      if (args.join('').trim() === '') return cb([]) //空格返回空
      let patt = args.join('').toLocaleLowerCase()
      if(patt.indexOf('*')<0){
        patt = patt.replace(/(.)/g,'*$1*')
      }
      let cmd = `find ${pluginConfig.include_path.map(ip=>`"${ip}"`).join(' ')} `+
      `\\( ${pluginConfig.exclude_path.map(ep=>`-path "${ep}"`).join(' -o ')} \\)  -a -prune `+
      `-o \\( -type d -o -type f \\) ${pluginConfig.maxdepth?`-maxdepth ${pluginConfig.maxdepth}`:''} -name "${patt}" -print`
      console.log(cmd);
      let defaultIcon = __dirname+'/../assets/file.svg'
      findProcess && findProcess.kill()
      findProcess = child.exec(cmd, {
          encoding:'utf8-',
          timeout: 0,
          maxBuffer: 5 * 1024 * 1024 // 默认 200 * 1024
      }, (error, stdout, stderr)=>{
        if(error){
          console.error(error)
          return cb([])
        }
        stdout = stdout+''
        cb && cb(stdout.split('\n').slice(0, pluginConfig.limit).filter(file=>!/^\s*$/.test(file)).map(file=>{
            return {
              name: path.basename(file),
              detail: file,
              icon: defaultIcon,
              value: file
            }
        }))
      })
  },
  execItem: function (item, cb) {
    require('electron').shell.openItem(item)
    cb()
  }
}
