import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'

const rootReducer = combineReducers({
  // ...reducers
  routing,
})

export default rootReducer
