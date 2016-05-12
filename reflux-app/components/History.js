import React from 'react'
import _ from 'lodash'

import AppActions from '../actions/AppActions'
import AppStore from '../stores/AppStore'

class History extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      historyPageContent: [],
      historyPageNo: 0,
      historyPageCount: 0,
      historyPageSize: 10,
      historySortField: '',
      historySortDir: ''
    }
  }

  componentDidMount() {
    this.unsubscribe = AppStore.listen(function(state) {
      this.setState(state);
    }.bind(this));

    // get 1st page
    AppActions.setHistoryPageNo(0)
    AppActions.setHistoryPageSize(10)
    AppActions.getHistoryPageCount()
    AppActions.getHistoryPage()
  }

  componentWillUnmount() {
    if (_.isFunction(this.unsubscribe))
      this.unsubscribe();
  }

  nextPage() {
    AppActions.setHistoryPageNo(this.state.historyPageNo + 1)
    AppActions.getHistoryPage()
  }

  prevPage() {
    AppActions.setHistoryPageNo(this.state.historyPageNo - 1)
    AppActions.getHistoryPage()
  }

  setSort(e) {
    switch (this.state.historySortDir) {
      case 'asc':
        AppActions.setHistorySort(e.target.dataset.field, 'desc')
      break

      case 'desc':
        AppActions.setHistorySort(e.target.dataset.field, 'asc')
      break

      default:
        AppActions.setHistorySort(e.target.dataset.field, 'asc')
    }
  }

  render() {
    let createLine = function(line, index) {
      let d = new Date()
      d.setTime(line.ts)

      let context
      switch (line.level) {
        case 'debug':
          context = 'active'
          break
        case 'info':
          context = 'info'
          break
        case 'warning':
          context = 'warning'
          break
        case 'error':
          context = 'danger'
          break
        default:
          context = 'danger'
      }
      let historyLine = <tr className={ context } key={ index }>
        <td>{ line._id }</td>
        <td>{ line.level }</td>
        <td>{ d.toLocaleString() }</td>
        <td>{ line.module }</td>
        <td>{ line.source }</td>
        <td>{ line.eventId }</td>
        <td>{ line.type }</td>
      </tr>

      return historyLine
    }

    let createPager = function(pageNo, pageCount) {
      let prev
      let next
      if (pageNo == 0)
        prev = <li className="previous disabled"><a href="#" aria-label="Previous"><span className="fa fa-arrow-circle-left" aria-hidden="true"></span> Prev</a></li>
      else
        prev = <li className="previous active"><a onClick={this.prevPage.bind(this)} href="#" aria-label="Previous"><span className="fa fa-arrow-circle-left" aria-hidden="true"></span> Prev</a></li>
      if (pageNo == pageCount - 1)
        next = <li className="next disabled"><a href="#" aria-label="Next">Next <span className="fa fa-arrow-circle-right" aria-hidden="true"></span></a></li>
      else
        next = <li className="next active"><a onClick={this.nextPage.bind(this)} href="#" aria-label="Next">Next <span className="fa fa-arrow-circle-right" aria-hidden="true"></span></a></li>

      let pager = <ul className="pager">
        { prev }
        { next }
      </ul>

      return pager
    }.bind(this)

    // console.log('historyPageContent', this.state.historyPageContent)
    let historyTable = this.state.historyPageContent.map(createLine)
    let pager = createPager(this.state.historyPageNo, this.state.historyPageCount)

    let idSort
    let levelSort
    let dateSort
    switch (this.state.historySortField) {
      case 'id':
        if (this.state.historySortDir == 'asc')
          idSort = <span className="fa fa-sort-asc" data-field="id" onClick={this.setSort.bind(this)}></span>
        else
          idSort = <span className="fa fa-sort-desc" data-field="id" onClick={this.setSort.bind(this)}></span>
        levelSort = <span className="fa fa-sort" data-field="level" onClick={this.setSort.bind(this)}></span>
        dateSort = <span className="fa fa-sort" data-field="date" onClick={this.setSort.bind(this)}></span>
      break

      case 'level':
        if (this.state.historySortDir == 'asc')
          levelSort = <span className="fa fa-sort-asc" data-field="level" onClick={this.setSort.bind(this)}></span>
        else
          levelSort = <span className="fa fa-sort-desc" data-field="level" onClick={this.setSort.bind(this)}></span>
        idSort = <span className="fa fa-sort" data-field="id" onClick={this.setSort.bind(this)}></span>
        dateSort = <span className="fa fa-sort" data-field="date" onClick={this.setSort.bind(this)}></span>
      break

      case 'date':
        if (this.state.historySortDir == 'asc')
          dateSort = <span className="fa fa-sort-asc" data-field="date" onClick={this.setSort.bind(this)}></span>
        else
          dateSort = <span className="fa fa-sort-desc" data-field="date" onClick={this.setSort.bind(this)}></span>
        idSort = <span className="fa fa-sort" data-field="id" onClick={this.setSort.bind(this)}></span>
        levelSort = <span className="fa fa-sort" data-field="level" onClick={this.setSort.bind(this)}></span>
      break

      default:
      idSort = <span className="fa fa-sort" data-field="id" onClick={this.setSort.bind(this)}></span>
      levelSort = <span className="fa fa-sort" data-field="level" onClick={this.setSort.bind(this)}></span>
      dateSort = <span className="fa fa-sort" data-field="date" onClick={this.setSort.bind(this)}></span>
    }

    return (
      <div className="container">
        <div className="row">
          <div className="col-md-2">
            <div className="form-group">
              <label>Module</label>
              <select className="form-control">
                <option>Position</option>
                <option>Name</option>
                <option>Office</option>
                <option>Start date</option>
                <option>Salary</option>
              </select>
            </div>
          </div>
          <div className="col-md-2">
            <div className="form-group">
              <label>EventID</label>
              <select className="form-control">
                <option>Position</option>
                <option>Name</option>
                <option>Office</option>
                <option>Start date</option>
                <option>Salary</option>
              </select>
            </div>
          </div>
          <div className="col-md-2">
            <div className="form-group">
              <label>Source</label>
              <select className="form-control">
                <option>Position</option>
                <option>Name</option>
                <option>Office</option>
                <option>Start date</option>
                <option>Salary</option>
              </select>
            </div>
          </div>
          <div className="col-md-2">
            <div className="form-group">
              <label>Type</label>
              <select className="form-control">
                <option>Position</option>
                <option>Name</option>
                <option>Office</option>
                <option>Start date</option>
                <option>Salary</option>
              </select>
            </div>
          </div>
          <div className="col-md-2">
            <div className="form-group">
              <label>From</label>
              <div className="input-group"> <span className="input-group-addon"><i className="fa fa-calendar"></i></span>
                <input type="text" id="example-input1-group1" name="example-input1-group1" className="form-control" placeholder="06/01/2015 - 06/07/2015" />
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="form-group">
              <label>To</label>
              <div className="input-group"> <span className="input-group-addon"><i className="fa fa-calendar"></i></span>
                <input type="text" id="example-input1-group2" name="example-input1-group2" className="form-control" placeholder="06/01/2015 - 06/07/2015" />
              </div>
            </div>
          </div>
          <div className="col-md-1">
            <div className="checkbox">
              <input id="checkbox0" type="checkbox" />
              <label htmlFor="checkbox0"> Default </label>
            </div>
            </div>
             <div className="col-md-1">
             <div className="checkbox">
              <input id="checkbox1" type="checkbox" />
              <label htmlFor="checkbox1"> Default </label>
            </div>
            </div>
             <div className="col-md-1">
             <div className="checkbox">
              <input id="checkbox2" type="checkbox" />
              <label htmlFor="checkbox2"> Default </label>
            </div>
          </div>
          <div className="col-md-1">
             <div className="checkbox">
              <input id="checkbox3" type="checkbox" />
              <label htmlFor="checkbox3"> Default </label>
            </div>
          </div>
          <div className="col-md-8">
            <div className="form-group text-right m-b-0 m-t-20">
              <button className="btn btn-primary waves-effect waves-light" type="submit"> Submit </button>
              <button type="reset" className="btn btn-default waves-effect waves-light m-l-5"> Cancel </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12 p-t-60">


            <table id="demo-custom-toolbar" className="table table-hover">
              <thead>
                <tr>
                  <th data-field="Id" data-sortable="true" data-formatter="">ID {idSort}</th>
                  <th data-field="Level" data-sortable="true">Level {levelSort}</th>
                  <th data-field="Date" data-sortable="true" data-formatter="dateFormatter">Date {dateSort}</th>
                  <th data-field="Module" data-align="center" data-sortable="false" data-sorter="">Module</th>
                  <th data-field="Source" data-align="center" data-sortable="false" data-formatter="">Source</th>
                  <th data-field="EventID" data-align="center" data-sortable="true" data-formatter="">EventID</th>
                  <th data-field="Type" data-align="center" data-sortable="false" data-formatter="">Type</th>
                </tr>
              </thead>
              <tbody>
                { historyTable }
              </tbody>
            </table>
            { pager }
          </div>
        </div>

        <div className="row p-t-10">
        <div className="card-box">
          <div className="col-sm-12 p-t-10 ">

            <form className="form-horizontal from-m-b10" role="form">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="col-sm-3 control-label">Module:</label>
                  <div className="col-sm-9">
                    <p className="form-control-static">Parser</p>
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-sm-3 control-label">Source:</label>
                  <div className="col-sm-9">
                    <p className="form-control-static">Tploader</p>
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-sm-3 control-label">EventID:</label>
                  <div className="col-sm-9">
                    <p className="form-control-static">401</p>
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-sm-3 control-label">Level:</label>
                  <div className="col-sm-9">
                    <p className="form-control-static"> Warning</p>
                  </div>
                </div>
                 <div className="form-group">
                  <label className="col-sm-3 control-label">User:</label>
                  <div className="col-sm-9">
                    <p className="form-control-static"> N/A</p>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="col-sm-3 control-label">Log Time:</label>
                  <div className="col-sm-9">
                    <p className="form-control-static">2016-02-17 15:29:43</p>
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-sm-3 control-label">Type:</label>
                  <div className="col-sm-9">
                    <p className="form-control-static">Unexpxct Input</p>
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-sm-3 control-label">Machine</label>
                  <div className="col-sm-9">
                    <p className="form-control-static">192.168.0.101</p>
                  </div>
                </div>
                 <div className="form-group">
                  <label className="col-sm-3 control-label">Description:</label>
                  <div className="col-sm-9">
                    <p className="form-control-static">Unexpxt Input at Line 1</p>
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-sm-3 control-label"></label>
                  <div className="col-sm-9">
                    <p className="form-control-static">
                      <button className="btn btn-primary waves-effect waves-light" type="submit"> Parser Editor </button>
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
        </div>
      </div>
    )
  }
}

History.propTypes = {

}

History.defaultProps = {

}

export default History
