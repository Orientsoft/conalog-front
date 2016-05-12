import React from 'react'
import _ from 'lodash'

class PassiveCollector extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-md-2">
            <div className="form-group">
              <label>Name:</label>
              <input type="text" placeholder="Name" data-mask="Name" className="form-control" />
            </div>
          </div>
          <div className="col-md-2">
            <div className="form-group">
              <label>Host</label>
              <input type="text" placeholder="time" data-mask="Date" className="form-control" />
            </div>
          </div>
          <div className="col-md-2">
            <div className="form-group">
              <label>Type:</label>
              <select className="form-control">
                <option>Position</option>
                <option>Name</option>
                <option>Office</option>
                <option>Start date</option>
                <option>Salary</option>
              </select>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group has-success">
              <label>File</label>
              <input type="text" placeholder="Command" data-mask="999-99-999-9999-9" className="form-control" />
            </div>
          </div>
          <div className="col-md-2">
            <div className="form-group text-right m-t-30">
              <button className="btn btn-primary waves-effect waves-light" type="submit"> Save </button>
              <button type="reset" className="btn btn-default waves-effect waves-light m-l-5"> clear </button>
            </div>
          </div>
        </div>
        <div className=" p-b-10 p-t-60">
          <button id="deleteToTable" className="btn btn-danger waves-effect waves-light pull-left m-t-10 m-r-10" disabled><i className="fa fa-plus m-r-5"></i>Delete</button>
          <button id="addToTable-2" className="btn btn-default waves-effect waves-light pull-left m-t-10 m-r-10" ><i className="fa fa-plus m-r-5"></i>Clone</button>
          <table id="demo-custom-toolbar-1"  data-toggle="table"
                     data-toolbar="#demo-delete-row"
                     data-search="true"
                     data-show-refresh="true"
                     data-show-toggle="true"
                     data-show-columns="true"
                     data-sort-name="id"
                     data-page-list="[5, 10, 20]"
                     data-page-size="5"
                     data-pagination="true" data-show-pagination-switch="true" className="table-bordered ">
            <thead>
              <tr>
                <th data-field="state" data-checkbox="true"></th>
                <th data-field="id" data-sortable="true" data-formatter="invoiceFormatter">ID</th>
                <th data-field="name" data-sortable="true">Name</th>
                <th data-field="date" data-sortable="true" data-formatter="dateFormatter">Date</th>
                <th data-field="Host" data-align="center" data-sortable="true" data-sorter="">Host</th>
                <th data-field="amount" data-align="center" data-sortable="true" data-sorter="">Type</th>
                <th data-field="Parameter" data-align="center" data-sortable="true" data-sorter="">Parameter</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td></td>
                <td>609</td>
                <td>HTTP</td>
                <td>2016-02-16 15:23:43 </td>
                <td>192.168.0.115 </td>
                <td>NET_CAP.</td>
                <td>sh/libs/getoracle.sh</td>
              </tr>
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
