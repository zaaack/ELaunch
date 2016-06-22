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

function init() {
  if(!isFirstRun) return
  isFirstRun=false
  //init appDbFile and appDb
  appDbFile = globalConfig.dataPath + '/app/app.db'
  fs.ensureFileSync(appDbFile)
  appDb = fs.readJsonSync(appDbFile, {throws: false, encoding:'utf-8'}) || {
    lastUpdateTime: 0,
    apps: {}
  }

  //update in first run
  update()

  // watch and update
  let watcher = chokidar.watch(pluginConfig.app_path, {
    ignore: /^.*(?!\.desktop)$/,
  }),delay = 3000,t

  watcher.on('raw', (event, path, details) => {
    if(['add','change','unlink'].indexOf(event) !== -1){
      t && clearTimeout(t)
      t = setTimeout(()=>{
        try {
          update()
        } catch (e) {
          console.error(e);
        }
      },delay)
    }
  })
}

function getAppInfo(file) {
  let name,bname=path.basename(file,'.app'),icon = `${file}/Contents/Resources/${bname}.icns`
  try {
    // if(!fs.existsSync(icon)){
    //   icon = child.execSync(`mdfind -onlyin '${file}/Contents/Resources' 'kMDItemFSName=*.icns'`)
    // }
    // name = child.execSync(`mdls '${file}' -name kMDItemDisplayName`).toString().match(/\"(.*?)\"/)[1]
  } catch (e) {
    // console.error(e);
  }
  return {
    name: bname,
    detail: file,
    icon: defaultIcon,
    value: file,
    en_name: bname
  }
}

function update() {
  let hasNewApp = false,tmpApps = {}

  pluginConfig.app_path.forEach((dir)=>{
    appFiles = child.execSync(`mdfind -onlyin '${dir}' 'kMDItemFSName=*.app' | grep '/Applications/.*\.app'`).split('\n').map(file=>{
      let mtime = fs.statSync(file).mtime.getTime(),
          appKey = path.basename(item.path)
      if (mtime > appDb.lastUpdateTime
          || !appDb.apps[appKey]) {
        let appInfo = getAppInfo(item.path)
        tmpApps[appKey] = appInfo
        hasNewApp = true
      }else {
        tmpApps[appKey] = appDb.apps[appKey]
      }
    })
  })
  appDb.lastUpdateTime = Date.now()
  appDb.apps = tmpApps
  hasNewApp && fs.writeFileSync(appDbFile, JSON.stringify(appDb), 'utf-8')
}


let timer
module.exports = {
  setConfig: function (pConfig, gConfig) {
    pluginConfig = pConfig.darwin
    globalConfig = gConfig
    // init()
  },
  exec: function (args, event) {
    if (args.join('').trim() === '') return //空格返回
    timer && clearTimeout(timer)
    timer = setTimeout(()=>{
      let items = []
      args = args.join('').replace('\'','\\\'')
      pluginConfig.app_path.forEach((dir)=>{
        appFiles = child.execSync(`mdfind -onlyin ${dir} '${args}'`).toString().split('\n').map(file=>{
          if(file)
          items.push(getAppInfo(file))
        })
      })
      event.sender.send('exec-reply', items)
    },600)
  },
  execItem: function (item, event) {
    require('child_process').exec(item.value)
    event.sender.send('exec-item-reply')
  }
}
