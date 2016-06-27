import React from 'react'
let message = require('antd/lib/message')
let TimePicker = require('antd/lib/time-picker')
let Checkbox = require('antd/lib/checkbox')
let Modal = require('antd/lib/modal')
let Tooltip = require('antd/lib/tooltip')
import AppActions from '../../actions/AppActions'
import AppStore from '../../stores/AppStore'
import _ from 'lodash'

const confirm = Modal.confirm

class ActiveCollector extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeCollectorFlag: false,
      activeCollector: {},
      activeCollectorList: [],
      activeCollectorChecklist: [],
      activeCollectorDeleteModal: false,
      activeCollectorTime: null
    }
  }

  componentDidMount() {
    this.unsubscribe = AppStore.listen(function(state) {
      this.setState(state)
    }.bind(this))

    // get active collector list
    AppActions.getActiveCollectorList()
  }

  componentWillUnmount() {
    if (_.isFunction(this.unsubscribe))
      this.unsubscribe();
  }

  showDeleteConfirm() {
    let that = this
    confirm({
      title: 'Comfirm Delete',
      content: 'Are you sure to delete ' + that.state.activeCollectorChecklist.length + ' active collector(s)?',
      onOk() {
        AppActions.deleteActiveCollector()
      },
      onCancel() {
        // do nothing
      }
    })
  }

  showEditConfirm() {
    let that = this
    confirm({
      title: 'Comfirm Update',
      content: 'Are you sure to update ' + that.state.activeCollector.name + ' active collector?',
      onOk() {
        // check time
        if (that.state.activeCollectorTime == null) {
          message.error('Empty trigger, please select trigger.')
          return
        }

        // console.log('saveActiveCollector', this.state.activeCollectorTime)
        // there might be some fields not set during update
        // we'd better read parameters from refs now
        that.state.activeCollector = {
          name: that.refs.nameInput.value.trim(),
          type: that.refs.typeInput.value.trim(),
          trigger: that.state.activeCollectorTime.getTime(),
          cmd: that.refs.cmdInput.value.trim(),
          param: that.refs.paramInput.value.trim(),
          host: that.refs.hostInput.value.trim()
        }

        // ok, save
        AppActions.updateActiveCollector(that.state.activeCollector)
      },
      onCancel() {
        // do nothing
      }
    })
  }

  saveActiveCollector(e) {
    e.preventDefault()
    AppActions.setActiveCollectorFlag(true)

    // check name
    let checkResults = this.state.activeCollectorList.map(collector => {
      if (collector.name == this.state.activeCollector.name)
        return true
      else
        return false
    })
    let checkResult = checkResults.reduce((prev, curr, idx) => {
      if (curr == true || prev == true)
        return true
      else
        return false
    }, false)

    if (checkResult == true) {
      // check failed - there's already a collector that has this name
      // pop a dialog to comfirm update
      this.showEditConfirm()
      return
    }

    // check time
    if (this.state.activeCollectorTime == null) {
      message.error('Empty trigger, please select trigger.')
      return
    }

    // console.log('saveActiveCollector', this.state.activeCollectorTime)
    // there might be some fields not set during update
    // we'd better read parameters from refs now
    this.state.activeCollector = {
      name: this.refs.nameInput.value.trim(),
      type: this.refs.typeInput.value.trim(),
      trigger: this.state.activeCollectorTime.getTime(),
      cmd: this.refs.cmdInput.value.trim(),
      param: this.refs.paramInput.value.trim(),
      host: this.refs.hostInput.value.trim()
    }

    // ok, save
    AppActions.saveActiveCollector(this.state.activeCollector)
  }

  updateTime(time) {
    // console.log(time.getTime())
    AppActions.setActiveCollectorTime(time)
  }

  clearActiveCollector() {
    AppActions.setActiveCollector({})
    AppActions.setActiveCollectorTime(null)
  }

  updateActiveCollector(e) {
    // console.log(e.target.dataset.field, e.target.type, e.target.value)
    AppActions.setActiveCollector(_.set(this.state.activeCollector, e.target.dataset.field, e.target.value))
    e.preventDefault()
  }

  updateActiveCollectorChecklist() {
    let id = this["data-id"]
    let idx = _.indexOf(this.that.state.activeCollectorChecklist, id)
    let checklist = this.that.state.activeCollectorChecklist
    if (idx == -1)
      checklist.push(id)
    else
      _.remove(checklist, (value, checklistIndex) => {
        if (idx == checklistIndex)
          return true
      })
    // console.log('updateActiveCollectorChecklist', checklist)
    AppActions.setActiveCollectorChecklist(checklist)
  }

  deleteActiveCollector() {
    AppActions.deleteActiveCollector()
  }

  editActiveCollector() {
    AppActions.editActiveCollector()
  }

  render() {
    // console.log('ActiveCollector::activeCollector', this.state.activeCollector)
    let nameInput
    let typeInput
    let triggerInput
    let cmdInput
    let paramInput
    let hostInput

    // name
    nameInput = <div className="col-md-4">
      <Tooltip title="Output Redis channel defaults to ac_[COLLECTOR_NAME]">
        <div className="form-group">
          <label>Name</label>
          <input type="text" placeholder="Name" className="form-control"
            data-field="name"
            ref="nameInput"
            value={this.state.activeCollector.name}
            onChange={this.updateActiveCollector.bind(this)} />
        </div>
      </Tooltip>
    </div>

    // type
    typeInput = <div className="col-md-4">
      <div className="form-group">
        <label>Type</label>
        <select className="form-control"
          data-field="type"
          ref="typeInput"
          value={this.state.activeCollector.type}
          onChange={this.updateActiveCollector.bind(this)}>
          <option>Interval</option>
          <option>Time</option>
        </select>
      </div>
    </div>

    triggerInput = <div className="col-md-4">
      <div className="form-group">
        <label>Trigger</label><br />
        <TimePicker
          value={this.state.activeCollectorTime}
          onChange={this.updateTime.bind(this)}
          format="HH:mm:ss"
          ref="triggerInput"
          size="large" />
      </div>
    </div>


    // cmd
    cmdInput = <div className="col-md-4">
      <div className="form-group">
        <label>Command</label>
        <input type="text" placeholder="Command" className="form-control"
          data-field="cmd"
          ref="cmdInput"
          value={this.state.activeCollector.cmd}
          onChange={this.updateActiveCollector.bind(this)} />
      </div>
    </div>

    // param
    paramInput = <div className="col-md-4">
      <div className="form-group">
        <label>Parameter</label>
        <input type="text" placeholder="Parameter" className="form-control"
          data-field="param"
          ref="paramInput"
          value={this.state.activeCollector.param}
          onChange={this.updateActiveCollector.bind(this)} />
      </div>
    </div>

    // host
    hostInput = <div className="col-md-4">
      <div className="form-group">
        <label>Host</label>
        <input type="text" placeholder="Host" className="form-control"
          data-field="host"
          ref="hostInput"
          value={this.state.activeCollector.host}
          onChange={this.updateActiveCollector.bind(this)} />
      </div>
    </div>

    let createActiveCollector = (line, index) => {
      let date = new Date(line.ts)
      date = date.toLocaleString()
      let idx = _.indexOf(this.state.activeCollectorChecklist, line._id)
      // console.log('createActiveCollector', this.state.activeCollectorChecklist, line._id, idx)
      let activeCollector
      let triggerDate = new Date(parseInt(line.trigger))

      if (idx == -1)
        activeCollector = <tr key={ index }>
          <td><Checkbox defaultChecked={ false }
            onChange={ this.updateActiveCollectorChecklist }
            data-id={ line._id }
            that={ this }
            />
          </td>
          <td>{ line.name }</td>
          <td>{ date }</td>
          <td>{ line.type }</td>
          <td>
            <TimePicker
              defaultValue={ triggerDate }
              size="small"
              disabled
            />
          </td>
          <td>{ line.cmd }</td>
          <td>{ line.param }</td>
          <td>{ line.host }</td>
        </tr>
      else
        activeCollector = <tr key={ index }>
        <td><Checkbox defaultChecked={ true }
          onChange={ this.updateActiveCollectorChecklist }
          data-id={ line._id }
          that={ this }
          />
        </td>
          <td>{ line.name }</td>
          <td>{ date }</td>
          <td>{ line.type }</td>
          <td>
            <TimePicker
              defaultValue={ triggerDate }
              size="small"
              disabled
            />
          </td>
          <td>{ line.cmd }</td>
          <td>{ line.param }</td>
          <td>{ line.host }</td>
        </tr>

      return activeCollector
    }

    let activeCollectorTable = this.state.activeCollectorList.map(createActiveCollector.bind(this))

    return (
      <div>
        <div className="row">
          { nameInput }
          { typeInput }
          { triggerInput }
          { cmdInput }
          { paramInput }
          { hostInput }
          <div className="col-md-24">
            <div className="form-group text-right m-b-0">
              <button className="btn btn-primary waves-effect waves-light" type="submit"
                onClick={this.saveActiveCollector.bind(this)}> Save </button>
              <button type="reset" className="btn btn-default waves-effect waves-light m-l-5"
                onClick={this.clearActiveCollector.bind(this)}> clear </button>
            </div>
          </div>
        </div>
        <div className=" p-b-10 p-t-60">
          <button id="deleteToTable-1"
            onClick={this.editActiveCollector.bind(this)}
            className="btn btn-primary waves-effect waves-light pull-left m-t-10 m-r-10" >
            <i className="fa fa-cogs m-r-5"></i>
            Edit
          </button>
          <button id="deleteToTable-2"
            onClick={this.showDeleteConfirm.bind(this)}
            className="btn btn-danger waves-effect waves-light pull-left m-t-10 m-r-10" >
            <i className="fa fa-minus m-r-5"></i>
            Delete
          </button>
          <table id="demo-custom-toolbar"  data-toggle="table"
                     data-toolbar="#demo-delete-row"
                     data-search="true"
                     data-show-refresh="true"
                     data-show-toggle="true"
                     data-show-columns="true"
                     data-sort-name="id"
                     data-page-list="[5, 10, 20]"
                     data-page-size="5"
                     data-pagination="true" data-show-pagination-switch="true" className="table table-hover">
            <thead>
              <tr>
                <th data-field="state" data-checkbox="true"></th>
                <th data-field="name" data-sortable="true">Name</th>
                <th data-field="date" data-sortable="true" data-formatter="dateFormatter">Date</th>
                <th data-field="amount" data-align="center" data-sortable="true" data-sorter="">Type</th>
                <th data-field="status" data-align="center" data-sortable="true" data-formatter="">Trigger</th>
                <th data-field="command" data-align="center" data-sortable="true" data-sorter="">Command</th>
                <th data-field="parameter" data-align="center" data-sortable="true" data-sorter="">Parameter</th>
                <th data-field="host" data-align="center" data-sortable="true" data-sorter="">Host</th>
              </tr>
            </thead>
            <tbody>
              { activeCollectorTable }
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

ActiveCollector.propTypes = {

}

ActiveCollector.defaultProps = {

}

export default ActiveCollector
