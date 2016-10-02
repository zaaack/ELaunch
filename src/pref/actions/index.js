import { CHANGE_CONFIG, UPDATE_CONFIG } from '../constants'
import config from '../../../app/config'
import deepKey from '../../../app/utils/deepKey'

export function changeConfig(key, value) {
  return {
    type: CHANGE_CONFIG,
    key,
    value,
  }
}

export function updateConfig(changedKeys, rawConfig) {
  const failedKeys = []
  changedKeys.forEach(key => {
    const value = deepKey.get(rawConfig)
    const changed = config.set(key, value)
    if (!changed) {
      failedKeys.push(key)
    }
  })
  return {
    type: UPDATE_CONFIG,
    failedKeys,
  }
}
