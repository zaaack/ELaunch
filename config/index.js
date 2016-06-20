var os = require('os')
var fs = require('fs-extra')

let debug = process.argv.some((value)=>value==='--debug')
let db,isChanged=false,
  userConfigFile = `${os.homedir()}/.ELaunch/config.js`,
  dbFile = `${os.homedir()}/.ELaunch/db.json`

function merge() {
  return [].slice.call(arguments).reduce((dist, src)=>{
    dist = dist || {}
    src = src === undefined? {} : src
    if(typeof src === 'object' && src !== null){
      for (var i in src) {
        if(src[i] instanceof Object && !(src[i] instanceof Array)){
          dist[i] = merge(dist[i], src[i])
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


module.exports = {
  userConfigFile: userConfigFile,
  merge: merge,
  isChanged: isChanged,
  debug: debug,
  loadConfig: function () {
    merge(this, require('./config.default.js'))
    if (!fs.existsSync(userConfigFile)) {
      try {
        fs.copySync(__dirname+'/config.user.js', userConfigFile)
      } catch (err) {
        console.error(err)
      }
    }else if(fs.statSync(userConfigFile).mtime.getTime() > this.db().lastCofigChangeTime){
      isChanged =true
    }
    merge(this, require(this.userConfigFile))
    // merge(this, require('./config.user'))
  }
,
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
  },
  dbGet: function (key, defaults) {
    return this.db()[key] || defaults
  }
}
module.exports.loadConfig()
