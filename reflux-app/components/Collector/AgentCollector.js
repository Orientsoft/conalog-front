import React from "react"
import refluxConnect from 'reflux-connect'
import AppActions from '../../actions/AppActions'
import AppStore from '../../stores/AppStore'
import _ from 'lodash'
import { Row, Col } from 'antd';

let Table = require('antd/lib/table')
let Input = require('antd/lib/input')
let Button = require('antd/lib/button')
let Modal = require('antd/lib/modal')
let Form = require('antd/lib/form')
let Select = require('antd/lib/select')
let Popover= require('antd/lib/popover')
let Icon = require('antd/lib/icon')

const confirm = Modal.confirm;
const createForm = Form.create;
const FormItem = Form.Item;
const Option = Select.Option;
let validates
let existSameName

class AgentCollector extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    AppActions.listAgentCollector();
  }

  componentWillUnmount() {
    if (_.isFunction(this.unsubscribe))
      this.unsubscribe();
  }

  onItemAdd() {
    existSameName = true;
    validates = {
      name: {
        msg: 'name  can\'t be empty',
        status: false
      },
      param: {
        msg: 'parameter can\'t be empty',
        status: false
      },
      desc: {
        msg: 'description can\'t be empty',
        status: false
      }
    }
    AppActions.clearCurrentAgentCollector()
    AppActions.setAgentCollectorAddModalVisible(true)
  }

  onAddOk() {
    var result = Object.keys(validates).filter(field => validates[field].status === false)
    if (!result.length && existSameName) {
      AppActions.saveAgentCollector.triggerAsync()
        .then(() => {
          AppActions.clearCurrentAgentCollector()
          return AppActions.listAgentCollector()
        })
        .catch(err => {
          console.log(err)
        })
      AppActions.setAgentCollectorAddModalVisible(false)
    }
    if(!existSameName){
      alert('The name is existed, please change another name!')
    }
    if (result.length) {
      var tip = 'Validate error: \n'
      result.forEach(field => tip += validates[field].msg + '\n')
      alert(tip)
    }
  }

  onAddCancel() {
    AppActions.clearCurrentAgentCollector()
    AppActions.setAgentCollectorAddModalVisible(false)
  }

  onItemEdit(e) {
    validates = {
      param: {
        msg: 'parameter can\'t be empty',
        status: false
      },
      desc: {
        msg: 'description can\'t be empty',
        status: false
      }
    }
    let name = e.target.dataset.name
    AppActions.setAgentCollectorEditModalVisible(true)
    AppActions.getAgentCollector(name, (ac) => {
      validates.param.status = !!ac.param
      validates.desc.status = !!ac.desc
    })
  }

  onEditOk() {
    var result = Object.keys(validates).filter(field => validates[field].status === false)
    if(!result.length){
      AppActions.saveAgentCollector.triggerAsync()
        .then(() => {
          AppActions.clearCurrentAgentCollector()
          return AppActions.listAgentCollector()
        })
        .catch(err => {
          console.log(err)
        })
      AppActions.setAgentCollectorEditModalVisible(false)
    }else{
      var tip = 'Validate error: \n'
      result.forEach(field => tip += validates[field].msg + '\n')
      alert(tip)
    }

  }

  onEditCancel() {
    AppActions.clearCurrentAgentCollector()
    AppActions.setAgentCollectorEditModalVisible(false)
  }

  onItemDelete(e) {
    let name = e.target.dataset.name
    let id = e.target.dataset._id
    confirm({
      title: 'Confirm Delete',
      content: 'Are you sure to delete ' +  name  +' ('+  id  + ' ) ?',
      onOk: this.onDeleteOk,
      onCancel: this.onDeleteCancel
    })
    AppActions.getAgentCollector(name)
  }

  onDeleteOk() {
    AppActions.deleteAgentCollector.triggerAsync()
      .then(() => {
        AppActions.clearCurrentAgentCollector()
        return AppActions.listAgentCollector()
      })
      .catch(err => {
        console.log(err)
      })
  }

  onDeleteCancel() {
    AppActions.clearCurrentAgentCollector()
  }


  render() {

    let antdTableColumns = [
      {
        title: "ID",
        key:"ID",
        dataIndex: '_id',
        sorter: (a, b) => {
          var sa = a._id.split('').reduce((s, v) => s += v.charCodeAt(), 0)
          var sb = b._id.split('').reduce((s, v) => s += v.charCodeAt(), 0)
          if (sa === sb) {
            return a._id - b._id
          }
          return sa - sb
        }
      },
      {
        title: 'Name',
        key:"Name",
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
        key:"Date",
        sorter: (a, b) => a.ts - b.ts,
        dataIndex: 'ts',
        render: (ts) => {
          let d = new Date(parseInt(ts)).toLocaleString()
          return d
        }
      },
      {
        title: 'Category',
        key:"Category",
        dataIndex: 'category',
      },
      {
        title: 'Parameter',
        key:"Parameter",
        dataIndex: 'param'
      },
      {
        title: 'Encoding',
        key:"Encoding",
        dataIndex: 'encoding'
      },
      {
        title: 'Channel',
        key:"Channel",
        dataIndex: 'channel'
      },
      {
        title: 'Description',
        key:"Description",
        render: (text, record) => (
          <Popover content = {record.desc} title = "Description">
            <Icon type = "eye"></Icon>
          </Popover>
        )
      },
      {
        title: 'Operation',
        key:"Operation",
        render: (text, record) => (
          <span>
            <a href="#" onClick={this.onItemEdit.bind(this)} data-name={record.name} >Edit</a>
            <span className="ant-divider"></span>
            <a href="#" onClick={this.onItemDelete.bind(this)} data-name={record.name} data-_id={record._id} >Delete</a>
          </span>
        )
      }
    ]

    let antdTable = <Table rowKey = {line => line._id}
                           columns = {antdTableColumns}
                           dataSource = {this.props.appStore.agentCollectorList}
                           loading = {this.props.appStore.agentCollectorLoadingFlag}
    />

    const { getFieldProps } = this.props.form

    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 18}
    }
    const formItemLayoutSelect = {
      labelCol: {span: 9},
      wrapperCol: {span: 15}
    }


  // add agentCollector
    let antdFormAdd = <Form horizonal form = {this.props.form}>

      <FormItem {...formItemLayout} label = "Name" required help = "name is required">
        <Input {...getFieldProps('name', {})} type = "text" autoComplete = "off" />
      </FormItem>

      <FormItem {...formItemLayout} label = "Parameter" required help = "parameter is required">
        <Input {...getFieldProps('param', {})} type = "text" autoComplete = "off" />
      </FormItem>

      <Row>
        <Col span = "11" offset = "2" >
          <FormItem {...formItemLayoutSelect} label = "Encoding" className = "selectEncoding">
            <Select {...getFieldProps('encoding',{})}>
              <Option value="UTF-8" key="UTF-8">UTF-8</Option>
              <Option key="ASCII">ASCII</Option>
              <Option key="GB2312">GB2312</Option>
              <Option key="GBK">GBK</Option>
              <Option key="GB18030">GB18030</Option>
              <Option key="Big5">Big5</Option>
              <Option key="Big5-HKSCS">Big5-HKSCS</Option>
              <Option key="Shift_JIS">Shift_JIS</Option>
              <Option key="EUC-JP">EUC-JP</Option>
              <Option key="UTF-16LE">UTF-16LE</Option>
              <Option key="UTF-16BE">UTF-16BE</Option>
              <Option key="binary">binary</Option>
              <Option key="base64">base64</Option>
              <Option key="hex">hex</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span = "11">
          <FormItem {...formItemLayoutSelect} label = "Channel">
            <Select {...getFieldProps('channel', {})}>
              <Option key = "Redis PubSub" > Redis PubSub </Option>
              <Option key = "Nanomsg Queue" > Nanomsg Queue </Option>
            </Select>
          </FormItem>
        </Col>
      </Row>

      <FormItem {...formItemLayout} label = "Description" required help = "description is required">
        <Input {...getFieldProps('desc', {})} type = "textarea" rows = "3" autoComplete = "off" />
      </FormItem>

    </Form>


  //edit agentCollector
    let antdFormEdit = <Form horizonal form = {this.props.form} className = "editAgentCollector">

      <FormItem {...formItemLayout} label = "ID">
        <span {...getFieldProps('_id', {})}>{this.props.appStore.agentCollector._id}</span>
      </FormItem>

      <FormItem {...formItemLayout} label = "Name">
        <span {...getFieldProps('name', {})}>{this.props.appStore.agentCollector.name}</span>
      </FormItem>

      <FormItem {...formItemLayout} label = "Parameter" required help = "parameter is required">
        <Input {...getFieldProps('param', {})} type = "text" autoComplete = "off" />
      </FormItem>

      <Row>
        <Col span = "11" offset = "2" >
          <FormItem {...formItemLayoutSelect} label = "Encoding" className = "selectEncoding">
            <Select {...getFieldProps('encoding', {})}>
              <Option key="UTF-8" value="UTF-8">UTF-8</Option>
              <Option key="ASCII">ASCII</Option>
              <Option key="GB2312">GB2312</Option>
              <Option key="GBK">GBK</Option>
              <Option key="GB18030">GB18030</Option>
              <Option key="Big5">Big5</Option>
              <Option key="Big5-HKSCS">Big5-HKSCS</Option>
              <Option key="Shift_JIS">Shift_JIS</Option>
              <Option key="EUC-JP">EUC-JP</Option>
              <Option key="UTF-16LE">UTF-16LE</Option>
              <Option key="UTF-16BE">UTF-16BE</Option>
              <Option key="binary">binary</Option>
              <Option key="base64">base64</Option>
              <Option key="hex">hex</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span = "11">
          <FormItem {...formItemLayoutSelect} label = "Channel">
            <Select {...getFieldProps('channel', {})}>
              <Option value = "Redis PubSub" > Redis PubSub </Option>
              <Option value = "Nanomsg Queue" > Nanomsg Queue </Option>
            </Select>
          </FormItem>
        </Col>
      </Row>

      <FormItem {...formItemLayout} label = "Description" required help = "description is required">
        <Input {...getFieldProps('desc', {})} type = "textarea" rows = "3" autoComplete = "off" />
      </FormItem>

    </Form>


    return (
      <div className = "container">
        <Modal
          title = "Add AgentCollector"
          visible = {this.props.appStore.agentCollectorAddModalVisible}
          onOk = {this.onAddOk.bind(this)}
          onCancel = {this.onAddCancel}
        >
          {antdFormAdd}
        </Modal>

        <Modal
          title = "Edit AgentCollector"
          visible = {this.props.appStore.agentCollectorEditModalVisible}
          onOk = {this.onEditOk.bind(this)}
          onCancel = {this.onEditCancel}
        >
          {antdFormEdit}
        </Modal>

        <div className = "row clbody addAgentCollector">
          <div className = "ant-col-sm24 p-t-10 addAgentCollector">
            <Button type = "primary" icon = "plus-circle-o" onClick = {this.onItemAdd}/>
          </div>
        </div>

        <div className = "row clbody tableAgentCollector">
          <div className = "ant-col-sm-24 p-t-10 ">
            { antdTable }
          </div>
        </div>

      </div>
    )
  }
}


AgentCollector.propTypes = {
  appStore: React.PropTypes.object
}

AgentCollector.defaultProps = {

}

// 1. in createForm, bind appStore prop to form bi-directionally
AgentCollector = createForm({
  onFieldsChange: function (props, fields) {
    // actually we don't care about props in reflux, just call AppActions to update state
    console.log('onFieldsChange', props, fields)

    let stateObj = {}
    for (let field in fields) {
      stateObj[fields[field].name] = fields[field].value
    }

  //name of AgentCollector can not be the same !
    if (fields.hasOwnProperty('name')) {
      existSameName = props.appStore.agentCollectorList.every (AgentCollector => {
        return AgentCollector.name !== fields['name'].value
      })
    }


  //param  des and name can not be blank
    if(fields.hasOwnProperty('name')){
      validates.name.status = !!fields['name'].value
    }
    if(fields.hasOwnProperty('param')){
      validates.param.status = !!fields['param'].value
    }
    if(fields.hasOwnProperty('desc')) {
      validates.desc.status = !!fields['desc'].value
    }

    AppActions.updateCurrentAgentCollector(stateObj)
  },
  mapPropsToFields: (props) => {
    console.log('mapPropsToFieldsAgent', props)
    // set defaultValue
    if (!props.appStore.agentCollector.encoding) {
      props.appStore.agentCollector.encoding = 'UTF-8'
    }
    if (!props.appStore.agentCollector.channel) {
      props.appStore.agentCollector.channel = 'Redis PubSub'
    }

    return {
      _id: {name: '_id', value: props.appStore.agentCollector._id},
      name: {name: 'name', value: props.appStore.agentCollector.name},
      category: {name: 'category', value: props.appStore.agentCollector.category},
      encoding: {name: 'encoding', value: props.appStore.agentCollector.encoding},
      channel: {name: 'channel', value: props.appStore.agentCollector.channel},
      param: {name: 'param', value: props.appStore.agentCollector.param},
      desc: {name: 'desc', value: props.appStore.agentCollector.desc}
    }
  }
})(AgentCollector)

// 2. connect AgentCollector with AppStore, so AgentCollector has a prop named appStore
const AgentCollectorConnect = refluxConnect({
  appStore: AppStore
})(state => {

  return {
    appStore: state.appStore
  }
}, null, null, {pure: false})
AgentCollector = AgentCollectorConnect(AgentCollector)

export default AgentCollector
