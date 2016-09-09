const path = require('path')
const child = require('child_process')
const fs = require('fs-extra')
const shell = require('electron').shell
const globule = require('globule')
const chokidar = require('chokidar')

const defaultIcon = __dirname + '/../assets/app.svg'

//app/apps.db 用于缓存应用信息，当有新应用安装时才更新
//{lastUpdateDate:0 ,apps:[]}
let pluginConfig, globalConfig, context,
    appDbFile, appDb, watchers = []


function initAppDb() {
  appDb = fs.readJsonSync(appDbFile, {throws: false, encoding:'utf-8'}) || {
    lastUpdateTime: 0,
    apps: {}
  }
}

const updateProcess = child.fork(`${__dirname}/update.js`,{
  stdio:'pipe'
})

updateProcess.on('message', (data)=>{
  switch (data.type) {
    case 'finished':
      initAppDb()
      break;
    case 'firstIndexingFinished':
      context.notifier.notify('First Indexing Finished! Now Search Your Apps!')
      break;
    case 'error':
      console.error(data.error);
      break;
    default:
  }
})


function update() {
  updateProcess.send({
    type:'update',
    pluginConfig: pluginConfig,
    globalConfig: globalConfig
  })
}

function init() {
  //init appDbFile and appDb
  appDbFile = globalConfig.dataPath + '/app/app.db'
  fs.ensureFileSync(appDbFile)
  initAppDb()
  //update in first run
  update()
  watchers.forEach(watcher=>watcher.close())
  watchers = []
  let delay = 1000 * 60 * 5 // update after 5min for copy time
  pluginConfig.app_path.forEach((dir)=>{
    let t, watcher = fs.watch(dir,{
      recursive: true
    }, (event, filename)=>{
      console.log(`event is: ${event}`);
      t && clearTimeout(t)
      t = setTimeout(()=>{
        update()
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
    console.log(context)
    globalConfig.on('reload-config', init)
    init()
  },
  exec: function (args, event) {
    if (args.join('').trim() === '') return //空格返回
    let patt = '*'+args.join('*').toLowerCase()+'*'
    let apps = Object.keys(appDb.apps).map(k => appDb.apps[k])
    console.log(apps.length,'len');
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
        return globule.isMatch(patt, app.name.toLocaleLowerCase()) || globule.isMatch(patt, app.en_name.toLocaleLowerCase())
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
