import React from 'react'
let message = require('antd/lib/message')
let TimePicker = require('antd/lib/time-picker')
let Switch = require('antd/lib/switch')
let Tag = require('antd/lib/tag')
let Modal = require('antd/lib/modal')
import AppActions from '../../actions/AppActions'
import AppStore from '../../stores/AppStore'
import constants from '../../const'
import _ from 'lodash'

class AgentStatus extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      agentStatusList: [],
      agentStatusListAll:[],
      messageModal:false,
      messageContent:''
    }
  }

  componentDidMount() {
    this.unsubscribe = AppStore.listen(function(state) {
      this.setState(state)
    }.bind(this))
    AppActions.getAgentStatusList()

    // start to get agent collector list in loop
    this.loop = setInterval(function() {
      AppActions.getAgentStatusList()
    }, constants.STATUS_REFRESH_INTERVAL)
  }

  componentWillUnmount() {
    // stop list loop
    clearInterval(this.loop)

    if (_.isFunction(this.unsubscribe))
      this.unsubscribe();
  }

  setAgentSwitch(switcher) {
    console.log(this)
    let id = this['data-id']
    AppActions.setCollectorSwitch({ id: id, switch: switcher, category: 'agent'})
  }

  showAllStatus(index, e){
    let id = e.target.getAttribute("data-id")
    this.setState({
      messageModal:true,
      messageContent:this.state.agentStatusListAll[index].status.lastActivity.stdout
    })

  }

  showPartStatus(index, e){
    this.setState({
      messageModal:false
    })
  }

  render() {
    // render status list
    let createAgentStatus = (line, index) => {
      // line = { _id, name, ts, type, trigger, cmd, param, host, status }
      // status = { runningFlag, lastActivity }
      // lastActivity = { ts, success[, stdout, stderr] }

      let agentStatus
      let date = new Date(line.ts)
      date = date.toLocaleString()
      let idx = _.indexOf(this.state.agentStatusChecklist, line._id)  // idx agentStatusChecklist??
      // console.log('createActiveStatus', this.state.activeStatusChecklist, line._id, idx)
      let lastAgentTs
      let lastAgentMsg
      let execCount
      let operation
      if (line.status.lastActivity != null) {
        execCount = line.status.lastActivity.execCounter
        lastAgentTs = new Date(parseInt(line.status.lastActivity.ts)).toLocaleString()
        console.log(JSON.stringify(line))

        switch (line.status.lastActivity.status) {
          case 'Success':
            lastAgentMsg = <td>
              <Tag color="green">stdout </Tag>
              <Tag color="green" onClick={this.showAllStatus.bind(this, index)}> + </Tag>
              { line.status.lastActivity.stdout }
            </td>
            break

          case 'Error':
            lastAgentMsg = <td>
              <Tag color="red">stderr </Tag>
              <Tag color="red" onClick={this.showAllStatus.bind(this, index)}> + </Tag>
              { line.status.lastActivity.stdout }
            </td>
            break

          default:
            execCount = 0
            lastAgentTs = 'N/A'
            lastAgentMsg = <td> <Tag color="yellow"> Pending </Tag> </td>
            break
        }
      }
      else {
        execCount = 0
        lastAgentTs = 'N/A'
        lastAgentMsg = <td> <Tag color="yellow"> N/A </Tag> </td>
      }

      if (line.status.runningFlag) {
        operation = <Switch data-id={line._id}
                            data-switch={false}
                            defaultChecked={true}
                            onChange={this.setAgentSwitch}
                            size="small" />
      }
      else {
        operation = <Switch data-id={line._id}
                            data-switch={true}
                            defaultChecked={false}
                            onChange={this.setAgentSwitch}
                            size="small" />
      }

      if (idx == -1)
        agentStatus = <tr key = { index }>
          <td>{ line.name }</td>
          <td>{ date }</td>
          <td>{ line.param }</td>
          <td>{ execCount }</td>
          <td>{ lastAgentTs }</td>
          { lastAgentMsg }
          <td>{ operation }</td>
        </tr>
      else
        agentStatus = <tr key = { index }>
          <td>{ line.name }</td>
          <td>{ date }</td>
          <td>{ line.param }</td>
          <td>{ execCount }</td>
          <td>{ lastAgentTs }</td>
          { lastAgentMsg }
          <td>{ operation }</td>
        </tr>

      return agentStatus
    }

    let agentStatusTable = this.state.agentStatusList.map(createAgentStatus.bind(this))

    return (
      <div>
        <Modal
          title = "Last Activity Message"
          visible = {this.state.messageModal}
          onOk = {this.showPartStatus.bind(this)}
          onCancel = {this.showPartStatus.bind(this)}
          footer = {null}
          className = 'statusModal'
        >
          {this.state.messageContent}
        </Modal>
        <div className=" p-b-10 p-t-10">
          <table id="demo-custom-toolbar"  data-toggle="table"
                 data-toolbar="#demo-delete-row"
                 data-search="true"
                 data-show-refresh="true"
                 data-show-toggle="true"
                 data-show-columns="true"
                 data-sort-name="id"
                 data-page-list="[5, 10, 20]"
                 data-page-size="5"
                 data-pagination="true" data-show-pagination-switch="true" className="table table-bordered table-hover">
            <thead>
            <tr>
              <th data-field="name" data-sortable="true">Name</th>
              <th data-field="date" data-sortable="true" data-formatter="dateFormatter">Date</th>
              <th data-field="parameter" data-align="center" data-sortable="true" data-sorter="">Parameter</th>
              <th data-field="execCount" data-align="center" data-sortable="true" data-sorter="">Exec Count</th>
              <th data-field="lastTs" data-align="center" data-sortable="true" data-sorter="">Last Activity Time</th>
              <th data-field="lastMsg" data-align="center" data-sortable="true" data-sorter="">Last Activity Message</th>
              <th data-field="operation" data-align="center" data-sortable="true" data-sorter="">Operation</th>
            </tr>
            </thead>
            <tbody>
            { agentStatusTable }
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

AgentStatus.propTypes = {

}

AgentStatus.defaultProps = {

}

export default AgentStatus

