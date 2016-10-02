const path = require('path')
const child = require('child_process')
const fs = require('fs-extra')
const shell = require('electron').shell
const globule = require('globule')
const chokidar = require('chokidar')
const update = require('./update')

const defaultIcon = __dirname + '/../assets/app.svg'

//app/apps.db 用于缓存应用信息，当有新应用安装时才更新
//{lastUpdateDate:0 ,apps:[]}
let pluginConfig, globalConfig, context

let watchers = []
let appDb, appDbFile


function updateAppDb() {
  update(appDb, appDbFile, pluginConfig, globalConfig)
    .then(ret => { appDb = ret })
}

function init() {
  //app/apps.db 用于缓存应用信息，当有新应用安装时才更新
  //{lastUpdateDate:0 ,apps:[]}
  appDbFile = globalConfig.dataPath + '/app/app.db'
  fs.ensureFileSync(appDbFile)
  appDb = appDb
    || fs.readJsonSync(appDbFile, { throws: false, encoding: 'utf-8' })
    || { lastUpdateTime: 0, apps: {} }
  updateAppDb()
  watchers.forEach(watcher=>watcher.close())
  watchers = []
  let delay = 1000 * 60 * 10 // update after 5min for copy time
  pluginConfig.app_path.forEach((dir) => {
    let t, watcher = fs.watch(dir,{
      recursive: true
    }, (event, filename) => {
      console.log(`event is: ${event}`);
      t && clearTimeout(t)
      t = setTimeout(() => {
        updateAppDb()
        t = null
      }, delay)
    })
    watchers.push(watcher)
  })

}


module.exports = {
  setConfig: function (pConfig, gConfig, ctx) {
    pluginConfig = pConfig
    globalConfig = gConfig
    context = ctx
    globalConfig.on('reload-config', init)
    init()
  },
  exec: function (args, event) {
    if (args.join('').trim() === '') return //空格返回
    let patt = '*'+args.join('*').toLowerCase()+'*'
    let apps = Object.keys(appDb.apps).map(k => appDb.apps[k])
    if(apps.length === 0){
      event.sender.send('exec-reply', [{
        icon: defaultIcon,
        name: 'This plugin has to index apps in first run',
        detail:'Please try it later...',
        value: 'exit'
      }])
      return
    }
    let items = apps.filter(app => {
      try {
        return globule.isMatch(patt, app.name.toLocaleLowerCase()) || globule.isMatch(patt, app.name_en.toLocaleLowerCase())
      } catch (e) {
        console.error(app,e);
      }
    }).slice(0,20)
    event.sender.send('exec-reply', items)
  },
  execItem: function (item, event) {
    shell.openItem(item.value)
    event.sender.send('exec-item-reply')
  }
}
