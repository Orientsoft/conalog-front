import React from 'react'
import AppActions from '../../actions/AppActions'
import AppStore from '../../stores/AppStore'
import _ from 'lodash'

class ActiveCollector extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeCollectorFlag: false,
      activeCollector: {},
      activeCollectorList: [],
      activeCollectorChecklist: []
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

  saveActiveCollector() {
    AppActions.setActiveCollectorFlag(true)
    AppActions.saveActiveCollector(this.state.activeCollector)
  }

  clearActiveCollector() {
    AppActions.setActiveCollector({})
  }

  updateActiveCollector(e) {
    console.log(e.target.dataset.field, e.target.type, e.target.value)
    AppActions.setActiveCollector(_.set(this.state.activeCollector, e.target.dataset.field, e.target.value))
    e.preventDefault()
  }

  updateActiveCollectorChecklist(e) {
    let id = e.target.dataset.id
    let idx = _.indexOf(this.state.activeCollectorChecklist, id)
    let checklist = this.state.activeCollectorChecklist
    if (idx == -1)
      checklist.push(id)
    else
      _.remove(checklist, (value, checklistIndex) => {
        if (idx == checklistIndex)
          return true
      })
    console.log('updateActiveCollectorChecklist', checklist)
    AppActions.setActiveCollectorChecklist(checklist)
  }

  deleteActiveCollector(e) {
    AppActions.deleteActiveCollector()
    e.preventDefault()
  }

  cloneActiveCollector() {
    AppActions.cloneActiveCollector()
    e.preventDefault()
  }

  render() {
    let nameInput
    let typeInput
    let triggerInput
    let cmdInput
    let paramInput
    let hostInput

    if (this.state.activeCollectorFlag) {
      // name
      if (this.state.activeCollector.name === undefined ||
        this.state.activeCollector.name == null ||
        this.state.activeCollector.name == '')
        nameInput = <div className="col-md-2">
          <div className="form-group has-error">
            <label>Name</label>
            <input type="text" placeholder="Name" className="form-control"
              data-field="name"
              onChange={this.updateActiveCollector.bind(this)} />
          </div>
        </div>
      else
        nameInput = <div className="col-md-2">
          <div className="form-group">
            <label>Name</label>
            <input type="text" placeholder="Name" className="form-control"
              data-field="name"
              onChange={this.updateActiveCollector.bind(this)} />
          </div>
        </div>

      // type
      if (this.state.activeCollector.type === undefined ||
        this.state.activeCollector.type == null ||
        this.state.activeCollector.type == '')
        typeInput = <div className="col-md-2">
          <div className="form-group has-error">
            <label>Type</label>
            <select className="form-control"
              data-field="type"
              onChange={this.updateActiveCollector.bind(this)}>
              <option>Interval</option>
              <option>Time</option>
            </select>
          </div>
        </div>
      else
        typeInput = <div className="col-md-2">
          <div className="form-group">
            <label>Type</label>
            <select className="form-control"
              data-field="type"
              onChange={this.updateActiveCollector.bind(this)}>
              <option>Interval</option>
              <option>Time</option>
            </select>
          </div>
        </div>

      // trigger
      if (this.state.activeCollector.trigger === undefined ||
        this.state.activeCollector.trigger == null ||
        this.state.activeCollector.trigger == '')
        triggerInput = <div className="col-md-2">
          <div className="form-group has-error">
            <label>Trigger</label>
            <input type="input" placeholder="Trigger" className="form-control"
              data-field="trigger"
              onChange={this.updateActiveCollector.bind(this)} />
          </div>
        </div>
      else
        triggerInput = <div className="col-md-2">
          <div className="form-group">
            <label>Trigger</label>
            <input type="input" placeholder="Trigger" className="form-control"
              data-field="trigger"
              onChange={this.updateActiveCollector.bind(this)} />
          </div>
        </div>

        // cmd
        if (this.state.activeCollector.cmd === undefined ||
          this.state.activeCollector.cmd == null ||
          this.state.activeCollector.cmd == '')
          cmdInput = <div className="col-md-2">
            <div className="form-group has-error">
              <label>Command</label>
              <input type="text" placeholder="Command" className="form-control"
                data-field="cmd"
                onChange={this.updateActiveCollector.bind(this)} />
            </div>
          </div>
        else
          cmdInput = <div className="col-md-2">
            <div className="form-group">
              <label>Command</label>
              <input type="text" placeholder="Command" className="form-control"
                data-field="cmd"
                onChange={this.updateActiveCollector.bind(this)} />
            </div>
          </div>

        // param
        if (this.state.activeCollector.param === undefined ||
          this.state.activeCollector.param == null ||
          this.state.activeCollector.param == '')
          paramInput = <div className="col-md-2">
            <div className="form-group">
              <label>Parameter</label>
              <input type="text" placeholder="Parameter" className="form-control"
                data-field="param"
                onChange={this.updateActiveCollector.bind(this)} />
            </div>
          </div>
        else
          paramInput = <div className="col-md-2">
            <div className="form-group">
              <label>Parameter</label>
              <input type="text" placeholder="Parameter" className="form-control"
                data-field="param"
                onChange={this.updateActiveCollector.bind(this)} />
            </div>
          </div>

        // host
        if (this.state.activeCollector.host === undefined ||
          this.state.activeCollector.host == null ||
          this.state.activeCollector.host == '')
          hostInput = <div className="col-md-2">
            <div className="form-group">
              <label>Host</label>
              <input type="text" placeholder="Host" className="form-control"
                data-field="host"
                onChange={this.updateActiveCollector.bind(this)} />
            </div>
          </div>
        else
          hostInput = <div className="col-md-2">
            <div className="form-group">
              <label>Host</label>
              <input type="text" placeholder="Host" className="form-control"
                data-field="host"
                onChange={this.updateActiveCollector.bind(this)} />
            </div>
          </div>
    }
    else {
      // name
      nameInput = <div className="col-md-2">
        <div className="form-group">
          <label>Name</label>
          <input type="text" placeholder="Name" className="form-control"
            data-field="name"
            onChange={this.updateActiveCollector.bind(this)} />
        </div>
      </div>

      // type
      typeInput = <div className="col-md-2">
        <div className="form-group">
          <label>Type</label>
          <select className="form-control"
            data-field="type"
            onChange={this.updateActiveCollector.bind(this)}>
            <option>Interval</option>
            <option>Time</option>
          </select>
        </div>
      </div>

      // trigger
      triggerInput = <div className="col-md-2">
        <div className="form-group">
          <label>Trigger</label>
          <input type="input" placeholder="Trigger" className="form-control"
            data-field="trigger"
            onChange={this.updateActiveCollector.bind(this)} />
        </div>
      </div>

      // cmd
      cmdInput = <div className="col-md-2">
        <div className="form-group">
          <label>Command</label>
          <input type="text" placeholder="Command" className="form-control"
            data-field="cmd"
            onChange={this.updateActiveCollector.bind(this)} />
        </div>
      </div>

      // param
      paramInput = <div className="col-md-2">
        <div className="form-group">
          <label>Parameter</label>
          <input type="text" placeholder="Parameter" className="form-control"
            data-field="param"
            onChange={this.updateActiveCollector.bind(this)} />
        </div>
      </div>

      // host
      hostInput = <div className="col-md-2">
        <div className="form-group">
          <label>Host</label>
          <input type="text" placeholder="Host" className="form-control"
            data-field="host"
            onChange={this.updateActiveCollector.bind(this)} />
        </div>
      </div>
    }

    let createActiveCollector = (line, index) => {
      let date = new Date(line.ts)
      date = date.toLocaleString()
      let idx = _.indexOf(this.state.activeCollectorChecklist, line._id)
      console.log('createActiveCollector', this.state.activeCollectorChecklist, line._id, idx)
      let activeCollector

      if (idx == -1)
        activeCollector = <tr key={ index }>
          <td><input type="checkbox"
            data-id={ line._id }
            onClick={ this.updateActiveCollectorChecklist.bind(this) }
            />
          </td>
          <td>{ line._id }</td>
          <td>{ line.name }</td>
          <td>{ date }</td>
          <td>{ line.type }</td>
          <td>{ line.trigger }</td>
          <td>{ line.cmd }</td>
          <td>{ line.param }</td>
          <td>{ line.host }</td>
        </tr>
      else
        activeCollector = <tr key={ index }>
          <td><input type="checkbox"
            data-id={ line._id }
            onClick={ this.updateActiveCollectorChecklist.bind(this) }
            defaultChecked="true" />
          </td>
          <td>{ line._id }</td>
          <td>{ line.name }</td>
          <td>{ date }</td>
          <td>{ line.type }</td>
          <td>{ line.trigger }</td>
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
          <div className="col-md-12">
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
            onClick={this.deleteActiveCollector.bind(this)}
            className="btn btn-danger waves-effect waves-light pull-left m-t-10 m-r-10" >
            <i className="fa fa-minus m-r-5"></i>
            Delete
          </button>
          <button id="addToTable" className="btn btn-default waves-effect waves-light pull-left m-t-10 m-r-10" ><i className="fa fa-plus m-r-5"></i>Clone</button>
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
                <th data-field="id" data-sortable="true" data-formatter="invoiceFormatter">ID</th>
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
