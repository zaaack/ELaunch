import styles from './style.scss'
import React, { PropTypes } from 'react'
import Input from 'react-toolbox/lib/input'
import Dropdown from 'react-toolbox/lib/dropdown';

import { languages } from '../../constants'
import { BaseConfigForm, configForm, configFormProptypes } from '../ConfigForm'

class General extends BaseConfigForm {

  static propTypes = configFormProptypes

  render() {
    const { t, rawConfig, updateChange } = this.props
    return (
      <div>
        <section className={styles.inlineGroup}>
          <Input
            type="number"
            label={t('Width')}
            value={rawConfig.width}
            min={200}
            onChange={this.changeAndUpdate('width', 1000, parseInt)}
            className={styles.inline2x}
          />
          <Input
            type="number"
            label={t('Max Height')}
            value={rawConfig.maxHeight}
            min={100}
            onChange={this.changeAndUpdate('maxHeight', 1000, parseInt)}
            className={styles.inline2x}
          />
        </section>
        <section>
          <Dropdown
            auto
            label={t('Choose language')}
            onChange={this.changeAndUpdate('language')}
            source={languages}
            value={rawConfig.language}
          />
        </section>
        {super.render()}
      </div>
    )
  }
}

export default configForm(General)
