var os = require('os');
var fs = require('fs');
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
exports.loadConfig = function () {
  merge(exports, require('./config.default.js'))
  let usrCfgFile = `${os.homedir()}/.ELaunch/config.js`
  if (fs.existsSync(usrCfgFile)) {
    merge(exports, require(usrCfgFile))
  }
}

exports.loadConfig()
