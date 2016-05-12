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
      activeCollectorList: []
    }
  }

  componentDidMount() {
    this.unsubscribe = AppStore.listen(function(state) {
      this.setState(state)
    }.bind(this))

    // TO DO : get active collector list
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

  render() {
    let nameInput;
    let typeInput;
    let triggerInput;
    let cmdInput;
    let paramInput;

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
            <input type="time" placeholder="Trigger" className="form-control"
              data-field="trigger"
              onChange={this.updateActiveCollector.bind(this)} />
          </div>
        </div>
      else
        triggerInput = <div className="col-md-2">
          <div className="form-group">
            <label>Trigger</label>
            <input type="time" placeholder="Trigger" className="form-control"
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
          paramInput = <div className="col-md-3">
            <div className="form-group">
              <label>Parameter</label>
              <input type="text" placeholder="Parameter" className="form-control"
                data-field="param"
                onChange={this.updateActiveCollector.bind(this)} />
            </div>
          </div>
        else
          paramInput = <div className="col-md-3">
            <div className="form-group">
              <label>Parameter</label>
              <input type="text" placeholder="Parameter" className="form-control"
                data-field="param"
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
          <input type="time" placeholder="Trigger" className="form-control"
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
      paramInput = <div className="col-md-3">
        <div className="form-group">
          <label>Parameter</label>
          <input type="text" placeholder="Parameter" className="form-control"
            data-field="param"
            onChange={this.updateActiveCollector.bind(this)} />
        </div>
      </div>
    }

    return (
      <div>
        <div className="row">
          { nameInput }
          { typeInput }
          { triggerInput }
          { cmdInput}
          { paramInput }
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
          <button id="deleteToTable-1" className="btn btn-danger waves-effect waves-light pull-left m-t-10 m-r-10" disabled><i className="fa fa-plus m-r-5"></i>Delete</button>
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
                <th data-field="Command" data-align="center" data-sortable="true" data-sorter="">Command</th>
                <th data-field="Parameter" data-align="center" data-sortable="true" data-sorter="">Parameter</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td></td>
                <td>609</td>
                <td>Oracle</td>
                <td>2016-03-16 15:23:43 </td>
                <td>Int.</td>
                <td>00:04:00.</td>
                <td>sh/libs/getoracle.sh</td>
                <td >aabc</td>
              </tr>
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
