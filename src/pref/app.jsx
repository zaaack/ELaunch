import './app.scss'
import 'react-toolbox/lib/commons.scss'
import '../../app/utils/notifier'
// import 'normalize.css/normalize.css'

import React from 'react'
import { render } from 'react-dom'
import Root from './containers/Root'
import { hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import configureStore from './store/configureStore'

const rootEl = document.getElementById('root')

const store = configureStore()
const history = syncHistoryWithStore(hashHistory, store)

render(
  <Root store={store} history={history} />,
  rootEl
)

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    // If you use Webpack 2 in ES modules mode, you can
    // use <App /> here rather than require() a <NextApp />.
    const NextRoot = require('./containers/Root').default
    render(
      <NextRoot store={store} history={history} />,
      rootEl
    )
  })
}
