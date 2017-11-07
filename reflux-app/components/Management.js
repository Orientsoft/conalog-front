import React from 'react'
import _ from 'lodash'

import AppActions from '../actions/AppActions'
import AppStore from '../stores/AppStore'
import { FormattedMessage } from 'react-intl';

class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      managementErr: {}
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

  changeManagementPassword(e) {
    // prevent default submit
    e.preventDefault()

    // get value from controls, with refs
    let oldPass = this.refs.old.value.trim()
    let newPass = this.refs.new.value.trim()
    let repeatedNewPass = this.refs.repeat.value.trim()

    // submit
    AppActions.changeManagementPassword({oldPass: oldPass,
      newPass: newPass,
      repeatedNewPass: repeatedNewPass})
  }

  render() {
    let a = <FormattedMessage id = 'home'/>
    let oldPass = a._owner._context.intl.messages.oldPass
    let newPass = a._owner._context.intl.messages.newPass
    let repeatNewPass = a._owner._context.intl.messages.repeatNewPassword

    return (
      <div>
        <div className="account-pages"></div>
        <div className="clearfix"></div>
        <div className="wrapper-page">
          <div className=" card-box">
            <div className="panel-heading">
              <h3 className="text-center"> <FormattedMessage id="manage"/> <strong className="text-custom">Conalog</strong> </h3>
            </div>
            <div className="panel-body">
              <div className=""></div>
              <form className="form-horizontal m-t-20" action="#">
                <div className="form-group ">
                  <div className="ant-col-xs-24">
                    <input className="form-control"
                      type="password"
                      required=""
                      placeholder={oldPass}
                      ref="old"
                      />
                  </div>
                </div>
                <div className="form-group">
                  <div className="ant-col-xs-24">
                    <input
                      className="form-control"
                      type="password"
                      required=""
                      placeholder={newPass}
                      ref="new"
                      />
                  </div>
                </div>
                <div className="form-group ">
                  <div className="ant-col-xs-24">
                    <input
                      className="form-control"
                      type="password"
                      required=""
                      placeholder={repeatNewPass}
                      ref="repeat"/>
                  </div>
                </div>
                <div className="form-group text-center m-t-40">
                  <div className="ant-col-xs-24">
                    <button className="btn btn-pink btn-block text-uppercase waves-effect waves-light" type="submit" onClick={this.changeManagementPassword.bind(this)}> <FormattedMessage id="changePass"/></button>
                  </div>
                </div>
              </form>
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
