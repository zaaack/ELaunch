import styles from './style.scss'
import React, { PropTypes } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import Input from 'react-toolbox/lib/input'

class General extends React.Component {

  static propTypes = {
    t: PropTypes.func.isRequired,
  }
  state = {}

  render() {
    const { t } = this.props
    return (
      <div>
        <section className={styles.inlineGroup}>
          <Input
            type="number"
            label={t('Width')}
            name="width"
            value={11}
            className={styles.inline2x}
          />
          <Input
            type="number"
            label={t('Max Height')}
            name="height"
            className={styles.inline2x}
          />
        </section>
        <section>

        </section>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    rawConfig: state.rawConfig,
  }
}

export default compose(
  connect(mapStateToProps),
  translate()
)(General)
