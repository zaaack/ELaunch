const myPromisify = require('../../../utils/promisify')
const path = require('path')
const child = myPromisify(require('child_process'))
const exec = child.exec
const fs = myPromisify(require('fs-extra'))
const co = require('co')

const defaultIcon = __dirname + '/../assets/app.svg'
const iconNames = ["icon_128x128.png", "icon_16x16@2x.png", "icon_32x32.png", "icon_512x512@2x.png", "icon_128x128@2x.png",
    "icon_256x256.png", "icon_32x32@2x.png", "icon_16x16.png", "icon_256x256@2x.png icon_512x512.png"
  ]

let pluginConfig, globalConfig

function getAppInfo(file) {
  const name_en = path.basename(file, '.app')
  const readName = exec(`mdls "${file}" -name kMDItemDisplayName`)
    .then(name => name.trim().match(/\"(.*?)\"/)[1])
    .catch(e => name_en)

  const readIcnsFile = () => exec(`/usr/libexec/PlistBuddy \"${file}/Contents/Info.plist\" -c 'Print :CFBundleIconFile'`)
    .then(iconName => {
      iconName = iconName.trim()
      let iconFile
      if (iconName.match(/\.icns/)) {
        iconFile = `${file}/Contents/Resources/${iconName}`
      } else {
        iconFile = `${file}/Contents/Resources/${iconName}.icns`
      }
      return iconFile
    })

  return co(function *() {
    const name = yield readName
    const iconPath = `${globalConfig.dataPath}/app/icons/${name_en}.iconset`
    const existIconPath = fs.existsSync(iconPath)

    let icon = `${iconPath}/icon_128x128.png`
    let icnsFile = `${file}/Contents/Resources/${name_en}.icns`
    if (!existIconPath) {
      try {
        let existIconFile = fs.existsSync(icnsFile)
        if (!existIconFile) {
          icnsFile = yield readIcnsFile()
        }
        // async convert icns early return
        const icns2pngCmd =
          `iconutil -c iconset -o "${iconPath}" "${icnsFile}"`
        exec(icns2pngCmd)
          .catch(e => console.error(icnsFile, e))
      } catch (e) {
        icon = defaultIcon
      }
    }
    return { name, icon }
  })
  .then(({ name, icon }) => ({
    name,
    icon,
    name_en,
    detail: file,
    value: file,
  }))
}

function update(appDb, appDbFile, pCfg, gCfg) {
  pluginConfig = pCfg
  globalConfig = gCfg
  let hasNewApp = false
  let tmpApps = {}

  const isFirstIndexing = appDb.lastUpdateTime === 0

  return Promise.all(pluginConfig.app_path.map(dir => {
    const findCmd =
      `mdfind -onlyin ${dir} 'kMDItemFSName=*.app' | grep -v '\.app\/'`
    return exec(findCmd, { maxBuffer: 5 * 1024 * 1024 })
      .then(out => out.toString().trim().split('\n'))
      .then(files => Promise.all(files.map(file => co(function *(){
         if (!file) return
         const mtime = fs.statSync(file).mtime.getTime()
         const appName = path.basename(file, '.app')
         if (mtime > appDb.lastUpdateTime
             || !appDb.apps[appName]) {
           tmpApps[appName] = yield getAppInfo(file)
           hasNewApp = true
         } else {
           tmpApps[appName] = appDb.apps[appName]
         }
       }))))
  })).then(() => {
    appDb.lastUpdateTime = Date.now()
    appDb.apps = tmpApps
    if (hasNewApp) {
      fs.outputJsonSync(appDbFile, appDb, 'utf-8')
    }
    if (isFirstIndexing) {
      const notifier = globalConfig.context.notifier
      notifier.notify('First Indexing Finished! Now Search Your Apps!')
    }
    return appDb
  }).catch(err => console.error(err))
}
module.exports = update
