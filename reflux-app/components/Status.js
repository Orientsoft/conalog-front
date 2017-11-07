import React from 'react'
import _ from 'lodash'

import AppActions from '../actions/AppActions'
import AppStore from '../stores/AppStore'

import ActiveStatus from './Status/ActiveStatus'
import PassiveStatus from './Status/PassiveStatus'
import ParserStatus from './Status/ParserStatus'
import AgentStatus from './Status/AgentStatus'
import { FormattedMessage } from 'react-intl';


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
    var t = e.target
    if (t.tagName.toLowerCase() == 'span') {
      t = t.parentElement
    }
    e.preventDefault()
    AppActions.changeStatusType(t.dataset.type)
  }

  render() {
    return (
      <div className="container">
        <div className="row clbody">
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
                  aria-expanded="true">
                  <FormattedMessage id="active"></FormattedMessage>
                </a>
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
                  aria-expanded="false">
                  <FormattedMessage id="passive"></FormattedMessage>
                </a>
              </li>
              <li role="presentation"
                  className= { this.props.statusType === 'Agent' ? "active text-center" : "text-center"}
                  style={{width:"20%"}}>
                <a href="#"
                   role="tab"
                   id="agent-tab"
                   data-toggle="tab"
                   onClick={ this.onTabClick }
                   data-type="Agent"
                   aria-controls="agent"
                   aria-expanded="false">
                  <FormattedMessage id="agent"></FormattedMessage>
                </a>
              </li>
              <li role="presentation"
                  className= { this.props.statusType === 'Parser' ? "active text-center" : "text-center"}
                  style={{width:"20%"}}>
                <a href="#"
                   role="tab"
                   id="parser-tab"
                   data-toggle="tab"
                   onClick={ this.onTabClick }
                   data-type="Parser"
                   aria-controls="parser"
                   aria-expanded="false">
                  <FormattedMessage id="parser"></FormattedMessage>
                </a>
              </li>
            </ul>
            <div id="myTabContent" className="tab-content p-t-10">
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

              <div role="tabpanel"
                   className={ this.props.statusType === 'Agent' ? "tab-pane fade active in" : "tab-pane fade " }
                   id="agent"
                   aria-labelledby="agent-tab">
                <AgentStatus />
              </div>

              <div role="tabpanel"
                   className={ this.props.statusType === 'Parser' ? "tab-pane fade active in" : "tab-pane fade " }
                   id="parser"
                   aria-labelledby="parser-tab">
                <ParserStatus />
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
