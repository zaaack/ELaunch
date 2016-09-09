const os = require('os')
const fs = require('fs-extra')
const electron = require('electron');
const EventEmitter = require('events');
class ConfigEmitter extends EventEmitter {}
const config = new ConfigEmitter();

let debug = process.argv.some((value)=>value.includes('--debug'))
let db,
  dataPath = `${os.homedir()}/.ELaunch`,
  userConfigFile = dataPath+'/config.js',
  dbFile = dataPath+'/db.json'

function toType(obj) {
  return Object.prototype.toString.call(obj).toLocaleLowerCase().slice(8, -1);
}

function merge() {
  let isNone = a=>a === undefined || a===null
  return [].slice.call(arguments).reduce((dist, src)=>{
    dist = isNone(dist)? {}: dist
    src = isNone(src)? {} : src
    if(toType(src) === 'object'){
      for (var i in src) {
        if(toType(src[i]) === 'object'
            && toType(dist[i]) === 'object'){
          dist[i] = merge({}, dist[i], src[i])
        }else{
          dist[i] = src[i]
        }
      }
    }
    return dist
  })
}

function saveDb() {
  try {
    fs.outputJsonSync(dbFile, db, {encoding: 'utf-8'})
  } catch (e) {
      console.error(e);
  }
}



function loadConfig() {
  let configFromFile
  if (!fs.existsSync(userConfigFile)) {
    try {
      fs.copySync(__dirname+'/config.user.js', userConfigFile)
    } catch (err) {
      console.error(err)
    }
  }
  delete require.cache[userConfigFile]
  configFromFile = merge({}, require('./config.default.js'), require(userConfigFile))
  Object.keys(configFromFile).forEach((key)=>delete config[key])
  merge(config, configFromFile)
  return this
}
Object.assign(config,  {
  dataPath: dataPath,
  userConfigFile: userConfigFile,
  merge: merge,
  debug: debug,
  context: {
    mainWindow: null,
    notifier: require('../utils/notifier')
  },
  loadConfig: loadConfig,
  emitReload: function () {
    config.emit('reload-config')
    electron.BrowserWindow.getAllWindows()
      .forEach((win)=>win.webContents.send('reload-config'))
    return this
  },
  db: function () {
    if(!db){
      fs.ensureFileSync(dbFile)
      db = fs.readJsonSync(dbFile, {encoding: 'utf-8',throws: false}) || {}
    }
    return db
  },
  dbSet: function (key, value) {
    let db = this.db()
    if (value === null) {
      delete db[key]
    }else {
      db[key] = value
    }
    saveDb()
    return this
  },
  dbGet: function (key, defaults) {
    return this.db()[key] || defaults
  }
})

loadConfig()
module.exports = config
