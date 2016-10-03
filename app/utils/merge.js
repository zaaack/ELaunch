let isNone = a => a === undefined || a === null

function getType(obj) {
  return Object.prototype.toString.call(obj)
    .toLocaleLowerCase().slice(8, -1);
}

function merge() {
  return [].slice.call(arguments).reduce((dist, src) => {
    dist = isNone(dist) ? {} : dist
    src = isNone(src) ? {} : src
    if (getType(dist) !== 'object') {
      return src
    } else if (getType(src) !== 'object') {
      return src
    } else {
      for (var i in src) {
        if (getType(src[i]) === 'object'
            && getType(dist[i]) === 'object') {
          dist[i] = merge({}, dist[i], src[i])
        } else {
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
