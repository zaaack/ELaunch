import styles from './style.scss'
import React, { Component, PropTypes } from 'react'
// import { connect } from 'react-redux'
import { Link } from 'react-router'
import autobind from 'autobind-decorator'
import { List, ListItem, ListSubHeader, ListDivider, ListCheckbox } from 'react-toolbox/lib/list'

import routes from '../../routes'

// collapsed, expanded
class SideMenu extends Component {
  constructor(props) {
    super(props)

    this.status = {
    }
    autobind(this.constructor)
  }

  render() {
    const menu = routes.childRoutes
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
              <ListSubHeader caption={item.text} />
            )
            item.childRoutes.forEach(
              childItem => els.push(
                <Link to={`${item.path}/${childItem.path}`}>
                  <ListItem caption={childItem.text} />
                </Link>
              ))
          } else {
            els.push(
              <Link to={item.path}>
                <ListItem caption={item.text} />
              </Link>
            )
          }
          return els
        })}
      </List>
    )
  }
}

export default (SideMenu)
