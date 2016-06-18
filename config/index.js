var os = require('os')
var fs = require('fs')
var fsUtils = require('nodejs-fs-utils')
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

exports.merge = merge
exports.userConfigFile = `${os.homedir()}/.ELaunch/config.js`
exports.loadConfig = function () {
  merge(exports, require('./config.default.js'))
  if (!fs.existsSync(exports.userConfigFile)) {
    // fsUtils.copySync(__dirname+'/config.user.js', userConfigFile, (err, cache)=>{
    //     if (!err) {
    //         console.log("Copied !");
    //     } else {
    //         console.error("Error", err)
    //     }
    // })
  }
  // merge(exports, require(exports.userConfigFile))
  merge(exports, require('./config.user'))
}

exports.loadConfig()
