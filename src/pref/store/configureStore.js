import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'
import rootReducer from '../reducers'

export default function configureStore(initialState) {
  let finalCreateStore
  if (process.env.NODE_ENV === 'production') {
    finalCreateStore = compose(
      applyMiddleware(thunk, createLogger()),
      // chrome extension: https://github.com/zalmoxisus/redux-devtools-extension
      window.devToolsExtension ? window.devToolsExtension() : f => f
    )(createStore)
  } else {
    /* eslint-disable */
    const DevTools = require('../containers/DevTools').default
    /* eslint-ensable */
    finalCreateStore = compose(
      applyMiddleware(thunk, createLogger()),
      DevTools.instrument()
    )(createStore)
  }

  const store = finalCreateStore(rootReducer, initialState)

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    /* eslint-disable */
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers').default
      store.replaceReducer(nextRootReducer)
    })
    /* eslint-enable */
  }

  return store
}
