import styles from './style.scss'
import React, { Component, PropTypes } from 'react'
import { translate } from 'react-i18next'
// import { connect } from 'react-redux'
import { Link } from 'react-router'
import autobind from 'autobind-decorator'
import { List, ListItem, ListSubHeader, ListDivider, ListCheckbox } from 'react-toolbox/lib/list'

import routes from '../../routes'

// collapsed, expanded
class SideMenu extends Component {
  constructor(props) {
    super(props)

    autobind(this.constructor)
  }

  renderItem(uri, text) {
    const { router } = this.context
    const isActive = router.isActive(uri)
    return (
      <Link to={uri}>
        <ListItem
          caption={text}
          disabled={isActive}
          selectable
          ripple
        />
      </Link>
    )
  }

  render() {
    const menu = routes.childRoutes
    const { t } = this.props
    return (
      <List selectable ripple>
        {menu.map((item, index) => {
          const els = []
          if (index > 0) {
            els.push(
              <ListDivider />
            )
          }
          if (item.childRoutes) { // subheader
            els.push(
              <ListSubHeader caption={t(item.text)} />
            )
            item.childRoutes.forEach(childItem =>
              els.push(this.renderItem(
                `${item.path}/${childItem.path}`, t(childItem.text))))
          } else {
            els.push(this.renderItem(item.path, t(item.text)))
          }
          return els
        })}
      </List>
    )
  }
}


SideMenu.contextTypes = {
  router: React.PropTypes.object,
}

export default translate()(SideMenu)
