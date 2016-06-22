var fs = require('fs')
var path = require('path')
var child = require('child_process')
var fs = require('fs-extra')
var shell = require('electron').shell
var globule = require('globule')
let chokidar = require('chokidar')

//app/apps.db 用于缓存应用信息，当有新应用安装时才更新
//{lastUpdateDate:0 ,apps:[]}
let appDbFile, pluginConfig, globalConfig,
    appDb, isFirstRun = true,
    defaultIcon = __dirname + '/../assets/app.svg'
function initAppDb() {
  appDb = fs.readJsonSync(appDbFile, {throws: false, encoding:'utf-8'}) || {
    lastUpdateTime: 0,
    apps: {}
  }
}
function init() {
  if(!isFirstRun) return
  isFirstRun=false
  //init appDbFile and appDb
  appDbFile = globalConfig.dataPath + '/app/app.db'
  fs.ensureFileSync(appDbFile)
  initAppDb()

  let updateP = child.fork(`${__dirname}/update.js`,{
    stdio:'pipe'
  })

  updateP.on('message', (data)=>{
    switch (data.type) {
      case 'finished':
        initAppDb()
        break;
      case 'firstIndexingFinished':
        globalConfig.context.notifier.notify('First Indexing Finished! Now Search Your Apps!')
        break;
      case 'error':
        console.error(data.error);
        break;

      default:

    }
  })
  function update() {
    console.log('s u');
    updateP.send({type:'update',pluginConfig: pluginConfig,globalConfig:globalConfig})
  }
  //update in first run
  update()

  // watch and update
  // let watcher = chokidar.watch(pluginConfig.app_path, {
  //   ignore: /^.*(?!\.desktop)$/,
  // }),delay = 3000,t
  //
  // watcher.on('raw', (event, path, details) => {
  //   if(['add','change','unlink'].indexOf(event) !== -1){
  //     t && clearTimeout(t)
  //     t = setTimeout(()=>{
  //       try {
  //         update()
  //       } catch (e) {
  //         console.error(e);
  //       }
  //     },delay)
  //   }
  // })
  let delay = 3000
  pluginConfig.app_path.forEach((dir)=>{
    let t
    fs.watch(dir,{
      recursive: true
    },(event, filename)=>{
      console.log(`event is: ${event}`);
      t && clearTimeout(t)
      t = setTimeout(()=>{
        update()
      },delay)
    })
  })

}


module.exports = {
  setConfig: function (pConfig, gConfig) {
    pluginConfig = pConfig
    globalConfig = gConfig
    init()
  },
  exec: function (args, event) {
    if (args.join('').trim() === '') return //空格返回
    let patt = '*'+args.join('').toLocaleLowerCase().split('').join('*')+'*'
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
