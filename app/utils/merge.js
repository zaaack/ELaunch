
function getType(obj) {
  return Object.prototype.toString.call(obj).toLocaleLowerCase().slice(8, -1);
}

function merge() {
  let isNone = a=>a === undefined || a===null
  return [].slice.call(arguments).reduce((dist, src)=>{
    dist = isNone(dist)? {}: dist
    src = isNone(src)? {} : src
    if(getType(src) === 'object'){
      for (var i in src) {
        if(getType(src[i]) === 'object'
            && getType(dist[i]) === 'object'){
          dist[i] = merge({}, dist[i], src[i])
        }else{
          dist[i] = src[i]
        }
      }
    }
    return dist
  })
}

module.exports = {
  getType,
  merge,
}
