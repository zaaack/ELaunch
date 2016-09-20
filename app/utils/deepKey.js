const { merge } = require('./merge')

module.exports = {
  get(obj, key, defaultValue) {
    return key.split('.').reduce((subObj, SubKey) => {
      if (subObj === defaultValue) return subObj
      const subValue = subObj[SubKey]
      if (subValue) {
        return subValue
      } else {
        return defaultValue
      }
    }, obj)
  },
  set(obj, key, value) {
    if (value === void 0) return
    const keys = key.split('.')
    keys.reduce((subObj, subKey) => {
      const subValue = subObj[subKey]
      if (subValue) {
        return subValue
      } else if (keys[keys.length - 1] === subKey){
        merge(subObj[subKey], value)
      } else {
        subObj[subKey] = {}
        return subObj[subKey]
      }
    }, obj)
    return obj
  },
}
