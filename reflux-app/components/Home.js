import React from 'react'
import _ from 'lodash'
import { FormattedMessage } from 'react-intl';


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
                <h3 data-nav="Collector" ><FormattedMessage id="collector"/></h3>
                <p> <FormattedMessage id="collectorMsg"/></p>
              </div>
            </div>
            <div className="ant-col-md-6 text-center">
              <p className="text-center orient-ico "><i data-nav="Parser" onClick={this.nav.bind(this)} className="fa fa-cogs"></i></p>
              <div className="caption">
                <h3 data-nav="Parser"  ><FormattedMessage id="parser"/></h3>
                <p><FormattedMessage id="parserMsg"/></p>
              </div>
            </div>
            <div className="ant-col-md-6 text-center">
              <p className="text-center orient-ico"><i data-nav="Status" onClick={this.nav.bind(this)} className="fa  fa-paper-plane-o"></i></p>
              <div className="caption">
                <h3 data-nav="Status" ><FormattedMessage id="status"/></h3>
                <p><FormattedMessage id="statusMsg"/></p>
              </div>
            </div>
            <div className="ant-col-md-6 text-center">
              <p className="text-center orient-ico"><i data-nav="History" onClick={this.nav.bind(this)} className="fa fa-history"></i></p>
              <div className="caption">
                <h3 data-nav="History" ><FormattedMessage id="history"/></h3>
                <p><FormattedMessage id="historyMsg"/></p>
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
