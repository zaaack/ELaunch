const isNone = a => a === undefined || a === null

function getType(obj) {
  return Object.prototype.toString.call(obj)
    .toLocaleLowerCase().slice(8, -1);
}

function merge(...args) {
  return [].slice.call(args).reduce((d, s) => {
    const dist = isNone(d) ? {} : d
    const src = isNone(s) ? {} : s
    if (getType(dist) !== 'object') {
      return src
    } else if (getType(src) !== 'object') {
      return src
    }
    Object.keys(src).forEach(i => {
      if (getType(src[i]) === 'object'
          && getType(dist[i]) === 'object') {
        dist[i] = merge({}, dist[i], src[i])
      } else {
        dist[i] = src[i]
      }
    })
    return dist
  })
}

module.exports = {
  getType,
  merge,
}
