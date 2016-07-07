import React from 'react'
import _ from 'lodash'

import AppActions from '../actions/AppActions'
import AppStore from '../stores/AppStore'

class Home extends React.Component {
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

  nav(e) {
    console.log(e.target)
    let loc = e.target.dataset.nav
    AppActions.nav(loc)
    e.preventDefault()
  }

  render() {
    return (
      <div>
        <div className="container orient">
          <h1>Conalog</h1>
          <p>contact your logs</p>
        </div>
        <div className="container">
          <div className="row">
            <div className="ant-col-md-6 text-center">
              <p className="text-center orient-ico"><i data-nav="Collector" onClick={this.nav.bind(this)} className="fa fa-modx"></i></p>
              <div className="caption">
                <h3 data-nav="Collector" onClick={this.nav.bind(this)}>Collector</h3>
                <p> Setup collectors Both active and passive supported </p>
              </div>
            </div>
            <div className="ant-col-md-6 text-center">
              <p className="text-center orient-ico"><i data-nav="Parser" className="fa fa-cogs"></i></p>
              <div className="caption">
                <h3 data-nav="Parser" >Parser</h3>
                <p> Quickly build parser flows and write parser arammar interactivelv.</p>
              </div>
            </div>
            <div className="ant-col-md-6 text-center">
              <p className="text-center orient-ico"><i data-nav="Status" onClick={this.nav.bind(this)} className="fa  fa-paper-plane-o"></i></p>
              <div className="caption">
                <h3 data-nav="Status" onClick={this.nav.bind(this)}>Status</h3>
                <p> Watch your collectocs and parser flows in a graphic way. </p>
              </div>
            </div>
            <div className="ant-col-md-6 text-center">
              <p className="text-center orient-ico"><i data-nav="History" onClick={this.nav.bind(this)} className="fa fa-history"></i></p>
              <div className="caption">
                <h3 data-nav="History" onClick={this.nav.bind(this)}>History</h3>
                <p> Check log history to identify where the problem sits </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Home.propTypes = {

}

Home.defaultProps = {

}

export default Home
