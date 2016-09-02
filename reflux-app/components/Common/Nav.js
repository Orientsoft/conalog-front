import React from 'react'
import _ from 'lodash'

import AppActions from '../../actions/AppActions'
import AppStore from '../../stores/AppStore'

class Nav extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  componentDidMount() {
    this.unsubscribe = AppStore.listen(function(state) {
      this.setState(state);
    }.bind(this));
  }

  componentWillUnmount() {
    if (_.isFunction(this.unsubscribe))
      this.unsubscribe();
  }

  onNavClick(e) {
    AppActions.nav(e.target.dataset.location)
    e.preventDefault()
  }

  onLogoutClick(e) {
    console.log('Nav::onLogoutClick')
    AppActions.logout()
    e.preventDefault()
  }

  render() {
    let url
    if (this.props.location === 'Home') {
      url = <div />
    }
    else {
      url = <div className="container p-t-60">
        <div className="row p-t-10">
          <div className="ant-col-sm-24">
            <ol className="breadcrumb">
              <li> <a href="#" onClick={ this.onNavClick } data-location='Home'>Conalog</a> </li>
              <li className="active"> { this.props.location } </li>
            </ol>
          </div>
        </div>
      </div>
    }

    return (
      <div>
        <div className="topbar">
          <div className="container">

            <div className="navbar-header">
              <button className="navbar-toggle collapsed" type="button" data-toggle="collapse" data-target=".navbar-collapse"> <span className="fa fa-bars"></span> </button>
              <a href="#" className="logo" onClick={ this.onNavClick } data-location='Home'>Conalog</a> </div>
            <div className="navbar-collapse collapse " role="navigation" aria-expanded="true">
              <ul className="nav navbar-nav">
                <li><a className={ this.props.location == 'Home' ? "active" : ""} href="#" onClick={ this.onNavClick } data-location='Home'>Home</a></li>
                <li><a className={ this.props.location == 'Cert' ? "active" : ""} href="#" onClick={ this.onNavClick } data-location='Cert'>Cert</a></li>
                <li><a className={ this.props.location == 'Collector' ? "active" : ""} href="#" onClick={ this.onNavClick } data-location='Collector'>Collector</a></li>
                <li className="disablebtn"><a className={ this.props.location == 'Parser' ? "active" : ""} href="#" onClick={ this.onNavClick } data-location='Parser' disabled="disabled">Parser</a></li>
                <li><a className={ this.props.location == 'Status' ? "active" : ""} href="#" onClick={ this.onNavClick } data-location='Status'>Status</a></li>
                <li><a className={ this.props.location == 'History' ? "active" : ""} href="#" onClick={ this.onNavClick } data-location='History'>History</a></li>
              </ul>
              <ul className="nav navbar-nav navbar-right hidden-sm">
                <li><a className="dropdown-toggle profile" data-toggle="dropdown" href="/about/" >Admin</a>
                  <ul className="dropdown-menu">
                    <li><a href="#" onClick={ this.onNavClick } data-location='Management'><i className="fa fa-user m-r-5"></i> Password</a></li>
                    <li><a href="#" onClick={ this.onLogoutClick } data-location='Logout'><i className="fa fa-power-off m-r-5"></i> Logout</a></li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>
        { url }
      </div>
    )
  }
}

Nav.propTypes = {

}

Nav.defaultProps = {

}

export default Nav
