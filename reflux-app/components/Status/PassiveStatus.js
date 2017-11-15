import React from 'react'
import { FormattedMessage } from 'react-intl';


let message = require('antd/lib/message')
let TimePicker = require('antd/lib/time-picker')
let Switch = require('antd/lib/switch')
let Tag = require('antd/lib/tag')
let Modal = require('antd/lib/modal')
let Icon = require('antd/lib/icon')
import AppActions from '../../actions/AppActions'
import AppStore from '../../stores/AppStore'
import constants from '../../const'
import _ from 'lodash'

class PassiveStatus extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      passiveStatusList: [],
      passiveStatusListAll:[],
      messageModal:false,
      messageContent:'',
      passiveStatus:[]
    }
  }

  componentDidMount() {
    this.unsubscribe = AppStore.listen(function(state) {
      this.setState(state)
    }.bind(this))

    AppActions.getPassiveStatusList()

    // start to get passive collector list in loop
    this.loop = setInterval(function() {
      AppActions.getPassiveStatusList()
    }, constants.STATUS_REFRESH_INTERVAL)
  }

  componentWillUnmount() {
    // stop list loop
    clearInterval(this.loop)

    if (_.isFunction(this.unsubscribe))
      this.unsubscribe();
  }

  setPassiveSwitch(switcher) {
    let id = this["data-id"]
    // console.log('setPassiveSwitch', {id: id, switch: switcher, category: 'passive'})
    AppActions.setCollectorSwitch({id: id, switch: switcher, category: 'passive'})
  }

  showAllStatus(index, e){
    let id = e.target.getAttribute("data-id")
    this.setState({
      messageModal:true,
      messageContent:this.state.passiveStatusListAll[index].status.lastActivity.data
    })

  }

  showPartStatus(index, e){
    this.setState({
      messageModal:false
    })
  }

  render() {
    // render status list
    let createPassiveStatus = (line, index) => {
      // line = { _id, name, ts, type, trigger, cmd, param, host, status }
      // status = { runningFlag, lastActivity }
      // lastActivity = { ts, success[, stdout, stderr] }
      let passiveStatus

      // console.log('PassiveStatus::render', line.status)

      let date = new Date(line.ts)
      date = date.toLocaleString()
      let idx = _.indexOf(this.state.passiveStatusChecklist, line._id)
      // console.log('createPassiveStatus', this.state.passiveStatusChecklist, line._id, idx)
      let triggerDate = new Date(parseInt(line.trigger))
      // create status columns
      let lastActivityTs
      let lastActivityMsg
      let execCount
      let operation
      if (line.status.runningFlag) {
        execCount = line.status.lastActivity.execCounter
        lastActivityTs = new Date(parseInt(line.status.lastActivity.ts)).toLocaleString()

        switch (line.status.lastActivity.status) {
          case 'Success':
            lastActivityMsg = <td> <Tag color="green"> stdout </Tag><Tag  onClick={this.showAllStatus.bind(this, index)} color="green"> + </Tag> { line.status.lastActivity.data.toString() } </td>
            break

          case 'Error':
            lastActivityMsg = <td> <Tag color="red"> stderr </Tag><Tag onClick={this.showAllStatus.bind(this, index)}  color="red"> + </Tag> { line.status.lastActivity.data.toString() } </td>
            break

          default:
            lastActivityMsg = <td> <Tag color="yellow"> Pending </Tag> </td>
            break
        }

        operation = <Switch data-id={line._id}
                            data-switch={false}
                            defaultChecked={true}
                            onChange={this.setPassiveSwitch}
                            size="small" />
      }
      else {
        execCount = 0
        lastActivityTs = 'N/A'
        lastActivityMsg = <td> <Tag color="yellow"> N/A </Tag> </td>

        operation = <Switch data-id={line._id}
                            data-switch={true}
                            defaultChecked={false}
                            onChange={this.setPassiveSwitch}
                            size="small" />
      }

      if (idx == -1)
        passiveStatus = <tr key={ index }>
          <td>{ line.name }</td>
          <td>{ date }</td>
          <td>{ line.type }</td>
          <td>{ (line.cmd == '') ? 'N/A' : line.cmd }</td>
          <td>{ line.param }</td>
          <td>{ line.host }</td>
          <td>{ execCount }</td>
          <td>{ lastActivityTs }</td>
          { lastActivityMsg }
          <td>{ operation }</td>
        </tr>
      else
        passiveStatus = <tr key={ index }>
          <td>{ line.name }</td>
          <td>{ date }</td>
          <td>{ line.type }</td>
          <td>{ (line.cmd == '') ? 'N/A' : line.cmd }</td>
          <td>{ line.param }</td>
          <td>{ line.host }</td>
          <td>{ execCount }</td>
          <td>{ lastActivityTs }</td>
          { lastActivityMsg }
          <td>{ operation }</td>
        </tr>

      return passiveStatus
    }

    let passiveStatusTable = this.state.passiveStatusList.map(createPassiveStatus.bind(this))

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
              <th data-field="name" data-sortable="true"><FormattedMessage id="name"/></th>
              <th data-field="date" data-sortable="true" data-formatter="dateFormatter"><FormattedMessage id="date"/></th>
              <th data-field="amount" data-align="center" data-sortable="true" data-sorter=""><FormattedMessage id="types"/></th>
              <th data-field="cmd" data-align="center" data-sortable="true" data-sorter=""><FormattedMessage id="command"/></th>
              <th data-field="parameter" data-align="center" data-sortable="true" data-sorter=""><FormattedMessage id="para"/></th>
              <th data-field="host" data-align="center" data-sortable="true" data-sorter=""><FormattedMessage id="host"/></th>
              <th data-field="execCount" data-align="center" data-sortable="true" data-sorter=""><FormattedMessage id="execCount"/></th>
              <th data-field="lastTs" data-align="center" data-sortable="true" data-sorter=""><FormattedMessage id="lastActivityTime"/></th>
              <th data-field="lastMsg" data-align="center" data-sortable="true" data-sorter=""><FormattedMessage id="lastActivityMessage"/></th>
              <th data-field="operation" data-align="center" data-sortable="true" data-sorter=""><FormattedMessage id="operation"/></th>
            </tr>
            </thead>
            <tbody>
            { passiveStatusTable }
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

PassiveStatus.propTypes = {

}

PassiveStatus.defaultProps = {

}

export default PassiveStatus
