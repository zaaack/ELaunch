import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import { ActionTypes } from '../constants'
import dotDrop from 'dot-prop'
import config from '../../../app/config'

function configReducer(state = {
  rawConfig: config.getCopyedConfig(),
  failedKeys: [],
  changedKeySet: new Set(),
}, action) {
  const newState = { ...state }
  switch (action.type) {
    case ActionTypes.CHANGE_CONFIG:
      dotDrop.set(newState.rawConfig, action.key, action.value)
      newState.changedKeySet.add(action.key)
      // connect would make shallow comparison,
      // https://github.com/reactjs/redux/issues/585#issuecomment-133028621
      newState.failedKeys = []
      break
    case ActionTypes.UPDATE_CONFIG:
      // roll back failed keys
      action.failedKeys.forEach(key => {
        const originalVal = config.get(key)
        dotDrop.set(newState.rawConfig, action.key, originalVal)
      })
      newState.failedKeys = action.failedKeys
      newState.changedKeySet.clear()
      break
    default:
  }
  return newState
}

const rootReducer = combineReducers({
  config: configReducer,
  routing,
})

export default rootReducer
