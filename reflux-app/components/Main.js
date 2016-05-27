import React from 'react'
import _ from 'lodash'

import AppActions from '../actions/AppActions'
import AppStore from '../stores/AppStore'

class Main extends React.Component {
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
    AppActions.updateMainUser(e.target.value)
    e.preventDefault()
  }

  updatePass(e) {
    AppActions.updateMainPass(e.target.value)
    e.preventDefault()
  }

  login(e) {
    AppActions.login()
    e.preventDefault()
  }

  render() {
    return (
      <div />
    )
  }
}

Main.propTypes = {

}

Main.defaultProps = {

}

export default Main
