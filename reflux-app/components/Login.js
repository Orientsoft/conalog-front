import React from 'react'
import _ from 'lodash'

import AppActions from '../actions/AppActions'
import AppStore from '../stores/AppStore'
import { FormattedMessage } from 'react-intl';

class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loginUser: '',
      loginPass: '',
      loginTries: 0
    }
  }

  componentDidMount() {
    this.unsubscribe = AppStore.listen(function(state) {
      this.setState(state)
    }.bind(this))
  }

  componentWillUnmount() {
    if (_.isFunction(this.unsubscribe))
      this.unsubscribe()
  }

  updateUser(e) {
    AppActions.updateLoginUser(e.target.value)
    e.preventDefault()
  }

  updatePass(e) {
    AppActions.updateLoginPass(e.target.value)
    e.preventDefault()
  }

  login(e) {
    console.log('login')
    e.preventDefault()
    AppActions.login()
  }

  render() {
    let a = <FormattedMessage id = 'home'/>
    let user = a._owner._context.intl.messages.user
    let password = a._owner._context.intl.messages.password

    return (
      <div>
        <div className="account-pages"></div>
        <div className="clearfix"></div>
        <div className="wrapper-page">
          <div className=" card-box">
            <div className="panel-heading">
              <h3 className="text-center"> <FormattedMessage id="signin"/> <strong className="text-custom">Conalog</strong> </h3>
            </div>
            <div className="panel-body">
              <form className="form-horizontal m-t-20" action="#">
                <div className="form-group ">
                  <div className="ant-col-xs-24">
                    <input className="form-control" type="text" required="" placeholder={user} onChange={this.updateUser.bind(this)}/>
                  </div>
                </div>
                <div className="form-group">
                  <div className="ant-col-xs-24">
                    <input className="form-control" type="password" required="" placeholder={password} onChange={this.updatePass.bind(this)}/>
                  </div>
                </div>
                <div className="form-group ">
                  <div className="ant-col-xs-24">
                    <div className="checkbox checkbox-primary">
                      <input id="checkbox-signup" type="checkbox" />
                      <label htmlFor="checkbox-signup"> <FormattedMessage id="remember"/> </label>
                    </div>
                  </div>
                </div>
                <div className="form-group text-center m-t-40">
                  <div className="ant-col-xs-24">
                    <button className="btn btn-pink btn-block text-uppercase waves-effect waves-light" type="submit" onClick={this.login.bind(this)}><FormattedMessage id="login"/></button>
                  </div>
                </div>
                <div className="form-group m-t-30 m-b-0">
                  <div className="ant-col-sm-24"> <a href="page-recoverpw.html"  className="text-dark"><i className="fa fa-lock m-r-5"></i> <FormattedMessage id="forget"/> </a> </div>
                </div>
              </form>
            </div>
          </div>
          <div className="row">
            <div className="ant-col-sm-24 text-center">
              <p> <FormattedMessage id="account"/>  <a href="page-register.html"  className="text-primary m-l-5"><b><FormattedMessage id="signup"/></b></a></p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Login.propTypes = {

}

Login.defaultProps = {

}

export default Login
