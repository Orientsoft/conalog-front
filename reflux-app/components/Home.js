import React from 'react'
import _ from 'lodash'

import AppActions from '../actions/AppActions'
import AppStore from '../stores/AppStore'

class Home extends React.Component {
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

  onLogoClick(e) {
    AppActions.nav(e.target.dataset.location)
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
            <div className="col-md-3 text-center">
              <p className="text-center orient-ico"><i className="fa fa-modx"></i></p>
              <div className="caption">
                <h3>Collector</h3>
                <p> Setup collectors Both active and passive supported </p>
              </div>
            </div>
            <div className="col-md-3 text-center">
              <p className="text-center orient-ico"><i className="fa fa-cogs"></i></p>
              <div className="caption">
                <h3>Parser</h3>
                <p> Quickly build parser flows and write parser arammar interactivelv.</p>
              </div>
            </div>
            <div className="col-md-3 text-center">
              <p className="text-center orient-ico"><i className="fa  fa-paper-plane-o"></i></p>
              <div className="caption">
                <h3>Status</h3>
                <p> Watch your collectocs and parser flows in a graphic way. </p>
              </div>
            </div>
            <div className="col-md-3 text-center">
              <p className="text-center orient-ico"><i className="fa fa-history"></i></p>
              <div className="caption">
                <h3>History</h3>
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
