import React from 'react'
let message = require('antd/lib/message')
let Checkbox = require('antd/lib/checkbox')
let Modal = require('antd/lib/modal')
let Tooltip = require('antd/lib/tooltip')
import AppActions from '../../actions/AppActions'
import AppStore from '../../stores/AppStore'
import _ from 'lodash'

const confirm = Modal.confirm

class PassiveCollector extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      passiveCollectorFlag: false,
      passiveCollector: {},
      passiveCollectorList: [],
      passiveCollectorChecklist: []
    }
  }

  componentDidMount() {
    this.unsubscribe = AppStore.listen(function(state) {
      this.setState(state)
    }.bind(this))

    // get passive collector list
    AppActions.getPassiveCollectorList()
  }

  componentWillUnmount() {
    if (_.isFunction(this.unsubscribe))
      this.unsubscribe();
  }

  showDeleteConfirm() {
    let that = this
    confirm({
      title: 'Comfirm Delete',
      content: 'Are you sure to delete ' + that.state.passiveCollectorChecklist.length + ' passive collector(s)?',
      onOk() {
        AppActions.deletePassiveCollector()
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
      content: 'Are you sure to update ' + that.state.passiveCollector.name + ' passive collector?',
      onOk() {
        // console.log('saveActiveCollector', this.state.activeCollectorTime)
        // there might be some fields not set during update
        // we'd better read parameters from refs now
        that.state.passiveCollector = {
          name: that.refs.nameInput.value.trim(),
          type: that.refs.typeInput.value.trim(),
          param: that.refs.paramInput.value.trim(),
          host: that.refs.hostInput.value.trim()
        }

        // ok, save
        AppActions.updatePassiveCollector(that.state.passiveCollector)
      },
      onCancel() {
        // do nothing
      }
    })
  }

  savePassiveCollector(e) {
    e.preventDefault()
    AppActions.setPassiveCollectorFlag(true)

    // check name
    let checkResults = this.state.passiveCollectorList.map(collector => {
      if (collector.name == this.state.passiveCollector.name)
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

    this.state.passiveCollector = {
      name: this.refs.nameInput.value.trim(),
      type: this.refs.typeInput.value.trim(),
      param: this.refs.paramInput.value.trim(),
      host: this.refs.hostInput.value.trim()
    }

    AppActions.savePassiveCollector(this.state.passiveCollector)
  }

  clearPassiveCollector() {
    AppActions.setPassiveCollector({})
  }

  updatePassiveCollector(e) {
    // console.log(e.target.dataset.field, e.target.type, e.target.value)
    e.preventDefault()
    AppActions.setPassiveCollector(_.set(this.state.passiveCollector, e.target.dataset.field, e.target.value))
  }

  updatePassiveCollectorChecklist() {
    let id = this["data-id"]
    let idx = _.indexOf(this.that.state.passiveCollectorChecklist, id)
    console.log('updateActiveCollectorChecklist', id, idx)

    let checklist = this.that.state.passiveCollectorChecklist
    if (idx == -1)
      checklist.push(id)
    else
      _.remove(checklist, (value, checklistIndex) => {
        if (idx == checklistIndex)
          return true
      })
    // console.log('updateActiveCollectorChecklist', checklist)
    AppActions.setPassiveCollectorChecklist(checklist)
  }

  deletePassiveCollector() {
    AppActions.deletePassiveCollector()
  }

  editPassiveCollector() {
    AppActions.editPassiveCollector()
  }

  render() {
    let nameInput
    let typeInput
    let paramInput
    let hostInput

    nameInput = <div className="col-md-6">
      <Tooltip title="Output Redis channel defaults to pc_[COLLECTOR_NAME]">
        <div className="form-group">
          <label>Name</label>
          <input type="text" placeholder="Name" className="form-control"
            data-field="name"
            ref="nameInput"
            value={this.state.passiveCollector.name}
            onChange={this.updatePassiveCollector.bind(this)} />
        </div>
      </Tooltip>
    </div>

    typeInput = <div className="col-md-6">
      <div className="form-group">
        <label>Type</label>
        <select className="form-control"
          data-field="type"
          ref="typeInput"
          value={this.state.passiveCollector.type}
          onChange={this.updatePassiveCollector.bind(this)}>
          <option>FileTail</option>
          { /* <option>NetCap</option> */ }
        </select>
      </div>
    </div>

    paramInput = <div className="col-md-6">
      <Tooltip title="For FILE_TAIL - Absolute file path, for NET_CAP - Listening port">
        <div className="form-group">
          <label>Parameter</label>
          <input type="text" placeholder="Parameter" className="form-control"
            data-field="param"
            ref="paramInput"
            value={this.state.passiveCollector.param}
            onChange={this.updatePassiveCollector.bind(this)} />
        </div>
      </Tooltip>
    </div>

    hostInput = <div className="col-md-6">
      <div className="form-group">
        <label>Host</label>
        <input type="text" placeholder="Host" className="form-control"
          data-field="host"
          ref="hostInput"
          value={this.state.passiveCollector.host}
          onChange={this.updatePassiveCollector.bind(this)} />
      </div>
    </div>

    let createPassiveCollector = (line, index) => {
      let date = new Date(line.ts)
      date = date.toLocaleString()
      let idx = _.indexOf(this.state.passiveCollectorChecklist, line._id)
      // console.log('createPassiveCollector', this.state.passiveCollectorChecklist, line._id, idx)
      let passiveCollector

      if (idx == -1)
        passiveCollector = <tr key={ index }>
          <td><Checkbox defaultChecked={ false }
            onChange={this.updatePassiveCollectorChecklist}
            data-id={ line._id }
            that={ this }
            />
          </td>
          <td>{ line.name }</td>
          <td>{ date }</td>
          <td>{ line.type }</td>
          <td>{ line.param }</td>
          <td>{ line.host }</td>
        </tr>
      else
        passiveCollector = <tr key={ index }>
          <td><Checkbox defaultChecked={ true }
            onChange={this.updatePassiveCollectorChecklist}
            data-id={ line._id }
            that={ this }
            />
          </td>
          <td>{ line.name }</td>
          <td>{ date }</td>
          <td>{ line.type }</td>
          <td>{ line.param }</td>
          <td>{ line.host }</td>
        </tr>

      return passiveCollector
    }

    let passiveCollectorTable = this.state.passiveCollectorList.map(createPassiveCollector.bind(this))

    return (
      <div>
        <div className="row">
          { nameInput }
          { typeInput }
          { paramInput }
          { hostInput }
          <div className="col-md-24">
            <div className="form-group text-right m-b-0">
              <button className="btn btn-primary waves-effect waves-light" type="submit"
                onClick={this.savePassiveCollector.bind(this)}> Save </button>
              <button type="reset" className="btn btn-default waves-effect waves-light m-l-5"
                onClick={this.clearPassiveCollector.bind(this)}> clear </button>
            </div>
          </div>
        </div>
        <div className=" p-b-10 p-t-60">
          <button id="deleteToTable-1"
            onClick={this.editPassiveCollector.bind(this)}
            className="btn btn-primary waves-effect waves-light pull-left m-t-10 m-r-10" >
            <i className="fa fa-cogs m-r-5"></i>
            Edit
          </button>
          <button id="deleteToTable-1"
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
                <th data-field="parameter" data-align="center" data-sortable="true" data-sorter="">Parameter</th>
                <th data-field="host" data-align="center" data-sortable="true" data-sorter="">Host</th>
              </tr>
            </thead>
            <tbody>
              { passiveCollectorTable }
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

PassiveCollector.propTypes = {

}

PassiveCollector.defaultProps = {

}

export default PassiveCollector
