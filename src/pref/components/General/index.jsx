import styles from './style.scss'
import React, { PropTypes } from 'react'
import Input from 'react-toolbox/lib/input'
import { configForm, configFormProptypes } from '../configForm'

class General extends React.Component {

  static propTypes = configFormProptypes

  handleChange(key) {
    return value =>
      this.props.changeConfig(key, value)
  }

  render() {
    const { t, rawConfig, updateChange } = this.props
    return (
      <div>
        <section className={styles.inlineGroup}>
          <Input
            type="number"
            label={t('Width')}
            value={rawConfig.width}
            onChange={this.handleChange('width')}
            onBlur={updateChange}
            className={styles.inline2x}
          />
          <Input
            type="number"
            label={t('Max Height')}
            value={rawConfig.maxHeight}
            onChange={this.handleChange('maxHeight')}
            onBlur={updateChange}
            className={styles.inline2x}
          />
        </section>
        <section>

        </section>
      </div>
    )
  }
}

export default configForm(General)
