import React from 'react'
import { FormattedMessage } from 'react-intl';
let Table = require('antd/lib/table')
let Input = require('antd/lib/input')
let Button = require('antd/lib/button')
import classNames from 'classnames'
import _ from 'lodash'

import AppActions from '../actions/AppActions'
import AppStore from '../stores/AppStore'

const InputGroup = Input.Group

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
      historyPager: { showSizeChanger: true, current: 1, pageSize: 10 },
      historySorter: null,
      historyFilters: null,
      historyLoadingFlag: false,
      historyEventIdFilter: '',
      historyEventIdFilterFocus: false
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
      pageSize: 10,
      sortField:'ts',
      sortOrder:'descend'
    })
    // AppActions.setHistorySorter('descend')
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
    console.log('sorter',sorter)
    AppActions.setHistoryPager(pager)
    if(sorter && !_(_.pick(sorter, ['field', 'order'])).size()) {
      sorter.field = 'ts';
      sorter.order = 'descend'
    }
    console.log('sorter2',sorter)

    AppActions.setHistorySorter(sorter)
    AppActions.setHistoryFilters(filters)

    // AppActions.getHistoryPageCount()
    let pageInfo = {
      pageSize: pager.pageSize,
      pageNo: pager.current,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters
    }
    console.log('paginfo:',pageInfo)
    if (this.state.historyEventIdFilter != '') {
      pageInfo.eventId = [ parseInt(this.state.historyEventIdFilter) ]
    }
    AppActions.getHistoryPage(pageInfo)
  }

  handleFilterChange(e) {
    let filterName = e.target.dataset.name
    switch (filterName) {
      case 'eventid':
        AppActions.setHistoryEventIdFilter(e.target.value)
      break

      default:
      break
    }
  }

  handleFilterBlur(e) {
    let filterName = e.target.dataset.name
    switch (filterName) {
      case 'eventid':
        AppActions.setHistoryEventIdFilterFocus((e.target === document.activeElement) ? true : false)
      break;

      default:
      break
    }
  }

  handleSearch(e) {
    // AppActions.getHistoryPageCount()
    let pageInfo = { }
    if (this.state.historyFilters != null) {
      pageInfo = {
        ...this.state.filters
      }
    }
    if (this.state.historySorter != null) {
      pageInfo.sortField = this.state.historySorter.field
      pageInfo.sortOrder = this.state.historySorter.order
    }
    pageInfo.pageSize = this.state.historyPager.pageSize
    pageInfo.pageNo = this.state.historyPager.current

    if (this.state.historyEventIdFilter != '') {
      pageInfo.eventId = [ parseInt(this.state.historyEventIdFilter) ]
    }
    AppActions.getHistoryPage(pageInfo)
  }

  render() {
    let a = <FormattedMessage id = 'home'/>
    let level = a._owner._context.intl.messages.level
    let date = a._owner._context.intl.messages.date
    let module = a._owner._context.intl.messages.module
    let source = a._owner._context.intl.messages.source
    let eventId = a._owner._context.intl.messages.eventId
    let type = a._owner._context.intl.messages.historyType
    let des = a._owner._context.intl.messages.des


    // ant design table
    let antdTableColumns = [
      {
        title: 'ID',
        dataIndex: '_id'
      },
      {
        title: level,
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
        title: date,
        dataIndex: 'ts',
        sorter: true,
        render: (ts) => {
          let d = new Date(parseInt(ts)).toLocaleString()
          return d
        },

      },
      {
        title: module,
        dataIndex: 'module'
      },
      {
        title: source,
        dataIndex: 'source'
      },
      {
        title: eventId,
        dataIndex: 'eventId'
      },
      {
        title: type,
        dataIndex: 'type'
      }
    ]
    let antdTable = <Table rowKey={line => line._id}
      columns={antdTableColumns}
      dataSource={this.state.historyPageContent}
      pagination={this.state.historyPager}
      loading={this.state.historyLoadingFlag}
      onChange={this.handleHistoryTableChange.bind(this)}
      expandedRowRender={record => <p><b>{des}</b> - {record.desc}</p>}
      />

    const buttonClass = classNames({
      'ant-search-btn': true,
      'ant-search-btn-noempty': !!this.state.historyEventIdFilter.trim()
    })
    const searchClass = classNames({
      'ant-search-input': true,
      'ant-search-input-focus': this.state.historyEventIdFilterFocus
    })

    return (
      <div className="container">
        <div className="row clbody">
          <div className="ant-col-sm-4 p-t-10 p-b-10 pull-right">
            <div className="ant-search-input-wrapper">
              <InputGroup className={searchClass}>
                <Input placeholder={eventId} data-name="eventid" defaultValue={this.state.historyEventIdFilter} onChange={this.handleFilterChange.bind(this)}
                  onFocus={this.handleFilterBlur.bind(this)} onBlur={this.handleFilterBlur.bind(this)} onPressEnter={this.handleSearch.bind(this)} />
                <div className="ant-input-group-wrap">
                  <Button icon="anticon icon-search1"  data-name="eventid" className={buttonClass} onClick={this.handleSearch.bind(this)} />
                </div>
              </InputGroup>
            </div>
          </div>
          <div className="ant-col-sm-24 p-t-10">
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
