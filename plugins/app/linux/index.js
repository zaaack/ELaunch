var fs = require('fs')
var path = require('path')
var child = require('child_process');
var fs = require('fs-extra')
var shell = require('electron').shell;
var globule = require('globule');
//app/apps.db 用于缓存应用信息，当有新应用安装时才更新
//{lastUpdateDate:0 ,apps:[]}
let appDbFile,appDb = {},gConfig,
  appPaths = ['/usr/share/applications','/usr/local/share/applications', '/home/z/.local/share/applications'],
  iconPaths = ['/usr/share/icons', '/home/z/.local/share/icons', '/usr/share/pixmaps']


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
      let findIconCmd = `find "${iconPaths.join('" "')}" \\( -name "${appIcon}.png" -o -name  "${appIcon}.svg" \\)`
      console.log(findIconCmd);
      let iconList = child.execSync(findIconCmd, 'utf-8').toString().trim().split('\n')
      iconList=iconList.sort((a,b)=>{
        let [am, bm]=[a,b].map(f=>f.match(/(\d+)/))
        if(am && bm){
          return +bm[1] - am[1]
        }else if (!am) {
          return -1
        }else {
          return 1
        }
      })
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

module.exports = {
  setConfig: function (pConfig, gConfig) {
    globalConfig = gConfig
    appDbFile = path.dirname(gConfig.userConfigFile) + '/app/app.db'
    fs.ensureFileSync(appDbFile)
    if(pConfig.app_path instanceof Array){
      appPaths = appPaths.concat(pConfig.app_path)
    }
    if(pConfig.app_path instanceof Array){
      iconPaths = iconPaths.concat(pConfig.icon_path)
    }
  },
  update: function (cb) {
    let hasNewApp = false
    appDb = fs.readJsonSync(appDbFile, {throws: false, encoding:'utf-8'}) || {
        lastUpdateTime: 0,
        apps: {}
      }
    function walkDir(iter) {
      let data = iter.next()
      !data.done && fs.walk(data.value).on('data',function (item) {
        if (path.extname(item.path) === '.desktop') {
          let mtime = item.stats.mtime.getTime()
          if (mtime > appDb.lastUpdateTime || globalConfig.isChanged) {
            let appInfo = getAppInfo(item.path)
            appDb.apps[path.basename(item.path)] = appInfo
            hasNewApp = true
          }
        }
      }).on('end',function () {
        walkDir(iter)
      })

      if(data.done){
        appDb.lastUpdateTime = Date.now()
        hasNewApp && fs.writeFileSync(appDbFile, JSON.stringify(appDb), 'utf-8')
        cb && cb()
      }
    }
    walkDir(appPaths[Symbol.iterator]())
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
      } finally {

      }
    })
    event.sender.send('exec-reply', items)
  },
  execItem: function (item, event) {
    require('child_process').exec(item.value)
    event.sender.send('exec-item-reply', '')
  }
}
