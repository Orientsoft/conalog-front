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
    /*
    this.unsubscribe = AppStore.listen(function(state) {
      this.setState(state);
    }.bind(this));
    */
    AppActions.listCert()
  }

  componentWillUnmount() {
    /*
    if (_.isFunction(this.unsubscribe))
      this.unsubscribe();
    */
  }

  onItemAdd(e) {
    console.log('onItemAdd')

    AppActions.clearCurrentCert()
    AppActions.setCertAddModalVisible(true)
  }

  onAddOk() {
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

  onAddCancel() {
    AppActions.clearCurrentCert()
    AppActions.setCertAddModalVisible(false)
  }

  onItemEdit(e) {
    let host = e.target.dataset.host

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
    let host = e.target.dataset.host
    let id = e.target.dataset.id

    AppActions.getCert(host)
    
    confirm({
      title: 'Confirm Delete',
      content: 'Are you sure to delete cert of ' + host + '?',
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

  render() {
    // console.log('Cert::render', this.props)

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
        render: (text, record) => (
          <span>
            <a onClick={this.onItemEdit.bind(this)} data-id={record._id} data-host={record.host} href="#">Edit</a>
            <span className="ant-divider"></span>
            <a onClick={this.onItemDelete.bind(this)} data-id={record._id} data-host={record.host} href="#">Delete</a>
          </span>
        )
      }
    ]

    let antdTable = <Table rowKey={line => line._id}
      columns={antdTableColumns}
      dataSource={this.props.appStore.certList}
      loading={this.props.appStore.certLoadingFlag}
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

    // console.log('this.props.appStore', this.props.appStore)

    return (
      <div className="container">

        <Modal title="Add Cert"
          visible={this.props.appStore.certAddModalVisible}
          onOk={this.onAddOk}
          onCancel={this.onAddCancel}
        >
          {antdForm}
        </Modal>

        <Modal title="Edit Cert"
          visible={this.props.appStore.certEditModalVisible}
          onOk={this.onEditOk}
          onCancel={this.onEditCancel}
        >
          {antdForm}
        </Modal>

        <div className="row clbody">
          <div className="ant-col-sm24 p-t-10">
            <Button type="primary" icon="plus-circle-o" onClick={this.onItemAdd} />
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
