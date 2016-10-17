import React, { PropTypes } from 'react'
import Input from 'react-toolbox/lib/input'
import Dropdown from 'react-toolbox/lib/dropdown'
import { Button, IconButton } from 'react-toolbox/lib/button'
import Dialog from 'react-toolbox/lib/dialog'
import { translate } from 'react-i18next'
import autoBind from 'autobind-decorator'

class ConfirmButton extends React.Component {

  static propTypes = {
    children: PropTypes.node,
    onConfirm: PropTypes.func,
    onClick: PropTypes.func,
    title: PropTypes.string,
    body: PropTypes.string,
    t: PropTypes.func,
  }

  constructor(props) {
    super(props)

    autoBind(this.constructor)
  }

  state = {
    active: false,
  }

  handleToggle() {
    this.setState({ active: !this.state.active })
  }

  confirm(result) {
    this.handleToggle()
    const { onConfirm } = this.props
    if (onConfirm) onConfirm(result)
  }

  handleClick(...args) {
    const { onClick } = this.props
    this.handleToggle()
    if (onClick) onClick(...args)
  }

  render() {
    const { children, title, body, t, buttonComponent } = this.props
    const actions = [
      { label: t('Cancel'), onClick: () => this.confirm(false) },
      { label: t('Confirm'), onClick: () => this.confirm(false) },
    ]
    const mButton = buttonComponent || Button
    return (
      <span>
        <IconButton {...this.props} onClick={this.handleClick} />
        <Dialog
          actions={actions}
          active={this.state.active}
          onEscKeyDown={this.handleToggle}
          onOverlayClick={this.handleToggle}
          title={title}
        >
          <p>{body}</p>
        </Dialog>
      </span>
    )
  }
}

export default translate()(ConfirmButton)
