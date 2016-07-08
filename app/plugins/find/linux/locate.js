var fs = require('fs')
var path = require('path')
var fs = require('fs-extra')
var child = require('child_process')
var config = require('../../../config')
var os = require('os');
var pluginConfig = {
  limit: 20,
  db_path: '~/.ELaunch/find/mlocate.db'
}
let findProcess
let updatedb = 'updatedb'
switch (process.platform) {
  case 'darwin':
    updatedb = '/usr/libexec/locate.updatedb'
    break;
  default:

}

update()

function update (cb) {
  let isFirst = false
  if(!fs.existsSync(pluginConfig.db_path)){
    isFirst = true
    fs.mkdirsSync(path.dirname(pluginConfig.db_path))
    global.notifier(`[plugin:find] Create index in first running.`,{
      body: 'It could take some minutes, plz wait.'
    })
  }

  let cmd = `${updatedb} -o "${pluginConfig.db_path}" --database-root "${pluginConfig.root_dir}"`
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
    isFirst && require('../../../utils/notifier').notify(`[plugin:find] Creating index finished!`,{
      body: 'Now enjoy it!'
    })
    cb && cb()
  })
}

module.exports = {
    setConfig: function (pConfig) {
      config.merge(pluginConfig, pConfig)
      let rep = p => path.normalize(p.replace('~/', os.homedir() + '/'))
      pluginConfig.root_dir = rep(pluginConfig.root_dir || '/')
    },
    exec: function (args, event) {
      if (args.join('').trim() === '') return cb([]) //空格返回空
      let patt = args.join('').toLocaleLowerCase().replace(/([\*\.\?\[\]\!+\\])/g, '\\$1')
      if(pluginConfig.exclude_regex && pluginConfig.exclude_regex.length>0){
        patt = `(?!${pluginConfig.exclude_regex.join('|')}).*?${patt}`
      }
      console.log('patt:'+patt);
      let cmd = `locate -i -d "${pluginConfig.db_path}" -r "${patt}" -l ${pluginConfig.locate_limit}" -m ${pluginConfig.limit}`;
      console.log(cmd);
      let defaultIcon = __dirname+'/../assets/file.svg'
      findProcess && findProcess.kill()
      findProcess = child.exec(cmd, (error, stdout, stderr)=>{
        if(error){
          console.error(error)
          return cb([])
        }
        let items = stdout.split('\n').filter(file=>!/^\s*$/.test(file)).map(file=>{
            return {
              name: path.basename(file),
              detail: file,
              icon: defaultIcon,
              value: file
            }
        })

        event.sender.send('exec-reply', items)
      })
  },
  execItem: function (item, event) {
    require('electron').shell.openItem(item.value)
    event.sender.send('exec-item-reply', ret)
  }
}
