const myPromisify = require('../../../utils/promisify')
const path = require('path')
const os = require('os')
const child = myPromisify(require('child_process'))
const exec = child.exec
const fs = myPromisify(require('fs-extra'))
const co = require('co')

const defaultIcon = `${__dirname}/../assets/app.svg`
const outputIconName = 'icon_128x128.png'
const uselessIcons = ['icon_128x128.png', 'icon_16x16@2x.png',
    'icon_32x32.png', 'icon_512x512@2x.png', 'icon_128x128@2x.png',
    'icon_256x256.png', 'icon_32x32@2x.png', 'icon_16x16.png',
    'icon_256x256@2x.png icon_512x512.png',
  ].filter(ic => ic !== outputIconName)

let pluginConfig
let globalConfig

function getAppInfo(file) {
  const nameEn = path.basename(file, '.app')
  const readName = exec(`mdls "${file}" -name kMDItemDisplayName`)
    .then(name => name.trim().match(/"(.*?)"/)[1])
    .catch(() => nameEn)

  const readIcnsFile = () => exec(
    `/usr/libexec/PlistBuddy \"${file}/Contents/Info.plist\" -c 'Print :CFBundleIconFile'`)
    .then(_iconName => {
      const iconName = _iconName.trim()
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
    const iconPath = `${globalConfig.dataPath}/app/icons/${nameEn}.iconset`
    const existIconPath = fs.existsSync(iconPath)

    let icon = `${iconPath}/${outputIconName}`
    let icnsFile = `${file}/Contents/Resources/${nameEn}.icns`
    if (!existIconPath) {
      try {
        const existIconFile = fs.existsSync(icnsFile)
        if (!existIconFile) {
          icnsFile = yield readIcnsFile()
        }
        // async convert icns early return
        const icns2pngCmd =
          `iconutil -c iconset -o "${iconPath}" "${icnsFile}"`
        exec(icns2pngCmd)
          .then(() => {
            uselessIcons.forEach(name => {
              fs.unlink(`${iconPath}/${name}`)
            })
          })
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
    nameEn,
    detail: file,
    value: file,
  }))
}

function update(appDb, appDbFile, pCfg, gCfg) {
  pluginConfig = pCfg
  globalConfig = gCfg
  let hasNewApp = false

  const tmpApps = {}
  const isFirstIndexing = appDb.lastUpdateTime === 0

  return Promise.all(pluginConfig.appPaths
    .map(_dir => {
      const dir = _dir.replace(/^~\//, `${os.homedir()}/`)
      const findCmd =
        `mdfind -onlyin ${dir} 'kMDItemFSName=*.app' | grep -v '\.app\/'`
      return exec(findCmd, { maxBuffer: 5 * 1024 * 1024 })
        .then(out => out.toString().trim().split('\n'))
        .then(files => Promise.all(files.map(file => co(function *() {
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
    }))
  .then(() => {
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
