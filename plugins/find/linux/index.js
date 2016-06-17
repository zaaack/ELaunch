var fs = require('fs')
var path = require('path')
var fsUtils = require('nodejs-fs-utils')
var child = require('child_process')
var config = require('../../../config')
var os = require('os');
var pluginConfig = {
  limit: 20
}

module.exports = {
    setConfig: function (pConfig) {
      config.merge(pluginConfig, pConfig)
      let rep = p => path.normalize(p.replace('~/', os.homedir() + '/'))
      pluginConfig.root_dir = rep(pluginConfig.root_dir) || '/'
      pluginConfig.exclude_path = pluginConfig.exclude_path.map(rep)

      if (pluginConfig.include_path instanceof Array) {
        pluginConfig.include_path.map(rep).forEach((incPath) => {
          fs.readdirSync(pluginConfig.root_dir).forEach((broPath) => {
            broPath = `${pluginConfig.root_dir}${path.sep}{broPath}`
            if (broPath !== incPath && pluginConfig.exclude_path.indexOf(broPath) < 0) {
              pluginConfig.exclude_path.push(broPath)
            }
          })
        })
      }
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

      let cmd = `updatedb -o ${pluginConfig.db_path} --database-root "${pluginConfig.root_dir}" --prunepaths "${pluginConfig.exclude_path.join(' ')}" --prunenames "${pluginConfig.exclude_ext.join(' ')}"`
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
      let cmd = `locate ${pluginConfig.use_regex?`-r `:``} ${patt} -i -l ${pluginConfig.limit} -d ${pluginConfig.db_path}`;
      console.log(cmd);
      let defaultIcon = __dirname+'/../assets/file.svg'
      child.exec(cmd, (error, stdout, stderr)=>{
        error && console.error(error);
        cb && cb(stdout.split('\n').map(file=>{
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
