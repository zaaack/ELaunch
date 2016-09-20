function mirror(obj) {
  /* eslint-disable no-param-reassign, no-sequences */
  return Object.keys(obj).reduce((newObj, key) => {
    const value = newObj[key]
    if (typeof value === 'object'
      && value !== null) {
      newObj[key] = mirror(value)
    } else {
      newObj[key] = key
    }
    return newObj
  }, {})
}

export default mirror({
  ActionTypes: {
    CHANGE_CONFIG: null,
  },
})
