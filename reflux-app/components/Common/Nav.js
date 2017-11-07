import React from 'react'
import _ from 'lodash'
import { FormattedMessage } from 'react-intl';

import AppActions from '../../actions/AppActions'
import AppStore from '../../stores/AppStore'

class Nav extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      language:"english"
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
    e.preventDefault()
    var t = e.target
    if (t.tagName.toLowerCase() == 'span') {
      t = t.parentElement
    }
    AppActions.nav(t.dataset.location)
  }
  onChangeWords(e){
    e.preventDefault()
    var t = e.target
    if (t.tagName.toLowerCase() == 'span') {
      t = t.parentElement
    }
    let language = t.dataset.location
    AppActions.changeLanguage(language)
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
      let a = ""
      if(this.state.language == "chinese"){
        if(this.props.location === "Cert"){
          a = "认证"
        }else if(this.props.location === "Collector"){
          a = "采集"
        }else if(this.props.location === "Parser"){
          a = "解析"
        }else if(this.props.location === "Status"){
          a = "状态"
        }else if(this.props.location === "History"){
          a = "历史"
        } else if(this.props.location === "Management"){
          a = "修改密码"
        }
      }else{
        if(this.props.location === "Cert"){
          a = "Cert"
        }else if(this.props.location === "Collector"){
          a = "Collector"
        }else if(this.props.location === "Parser"){
          a = "Parser"
        }else if(this.props.location === "Status"){
          a = "Status"
        }else if(this.props.location === "History"){
          a = "History"
        }else if(this.props.location === "Management"){
          a = "Management"
        }
      }

      url = <div className="container p-t-60">
        <div className="row p-t-10">
          <div className="ant-col-sm-24">
            <ol className="breadcrumb">
              <li> <a href="#" onClick={ this.onNavClick } data-location='Home'>Conalog</a> </li>
              <li className="active"> <FormattedMessage id="superhello" values={{someone:a}}/> </li>
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
                <li><a className={ this.props.location == 'Home' ? "active" : ""} href="#" onClick={ this.onNavClick } data-location='Home' ><FormattedMessage id="home" /></a></li>
                <li><a className={ this.props.location == 'Cert' ? "active" : ""} href="#" onClick={ this.onNavClick } data-location='Cert' ><FormattedMessage id="cert" /></a></li>
                <li><a className={ this.props.location == 'Collector' ? "active" : ""} href="#" onClick={ this.onNavClick } data-location='Collector' ><FormattedMessage id="collector" /></a></li>
                <li><a className={ this.props.location == 'Parser' ? "active" : ""} href="#" onClick={ this.onNavClick } data-location='Parser' ><FormattedMessage id="parser" /></a></li>
                <li><a className={ this.props.location == 'Status' ? "active" : ""} href="#" onClick={ this.onNavClick } data-location='Status' ><FormattedMessage id="status" /></a></li>
                <li><a className={ this.props.location == 'History' ? "active" : ""} href="#" onClick={ this.onNavClick } data-location='History' ><FormattedMessage id="history"/></a></li>
                <li><a className={ this.props.location == 'Document' ? "active" : ""} href="https://orientsoft.github.io/conalog-doc/" target="view_window"><FormattedMessage id="document"  /></a></li>
              </ul>
              <ul className="nav navbar-nav navbar-right hidden-sm">
                <li><a className="dropdown-toggle profile" data-toggle="dropdown" href="#" data-location='ChangeLanguage'><FormattedMessage id="ChangeLanguage"/></a>
                  <ul className="dropdown-menu">
                    <li><a href="#" onClick={ this.onChangeWords } data-location='chinese'><FormattedMessage id="chinese" /></a></li>
                    <li><a href="#" onClick={ this.onChangeWords } data-location='english'><FormattedMessage id="english" /> </a></li>
                  </ul>
                </li>
                <li><a className="dropdown-toggle profile" data-toggle="dropdown" href="/about/" ><FormattedMessage id="admin" defaultMessage="Admin" /></a>
                  <ul className="dropdown-menu">
                    <li><a href="#" onClick={ this.onNavClick } data-location='Management'><i className="fa fa-user m-r-5"></i> <FormattedMessage id="password"  /></a></li>
                    <li><a href="#" onClick={ this.onLogoutClick } data-location='Logout'><i className="fa fa-power-off m-r-5"></i><FormattedMessage id="logout"  /> </a></li>
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
