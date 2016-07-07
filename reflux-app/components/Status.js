import React from 'react'
import _ from 'lodash'

import AppActions from '../actions/AppActions'
import AppStore from '../stores/AppStore'

import ActiveStatus from './Status/ActiveStatus'
import PassiveStatus from './Status/PassiveStatus'

class Status extends React.Component {
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

  onTabClick(e) {
    e.preventDefault()
    AppActions.changeStatusType(e.target.dataset.type)
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="ant-col-lg-24">
            <ul id="myTabs" className="nav nav-tabs" role="tablist">
              <li role="presentation"
                className= { this.props.statusType === 'Active' ? "active text-center" : "text-center"}
                style={{width:"20%"}}>
                <a href="#"
                  id="home-tab"
                  role="tab"
                  data-toggle="tab"
                  onClick={ this.onTabClick }
                  data-type="Active"
                  aria-controls="home"
                  aria-expanded="true">Active</a>
              </li>
              <li role="presentation"
                className= { this.props.statusType === 'Passive' ? "active text-center" : "text-center"}
                style={{width:"20%"}}>
                <a href="#"
                  role="tab"
                  id="profile-tab"
                  data-toggle="tab"
                  onClick={ this.onTabClick }
                  data-type="Passive"
                  aria-controls="profile"
                  aria-expanded="false">Passive</a>
              </li>
            </ul>
            <div id="myTabContent" className="tab-content p-20">
              <div role="tabpanel"
                className={ this.props.statusType === 'Active' ? "tab-pane fade active in" : "tab-pane fade " }
                id="home"
                aria-labelledby="home-tab">
                <ActiveStatus />
              </div>

              <div role="tabpanel"
                className={ this.props.statusType === 'Passive' ? "tab-pane fade active in" : "tab-pane fade " }
                id="profile"
                aria-labelledby="profile-tab">
                <PassiveStatus />
              </div>

            </div>
          </div>
        </div>
      </div>
    )
  }
}

Status.propTypes = {

}

Status.defaultProps = {

}

export default Status
