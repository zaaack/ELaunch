import styles from './style.scss'
import electron from 'electron'
import React, { PropTypes } from 'react'
import Input from 'react-toolbox/lib/input'
import Dropdown from 'react-toolbox/lib/dropdown'
import Checkbox from 'react-toolbox/lib/checkbox'
import event2string from 'key-event-to-string'
import autoBind from 'autobind-decorator'

import { stopEvent } from '../../utils'
import { languages, CENTER, CUSTOM } from '../../constants'
import { BaseConfigForm, configForm, configFormProptypes } from '../ConfigForm'

const readEvent = event2string({ joinWith: '+' })

class KeyInput extends React.Component {

  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    className: PropTypes.string,
    placeholder: PropTypes.string,
  }

  constructor(props) {
    super(props)
    autoBind(this.constructor)
  }

  handleKeyDown(e) {
    let value = readEvent(e)
    if (['Escape', 'Backspace', 'Delete'].some(i => i === value)) {
      value = ''
    }
    const { onChange } = this.props
    if (onChange) onChange(value)
    stopEvent(e)
  }

  handleKeyUp(e) {
    stopEvent(e)
  }

  render() {
    const { className, placeholder, value } = this.props
    return (
      <div
        className={className}
        onClick={this.handleClick}
      >
        <input
          type="text"
          onKeyDown={this.handleKeyDown}
          onKeyUp={this.handleKeyUp}
          value={value}
          placeholder={placeholder}
          style={{ border: 'none', background: 'transparent' }}
        />
      </div>
    )
  }
}

export default KeyInput
