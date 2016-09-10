import React from 'react'
import SideMenu from '../components/SideMenu'
import { AppBar, Checkbox, IconButton } from 'react-toolbox'
import { Layout, NavDrawer, Drawer, Panel, Sidebar } from 'react-toolbox'

export default class Main extends React.Component {
  state = {
    drawerPinned: true
  }

  toggleDrawerPinned = () => {
    this.setState({
      drawerPinned: !this.state.drawerPinned,
    })
  }

  render() {
    return (
      <Layout>
        <Sidebar
          pinned={this.state.drawerPinned}
          width={3}
        >
          <SideMenu />
        </Sidebar>
        <Panel>
          {this.props.children}
        </Panel>
      </Layout>
    )
  }
}

Main.propTypes = {
  children: React.PropTypes.node,
}
