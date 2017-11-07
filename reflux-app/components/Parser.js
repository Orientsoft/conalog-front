import React from "react"
import refluxConnect from 'reflux-connect'
import AppActions from '../actions/AppActions'
import AppStore from '../stores/AppStore'
import _ from 'lodash'
import { Row, Col, Cascader } from 'antd';
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl';

let Table = require('antd/lib/table')
let Input = require('antd/lib/input')
let Button = require('antd/lib/button')
let Modal = require('antd/lib/modal')
let Form = require('antd/lib/form')
let Select = require('antd/lib/select')
let Popover= require('antd/lib/popover')
// let Icon = require('antd/lib/icon')
let Menu = require('antd/lib/menu')
let Dropdown = require('antd/lib/dropdown')
let existSameName;
let validates;
let parser = '';
let cert = '';
let channel = '';

const confirm = Modal.confirm;
const createForm = Form.create;
const FormItem = Form.Item;
const Option = Select.Option;
const InputGroup = Input.Group;
const SubMenu = Menu.SubMenu;

class Parser extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      delete:"",
      delmsg:"",
      certList:[]
    }
  }

  componentDidMount() {
    this.unsubscribe = AppStore.listen(function(state) {
      this.setState(state);
    }.bind(this));

    AppActions.listCert().then( () => { console.log("componentDidMount",this.state.certList)})
    AppActions.listParser();
    AppActions.listParserScripts();
    AppActions.getAllCollector();
  }

  componentWillUnmount() {
    if (_.isFunction(this.unsubscribe))
      this.unsubscribe();
  }

  onItemAdd() {
    parser = ''
    channel = ''
    existSameName = true;
    validates = {
      name: {
        msg: 'name  can\'t be empty',
        status: false
      },
      path:{
        msg: 'path can\'t be empty',
        status: false
      },
      host:{
        msg: 'host can\'t be empty',
        status: false
      },
      inputChannel:{
        msg: 'inputChannel can\'t be empty',
        status: false
      },
      outputChannel:{
        msg: 'outputChannel can\'t be empty',
        status: false
      },
      remark: {
        msg: 'remark can\'t be empty',
        status: false
      }
    }
    AppActions.clearCurrentParser()
    AppActions.setParserAddModalVisible(true)
  }

  onAddOk() {
    var result = Object.keys(validates).filter(field => validates[field].status === false)
    if (!result.length && existSameName) {
      AppActions.saveCurrentParser.triggerAsync()
        .then(() => {
          AppActions.clearCurrentParser()
          return AppActions.listParser()
        })
        .catch(err => {
          console.log(err)
        })
      AppActions.setParserAddModalVisible(false)
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
    AppActions.clearCurrentParser()
    AppActions.setParserAddModalVisible(false)
  }

  onItemEdit(e) {
    var t = e.target
    if (t.tagName.toLowerCase() == 'span') {
      t = t.parentElement
    }
    let name = t.dataset.name
    AppActions.setParserEditModalVisible(true)
    AppActions.getParser(name)
  }

  onEditOk() {
    AppActions.saveCurrentParser.triggerAsync()
      .then(() => {
        AppActions.clearCurrentParser()
        return AppActions.listParser()
      })
      .catch(err => {
        console.log(err)
      })
    AppActions.setParserEditModalVisible(false)
  }

  onEditCancel() {
    AppActions.clearCurrentParser()
    AppActions.setParserEditModalVisible(false)
  }

  onItemDelete(e) {
    var t = e.target
    if (t.tagName.toLowerCase() == 'span') {
      t = t.parentElement
    }
    let name = t.dataset.name
    let id = t.dataset.id
    confirm({
      title: this.state.delete,
      content: this.state.delmsg +  name  +' ('+  id  + ' ) ?',
      onOk: this.onDeleteOk,
      onCancel: this.onDeleteCancel
    })
    AppActions.getParser(name)
  }

  onDeleteOk() {
    AppActions.deleteCurrentParser.triggerAsync()
      .then(() => {
        AppActions.clearCurrentParser()
        return AppActions.listParser()
      })
      .catch(err => {
        console.log(err)
      })
  }

  onDeleteCancel() {
    AppActions.clearCurrentParser()
  }

  selectParser(e){
    parser = e.key
    console.log("value:",parser)
    if(parser){
      validates.path.status = !!parser
      AppActions.updateCurrentParser({
        path: parser
      })
      e.selectedKeys.length = 0
    }
  }

  selectcert(e){
    cert = e.key
    console.log("value:",cert)
    if(cert){
      validates.host.status = !!cert
      AppActions.updateCurrentParser({
        host: cert
      })
      e.selectedKeys.length = 0
    }
  }

  selectInputChannel(e){
    channel = e.key
    console.log(channel)
    if(channel){
      validates.inputChannel.status = !!channel
      AppActions.updateCurrentParser({
        inputChannel: channel
      })
      e.selectedKeys.length = 0
    }
  }


  render() {
    let a = <FormattedMessage id = 'home'/>
    let name = a._owner._context.intl.messages.name
    let date = a._owner._context.intl.messages.date
    let path = a._owner._context.intl.messages.path
    let type = a._owner._context.intl.messages.types
    let inputType = a._owner._context.intl.messages.inputType
    let outputType = a._owner._context.intl.messages.outputType
    let operation = a._owner._context.intl.messages.operation
    let parameter = a._owner._context.intl.messages.para
    let host = a._owner._context.intl.messages.host
    let inputChannel = a._owner._context.intl.messages.inputChannel
    let channel = a._owner._context.intl.messages.channel
    let outputChannel = a._owner._context.intl.messages.outputChannel
    let add = a._owner._context.intl.messages.adding
    let edit = a._owner._context.intl.messages.edit
    let remark = a._owner._context.intl.messages.remark
    this.state.delete = a._owner._context.intl.messages.comfirmDel
    this.state.delmsg = a._owner._context.intl.messages.delMessage
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
        sorter: (a, b) => a.ts - b.ts,
        dataIndex: 'ts',
        render: (ts) => {
          let d = new Date(parseInt(ts)).toLocaleString()
          return d
        }
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
        title: remark,
        render: (text, record) => (
          <Popover content = {record.remark} title = {remark} overlayStyle={{maxWidth:'300px',wordWrap:'break-word'}}>
            <i className="parserIconEye  anticon icon-eye"  ></i>
          </Popover>
        )
      },
      {
        title: operation,
        render: (text, record) => (
          <span>
            <a href="#" onClick={this.onItemEdit.bind(this)} data-name={record.name} ><FormattedMessage id="edit"/></a>
            <span className="ant-divider"></span>
            <a href="#" onClick={this.onItemDelete.bind(this)} data-name={record.name} data-id={record.id} ><FormattedMessage id="del"/></a>
          </span>
        )
      }
    ]

    let antdTable = <Table rowKey = {line => line.id}
                           columns = {antdTableColumns}
                           dataSource = {this.props.appStore.parserList}
                           loading = {this.props.appStore.parserLoadingFlag}
    />

    const { getFieldProps } = this.props.form

    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 18}
    }
    const formItemLayoutSelect = {
      labelCol: {span: 12},
      wrapperCol: {span: 12}
    }
    const formItemLayoutSelect2 = {
      labelCol: {span: 4},
      wrapperCol: {span: 20}
    }


    //path option
    let createParserOptions = () => {
      return this.props.appStore.parserScriptsList.map( (parser,index) => {
        return <Menu.Item key={parser}>{parser}</Menu.Item>
      })
    }
    let parserOptions = createParserOptions()
    let pathMenu = <Menu onSelect={this.selectParser.bind(this)} style = {{overflow: 'scroll',height:'300px'}}>
      {parserOptions}
    </Menu>

    // host option
    let createHostOptions = () => {
      return this.props.appStore.certList.map( (item,index) => {
        return <Menu.Item key={item.user+"@"+item.host+":"+item.port}>{item.user+"@"+item.host+":"+item.port}</Menu.Item>
      })
    }
    let hostOptions = createHostOptions()
    let hostMenu = <Menu onSelect={this.selectcert.bind(this)} style = {{overflow: 'scroll',height:'300px'}}>
      {hostOptions}
    </Menu>

    // inputChannel option
    let allCollectorList = this.props.appStore.allCollectorList
    let activeCollector = []
    let passiveCollector = []
    let agentCollector = []
    allCollectorList.map( (collector,index) =>{
      if(collector.category == "agent"){
        agentCollector.push(collector)
      } else if(collector.category == "active"){
        activeCollector.push(collector)
      }else{
        passiveCollector.push(collector)
      }
    })

    let createAgentOptions = () => {
      return agentCollector.map( (collector,index) => {
        return <Menu.Item key={"agc_"+collector.name}>{collector.name}</Menu.Item>
      })
    }
    let agentOptions = createAgentOptions()

    let interval = []
    let time = []
    let oneshot = []
    activeCollector.map( (collector,index) => {
      if(collector.type == "Interval"){
        interval.push(collector)
      }else if(collector.type == "Time"){
        time.push(collector)
      }else{
        oneshot.push(collector)
      }
    })

    let createIntervalOptions = () => {
      return interval.map( (collector,index) => {
        return <Menu.Item key={"ac_"+collector.name}>{collector.name}</Menu.Item>
      })
    }
    let intervalOptions = createIntervalOptions()

    let createTimeOptions = () => {
      return time.map( (collector,index) => {
        return <Menu.Item key={"ac_"+collector.name}>{collector.name}</Menu.Item>
      })
    }
    let timeOptions = createTimeOptions()

    let createOneshotOptions = () => {
      return oneshot.map( (collector,index) => {
        return <Menu.Item key={"ac_"+collector.name}>{collector.name}</Menu.Item>
      })
    }
    let oneshotOptions = createOneshotOptions()


    let fileTail = []
    let longScript = []
    passiveCollector.map( (collector,index) => {
      if(collector.type == "FileTail"){
        fileTail.push(collector)
      }else {
        longScript.push(collector)
      }
    })

    let createFileTailOptions = () => {
      return fileTail.map( (collector,index) => {
        return <Menu.Item key={"pc_"+collector.name}>{collector.name}</Menu.Item>
      })
    }
    let fileTailOptions = createFileTailOptions()

    let createLongScriptOptions = () => {
      return longScript.map( (collector,index) => {
        return <Menu.Item key={"pc_"+collector.name}>{collector.name}</Menu.Item>
      })
    }
    let longScriptOptions = createLongScriptOptions()

    const InputChannelmenu = (
      <Menu onSelect={this.selectInputChannel.bind(this)} style={{height:"200px",overflowY:"scroll"}}>
        <SubMenu title="Active">
          <SubMenu title="Interval">{intervalOptions}</SubMenu>
          <SubMenu title="Time" >{timeOptions}</SubMenu>
          <SubMenu title="OneShot">{oneshotOptions}</SubMenu>
        </SubMenu>
        <SubMenu title="Passive">
          <SubMenu title="LongScript">{longScriptOptions}</SubMenu>
          <SubMenu title="FileTail">{fileTailOptions}</SubMenu>
        </SubMenu>
        <SubMenu title="Agent">{agentOptions}</SubMenu>
      </Menu>
    );



// add parser
    let antdFormAdd = <Form horizonal form = {this.props.form}>

      <FormItem {...formItemLayout} label = {name} required >
        <Input {...getFieldProps('name', {})} type = "text" autoComplete = "off" placeholder="name is required"/>
      </FormItem>

      <FormItem {...formItemLayout} label = {host}  required >
        <Row>
          <Col span="2">
            <Dropdown overlay={hostMenu} trigger={['click']}>
              <Button>
                <i className="anticon icon-down" />
              </Button>
            </Dropdown>
          </Col>
          <Col span="20" offset = "2">
            <Input {...getFieldProps('host', {})}   type = "text" autoComplete = "off"  placeholder="host is required" />
          </Col>
        </Row>
      </FormItem>

      <FormItem {...formItemLayout} label = {path} required >
        <Row>
          <Col span="2">
            <Dropdown overlay={pathMenu} trigger={['click']}>
              <Button>
                <i className="anticon icon-down"/>
              </Button>
            </Dropdown>
          </Col>
          <Col span="20" offset = "2">
            <Input {...getFieldProps('path', {})}   type = "text" autoComplete = "off"  placeholder="path is required" />
          </Col>
        </Row>
      </FormItem>


      <FormItem {...formItemLayout} label = {parameter} >
        <Input {...getFieldProps('parameter', {})} type = "text" autoComplete = "off"/>
      </FormItem>

      <Row>
        <Col span = "12"  >
          <FormItem {...formItemLayoutSelect} label = {inputType} required >
            <Select {...getFieldProps('inputType', {})}>
              <Option value = "RedisChannel" > RedisChannel </Option>
              <Option value = "Nsq Queue" > Nsq Queue </Option>
            </Select>
          </FormItem>
        </Col>
        <Col span = "12"  >
          <FormItem {...formItemLayoutSelect} label = {outputType} required >
            <Select {...getFieldProps('outputType', {})}>
              <Option value = "RedisChannel" > RedisChannel </Option>
              <Option value = "Nsq Queue" > Nsq Queue </Option>
            </Select>
          </FormItem>
        </Col>
      </Row>

      <FormItem {...formItemLayout} label = {inputChannel}  required>
        <Row>
          <Col span="2">
            <Dropdown overlay={InputChannelmenu} trigger={['click']}>
              <Button>
                <i className="anticon icon-down" />
              </Button>
            </Dropdown>
          </Col>
          <Col span="20" offset = "2">
            <Input {...getFieldProps('inputChannel', {})} type = "text" autoComplete = "off" placeholder="inputChannel is required" />
          </Col>
        </Row>
      </FormItem>

      <FormItem {...formItemLayout} label = {outputChannel}  required>
        <Input {...getFieldProps('outputChannel', {})} type = "text" autoComplete = "off" placeholder="outputChannel is required" />
      </FormItem>

      <FormItem {...formItemLayout} label = {remark} required >
        <Input {...getFieldProps('remark', {})} type = "textarea" rows="3" autoComplete = "off" placeholder="remark is required"/>
      </FormItem>

    </Form>


//edit parser
    let antdFormEdit = <Form horizonal form = {this.props.form}>

      <FormItem {...formItemLayout} label = "ID">
        <span {...getFieldProps('id', {})}>{this.props.appStore.parser.id}</span>
      </FormItem>

      <FormItem {...formItemLayout} label = {name}>
        <span {...getFieldProps('name', {})}>{this.props.appStore.parser.name}</span>
      </FormItem>

      <FormItem {...formItemLayout} label = {host}   >
        <Row>
          <Col span="2">
            <Dropdown overlay={hostMenu} trigger={['click']}>
              <Button>
                <i className="anticon icon-down" />
              </Button>
            </Dropdown>
          </Col>
          <Col span="20" offset = "2">
            <Input {...getFieldProps('host', {})}   type = "text" autoComplete = "off"   />
          </Col>
        </Row>
      </FormItem>

      <FormItem {...formItemLayout} label = {path}>
        <Row>
          <Col span="2">
            <Dropdown overlay={pathMenu} trigger={['click']}>
              <Button>
                <i className="anticon icon-down" />
              </Button>
            </Dropdown>
          </Col>
          <Col span="20" offset = "2">
            <Input {...getFieldProps('path', {})}   type = "text" autoComplete = "off" />
          </Col>
        </Row>
      </FormItem>

      <FormItem {...formItemLayout} label = {parameter}>
        <Input {...getFieldProps('parameter', {})} type = "text" autoComplete = "off" />
      </FormItem>

      <Row>
        <Col span = "12"  >
          <FormItem {...formItemLayoutSelect} label = {inputType}  >
            <Select {...getFieldProps('inputType', {})}>
              <Option value = "RedisChannel" > RedisChannel </Option>
              <Option value = "Nsq Queue" > Nsq Queue </Option>
            </Select>
          </FormItem>
        </Col>
        <Col span = "12"  >
          <FormItem {...formItemLayoutSelect} label = {outputType} >
            <Select {...getFieldProps('outputType', {})}>
              <Option value = "RedisChannel" > RedisChannel </Option>
              <Option value = "Nsq Queue" > Nsq Queue </Option>
            </Select>
          </FormItem>
        </Col>
      </Row>

      <FormItem {...formItemLayout} label = {inputChannel}>
        <Row>
          <Col span="2">
            <Dropdown overlay={InputChannelmenu} trigger={['click']} >
              <Button>
                <i className="anticon icon-down"/>
              </Button>
            </Dropdown>
          </Col>
          <Col span="20" offset = "2">
            <Input {...getFieldProps('inputChannel', {})} type = "text" autoComplete = "off"  />
          </Col>
        </Row>
      </FormItem>

      <FormItem {...formItemLayout} label = {outputChannel} >
        <Input {...getFieldProps('outputChannel', {})} type = "text" autoComplete = "off"  />
      </FormItem>

      {/*// <Row>*/}
        {/*<Col span = "11" offset = "2" >*/}
          {/*<FormItem {...formItemLayoutSelect} label = "InputChannel" className = "selectType">*/}
            {/*<Input {...getFieldProps('inputChannel', {})} type = "text" autoComplete = "off" />*/}
          {/*</FormItem>*/}
        {/*</Col>*/}

        {/*<Col span = "11">*/}
          {/*<FormItem {...formItemLayoutSelect} label = "InputType" >*/}
            {/*<Select {...getFieldProps('inputType', {})}>*/}
              {/*<Option value = "RedisChannel" > RedisChannel </Option>*/}
              {/*<Option value = "Nsq Queue" > Nsq Queue </Option>*/}
            {/*</Select>*/}
          {/*</FormItem>*/}
        {/*</Col>*/}
      {/*</Row>*/}

      {/*<Row>*/}
        {/*<Col span = "11" offset = "2" >*/}
          {/*<FormItem {...formItemLayoutSelect} label = "OutputChannel" className = "selectType">*/}
            {/*<Input {...getFieldProps('outputChannel', {})} type = "text" autoComplete = "off" />*/}
          {/*</FormItem>*/}
        {/*</Col>*/}

        {/*<Col span = "11">*/}
          {/*<FormItem {...formItemLayoutSelect} label = "OutputType">*/}
            {/*<Select {...getFieldProps('outputType', {})}>*/}
              {/*<Option value = "RedisChannel" > RedisChannel </Option>*/}
              {/*<Option value = "Nsq Queue" > Nsq Queue </Option>*/}
            {/*</Select>*/}
          {/*</FormItem>*/}
        {/*</Col>*/}
      {/*</Row>*/}

      <FormItem {...formItemLayout} label = {remark}>
        <Input {...getFieldProps('remark', {})} type = "textarea" rows = "3" autoComplete = "off" />
      </FormItem>

    </Form>



    return (
      <div className = "container">
        <Modal
          title = {add}
          visible = {this.props.appStore.parserAddModalVisible}
          onOk = {this.onAddOk}
          onCancel = {this.onAddCancel}
          className = "antdFormAdd"
        >
          {antdFormAdd}
        </Modal>

        <Modal
          title ={edit}
          visible = {this.props.appStore.parserEditModalVisible}
          onOk = {this.onEditOk}
          onCancel = {this.onEditCancel}
          className = "antdFormEdit"
        >
          {antdFormEdit}
        </Modal>

        <div className = "row clbody">
          <div className = "ant-col-sm24 p-t-10">
            <Button type = "primary" icon = "anticon icon-pluscircleo" onClick = {this.onItemAdd}/>
          </div>
        </div>

        <div className = "row clbody">
          <div className = "ant-col-sm-24 p-t-10">
            { antdTable }
          </div>
        </div>

      </div>
    )
  }
}


Parser.propTypes = {
  appStore: React.PropTypes.object
}

Parser.defaultProps = {

}

// 1. in createForm, bind appStore prop to form bi-directionally
Parser = createForm({
  onFieldsChange: (props, fields) => {
    // actually we don't care about props in reflux, just call AppActions to update state
    console.log('onFieldsChange', props, fields)

    let stateObj = {}
    for (let field in fields) {
      stateObj[fields[field].name] = fields[field].value
    }

//name of parser can not be the same !
    if (fields.hasOwnProperty('name')) {
      existSameName = props.appStore.parserList.every (parser => {
        return parser.name !== fields['name'].value
      })
    }

    //input can not be empty
    if(fields.hasOwnProperty('name')){
      validates.name.status = !!fields['name'].value
    }

    if(fields.hasOwnProperty('host')){
      validates.host.status = !!fields['host'].value
    }

    if(fields.hasOwnProperty('path')){
      validates.path.status = !!fields['path'].value
    }

    if(fields.hasOwnProperty('inputChannel')){
      validates.inputChannel.status = !!fields['inputChannel'].value
    }
    if(fields.hasOwnProperty('outputChannel')){
      validates.outputChannel.status = !!fields['outputChannel'].value
    }
    if(fields.hasOwnProperty('remark')) {
      validates.remark.status = !!fields['remark'].value
    }

    AppActions.updateCurrentParser(stateObj)
  },
  mapPropsToFields: (props) => {
    console.log('mapPropsToFields', props)
    // if (props.appStore.parser == {})
    //   return { }

    if (!props.appStore.parser.inputType) {
      props.appStore.parser.inputType = 'RedisChannel'
    }
    if (!props.appStore.parser.outputType) {
      props.appStore.parser.outputType = 'RedisChannel'
    }

    return {
      id: {name: 'id', value: props.appStore.parser.id},
      name: {name: 'name', value: props.appStore.parser.name},
      path: {name: 'path', value: props.appStore.parser.path},
      inputType: {name: 'inputType', value: props.appStore.parser.inputType},
      inputChannel: {name: 'inputChannel', value: props.appStore.parser.inputChannel},
      outputType: {name: 'outputType', value: props.appStore.parser.outputType},
      outputChannel: {name: 'outputChannel', value: props.appStore.parser.outputChannel},
      parameter: {name: 'parameter', value: props.appStore.parser.parameter},
      remark: {name: 'remark', value: props.appStore.parser.remark},
      host: {name: 'host', value: props.appStore.parser.host},
    }
  }
})(Parser)

// 2. connect Parser with AppStore, so Parser has a prop named appStore
const ParserConnect = refluxConnect({
  appStore: AppStore
})(state => {

  return {
    appStore: state.appStore
  }
}, null, null, {pure: false})
Parser = ParserConnect(Parser)

export default Parser
