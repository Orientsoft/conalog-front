import React from 'react'
import AppActions from '../../actions/AppActions'
import AppStore from '../../stores/AppStore'
import _ from 'lodash'

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

  savePassiveCollector() {
    AppActions.setPassiveCollectorFlag(true)
    AppActions.savePassiveCollector(this.state.passiveCollector)
  }

  clearPassiveCollector() {
    AppActions.setPassiveCollector({})
  }

  updatePassiveCollector(e) {
    console.log(e.target.dataset.field, e.target.type, e.target.value)
    AppActions.setPassiveCollector(_.set(this.state.passiveCollector, e.target.dataset.field, e.target.value))
    e.preventDefault()
  }

  updatePassiveCollectorChecklist(e) {
    let id = e.target.dataset.id
    let idx = _.indexOf(this.state.passiveCollectorChecklist, id)
    let checklist = this.state.passiveCollectorChecklist
    if (idx == -1)
      checklist.push(id)
    else
      _.remove(checklist, (value, checklistIndex) => {
        if (idx == checklistIndex)
          return true
      })
    console.log('updatePassiveCollectorChecklist', checklist)
    AppActions.setPassiveCollectorChecklist(checklist)
  }

  deletePassiveCollector(e) {
    AppActions.deletePassiveCollector()
    e.preventDefault()
  }

  clonePassiveCollector() {
    AppActions.clonePassiveCollector()
    e.preventDefault()
  }

  render() {
    let nameInput
    let typeInput
    let paramInput
    let hostInput

    if (this.state.passiveCollectorFlag) {
      // name
      if (this.state.passiveCollector.name === undefined ||
        this.state.passiveCollector.name == null ||
        this.state.passiveCollector.name == '')
        nameInput = <div className="col-md-3">
          <div className="form-group has-error">
            <label>Name</label>
            <input type="text" placeholder="Name" className="form-control"
              data-field="name"
              onChange={this.updatePassiveCollector.bind(this)} />
          </div>
        </div>
      else
        nameInput = <div className="col-md-3">
          <div className="form-group">
            <label>Name</label>
            <input type="text" placeholder="Name" className="form-control"
              data-field="name"
              onChange={this.updatePassiveCollector.bind(this)} />
          </div>
        </div>

      // type
      if (this.state.passiveCollector.type === undefined ||
        this.state.passiveCollector.type == null ||
        this.state.passiveCollector.type == '')
        typeInput = <div className="col-md-3">
          <div className="form-group has-error">
            <label>Type</label>
            <select className="form-control"
              data-field="type"
              onChange={this.updatePassiveCollector.bind(this)}>
              <option>FileTail</option>
              <option>NetCap</option>
            </select>
          </div>
        </div>
      else
        typeInput = <div className="col-md-3">
          <div className="form-group">
            <label>Type</label>
            <select className="form-control"
              data-field="type"
              onChange={this.updatePassiveCollector.bind(this)}>
              <option>FileTail</option>
              <option>NetCap</option>
            </select>
          </div>
        </div>

        // param
        if (this.state.passiveCollector.param === undefined ||
          this.state.passiveCollector.param == null ||
          this.state.passiveCollector.param == '')
          paramInput = <div className="col-md-3">
            <div className="form-group">
              <label>Parameter</label>
              <input type="text" placeholder="Parameter" className="form-control"
                data-field="param"
                onChange={this.updatePassiveCollector.bind(this)} />
            </div>
          </div>
        else
          paramInput = <div className="col-md-3">
            <div className="form-group">
              <label>Parameter</label>
              <input type="text" placeholder="Parameter" className="form-control"
                data-field="param"
                onChange={this.updatePassiveCollector.bind(this)} />
            </div>
          </div>

        // host
        if (this.state.passiveCollector.host === undefined ||
          this.state.passiveCollector.host == null ||
          this.state.passiveCollector.host == '')
          hostInput = <div className="col-md-3">
            <div className="form-group">
              <label>Host</label>
              <input type="text" placeholder="Host" className="form-control"
                data-field="host"
                onChange={this.updatePassiveCollector.bind(this)} />
            </div>
          </div>
        else
          hostInput = <div className="col-md-3">
            <div className="form-group">
              <label>Host</label>
              <input type="text" placeholder="Host" className="form-control"
                data-field="host"
                onChange={this.updatePassiveCollector.bind(this)} />
            </div>
          </div>
    }
    else {
      // name
      nameInput = <div className="col-md-3">
        <div className="form-group">
          <label>Name</label>
          <input type="text" placeholder="Name" className="form-control"
            data-field="name"
            onChange={this.updatePassiveCollector.bind(this)} />
        </div>
      </div>

      // type
      typeInput = <div className="col-md-3">
        <div className="form-group">
          <label>Type</label>
          <select className="form-control"
            data-field="type"
            onChange={this.updatePassiveCollector.bind(this)}>
            <option>FileTail</option>
            <option>NetCap</option>
          </select>
        </div>
      </div>

      // param
      paramInput = <div className="col-md-3">
        <div className="form-group">
          <label>Parameter</label>
          <input type="text" placeholder="Parameter" className="form-control"
            data-field="param"
            onChange={this.updatePassiveCollector.bind(this)} />
        </div>
      </div>

      // host
      hostInput = <div className="col-md-3">
        <div className="form-group">
          <label>Host</label>
          <input type="text" placeholder="Host" className="form-control"
            data-field="host"
            onChange={this.updatePassiveCollector.bind(this)} />
        </div>
      </div>
    }

    let createPassiveCollector = (line, index) => {
      let date = new Date(line.ts)
      date = date.toLocaleString()
      let idx = _.indexOf(this.state.passiveCollectorChecklist, line._id)
      console.log('createPassiveCollector', this.state.passiveCollectorChecklist, line._id, idx)
      let passiveCollector

      if (idx == -1)
        passiveCollector = <tr key={ index }>
          <td><input type="checkbox"
            data-id={ line._id }
            onClick={ this.updatePassiveCollectorChecklist.bind(this) }
            />
          </td>
          <td>{ line._id }</td>
          <td>{ line.name }</td>
          <td>{ date }</td>
          <td>{ line.type }</td>
          <td>{ line.param }</td>
          <td>{ line.host }</td>
        </tr>
      else
        passiveCollector = <tr key={ index }>
          <td><input type="checkbox"
            data-id={ line._id }
            onClick={ this.updatePassiveCollectorChecklist.bind(this) }
            defaultChecked="true" />
          </td>
          <td>{ line._id }</td>
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
          <div className="col-md-12">
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
            onClick={this.deletePassiveCollector.bind(this)}
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
