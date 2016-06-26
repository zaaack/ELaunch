var path = require('path')
var child = require('child_process')
var fs = require('fs-extra')

//app/apps.db 用于缓存应用信息，当有新应用安装时才更新
//{lastUpdateDate:0 ,apps:[]}
let appDbFile, pluginConfig, globalConfig,
    appDb, isFirstIndexing = true,
    defaultIcon = __dirname + '/../assets/app.svg'


    function getAppInfo(file) {
      let name,bname=path.basename(file,'.app'),
        icon = `${file}/Contents/Resources/${bname}.icns`,
        iconPath = `${globalConfig.dataPath}/app/icons/${bname}.iconset`,
        iconNames = ["icon_128x128.png","icon_16x16@2x.png","icon_32x32.png","icon_512x512@2x.png","icon_128x128@2x.png",
         "icon_256x256.png","icon_32x32@2x.png","icon_16x16.png","icon_256x256@2x.png icon_512x512.png"]
      try {
        name = child.execSync(`mdls "${file}" -name kMDItemDisplayName`).toString().match(/\"(.*?)\"/)[1]
        if(!fs.existsSync(icon)){
          let info = fs.readFileSync(`${file}/Contents/Info.plist`,'utf-8')
          icon = info.match(/\<key\>CFBundleIconFile\<\/key\>\s*\<string\>(.*?)\<\/string\>/)[1]
          if(icon.match(/\.icns/)){
            icon = `${file}/Contents/Resources/${icon}`
          }else{
            icon = `${file}/Contents/Resources/${icon}.icns`
          }
        }
        if(!fs.existsSync(iconPath))
          child.execSync(`iconutil -c iconset -o "${iconPath}" "${icon}"`, console.error.bind(console))
      } catch (e) {
        console.error({message:e.message,stack:e.stack}, bname);
      }
      return {
        name: name || bname,
        detail: file,
        icon:  icon? `${iconPath}/icon_128x128.png`:defaultIcon,
        value: file,
        en_name: bname
      }
    }

    function update() {
      let hasNewApp = false,tmpApps = {},
      appDbFile = globalConfig.dataPath + '/app/app.db'
      fs.ensureFileSync(appDbFile)
      appDb  = appDb || fs.readJsonSync(appDbFile, {throws: false, encoding:'utf-8'}) || {
        lastUpdateTime: 0,
        apps: {}
      },isFirstIndexing = appDb.lastUpdateTime === 0

      pluginConfig.app_path.forEach((dir)=>{
        appFiles = child.execSync(`mdfind -onlyin ${dir} 'kMDItemFSName=*.app' | grep -v '\.app\/'`,{
          maxBuffer: 5*1024*1024
        }).toString().split('\n').map(file=>{
          if(!file) return
          let mtime = fs.statSync(file).mtime.getTime(),
              appKey = path.basename(file,'.app')
          if (mtime > appDb.lastUpdateTime
              || !appDb.apps[appKey]) {
            let appInfo = getAppInfo(file)
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
process.on('message', (m) => {
  try {
    pluginConfig = m.pluginConfig
    globalConfig = m.globalConfig
    switch (m.type) {
      case 'update':
        update()
        break;
      default:
    }
  } catch (e) {
    process.send({type:'error',error:e})
    console.error(e);
  } finally {

  }
  if(isFirstIndexing){
    console.log('fi');
    process.send({type:'firstIndexingFinished'})
  }else {
    console.log('f');
    process.send({type:'finished'})
  }
});
