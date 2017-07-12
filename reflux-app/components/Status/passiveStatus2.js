import React from 'react'
let message = require('antd/lib/message')
let TimePicker = require('antd/lib/time-picker')
let Switch = require('antd/lib/switch')
let Tag = require('antd/lib/tag')
import AppActions from '../../actions/AppActions'
import AppStore from '../../stores/AppStore'
import constants from '../../const'
import _ from 'lodash'

class PassiveStatus extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      passiveStatusList: [],
      passiveStatusTable: [],
      statusTextAll: [],
      statusText: []
    }
  }

  componentDidMount() {
    this.unsubscribe = AppStore.listen(function (state) {
      this.setState(state)
    }.bind(this))

    AppActions.getPassiveStatusList.triggerAsync().then(() => {
      this.setState({
        passiveStatusTable: this.state.passiveStatusList.map(this.createPassiveStatus.bind(this))
      }, () => {
        console.log('this.state.passiveStatusTable:', this.state.passiveStatusTable)
      })
    })

    // start to get passive collector list in loop
    this.loop = setInterval(function () {
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

  showAllStatus(shouldShow, index) {
    console.log('shouldShow:', shouldShow)
    if (shouldShow) {
      this.state.statusText[index] = this.state.statusTextAll[index]
    } else {
      this.state.statusText[index] = this.state.statusTextAll[index].substr(0, 64) + '...'
    }
    this.setState({
      statusText: this.state.statusText
    }, () => {
      console.log(this.state.statusText)
    })
  }

  // render status list
  createPassiveStatus(line, index) {
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
      console.log('id:',line._id)
      execCount = line.status.lastActivity.execCounter
      lastActivityTs = new Date(parseInt(line.status.lastActivity.ts)).toLocaleString()

      switch (line.status.lastActivity.status) {
        case 'Success':
          this.state.statusTextAll[index] = line.status.lastActivity.data.toString()
          this.showAllStatus(false, index)
          lastActivityMsg = text => (<td onMouseEnter={this.showAllStatus.bind(this, true, index)} onMouseLeave={this.showAllStatus.bind(this, false, index)}>
            <Tag color="green"> stdout </Tag> { text } </td>)
          break

        case 'Error':
          lastActivityMsg = text => (<td><Tag color="red"> stderr </Tag> { text } </td>)
          break

        default:
          lastActivityMsg = () => (<td><Tag color="yellow"> Pending </Tag></td>)
          break
      }

      operation = <Switch data-id={line._id}
                          data-switch={false}
                          defaultChecked={true}
                          onChange={this.setPassiveSwitch}
                          size="small"/>
    }
    else {
      execCount = 0
      lastActivityTs = 'N/A'
      lastActivityMsg = () => (<td><Tag color="yellow"> N/A </Tag></td>)

      operation = <Switch data-id={line._id}
                          data-switch={true}
                          defaultChecked={false}
                          onChange={this.setPassiveSwitch}
                          size="small"/>
    }

    if (idx == -1)
      passiveStatus = (text) => (<tr key={ index }>
        <td>{ line.name }</td>
        <td>{ date }</td>
        <td>{ line.type }</td>
        <td>{ (line.cmd == '') ? 'N/A' : line.cmd }</td>
        <td>{ line.param }</td>
        <td>{ line.host }</td>
        <td>{ execCount }</td>
        <td>{ lastActivityTs }</td>
        { lastActivityMsg(text) }
        <td>{ operation }</td>
      </tr>)
    else
      passiveStatus = (text) => (<tr key={ index }>
        <td>{ line.name }</td>
        <td>{ date }</td>
        <td>{ line.type }</td>
        <td>{ (line.cmd == '') ? 'N/A' : line.cmd }</td>
        <td>{ line.param }</td>
        <td>{ line.host }</td>
        <td>{ execCount }</td>
        <td>{ lastActivityTs }</td>
        { lastActivityMsg(text) }
        <td>{ operation }</td>
      </tr>)

    return passiveStatus
  }

  render() {
    return (
      <div>
        <div className=" p-b-10 p-t-10">
          <table id="demo-custom-toolbar" data-toggle="table"
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
              <th data-field="amount" data-align="center" data-sortable="true" data-sorter="">Type</th>
              <th data-field="cmd" data-align="center" data-sortable="true" data-sorter="">Command</th>
              <th data-field="parameter" data-align="center" data-sortable="true" data-sorter="">Parameter</th>
              <th data-field="host" data-align="center" data-sortable="true" data-sorter="">Host</th>
              <th data-field="execCount" data-align="center" data-sortable="true" data-sorter="">Msg Count</th>
              <th data-field="lastTs" data-align="center" data-sortable="true" data-sorter="">Last Activity Time</th>
              <th data-field="lastMsg" data-align="center" data-sortable="true" data-sorter="">Last Activity Message
              </th>
              <th data-field="operation" data-align="center" data-sortable="true" data-sorter="">Operation</th>
            </tr>
            </thead>
            <tbody>
            { this.state.passiveStatusTable.map((f, i) => f(this.state.statusText[i])) }
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

PassiveStatus.propTypes = {}

PassiveStatus.defaultProps = {}

export default PassiveStatus

