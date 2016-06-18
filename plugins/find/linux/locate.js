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
      pluginConfig.root_dir = rep(pluginConfig.root_dir) || '/'
    },
    update: function (cb) {
      let isFirst = false
      if(!fs.existsSync(pluginConfig.db_path)){
        isFirst = true
        fsUtils.mkdirsSync(path.dirname(pluginConfig.db_path))
        global.notify(`[plugin:find] Create index in first running.`,{
          body: 'It could take some minutes, plz wait.'
        })
      }

      let cmd = `updatedb -o "${pluginConfig.db_path}" --database-root "${pluginConfig.root_dir}"`
      console.log(cmd);
      child.exec(cmd, (error, stdout, stderr) => {
        if(error){
          require('electron').dialog.showMessageBox({
            type: 'warning',
            title: '',
            message: "Plz grant root access to `updatedb` to use plugin [find].",
            buttons: ['No', 'Yes']
          }, function (index) {
            if(index === 1){
              child.exec('gksu chmod u+s `which updatedb`', console.log.bind(console))
            }
          })
          console.error(error,stderr);
        }
        console.log('update',stdout);
        isFirst && global.notify(`[plugin:find] Creating index finished!`,{
          body: 'Now enjoy it!'
        })
        cb && cb()
      })
    },
    exec: function (args, cb) {
      if (args.join('').trim() === '') return cb([]) //空格返回空
      let patt = args.join('').toLocaleLowerCase()
      let cmd = `locate -i -d "${pluginConfig.db_path}" ${pluginConfig.use_regex?`-r `:``} "${patt}" -l ${pluginConfig.locate_limit} | grep -P -v "${pluginConfig.exclude_patt}" -m ${pluginConfig.limit}`;
      console.log(cmd);
      let defaultIcon = __dirname+'/../assets/file.svg'
      findProcess && findProcess.kill()
      findProcess = child.exec(cmd, (error, stdout, stderr)=>{
        if(error){
          console.error(error)
          return cb([])
        }
        cb && cb(stdout.split('\n').filter(file=>!/^\s*$/.test(file)).map(file=>{
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
