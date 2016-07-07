import React from 'react'
let Table = require('antd/lib/table')
import _ from 'lodash'

import AppActions from '../actions/AppActions'
import AppStore from '../stores/AppStore'

class History extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      history: {},
      historyPageContent: [],
      historyPageNo: 0,
      historyPageCount: 0,
      historyPageSize: 10,
      historySortField: '',
      historySortDir: '',
      historyPager: { showSizeChanger: true },
      historyLoadingFlag: false
    }
  }

  componentDidMount() {
    this.unsubscribe = AppStore.listen(function(state) {
      this.setState(state);
    }.bind(this));

    /*
    // get 1st page
    AppActions.setHistoryPageNo(0)
    AppActions.setHistoryPageSize(10)
    AppActions.getHistoryPageCount()
    AppActions.getHistoryPage()
    */


    AppActions.getHistoryPage({
      pageNo: 1,
      pageSize: 10
    })
  }

  componentWillUnmount() {
    if (_.isFunction(this.unsubscribe))
      this.unsubscribe();
  }

  loadHistoryDetail(e) {
    // TO DO: get id!
    let id = e.target.dataset.hid
    AppActions.getHistory(id)
  }

  handleHistoryTableChange(pager, filters, sorter) {
    let pagerState = this.state.historyPager
    pagerState.current = pager.current
    AppActions.setHistoryPager(pagerState)
    AppActions.getHistoryPageCount()
    AppActions.getHistoryPage({
      pageSize: pager.pageSize,
      pageNo: pager.current,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters
    })
  }

  render() {
    // ant design table
    let antdTableColumns = [
      {
        title: 'ID',
        dataIndex: '_id'
      },
      {
        title: 'Level',
        dataIndex: 'level',
        filters: [
          { text: 'debug', value: 'debug' },
          { text: 'info', value: 'info' },
          { text: 'warning', value: 'warning' },
          { text: 'error', value: 'error' }
        ],
        filterMultiple: true
      },
      {
        title: 'Date',
        dataIndex: 'ts',
        sorter: true,
        render: (ts) => {
          let d = new Date(parseInt(ts)).toLocaleString()
          return d
        }
      },
      {
        title: 'Module',
        dataIndex: 'module'
      },
      {
        title: 'Source',
        dataIndex: 'source'
      },
      {
        title: 'EventID',
        dataIndex: 'eventId'
      },
      {
        title: 'Type',
        dataIndex: 'type'
      }
    ]
    let antdTable = <Table rowKey={line => line._id}
      columns={antdTableColumns}
      dataSource={this.state.historyPageContent}
      pagination={this.state.historyPager}
      loading={this.state.historyLoadingFlag}
      onChange={this.handleHistoryTableChange.bind(this)}
      expandedRowRender={record => <p><b>Description</b> - {record.desc}</p>}
      />

    return (
      <div className="container">

        <div className="row">
          <div className="ant-col-sm-24 p-t-60">
          { antdTable }
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
