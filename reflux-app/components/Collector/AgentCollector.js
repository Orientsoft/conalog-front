import React from "react"
import refluxConnect from 'reflux-connect'
import AppActions from '../../actions/AppActions'
import AppStore from '../../stores/AppStore'
import _ from 'lodash'
import { Row, Col } from 'antd';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

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
const InputGroup = Input.Group;
let validates
let checkName
let existSameName

class AgentCollector extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectContent:'name',
      searchContent:'',
      agentCollector:{},
      agentCollectorList:[],
      agentCollectorListAll:[],
      delete:"",
      delmsg:""
    }
  }

  componentDidMount() {
    this.unsubscribe = AppStore.listen(function(state) {
      this.setState(state);
    }.bind(this));

    AppActions.listAgentCollector()
  }

  componentWillUnmount() {
    if (_.isFunction(this.unsubscribe))
      this.unsubscribe();
  }

  onItemAdd() {
    checkName = false;
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
    if (!result.length && existSameName && checkName) {
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
    if(validates.name.status && !checkName){
      alert('Name of collector should begin with a letter!')
    }
  }

  onAddCancel() {
    AppActions.clearCurrentAgentCollector()
    AppActions.setAgentCollectorAddModalVisible(false)
  }

  onItemEdit(e) {
    var t = e.target
    if (t.tagName.toLowerCase() == 'span') {
      t = t.parentElement
    }

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
    let name = t.dataset.name
    AppActions.setAgentCollectorEditModalVisible(true)
    AppActions.getAgentCollector(name, (ac) => {
      validates.param.status = !!ac.param
      validates.desc.status = !!ac.desc
    })
  }

  onEditOk() {
    AppActions.saveAgentCollector.triggerAsync()
      .then(() => {
        AppActions.clearCurrentAgentCollector()
        return AppActions.listAgentCollector()
      })
      .catch(err => {
        console.log(err)
      })
    AppActions.setAgentCollectorEditModalVisible(false)
  }

  onEditCancel() {
    AppActions.clearCurrentAgentCollector()
    AppActions.setAgentCollectorEditModalVisible(false)
  }

  onItemDelete(e) {
    var t = e.target
    if (t.tagName.toLowerCase() == 'span') {
      t = t.parentElement
    }
    let name = t.dataset.name
    let id = t.dataset._id
    confirm({
      title: this.state.delete,
      content: this.state.delmsg +  name  +' ('+  id  + ' ) ?',
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

  handleSelect (e) {
    this.setState({
      selectContent: e
    })
  }

  handleFilterChange(e) {
    this.state.searchContent = e.target.value
    this.state.agentCollectorList =  this.state.agentCollectorListAll
  }


  handleSearch(e) {
    if(this.state.searchContent == ""){
      AppActions.listAgentCollector();
    }else {
      var replaceList = this.state.agentCollectorListAll;
      var searchContent = [];

      if(this.state.selectContent == "name"){
        for( var i = 0; i<replaceList.length; i++) {
          if (replaceList[i].name.indexOf(this.state.searchContent) !== -1) {
            searchContent.push(replaceList[i])
          }
        }
      }else{
        for( var i = 0; i<replaceList.length; i++) {
          if (replaceList[i].param.indexOf(this.state.searchContent) !== -1) {
            searchContent.push(replaceList[i])
          }
        }
      }

      this.setState({
        agentCollectorList: searchContent
      })
    }
  }


  render() {
    let a = <FormattedMessage id = 'home'/>
    let name = a._owner._context.intl.messages.name
    let date = a._owner._context.intl.messages.date
    let category = a._owner._context.intl.messages.category
    let type = a._owner._context.intl.messages.types
    let host = a._owner._context.intl.messages.host
    let command = a._owner._context.intl.messages.command
    let operation = a._owner._context.intl.messages.operation
    let parameter = a._owner._context.intl.messages.para
    let encod = a._owner._context.intl.messages.encod
    let channel = a._owner._context.intl.messages.channel
    let description = a._owner._context.intl.messages.des
    let add = a._owner._context.intl.messages.adding
    let edit = a._owner._context.intl.messages.edit
    this.state.delete = a._owner._context.intl.messages.comfirmDel
    this.state.delmsg = a._owner._context.intl.messages.delMessage


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
        title: name,
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
        title: date,
        key:"Date",
        sorter: (a, b) => a.ts - b.ts,
        dataIndex: 'ts',
        render: (ts) => {
          let d = new Date(parseInt(ts)).toLocaleString()
          return d
        }
      },
      {
        title: category,
        dataIndex: 'category',
      },
      {
        title: parameter,
        dataIndex: 'param',
        className:"parameterWidth"
      },
      {
        title: encod,
        dataIndex: 'encoding'
      },
      {
        title: channel,
        dataIndex: 'channel'
      },
      {
        title: description,
        render: (text, record) => (
          <Popover content = {record.desc} title = "Description" overlayStyle={{maxWidth:'300px',wordWrap:'break-word'}}>
            <i  className="anticon icon-eye  collectorIconEye " ></i>
          </Popover>
        )
      },
      {
        title: operation,
        render: (text, record) => (
          <span>
            <a href="#" onClick={this.onItemEdit.bind(this)} data-name={record.name} ><FormattedMessage id="edit"/></a>
            <span className="ant-divider"></span>
            <a href="#" onClick={this.onItemDelete.bind(this)} data-name={record.name} data-_id={record._id} ><FormattedMessage id="del"/></a>
          </span>
        )
      }
    ]

    let antdTable = <Table rowKey = {line => line._id}
                           columns = {antdTableColumns}
                           dataSource = {this.state.agentCollectorList}
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
    const buttonClass = classNames({
      'ant-search-btn': true,
    })
    const searchClass = classNames({
      'ant-search-input': true,
    })


    // add agentCollector
    let antdFormAdd = <Form horizonal form = {this.props.form}>


      <FormItem {...formItemLayout} label = {name} required >
        <Input {...getFieldProps('name', {})} type = "text" autoComplete = "off" />
      </FormItem>

      <FormItem {...formItemLayout} label = {parameter}  required  >
        <Input {...getFieldProps('param', {})} type = "text" autoComplete = "off" />
      </FormItem>

      <Row>
        <Col span = "11" offset = "2" >
          <FormItem {...formItemLayoutSelect} label = {encod} className = "selectEncoding" required>
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
          <FormItem {...formItemLayoutSelect} label = {channel} required>
            <Select {...getFieldProps('channel', {})}>
              <Option key = "Redis PubSub" > Redis PubSub </Option>
              <Option key = "Nsq Queue" > Nsq Queue </Option>
            </Select>
          </FormItem>
        </Col>
      </Row>

      <FormItem {...formItemLayout} label = {description} required >
        <Input {...getFieldProps('desc', {})} type = "textarea" rows = "3" autoComplete = "off" />
      </FormItem>

    </Form>


    //edit agentCollector
    let antdFormEdit = <Form horizonal form = {this.props.form} className = "editAgentCollector">

      <FormItem {...formItemLayout} label = "ID">
        <span {...getFieldProps('_id', {})}>{this.props.appStore.agentCollector._id}</span>
      </FormItem>

      <FormItem {...formItemLayout} label = {name}>
        <span {...getFieldProps('name', {})}>{this.props.appStore.agentCollector.name}</span>
      </FormItem>

      <FormItem {...formItemLayout} label = {parameter} required >
        <Input {...getFieldProps('param', {})} type = "text" autoComplete = "off" />
      </FormItem>

      <Row>
        <Col span = "11" offset = "2" >
          <FormItem {...formItemLayoutSelect} label = {encod} className = "selectEncoding">
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
          <FormItem {...formItemLayoutSelect} label = {channel}>
            <Select {...getFieldProps('channel', {})}>
              <Option value = "Redis PubSub" > Redis PubSub </Option>
              <Option value = "Nsq Queue" > Nsq Queue </Option>
            </Select>
          </FormItem>
        </Col>
      </Row>

      <FormItem {...formItemLayout} label = {description} required >
        <Input {...getFieldProps('desc', {})} type = "textarea" rows = "3" autoComplete = "off" />
      </FormItem>

    </Form>

    return (
      <div className = "container">
        <Modal
          title = {add}
          visible = {this.props.appStore.agentCollectorAddModalVisible}
          onOk = {this.onAddOk.bind(this)}
          onCancel = {this.onAddCancel}
        >
          {antdFormAdd}
        </Modal>

        <Modal
          title = {edit}
          visible = {this.props.appStore.agentCollectorEditModalVisible}
          onOk = {this.onEditOk.bind(this)}
          onCancel = {this.onEditCancel}
        >
          {antdFormEdit}
        </Modal>

        <div className = "row clbody addAgentCollector">
          <div className = "ant-col-sm24 p-t-10 addAgentCollector">
            <Button type = "primary" icon="anticon icon-pluscircleo" onClick = {this.onItemAdd}/>
          </div>
        </div>


        <div className="row clbody tableAgentCollector">
          <div className="ant-col-sm-4 p-t-10 p-b-10 pull-right CollectorSelect">
            <div className="ant-search-input-wrapper ">
              <div className="selectDiv">
                <Select className="searchSelect" placeholder={name} onChange={this.handleSelect.bind(this)}>
                  <Option value="name" selected> {name} </Option>
                  <Option value="parameter"> {parameter} </Option>
                </Select>
              </div>
              <InputGroup className={searchClass}>
                <Input  data-name="name" onChange={this.handleFilterChange.bind(this)} onPressEnter={this.handleSearch.bind(this)} />
                <div className="ant-input-group-wrap">
                  <Button icon="anticon icon-search1" data-name="name" className={buttonClass}
                          onClick={this.handleSearch.bind(this)}/>
                </div>
              </InputGroup>
            </div>
          </div>
          <div className="ant-col-sm-24 p-t-10 ">
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

    //check the first character of name
    if (fields.hasOwnProperty('name')){
      if(fields['name'].value){
        let reg= /^[A-Za-z]+$/
        if(reg.test(fields['name'].value.substring(0,1))){
          checkName = true
        }
      }
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
    // console.log('mapPropsToFieldsAgent', props)
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
