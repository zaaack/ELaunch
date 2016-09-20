import React from 'react'
import SideMenu from '../components/SideMenu'
import { Layout, Panel, Sidebar } from 'react-toolbox/lib/layout'

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
          <div style={{ padding: '1.8rem' }}>
            {this.props.children}
          </div>
        </Panel>
      </Layout>
    )
  }
}

Main.propTypes = {
  children: React.PropTypes.node,
}
