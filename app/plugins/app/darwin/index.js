const fs = require('fs-extra')
const shell = require('electron').shell
const globule = require('globule')
const update = require('./update')

const defaultIcon = `${__dirname}/../assets/app.svg`

// app/apps.db 用于缓存应用信息，当有新应用安装时才更新
// {lastUpdateDate:0 ,apps:[]}
let pluginConfig
let globalConfig
let watchers = []
let appDbFile
let appDb


function updateAppDb() {
  update(appDb, appDbFile, pluginConfig, globalConfig)
    .then(ret => { appDb = ret })
}

function init() {
  // app/apps.db 用于缓存应用信息，当有新应用安装时才更新
  // {lastUpdateDate:0 ,apps:[]}
  appDbFile = `${globalConfig.dataPath}/app/app.db`
  fs.ensureFileSync(appDbFile)
  appDb = appDb
    || fs.readJsonSync(appDbFile, { throws: false, encoding: 'utf-8' })
    || { lastUpdateTime: 0, apps: {} }
  updateAppDb()
  watchers.forEach(watcher => watcher.close())
  watchers = []
  const delay = 1000 * 60 * 10 // update after 5min for copy time
  pluginConfig.appPaths.forEach((dir) => {
    let timer
    const watcher = fs.watch(dir, {
      recursive: true,
    }, () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        updateAppDb()
        timer = null
      }, delay)
    })
    watchers.push(watcher)
  })
}


module.exports = {
  setConfig(pCfg, gCfg) {
    pluginConfig = pCfg
    pluginConfig.appPaths = pluginConfig.appPaths
      .map(file => file.replace('~/', require('os').homedir()))
    globalConfig = gCfg
    init()
  },
  exec(args, event) {
    if (args.join('').trim() === '') return // 空格返回
    const patt = `*${args.join('*').toLowerCase()}*`
    const apps = Object.keys(appDb.apps).map(k => appDb.apps[k])
    if (apps.length === 0) {
      event.sender.send('exec-reply', [{
        icon: defaultIcon,
        name: 'This plugin has to index apps in first run',
        detail: 'Please try it later...',
        value: 'exit',
      }])
      return
    }
    const items = apps.filter(app => {
      try {
        return globule.isMatch(patt, app.name.toLocaleLowerCase())
          || globule.isMatch(patt, app.nameEn.toLocaleLowerCase())
      } catch (e) {
        console.error(app, e);
      }
      return false
    }).slice(0, 20)
    event.sender.send('exec-reply', items)
  },
  execItem(item, event) {
    shell.openItem(item.value)
    event.sender.send('exec-item-reply')
  },
}
