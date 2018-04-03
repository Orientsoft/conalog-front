import React from 'react'
import refluxConnect from 'reflux-connect'
import { FormattedMessage } from 'react-intl';

let Table = require('antd/lib/table')
let Input = require('antd/lib/input')
let Button = require('antd/lib/button')
let Modal = require('antd/lib/modal')
let Form = require('antd/lib/form')
let Icon = require('antd/lib/icon')
import classNames from 'classnames'
import _ from 'lodash'

import AppActions from '../actions/AppActions'
import AppStore from '../stores/AppStore'

const confirm = Modal.confirm
const createForm = Form.create;
const FormItem = Form.Item;
let validates
let host
let port
let user

class Cert extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      delete:"",
      delmsg:"",
      certList:[],
    }
  }

  componentDidMount() {

    this.unsubscribe = AppStore.listen(function(state) {
      this.setState(state);
    }.bind(this));

    AppActions.listCert().then( () => { console.log("aa",this.state.certList)})

  }

  componentWillUnmount() {

    if (_.isFunction(this.unsubscribe))
      this.unsubscribe();

  }

  onItemAdd(e) {
    validates = {
      host:{status:true},
      port:{status:true},
      name:{status:true},
    }

    AppActions.clearCurrentCert()
    AppActions.setCertAddModalVisible(true)
  }

  onAddOk() {
    this.state.certList.every( cert =>{
      validates.host.status = validates.port.status = validates.name.status = this.state.certList.every(cert => {
        return cert.user !== user || cert.port !== port || cert.host !== host
      })
    })
    var result = Object.keys(validates).filter(field => validates[field].status === false)
    //console.log(result)
    if(result.length == 3){
      alert('The user of  '+host+' is existed!'  )
    }else{
      AppActions.saveCurrentCert.triggerAsync()
        .then(() => {
          AppActions.clearCurrentCert()
          return AppActions.listCert()
        })
        .catch(err => {
          // do nothing
        })
      AppActions.setCertAddModalVisible(false)
    }

  }

  onAddCancel() {
    AppActions.clearCurrentCert()
    AppActions.setCertAddModalVisible(false)
  }

  onItemEdit(e) {
    var t = e.target
    if (t.tagName.toLowerCase() == 'span') {
      t = t.parentElement
    }
    let host = t.dataset.host

    AppActions.setCertEditModalVisible(true)
    AppActions.getCert(host)
  }

  onEditOk() {
    AppActions.saveCurrentCert.triggerAsync()
      .then(() => {
        AppActions.clearCurrentCert()
        return AppActions.listCert()
      })
      .catch(err => {
        // do nothing
      })
    AppActions.setCertEditModalVisible(false)
  }

  onEditCancel() {
    AppActions.clearCurrentCert()
    AppActions.setCertEditModalVisible(false)
  }

  onItemDelete(e) {
    var t = e.target
    if (t.tagName.toLowerCase() == 'span') {
      t = t.parentElement
    }
    let host = t.dataset.host
    let id = t.dataset.id

    AppActions.getCert(host)
    
    confirm({
      title: this.state.delete,
      content: this.state.delmsg + host + '?',
      onOk: this.onDeleteOk,
      onCancel: this.onDeleteCancel
    })  
  }

  onDeleteOk() {
    AppActions.deleteCurrentCert.triggerAsync()
      .then(() => {
        AppActions.clearCurrentCert()
        return AppActions.listCert()
      })
      .catch(err => {
        // do nothing
      })
  }

  onDeleteCancel() {
    AppActions.clearCurrentCert()
  }

  onShowPass(e){
    var showPassword=true;
    AppActions.toggleCertPass(e.target.dataset._id,showPassword)
  }

  onHidePass(e){
    var showPassword=false;
    AppActions.toggleCertPass(e.target.dataset._id,showPassword)
  }
  render() {
    let a = <FormattedMessage id = 'home'/>
    let password = a._owner._context.intl.messages.password
    let date = a._owner._context.intl.messages.date
    let host = a._owner._context.intl.messages.host
    let port = a._owner._context.intl.messages.port
    let username = a._owner._context.intl.messages.user
    let operation = a._owner._context.intl.messages.operation
    let edit = a._owner._context.intl.messages.edit
    let del = a._owner._context.intl.messages.del
    let add = a._owner._context.intl.messages.adding
    this.state.delete = a._owner._context.intl.messages.comfirmDel
    this.state.delmsg = a._owner._context.intl.messages.delCert

    // ant design table
    let antdTableColumns = [
      {
        title: 'ID',
        dataIndex: '_id'
      },

      {
        title: date,
        dataIndex: 'ts',
        render: (ts) => {
           let d = new Date(parseInt(ts)).toLocaleString()
          return d
        }
      },
      {
        title: host,
        dataIndex: 'host',
      },
      {
        title: port,
        dataIndex: 'port'
      },
      {
        title: username,
        dataIndex: 'user'
      },
      {
        title:password,
        render:(text,record)=>(
          <span>
            <span>{record.originPass}</span>
          </span>
        )
      },
      {
        title: operation,
        render: (text, record) => (
          <span>
            <a onClick={this.onItemEdit.bind(this)} data-id={record._id} data-host={record.host} href="#"><FormattedMessage id="edit"/></a>
            <span className="ant-divider"></span>
            <a onClick={this.onItemDelete.bind(this)} data-id={record._id} data-host={record.host} href="#"><FormattedMessage id="del"/></a>
	         {/*<span className="ant-divider"></span>*/}
	         {/*<a><Icon data-_id={record._id}  type="eye"  onMouseOver={this.onShowPass.bind(this)} onMouseLeave={this.onHidePass.bind(this)} ></Icon></a>*/}
           {/*<a><i data-_id={record._id}  className="anticon anticon-eye"  onMouseOver={this.onShowPass.bind(this)} onMouseLeave={this.onHidePass.bind(this)} ></i></a>*/}
          </span>
        )
      }
    ]

    let antdTable = <Table rowKey={line => line._id}
      columns={antdTableColumns}
      dataSource={this.props.appStore.certList}
      loading={this.props.appStore.certLoadingFlag}
    />

    const { getFieldProps } = this.props.form

    const formItemLayout = {
     labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    }

    let antdForm = <Form horizontal form={this.props.form}>
      <FormItem
        {...formItemLayout}
        label={host}
      >
        <Input {...getFieldProps('host', {})} type="text" autoComplete="off" />
      </FormItem>
      <FormItem
        {...formItemLayout}
        label={port}
      >
        <Input {...getFieldProps('port', {})} type="text" autoComplete="off" />
      </FormItem>
      <FormItem
        {...formItemLayout}
        label={username}
      >
        <Input {...getFieldProps('user', {})} type="text" autoComplete="off" />
      </FormItem>
      <FormItem
        {...formItemLayout}
        label={password}
      >
        <Input {...getFieldProps('pass', {})} type="password" autoComplete="off" />
      </FormItem>
    </Form>

    // console.log('this.props.appStore', this.props.appStore)

    return (
      <div className="container">

        <Modal title= {add}
          visible={this.props.appStore.certAddModalVisible}
          onOk={() => this.onAddOk()}
          onCancel={this.onAddCancel}
        >
          {antdForm}
        </Modal>

        <Modal title= {edit}
          visible={this.props.appStore.certEditModalVisible}
          onOk={this.onEditOk}
          onCancel={this.onEditCancel}
        >
          {antdForm}
        </Modal>

        <div className="row clbody">
          <div className="ant-col-sm24 p-t-10">
            <Button type="primary" icon="anticon anticon-plus"  onClick={this.onItemAdd} ></Button>
          </div>
        </div>

        <div className="row clbody">
          <div className="ant-col-sm-24 p-t-10">
            { antdTable }
          </div>
        </div>
      </div>
    )
  }
}

Cert.propTypes = {
  appStore: React.PropTypes.object
}

Cert.defaultProps = {

}

// 1. in createForm, bind appStore prop to form bi-directionally
Cert = createForm({
  onFieldsChange: (props, fields) => {
    // actually we don't care about props in reflux, just call AppActions to update state
    console.log('onFieldsChange', props, fields)

    let stateObj = {}
    for (let field in fields) {
      stateObj[fields[field].name] = fields[field].value
    }

    if(fields.hasOwnProperty('host')){
      host = fields['host'].value
    }
    if(fields.hasOwnProperty('user')){
      user = fields['user'].value
    }
    if(fields.hasOwnProperty('port')){
      port = fields['port'].value
    }

    AppActions.updateCurrentCert(stateObj)

  },
  mapPropsToFields: (props) => {
    console.log('mapPropsToFields', props)
    if (props.appStore.cert == {})
      return { }

    return {
      host: {name: 'host', value: props.appStore.cert.host},
      port: {name: 'port', value: props.appStore.cert.port},
      user: {name: 'user', value: props.appStore.cert.user},
      pass: {name: 'pass', value: props.appStore.cert.pass}
    }
  }
})(Cert)

// 2. connect Cert with AppStore, so Cert has a prop named appStore
const CertConnect = refluxConnect({
  appStore: AppStore
})(state => {
  // console.log('mapStateToProps', state)

  return {
    appStore: state.appStore
  }
}, null, null, {pure: false})
Cert = CertConnect(Cert)

export default Cert
