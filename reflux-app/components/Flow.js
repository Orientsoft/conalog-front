import React from 'react'
import _ from 'lodash'

import AppActions from '../actions/AppActions'
import AppStore from '../stores/AppStore'



class Flow extends React.Component {
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
    // AppActions.changeCollectorType(e.target.dataset.type)
    e.preventDefault()
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="ant-col-sm-12 p-t-60">
            <table id="demo-custom-toolbar"  data-toggle="table"
      										   data-toolbar=""
      										   data-search="false"
      										   data-show-refresh="false"
      										   data-show-toggle="false"
      										   data-show-columns="false"
      										   data-sort-name="id"
      										   data-page-list="[5, 10, 20]"
      										   data-page-size="5"
      										   data-pagination="true" data-show-pagination-switch="true" className="table-bordered ">
              <thead>
                <tr>
                  <th data-field="Name" data-sortable="true" data-formatter="">Name</th>
                  <th data-field="Date" data-sortable="true" data-formatter="dateFormatter">Date</th>
                  <th data-field="Machine" data-align="center" data-sortable="true" data-sorter="">Machine</th>
                  <th data-field="Status" data-align="center" data-sortable="true" data-sorter="">Status</th>
                  <th data-field="Load" data-align="center" data-sortable="true" data-formatter="">Load / Sec</th>
                  <th data-field="Operation" data-align="center" data-formatter="">Operation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Flow1</td>
                  <td>2012-23-12 13:32:12</td>
                  <td>127.0.0.1</td>
                  <td><i className="fa fa-hand-stop-o" /></td>
                  <td><i className="fa fa-download" /> 24 / <i className="fa fa-upload" /> 8</td>
                  <td><i className="fa fa-play" /></td>
                </tr>
                <tr>
                  <td>Flow2</td>
                  <td>2012-23-12 13:32:12</td>
                  <td>127.0.0.1</td>
                  <td><i className="fa fa-spin fa-cog" /></td>
                  <td><i className="fa fa-download" /> 24 / <i className="fa fa-upload" /> 8</td>
                  <td><i className="fa fa-stop" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }
}

Flow.propTypes = {

}

Flow.defaultProps = {

}

export default Flow
