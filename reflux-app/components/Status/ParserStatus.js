
import React from "react"
import refluxConnect from 'reflux-connect'
import AppActions from '../../actions/AppActions'
import AppStore from '../../stores/AppStore'
import constants from '../../const'
import { FormattedMessage } from 'react-intl';
import { Icon,Modal,Button,Table,Input,Form,Tag } from 'antd';


// let Table = require('antd/lib/table')
// let Button = require('antd/lib/button')
// let Modal = require('antd/lib/modal')
// let Form = require('antd/lib/form')
// let Icon = require('antd/lib/icon')
// let Tag = require('antd/lib/tag')
const confirm = Modal.confirm


class ParserStatus extends React.Component{
  constructor (props) {
    super(props)
    this.state = {
      instanceListAll:[],
      messageModal:false,
      messageContent:'',
      start:"",
      startmsg1:"",
      startmsg2:"",
      delete:"",
      delmsg:"",
    }
  }

  componentDidMount() {
    this.unsubscribe = AppStore.listen(function(state) {
      this.setState(state)
    }.bind(this))

    AppActions.listParser();
    AppActions.listInstance();

     this.loop = setInterval(function() {
      AppActions.listInstance()
    }, constants.STATUS_REFRESH_INTERVAL)
  }

  componentWillUnmount() {
    // stop list loop
    clearInterval(this.loop)

    if (_.isFunction(this.unsubscribe))
      this.unsubscribe();
  }

  onInstanceStart(e) {
    var t = e.target
    if (t.tagName.toLowerCase() == 'span') {
      t = t.parentElement
    }
    let name = t.dataset.name
    let id = t.dataset.id
    confirm({
      title: this.state.start,
      content: this.state.startmsg1 + name + this.state.startmsg2 +  ' ?',
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
    var t = e.target
    if (t.tagName.toLowerCase() == 'span') {
      t = t.parentElement
    }
    let id = t.dataset.id
    confirm({
      title: this.state.delete,
      content: this.state.delmsg + id +' ?',
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

  showAllStatus(e){
    let id = e.target.dataset.id
    let instanceListAll = this.state.instanceListAll
    for(let i = 0; i<instanceListAll.length;i++){
      if(id == instanceListAll[i].id){
        this.setState({
          messageModal:true,
          messageContent:instanceListAll[i].lastActivity.message
        })
      }
    }
  }

  showPartStatus(e){
    this.setState({
      messageModal:false
    })
  }

  render () {
    let a = <FormattedMessage id = 'home'/>
    let name = a._owner._context.intl.messages.name
    let date = a._owner._context.intl.messages.date
    let path = a._owner._context.intl.messages.path
    let type = a._owner._context.intl.messages.types
    let inputType = a._owner._context.intl.messages.inputType
    let outputType = a._owner._context.intl.messages.outputType
    let operation = a._owner._context.intl.messages.operation
    let parameter = a._owner._context.intl.messages.para
    let inputChannel = a._owner._context.intl.messages.inputChannel
    let channel = a._owner._context.intl.messages.channel
    let outputChannel = a._owner._context.intl.messages.outputChannel
    let lastActivityTime = a._owner._context.intl.messages.lastActivityTime
    let lastActivityMessage = a._owner._context.intl.messages.lastActivityMessage
    let execCount = a._owner._context.intl.messages.execCount
    let instance =  a._owner._context.intl.messages.instance
    this.state.delete = a._owner._context.intl.messages.comfirmDel
    this.state.delmsg = a._owner._context.intl.messages.delInstance
    this.state.start = a._owner._context.intl.messages.comfirmStart
    this.state.startmsg1 = a._owner._context.intl.messages.startMsg1
    this.state.startmsg2 = a._owner._context.intl.messages.startMsg2

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
        title: name,
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
        title: date,
        dataIndex: 'ts',
        render: (ts) => {
          let d = new Date(parseInt(ts)).toLocaleString()
          return d
        },
        sorter: (a, b) => a.ts - b.ts
      },
      {
        title: path,
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
        title: parameter,
        dataIndex: 'parameter'
      },
      {
        title: inputType,
        dataIndex: 'input.type'
      },
      {
        title: inputChannel,
        dataIndex: 'input.channel'
      },
      {
        title: outputType,
        dataIndex: 'output.type'
      },
      {
        title: outputChannel,
        dataIndex: 'output.channel'
      },
      {
        title: instance,
        render: (text, record) => {
          let parserInstance = [];
          let parserInstances = this.props.appStore.instanceList;
          parserInstance = parserInstances.filter(p => p.parserId == record.id)
          let anim = ''
          if (parserInstance.length !== 0){
            anim = 'settingIcon'
          }
          return (<span>
                    <i className = 'anticon anticon-setting' id={anim}  style = {{fontSize:20}}></i>
                    <span className = "ant-divider"></span>
                    <span> {parserInstance.length} </span>
                  </span>)

        }
      },
      {
        title: operation,
        render: (text, record) => (
          <span>
            <a href = "#"  onClick = {this.onInstanceStart.bind(this) } data-name = {record.name } data-id = {record.id }><FormattedMessage id="start"/></a>
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
        title: lastActivityTime,
        sorter: (a, b) => a.ts - b.ts,
        dataIndex: 'lastActivity.ts',
        render: (ts) => {
          let d = new Date(parseInt(ts)).toLocaleString()
          return d
        },
      },
      {
        title: execCount,
        dataIndex: 'lastActivity.count',
        sorter: (a, b) => a.lastActivity.count - b.lastActivity.count
      },
      {
        title: lastActivityMessage,
        render: (text, record) => {
          if (record.lastActivity.message) {
            return(
              <span>
                <Tag color="green"><a href="#">stdout</a></Tag>
                <Tag color="green"><a href="#" data-id={record.id} onClick={this.showAllStatus.bind(this)}> + </a></Tag>
                <span>{record.lastActivity.message}</span>
              </span>
            )
          }else{
            return (
              <span>
                <Tag color="green"><a href="#">stdout</a></Tag>
                <span>{record.lastActivity.message}</span>
              </span>
            )
          }

        }
      },
      {
        title: operation,
        render: (text, record) => (
          <span>
            <a href = "#" onClick = {this.onInstanceStop.bind(this)} data-id = {record.id} ><FormattedMessage id="stop"/></a>
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
        <Modal
          title = "Last Activity Message"
          visible = {this.state.messageModal}
          onOk = {this.showPartStatus.bind(this)}
          onCancel = {this.showPartStatus.bind(this)}
          footer = {null}
          className = 'statusModal'
        >
          {this.state.messageContent}
        </Modal>
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