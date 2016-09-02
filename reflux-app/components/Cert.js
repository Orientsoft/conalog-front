import React from 'react'
import refluxConnect from 'reflux-connect'
let Table = require('antd/lib/table')
let Input = require('antd/lib/input')
let Button = require('antd/lib/button')
let Modal = require('antd/lib/modal')
let Form = require('antd/lib/form')
import classNames from 'classnames'
import _ from 'lodash'

import AppActions from '../actions/AppActions'
import AppStore from '../stores/AppStore'

const confirm = Modal.confirm
const createForm = Form.create;
const FormItem = Form.Item;

class Cert extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.unsubscribe = AppStore.listen(function(state) {
      this.setState(state);
    }.bind(this));

    AppActions.listCert()
  }

  componentWillUnmount() {
    if (_.isFunction(this.unsubscribe))
      this.unsubscribe();
  }

  onItemAdd(e) {
    AppActions.clearCurrentCert()
    AppActions.setCertAddModalVisible(true)
  }

  onAddOk() {
    AppActions.saveCurrentCert()
    AppActions.clearCurrentCert()
    AppActions.listCert()
    AppActions.setCertEditModalVisible(false)
  }

  onAddCancel() {
    AppActions.clearCurrentCert()
    AppActions.setCertEditModalVisible(false)
  }

  onItemEdit(e) {
    let host = e.target.dataset.host

    AppActions.setCertEditModalVisible(true)
    AppActions.getCert(host)
  }

  onEditOk() {
    AppActions.saveCurrentCert()
    AppActions.clearCurrentCert()
    AppActions.listCert()
    AppActions.setCertEditModalVisible(false)
  }

  onEditCancel() {
    AppActions.clearCurrentCert()
    AppActions.setCertEditModalVisible(false)
  }

  onItemDelete(e) {
    let host = e.target.dataset.host

    // AppActions.setCertDeleteModalVisible(true)
    confirm({
      title: 'Confirm Delete',
      content: 'Are you sure to delete cert of ' + host + '?',
      onOk: onDeleteOk,
      onCancel: onDeleteCancel
    })

    AppActions.getCert(host)
  }

  onDeleteOk() {
    AppActions.deleteCurrentCert()
    AppActions.clearCurrentCert()
    AppActions.listCert()
    // AppActions.setCertDeleteModalVisible(false)
  }

  onDeleteCancel() {
    AppActions.clearCurrentCert()
    // AppActions.setCertDeleteModalVisible(false)
  }

  render() {
    // ant design table
    let antdTableColumns = [
      {
        title: 'ID',
        dataIndex: '_id'
      },
      {
        title: 'Date',
        dataIndex: 'ts',
        render: (ts) => {
          let d = new Date(parseInt(ts)).toLocaleString()
          return d
        }
      },
      {
        title: 'Host',
        dataIndex: 'host',
      },
      {
        title: 'Port',
        dataIndex: 'port'
      },
      {
        title: 'Username',
        dataIndex: 'user'
      },
      {
        title: 'Operation',
        render: (text, record) => {
          <span>
            <a onClick={this.onItemEdit} data-host={record.host} href="#">Edit</a>
            <span className="ant-divider"></span>
            <a onClick={this.onItemDelete} data-host={record.host} href="#">Delete</a>
          </span>
        }
      }
    ]

    let antdTable = <Table rowKey={line => line._id}
      columns={antdTableColumns}
      dataSource={this.state.certList}
      loading={this.state.certLoadingFlag}
      expandedRowRender={record => <p><b>Password</b> - {record.pass}</p>}
    />

    const { getFieldProps } = this.props.form

    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    }

    let antdForm = <Form horizontal form={this.props.form}>
      <FormItem
        {...formItemLayout}
        label="Host"
      >
        <Input {...getFieldProps('host', {})} type="text" autoComplete="off" />
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="Port"
      >
        <Input {...getFieldProps('port', {})} type="text" autoComplete="off" />
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="User"
      >
        <Input {...getFieldProps('user', {})} type="text" autoComplete="off" />
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="Password"
      >
        <Input {...getFieldProps('pass', {})} type="password" autoComplete="off" />
      </FormItem>
    </Form>

    return (
      <div className="container">

        <Modal title="Add Cert"
          visible={this.state.addModalVisible}
          onOK={this.onAddOk}
          onCancel={this.onAddCancel}
        >
          {antdForm}
        </Modal>

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
  cert: React.PropTypes.object,
  certList: React.PropTypes.array,
  certLoadingFlag: React.PropTypes.bool,
  addModalVisible: React.PropTypes.bool,
  editModalVisible: React.PropTypes.bool
}

Cert.defaultProps = {

}

// 1. connect Cert with AppStore, so Cert has a prop named appStore
const CertConnect = refluxConnect({
  cert: AppStore.cert,
  certList: AppStore.certList,
  certLoadingFlag: AppStore.certLoadingFlag,
  addModalVisible: AppStore.addModalVisible,
  editModalVisible: AppStore.editModalVisible
})((state) => {
  return {
    cert: state.cert,
    certList: state.certList,
    certLoadingFlag: state.certLoadingFlag,
    addModalVisible: state.addModalVisible,
    editModalVisible: state.editModalVisible
  }
})
let ConnectedCert = CertConnect(Cert)

// 2. in createForm, bind appStore prop to form bi-directionally
Cert = createForm({
  onFieldsChange: (props, fields) => {
    // actually we don't care about props in reflux, just call AppActions to update state
    AppActions.updateCurrentCert(fields)
  },
  mapPropsToFields: (props) => {
    console.log('mapPropsToFields', props)
    /*
    if (props === undefined || props == null || props == {})
      return {}

    return {
      host: props.cert.host,
      port: props.cert.port,
      user: props.cert.user,
      pass: props.cert.pass
    }
    */
  }
})(ConnectedCert)

export default Cert
