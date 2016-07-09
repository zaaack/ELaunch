var fs = require('fs')
var path = require('path')
var fs = require('fs-extra')
var child = require('child_process')
var config = require('../../../config')
var os = require('os')
var pluginConfig = {
    limit: 20,
    locate_limit: 2000,
    db_path: '~/.ELaunch/find/mlocate.db'
  },
  globalConfig
let findProcess
let updatedb = 'updatedb'
switch (process.platform) {
case 'darwin':
  updatedb = '/usr/libexec/locate.updatedb'
  break;
default:

}

function update(cb) {
  let isFirst = false
  if (!fs.existsSync(pluginConfig.db_path)) {
    isFirst = true
    fs.mkdirsSync(path.dirname(pluginConfig.db_path))
    globalConfig.context.notifier.notify(`[plugin:find] Create index in first running.`, {
      body: 'It could take some minutes, plz wait.'
    })
  }

  let cmd = `${updatedb} -o "${pluginConfig.db_path}" --database-root "${pluginConfig.root_dir}"`
  console.log(cmd);
  child.exec(cmd, (error, stdout, stderr) => {
    if (error) {
      require('electron').dialog.showMessageBox({
        type: 'warning',
        title: '',
        message: "Please grant root access to `updatedb` to use plugin [find].",
        buttons: ['No', 'Yes']
      }, function (index) {
        if (index === 1) {
          child.exec('kdesu chmod u+s `which updatedb`', (error, stdout, stderr)=>{
            if(error || stderr){
              console.error(error, stderr);
              require('electron').dialog.showMessageBox({
                type: 'error',
                title: 'auto run error',
                message: 'Please run "sudo chmod u+s `which updatedb`" manually.',
                buttons: ['OK']
              })
            }
          })
        }
      })
      console.error(error, stderr);
    }
    console.log('update', stdout);
    isFirst && globalConfig.context.notifier.notify(`[plugin:find] Creating index finished!`, {
      body: 'Now enjoy it!'
    })
    cb && cb()
  })
}
let delay,
  lastUpdateTime = 0,
  isUpdating = false
module.exports = {
  setConfig: function (pConfig, gConfig) {
    config.merge(pluginConfig, pConfig)
    globalConfig = gConfig
    let rep = p => path.normalize(p.replace(/^~/, os.homedir()))
    pluginConfig.root_dir = rep(pluginConfig.root_dir || '/')
    pluginConfig.db_path = rep(pluginConfig.db_path)
    delay = pluginConfig.update_delay || 60000*30
    if (Date.now() - lastUpdateTime > delay) {
      update()
      lastUpdateTime = Date.now()
    }
  },
  exec: function (args, event) {
    if (args.join('').trim() === '') return //空格返回空
    let defaultIcon = __dirname + '/../assets/file.svg'
    if (!fs.existsSync(pluginConfig.db_path)){
      return  event.sender.send('exec-reply', [{
        name: 'Updateing index, plz wait...',
        detail: '',
        icon: defaultIcon,
        value: ''
      }])
    }

    let patt = args.join('').toLocaleLowerCase()
    console.log('patt:' + patt);
    let cmd = `locate -i -d "${pluginConfig.db_path}" ${pluginConfig.regex?'--regex':''} "${patt}" `;
    if(pluginConfig.exclude_patt){
      cmd += ` ${pluginConfig.locate_limit? `-l ${pluginConfig.locate_limit}`:``} | grep -P -v "${pluginConfig.exclude_patt}" -m ${pluginConfig.limit}`
    }else {
      cmd += `-l ${pluginConfig.limit}`
    }
    console.log(cmd);
    findProcess && findProcess.kill()
    findProcess = child.exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(error)
        return
      }
      let items = stdout.split('\n').filter(file => !/^\s*$/.test(file)).map(file => {
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
