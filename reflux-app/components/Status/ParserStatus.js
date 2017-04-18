
import React from "react"
import refluxConnect from 'reflux-connect'
import AppActions from '../../actions/AppActions'
import AppStore from '../../stores/AppStore'
// import gear from "../../../public/img/gear.png"

let Table = require('antd/lib/table')
let Button = require('antd/lib/button')
let Modal = require('antd/lib/modal')
let Form = require('antd/lib/form')
let Icon = require('antd/lib/icon')
const confirm = Modal.confirm


class ParserStatus extends React.Component{
  constructor (props) {
    super(props)
  }

  componentDidMount() {
    AppActions.listParser();
    AppActions.listInstance();
  }

  onInstanceStart(e) {
    let name = e.target.dataset.name
    let id = e.target.dataset.id
    confirm({
      title: 'Confirm Start',
      content: 'Are you sure to start an instance of ' + name +' ?',
      onOk: this.onStartOk,
      onCancel: this.onStartCancel
    })
    AppActions.getParser(name)
  }

  onStartOk() {
    AppActions.saveInstance.triggerAsync()
      .then(() => {
        return AppActions.listInstance()
      })
      .catch(err => {
        console.log(err)
      })
  }

  onStartCancel() {}

  onInstanceStop(e) {
    let id = e.target.dataset.id
    console.log("id-->",id)
    confirm({
      title: 'Confirm Stop',
      content: 'Are you sure to stop instance ' + id +' ?',
      onOk: this.onInstanceStopOk,
      onCancel: this.onInstanceStopCancel
    })
    AppActions.getInstance(id)
  }

  onInstanceStopOk() {
    AppActions.stopInstance.triggerAsync()
      .then(() => {
        return AppActions.listInstance()
      })
      .catch(err => {
        console.log(err)
      })
  }

  onInstanceStopCancel() {}

  render () {
    let antdTableColumns = [
      {
        title: "ID",
        dataIndex: 'id',
        sorter: (a, b) => {
          var sa = a.id.split('').reduce((s, v) => s += v.charCodeAt(), 0)
          var sb = b.id.split('').reduce((s, v) => s += v.charCodeAt(), 0)
          if (sa === sb) {
            return a.id - b.id
          }
          return sa - sb
        }
      },
      {
        title: 'Name',
        dataIndex: 'name',
        sorter: (a, b) => {
          var sa = a.name.split('').reduce((s, v) => s += v.charCodeAt(), 0)
          var sb = b.name.split('').reduce((s, v) => s += v.charCodeAt(), 0)
          if (sa === sb) {
            return a.name - b.name
          }
          return sa - sb
        }
      },
      {
        title: 'Date',
        dataIndex: 'ts',
        render: (ts) => {
          let d = new Date(parseInt(ts)).toLocaleString()
          return d
        },
        sorter: (a, b) => a.ts - b.ts
      },
      {
        title: 'Path',
        dataIndex: 'path',
        sorter: (a, b) => {
          var sa = a.path.split('').reduce((s, v) => s += v.charCodeAt(), 0)
          var sb = b.path.split('').reduce((s, v) => s += v.charCodeAt(), 0)
          if (sa === sb) {
            return a.path - b.path
          }
          return sa - sb
        }
      },
      {
        title: 'Parameter',
        dataIndex: 'parameter'
      },
      {
        title: 'InputType',
        dataIndex: 'input.type'
      },
      {
        title: 'InputChannel',
        dataIndex: 'input.channel'
      },
      {
        title: 'OutputType',
        dataIndex: 'output.type'
      },
      {
        title: 'OutputChannel',
        dataIndex: 'output.channel'
      },
      {
        title: 'Instance',
        render: (text, record) => {
          let parserInstance = [];
          let parserInstances = this.props.appStore.instanceList;
          parserInstance = parserInstances.filter(p => p.parserId == record.id)
          let anim = ''
          if (parserInstance.length !== 0){
            anim = 'settingIcon'
          }
          return (<span>
                    <Icon className = { anim } type = "setting" style = {{fontSize:20}}></Icon>
                    <span className = "ant-divider"></span>
                    <span> {parserInstance.length} </span>
                  </span>)

        }
      },
      {
        title: 'Operation',
        render: (text, record) => (
          <span>
            <a href = "#"  onClick = {this.onInstanceStart.bind(this) } data-name = {record.name } data-id = {record.id }>Start</a>
          </span>
        )
      }
    ]

    let antdInstanceTableColumns = [
      {
        title: "ID",
        dataIndex: 'id',
        sorter: (a, b) => {
          var sa = a.id.split('').reduce((s, v) => s += v.charCodeAt(), 0)
          var sb = b.id.split('').reduce((s, v) => s += v.charCodeAt(), 0)
          if (sa === sb) {
            return a.id - b.id
          }
          return sa - sb
        }
      },
      {
        title: "ParserId",
        dataIndex: 'parserId',
        sorter: (a, b) => {
          var sa = a.parserId.split('').reduce((s, v) => s += v.charCodeAt(), 0)
          var sb = b.parserId.split('').reduce((s, v) => s += v.charCodeAt(), 0)
          if (sa === sb) {
            return a.parserId - b.parserId
          }
          return sa - sb
        }
      },
      {
        title: "Date",
        sorter: (a, b) => a.ts - b.ts,
        dataIndex: 'ts',
        render: (ts) => {
          let d = new Date(parseInt(ts)).toLocaleString()
          return d
        },
      },
      {
        title: "Last Activity Count",
        dataIndex: 'lastActivity.count',
        sorter: (a, b) => a.lastActivity.count - b.lastActivity.count
      },
      {
        title: "Last Activity Message",
        dataIndex: 'lastActivity.message'
      },
      {
        title: 'Operation',
        render: (text, record) => (
          <span>
            <a href = "#" onClick = {this.onInstanceStop.bind(this)} data-id = {record.id} >Stop</a>
          </span>
        )
      }
    ]

    let antdTable = <Table rowKey = { line => line.id }
      columns = { antdTableColumns }
      dataSource = { this.props.appStore.parserList }
      expandedRowRender = { record => {
        let parserInstance = [];
        let parserInstances = this.props.appStore.instanceList;
        parserInstance = parserInstances.filter(p => p.parserId == record.id)
        return (<Table rowKey = { line => line.id }
          columns = {antdInstanceTableColumns}
          dataSource = {parserInstance } />)
        }
      }
    />

    return (
      <div className = "container">
        <div className = "row clbody tableParsserStatus">
          <div className = "ant-col-sm-24 p-t-10">
            { antdTable }
          </div>
        </div>
      </div>
    )

  }
}
const ParserInstanceConnect = refluxConnect({
  appStore: AppStore
})(state => {
  // console.log('mapStateToProps', state)

  return {
    appStore: state.appStore
  }
}, null, null, {pure: false})
ParserStatus = ParserInstanceConnect(ParserStatus)

export default ParserStatus