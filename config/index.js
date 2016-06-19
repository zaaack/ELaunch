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



module.exports = {
  userConfigFile: userConfigFile,
  merge: merge,
  isChanged: isChanged,
  debug: debug,
  loadConfig: function () {
    merge(this, require('./config.default.js'))
    if (!fs.existsSync(userConfigFile)) {
      // fs.copySync(__dirname+'/config.user.js', userConfigFile, (err, cache)=>{
      //     if (!err) {
      //         console.log("Copied !");
      //     } else {
      //         console.error("Error", err)
      //     }
      // })
    }else if(fs.statSync(userConfigFile).mtime.getTime() > this.db().lastCofigChangeTime){
      isChanged =true
    }
    // merge(this, require(this.userConfigFile))
    merge(this, require('./config.user'))
  }
,
  db: function () {
    if(!db){
      fs.ensureFileSync(dbFile)
      db = fs.readJsonSync(dbFile, {encoding: 'utf-8',throws: false}) || {}
    }
    return db
  }
}
module.exports.loadConfig()
