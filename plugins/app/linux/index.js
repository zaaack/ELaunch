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
    appDb, isFirstRun = true

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
  let defaultIcon = __dirname + '/../assets/app.svg'
  let icon, execCmd, name,enName
  try {
    let content = fs.readFileSync(file, 'utf-8')
    let locale = child.execSync("locale|grep LANGUAGE |awk '{print substr($0,10)}'", 'utf-8').toString().trim()
    name = enName = content.match(/\n\s*Name\s*=\s*(.*?)\s*(\n|$)/)[1]
    let lm = content.match(new RegExp(`\n\\s*Name\\s*\\[\\s*${locale}\\s*\\]\\s*=\\s*(.*?)\\s*(\n|$)`))
    if (lm) {
      name = lm[1]
    }
    execCmd = content.match(/\n\s*Exec\s*=\s*(.*?)\s*(\n|$)/)[1]
    let appIcon = content.match(/\n\s*Icon\s*=\s*(.*?)\s*(\n|$)/)[1]
    if (fs.existsSync(appIcon)) {
      icon = appIcon
    } else {
      appIcon = appIcon.replace(/[\u4e00-\u9fa5]+/g,'**')
        .replace(/(\.png|\.jpg|\.svg)$/,'')
      let findIconCmd = `find "${pluginConfig.icon_path.join('" "')}" \\( -name "${appIcon}.png" -o -name  "${appIcon}.svg" \\) -follow -size +2k`
      console.log(findIconCmd);
      let iconList = child.execSync(findIconCmd, 'utf-8').toString().trim().split('\n')
      icon=iconList[0]
    }
  } catch (e) {
    // console.error(e);
  }
  return {
    name: name,
    detail: file,
    icon: icon || defaultIcon,
    value: execCmd,
    en_name: enName
  }
}

function update() {
  let hasNewApp = false,tmpApps = {}
  function walkDir(iter) {
    let data = iter.next()
    !data.done && fs.walk(data.value).on('data',function (item) {
      if (path.extname(item.path) === '.desktop') {
        let mtime = item.stats.mtime.getTime(),
            appKey = path.basename(item.path)
        if (mtime > appDb.lastUpdateTime
            || !appDb.apps[appKey]) {
          let appInfo = getAppInfo(item.path)
          tmpApps[appKey] = appInfo
          hasNewApp = true
        }else {
          tmpApps[appKey] = appDb.apps[appKey]
        }
      }
    }).on('end',function () {
      walkDir(iter)
    })

    if(data.done){
      appDb.lastUpdateTime = Date.now()
      appDb.apps = tmpApps
      hasNewApp && fs.writeFileSync(appDbFile, JSON.stringify(appDb), 'utf-8')
    }
  }
  walkDir(pluginConfig.app_path[Symbol.iterator]())
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
    let items = apps.filter(app => {
      try {
        return globule.isMatch(patt, app.name.toLocaleLowerCase()) || globule.isMatch(patt, app.en_name.toLocaleLowerCase())
      } catch (e) {
        console.error(app,e);
      }
    })
    event.sender.send('exec-reply', items)
  },
  execItem: function (item, event) {
    require('child_process').exec(item.value)
    event.sender.send('exec-item-reply')
  }
}
