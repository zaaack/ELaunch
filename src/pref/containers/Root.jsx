import React, { PropTypes } from 'react'
import { Provider } from 'react-redux'
import routes from '../routes'
import { Router } from 'react-router'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../../app/i18n'

export default class Root extends React.Component {

  render() {
    const { store, history } = this.props
    let devTools

    if (process.env.NODE_ENV === 'development') {
      /* eslint-disable */
      const DevTools = require('./DevTools').default
      devTools = <DevTools />
      /* eslint-ensable */
    }

    return (
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <div className="root">
            <Router history={history} routes={routes} />
            {devTools}
          </div>
        </I18nextProvider>
      </Provider>
    )
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
}
