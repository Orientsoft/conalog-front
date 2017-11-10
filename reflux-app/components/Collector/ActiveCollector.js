import React from 'react'
import { FormattedMessage } from 'react-intl';

let message = require('antd/lib/message')
let TimePicker = require('antd/lib/time-picker')
let Checkbox = require('antd/lib/checkbox')
let Modal = require('antd/lib/modal')
let Form = require('antd/lib/form')
let Tooltip = require('antd/lib/tooltip')
let Select = require('antd/lib/select')
let Input = require('antd/lib/input')
let Button = require('antd/lib/button')
let Icon = require('antd/lib/icon')

const Option = Select.Option
import AppActions from '../../actions/AppActions'
import AppStore from '../../stores/AppStore'
import _ from 'lodash'
import { Row, Col } from 'antd';
import Moment from 'moment'
import classNames from 'classnames';

const createForm = Form.create;
const FormItem = Form.Item;
const confirm = Modal.confirm;
const InputGroup = Input.Group;

class ActiveCollector extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeCollectorFlag: false,
      activeCollector: {},
      activeCollectorAdd: {},
      activeCollectorList: [],
      activeCollectorChecklist: [],
      activeCollectorEditModal: false,
      activeCollectorAddModal:false,
      activeCollectorDeleteModal: false,
      activeCollectorTime: new Date('2017-01-01 00:00:10'),
      activeCollectorAddTime: new Date('2017-01-01 00:00:10'),
      certList: [],
      selectContent:'name',
      searchContent:'',
      activeCollectorListAll:[],
      delete:"",
      delmsg:"",
    }
  }

  componentDidMount() {
    this.unsubscribe = AppStore.listen(function(state) {
      this.setState(state)
    }.bind(this))

    // get active collector & cert list
    AppActions.getActiveCollectorList()
    AppActions.listCert.triggerAsync()
      .then(() => {
      const cert = this.state.certList[0]
      console.log('this.state.activeCollectorAdd',this.state.activeCollectorAdd)
      this.setState({
        activeCollectorAdd: Object.assign(this.state.activeCollectorAdd, {

          host: '',
          trigger:this.state.activeCollectorAddTime.getTime(),
          name:'',
          type:'Interval',
          cmd:'',
          param:'',
          encoding:'UTF-8',
          channel:'Redis PubSub',
          desc:''
        })
      })
        console.log("host",this.state.activeCollectorAdd.host)
    })
  }

  componentWillUnmount() {
    if (_.isFunction(this.unsubscribe))
      this.unsubscribe();
  }

  showEditConfirm() {
    let that = this
    confirm({
      title: 'Comfirm Update',
      content: 'Are you sure to update ' + that.state.activeCollector.name + ' active collector?',
      onOk() {
        // check time
        if (that.state.activeCollectorTime == null && that.state.activeCollector.type != 'OneShot') {
          message.error('Empty trigger, please select trigger.')
          return
        }

        // console.log('saveActiveCollector', this.state.activeCollectorTime)
        // there might be some fields not set during update
        // we'd better read parameters from refs now
        that.state.activeCollector = {
          name: that.refs.nameInput.value.trim(),
          type: that.refs.typeInput.value.trim(),
          trigger: that.state.activeCollectorTime.getTime(),
          cmd: that.refs.cmdInput.value.trim(),
          param: that.refs.paramInput.value.trim(),
          host: that.refs.hostInput.value.trim(),
          encoding: that.refs.encodingInput.value.trim(),
          channel: that.refs.channelInput.value.trim(),
          desc: that.refs.descInput.value.trim()
        }

        // ok, save
        AppActions.updateActiveCollector(that.state.activeCollector)
      },
      onCancel() {
        // do nothing
      }
    })
  }

  addActiveCollector(e) {
    // console.log(e.target.dataset.field,e.target.value)
    this.setState({
      activeCollectorAdd: Object.assign(this.state.activeCollectorAdd, {
        [e.target.dataset.field]: e.target.value
      })
    })
  }

  addActiveCollectorType (e){
    this.setState({
      activeCollectorAdd: Object.assign(this.state.activeCollectorAdd, {
        "type":e})
    })
  }

  addActiveCollectorEncoding (e){
    this.setState({
      activeCollectorAdd: Object.assign(this.state.activeCollectorAdd, {
        "encoding":e})
    })
  }

  addActiveCollectorHost (e){
    this.setState({
      activeCollectorAdd: Object.assign(this.state.activeCollectorAdd, {
        "host":e})
    })
  }

  addActiveCollectorChannel (e){
    this.setState({
      activeCollectorAdd: Object.assign(this.state.activeCollectorAdd, {
        "channel":e})
    })
  }

  addTime(time) {
    this.setState({
      activeCollectorAddTime: time,
      activeCollectorAdd: Object.assign(this.state.activeCollectorAdd, {
        trigger: time.getTime()
      })
    })
  }

  onItemAdd(){

    this.setState({
      activeCollectorAdd: {
        name:'',
        type:'Interval',
        cmd:'',
        trigger:new Date('2017-01-01 00:00:10').getTime(),

        host:'',
        param:'',
        encoding:'UTF-8',
        channel:'Redis PubSub',
        desc:''
      },
      activeCollectorAddTime: new Date('2017-01-01 00:00:10')
    }, () => {
      this.refs.descInput = ''
    })
    this.setState({
      activeCollectorAddModal:true
    })
  }

  saveActiveCollector(e) {
    // AppActions.setActiveCollectorFlag(true)

    // check name
    let checkResults = this.state.activeCollectorList.map(collector => {
      if (collector.name == this.state.activeCollectorAdd.name)
        return true
      else
        return false
    })
    let checkResult = checkResults.reduce((prev, curr, idx) => {
      if (curr == true || prev == true)
        return true
      else
        return false
    }, false)

    if (checkResult == true) {
      // check failed - there's already a collector that has this name
      // pop a dialog to comfirm update
      // this.showEditConfirm()
      message.error('This name is existed!')
      return
    }
    // check time
    if (this.state.activeCollectorAddTime == null && this.state.activeCollectorAdd.type != 'OneShot') {
      message.error('Empty trigger, please select trigger.')
      return
    }

    //check activeCollectorAdd (name,param,command,host,desc can not be empty)
    var checkName = false;
    var validates = {
      name: {
        msg: 'name  can\'t be empty',
        status: false
      },
      host: {
        msg: 'host  can\'t be empty',
        status: false
      },
      command: {
        msg: 'command  can\'t be empty',
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
    if(this.state.activeCollectorAdd.name !== ''){
      validates.name.status = true
    }
    if(this.state.activeCollectorAdd.host !== ''){
      validates.host.status = true
    }
    if(this.state.activeCollectorAdd.cmd !== ''){
      validates.command.status = true
    }
    if(this.state.activeCollectorAdd.param !== ''){
      validates.param.status = true
    }
    if(this.state.activeCollectorAdd.desc !== ''){
      validates.desc.status = true
    }
    var result = Object.keys(validates).filter(field => validates[field].status === false)
    let reg= /^[A-Za-z]+$/
    if(reg.test(this.state.activeCollectorAdd.name.substring(0,1))){
      checkName = true
    }
    if(!result.length && checkName){
      this.setState({
        activeCollectorAdd: this.state.activeCollectorAdd
      }, () => {
        // ok, save
        AppActions.saveActiveCollector(this.state.activeCollectorAdd)
        this.clearActiveCollector()
      })
    }
    if(this.state.activeCollectorAdd.name && !checkName){
      message.error('Name of collector should begin with a letter!')
    }
    if(result.length){
      var tip = ''
      result.forEach(field => tip += validates[field].msg + ' \n ')
      message.error(tip)
    }

  }

  clearActiveCollector() {
    this.setState({
      activeCollectorAddModal:false
    })
    var that = this;
    that.setState({
      activeCollectorAdd: {
        name:'',
        type:'Interval',
        cmd:'',
        trigger:new Date('2017-01-01 00:00:10').getTime(),
        // host:this.state.certList[0].host,
        host:'',
        param:'',
        encoding:'UTF-8',
        channel:'Redis PubSub',
        desc:''
      },
      activeCollectorAddTime: new Date('2017-01-01 00:00:10')
    }, () => {
      that.refs.descInput = ''
    })
  }

  updateTime(time) {
    console.log("time",time.getTime())
    AppActions.setActiveCollectorTime(time)
  }

  updateActiveCollector(e) {
    // AppActions.setActiveCollector(_.set(this.state.activeCollector, e.target.dataset.field, e.target.value))
    // e.preventDefault()
    AppActions.setActiveCollector(e.target.dataset.field, e.target.value)
  }

  updateActiveCollectorType (e){
     AppActions.setActiveCollector('type',e)
     console.log('changetype',this.state.activeCollector.type)
   }
  updateActiveCollectorEncoding (e){
     AppActions.setActiveCollector('encoding',e)
   }
  updateActiveCollectorHost (e){
     AppActions.setActiveCollector('host',e)
   }
  updateActiveCollectorChannel (e){
     AppActions.setActiveCollector('channel',e)
   }

  updateActiveCollectorChecklist() {
    let id = this["data-id"]
    let idx = _.indexOf(this.that.state.activeCollectorChecklist, id)
    let checklist = this.that.state.activeCollectorChecklist
    if (idx == -1)
      checklist.push(id)
    else
      _.remove(checklist, (value, checklistIndex) => {
        if (idx == checklistIndex)
          return true
      })
    // console.log('updateActiveCollectorChecklist', checklist)
    AppActions.setActiveCollectorChecklist(checklist)
  }

  handleSelect (e) {
    this.setState({
      selectContent: e
    })
  }

  handleFilterChange (e) {
    this.state.searchContent = e.target.value
    this.state.activeCollectorList =  this.state.activeCollectorListAll
  }

  handleSearch () {
    if(this.state.searchContent == ""){
      AppActions.getActiveCollectorList(
        function (state) {
          state.activeCollectorListAll = state.activeCollectorList
        }
      );
    }else {
      var replaceList = this.state.activeCollectorListAll;
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
        activeCollectorList: searchContent
      })
    }
  }

  onItemEdit(e) {
    this.setState({
      activeCollectorEditModal:true
    })
    // console.log("aaaa",this.state.activeCollectorListAll)
    var t = e.target
        if (t.tagName.toLowerCase() == 'span') {
          t = t.parentElement
        }

    let id = t.getAttribute("data-id")
    let idx = _.indexOf(this.state.activeCollectorChecklist, id)
    let checklist = this.state.activeCollectorChecklist
    if (idx == -1) {
       checklist.unshift(id)
    }else{
         checklist = [];
         checklist.unshift(id)
    }
    console.log('checklist',checklist)
    AppActions.setActiveCollectorChecklist(checklist)
    AppActions.editActiveCollector.triggerAsync()
      .then(() => {
        console.log('qqq',this.refs.cmdInput.value)
      })
  }

  onEditOk(e) {
    if (this.state.activeCollectorTime == null && this.state.activeCollector.type != 'OneShot') {
      message.error('Empty trigger, please select trigger.')
      return
    }

    this.state.activeCollector.trigger = this.state.activeCollectorTime.getTime();
    AppActions.updateActiveCollector(this.state.activeCollector)
    this.setState({
      activeCollectorEditModal:false
    })

  }

  onEditCancel() {
    this.setState({
      activeCollectorEditModal:false
    })
  }

  onItemDelete(e) {
    var t = e.target
        if (t.tagName.toLowerCase() == 'span') {
          t = t.parentElement
        }

    let id = t.getAttribute("data-id")

    let idx = _.indexOf(this.state.activeCollectorChecklist, id)
    let checklist = this.state.activeCollectorChecklist
    if (idx == -1) {
      checklist = []
      checklist.unshift(id)
    }else{
      checklist = [];
      checklist.unshift(id)
    }

    console.log(checklist)
    // console.log('updateActiveCollectorChecklist', checklist)

    var name = '';
    for(var i =0;i<this.state.activeCollectorListAll.length;i++){
      if(this.state.activeCollectorListAll[i]._id == id){
        name = this.state.activeCollectorListAll[i].name
      }
    }


    confirm({
      title: this.state.delete,
      content: this.state.delmsg +name + ' ?',
      onOk() {
        AppActions.setActiveCollectorChecklist(checklist)
        AppActions.deleteActiveCollector()
      },
      onCancel() {
      // do nothing
      },
    })
  }


  render() {
     let a = <FormattedMessage id = 'home'/>
     let name = a._owner._context.intl.messages.name
     let type = a._owner._context.intl.messages.types
     let host = a._owner._context.intl.messages.host
     let command = a._owner._context.intl.messages.command
     let trigger = a._owner._context.intl.messages.trigger
     let parameter = a._owner._context.intl.messages.para
     let encod = a._owner._context.intl.messages.encod
     let channel = a._owner._context.intl.messages.channel
     let description = a._owner._context.intl.messages.des
     let add = a._owner._context.intl.messages.adding
     let edit = a._owner._context.intl.messages.edit
     this.state.delete = a._owner._context.intl.messages.comfirmDel
     this.state.delmsg = a._owner._context.intl.messages.delMessage


    let createHostOptions = () => {
        // console.log('createHostOptions', this.state)
        return this.state.certList.map(item => {
          return <Option  key={item._id.toString()} value={item._id.toString()}>{item.user+"@"+item.host+":"+item.port}</Option>
        })
    }
    let hostOptions = createHostOptions()

    let createActiveCollector = (line, index) => {
      let date = new Date(line.ts)
      date = date.toLocaleString()
      let idx = _.indexOf(this.state.activeCollectorChecklist, line._id)
      // console.log('createActiveCollector', this.state.activeCollectorChecklist, line._id, idx)
      let activeCollector
      let triggerDate = new Date(parseInt(line.trigger))

      if (idx == -1)
        activeCollector = <tr key={ line._id.toString() }>
          <td>{ line.name }</td>
          <td>{ date }</td>
          <td>{ line.type }</td>
          <td>
            <TimePicker
              value={ triggerDate }
              size="small"
              disabled
            />
          </td>
          <td>{ line.cmd }</td>
          <td>{ line.param }</td>
          <td>{ line.host }</td>
          <td>{ line.encoding }</td>
          <td>{ line.channel }</td>
          <td>
            <span>
              <a href="#" data-id={ line._id } that={ this } onClick={this.onItemEdit.bind(this)}  ><FormattedMessage id="edit"/></a>
              <span className="ant-divider"></span>
              <a href="#" data-id={ line._id } that={ this }  onClick={this.onItemDelete.bind(this)}><FormattedMessage id="del"/></a>
            </span>
          </td>
        </tr>
      else
        activeCollector = <tr key={ line._id.toString() }>
          <td>{ line.name }</td>
          <td>{ date }</td>
          <td>{ line.type }</td>
          <td>
            <TimePicker
              value={ triggerDate }
              size="small"
              disabled
            />
          </td>
          <td>{ line.cmd }</td>
          <td>{ line.param }</td>
          <td>{ line.host }</td>
          <td>{ line.encoding }</td>
          <td>{ line.channel }</td>
          <td>
            <span data-id={ line._id } that={ this }>
              <a href="#" data-id={ line._id } that={ this } onClick={this.onItemEdit.bind(this)} ><FormattedMessage id="edit"/></a>
              <span className="ant-divider"></span>
              <a href="#" data-id={ line._id } that={ this } onClick={this.onItemDelete.bind(this)} ><FormattedMessage id="del"/></a>
            </span>
          </td>
        </tr>

      return activeCollector
    }

    let activeCollectorTable = this.state.activeCollectorList.map(createActiveCollector.bind(this))

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
    //add activeCollector
    let antdFormAdd = <Form horizonal className = "addActiveCollector">

      <FormItem {...formItemLayout} label = {name} required>
        <Tooltip title="Output Redis channel defaults to ac_[COLLECTOR_NAME]">
          <Input  type = "text" rows = "3" autoComplete = "off"
                  data-field="name"
                  ref="nameInput"
                  value={this.state.activeCollectorAdd.name}
                  onChange={this.addActiveCollector.bind(this)}/>
        </Tooltip>
      </FormItem>

      <FormItem {...formItemLayout} label = {host} className = "selectEncoding" required>
        <Select data-field="host"
                ref="hostInput"
                value={this.state.activeCollectorAdd.host}
                onChange={this.addActiveCollectorHost.bind(this)}>
          {hostOptions}
        </Select>
      </FormItem>

      <Row>
        <Col span = "11" offset = "2" >
          <FormItem {...formItemLayoutSelect} label = {type} className = "selectEncoding" required>
            <Select data-field="type"
                    ref="typeInput"
                    value={this.state.activeCollectorAdd.type}
                    onChange={this.addActiveCollectorType.bind(this)}>
              <Option key="interval" value="Interval">Interval</Option>
              <Option key="time" value="Time">Time</Option>
              <Option key="oneshot" value="OneShot">OneShot</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span = "11">
          <FormItem {...formItemLayoutSelect} label = {trigger} className ='timepicker' required>
            <TimePicker
              disabled={(this.state.activeCollectorAdd.type == 'OneShot') ? true : false}
              value={this.state.activeCollectorAddTime}
              onChange={this.addTime.bind(this)}
              format="HH:mm:ss"
              ref="triggerInput"
              size="small"/>
          </FormItem>
        </Col>
      </Row>

      <FormItem {...formItemLayout} label = {command} required>
        <Input  type = "text" autoComplete = "off"
                data-field="cmd"
                ref="cmdInput"
                value={this.state.activeCollectorAdd.cmd}
                onChange={this.addActiveCollector.bind(this)}
        />
      </FormItem>

      <FormItem {...formItemLayout} label = {parameter} required>
        <Input  type = "text" autoComplete = "off"
                data-field="param"
                ref="paramInput"
                value={this.state.activeCollectorAdd.param}
                onChange={this.addActiveCollector.bind(this)}
        />
      </FormItem>

      <Row>
        <Col span = "11" offset = "2" >
          <FormItem {...formItemLayoutSelect} label = {encod} className = "selectEncoding" required>
            <Select
              data-field="encoding"
              ref="encodingInput"
              value={this.state.activeCollectorAdd.encoding}
              onChange={this.addActiveCollectorEncoding.bind(this)}>
              <Option key="UTF-8" value="UTF-8">UTF-8</Option>
              <Option key="ASCII" value="ASCII">ASCII</Option>
              <Option key="GB2312" value="GB2312">GB2312</Option>
              <Option key="GBK" value="GBK">GBK</Option>
              <Option key="GB18030" value="GB18030">GB18030</Option>
              <Option key="Big5" value="Big5">Big5</Option>
              <Option key="Big5-HKSCS" value="Big5-HKSCS">Big5-HKSCS</Option>
              <Option key="Shift_JIS" value="Shift_JIS">Shift_JIS</Option>
              <Option key="EUC-JP" value="EUC-JP">EUC-JP</Option>
              <Option key="UTF-16LE" value="UTF-16LE">UTF-16LE</Option>
              <Option key="UTF-16BE" value="UTF-16BE">UTF-16BE</Option>
              <Option key="binary" value="binary">binary</Option>
              <Option key="base64" value="base64">base64</Option>
              <Option key="hex" value="hex">hex</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span = "11">
          <FormItem {...formItemLayoutSelect} label = {channel} required>
            <Select
              data-field="channel"
              ref="channelInput"
              value={this.state.activeCollectorAdd.channel}
              onChange={this.addActiveCollectorChannel.bind(this)}>
              <Option key="Redis PubSub" value = "Redis PubSub" > Redis PubSub </Option>
              <Option key="Nsq Queue" value = "Nsq Queue" > Nsq Queue </Option>
            </Select>
          </FormItem>
        </Col>
      </Row>

      <FormItem {...formItemLayout} label = {description} required>
        <Input  type = "textarea" rows = "3" autoComplete = "off"
                data-field="desc"
                ref="descInput"
                value={this.state.activeCollectorAdd.desc}
                onChange={this.addActiveCollector.bind(this)}/>
      </FormItem>


    </Form>

    //edit activeCollector
    let antdFormEdit = <Form horizonal className = "editActiveCollector">

      <FormItem {...formItemLayout} label = {name} >
        <span>
          {this.state.activeCollector.name}
        </span>
      </FormItem>

      <Row>
        <Col span = "11" offset = "2" >
          <FormItem {...formItemLayoutSelect} label = {type} className = "selectEncoding">
            <Select data-field="type"
                    ref="typeInput"
                    value={this.state.activeCollector.type}
                    onChange={this.updateActiveCollectorType.bind(this)}>
              <Option key="interval" value="Interval">Interval</Option>
              <Option key="time" value="Time">Time</Option>
              <Option key="oneshot" value="OneShot">OneShot</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span = "11">
          <FormItem {...formItemLayoutSelect} label = {trigger} className ='timepicker'>
            <TimePicker
              disabled={(this.state.activeCollector.type == 'OneShot') ? true : false}
              value={this.state.activeCollectorTime}
              onChange={this.updateTime.bind(this)}
              format="HH:mm:ss"
              ref="triggerInput"
              size="small"/>
          </FormItem>
        </Col>
      </Row>

      <FormItem {...formItemLayout} label = {host} className = "selectEncoding">
        <Select data-field="host"
                ref="hostInput"
                value={this.state.activeCollector.host}
                onChange={this.updateActiveCollectorHost.bind(this)}>
          {hostOptions}
        </Select>
      </FormItem>

      <FormItem {...formItemLayout} label = {command} >
        <Input  type = "text" autoComplete = "off"
                data-field="cmd"
                ref="cmdInput"
                value={this.state.activeCollector.cmd}
                onChange={this.updateActiveCollector.bind(this)}
        />
      </FormItem>

      <FormItem {...formItemLayout} label = {parameter} >
        <Input  type = "text" autoComplete = "off"
                data-field="param"
                ref="paramInput"
                value={this.state.activeCollector.param}
                onChange={this.updateActiveCollector.bind(this)}
        />
      </FormItem>

      <Row>
        <Col span = "11" offset = "2" >
          <FormItem {...formItemLayoutSelect} label = {encod} className = "selectEncoding">
            <Select
              data-field="encoding"
              ref="encodingInput"
              value={this.state.activeCollector.encoding}
              onChange={this.updateActiveCollectorEncoding.bind(this)}>
              <Option key="UTF-8" value="UTF-8">UTF-8</Option>
              <Option key="ASCII" value="ASCII">ASCII</Option>
              <Option key="GB2312" value="GB2312">GB2312</Option>
              <Option key="GBK" value="GBK">GBK</Option>
              <Option key="GB18030" value="GB18030">GB18030</Option>
              <Option key="Big5" value="Big5">Big5</Option>
              <Option key="Big5-HKSCS" value="Big5-HKSCS">Big5-HKSCS</Option>
              <Option key="Shift_JIS" value="Shift_JIS">Shift_JIS</Option>
              <Option key="EUC-JP" value="EUC-JP">EUC-JP</Option>
              <Option key="UTF-16LE" value="UTF-16LE">UTF-16LE</Option>
              <Option key="UTF-16BE" value="UTF-16BE">UTF-16BE</Option>
              <Option key="binary" value="binary">binary</Option>
              <Option key="base64" value="base64">base64</Option>
              <Option key="hex" value="hex">hex</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span = "11">
          <FormItem {...formItemLayoutSelect} label = {channel}>
            <Select
              data-field="channel"
              ref="channelInput"
              value={this.state.activeCollector.channel}
              onChange={this.updateActiveCollectorChannel.bind(this)}>
              <Option key="Redis PubSub" value = "Redis PubSub" > Redis PubSub </Option>
              <Option key="Nsq Queue" value = "Nsq Queue" > Nsq Queue </Option>
            </Select>
          </FormItem>
        </Col>
      </Row>

      <FormItem {...formItemLayout} label = {description} >
        <Input  type = "textarea" rows = "3" autoComplete = "off"
                data-field="desc"
                ref="descInput"
                value={this.state.activeCollector.desc}
                onChange={this.updateActiveCollector.bind(this)}/>
      </FormItem>


    </Form>

    return (
      <div>
        <div className = "row clbody addActiveCollector">
          <div className = "ant-col-sm24 p-t-10 ">
            <Button type = "primary" icon="anticon anticon-plus" onClick = {this.onItemAdd.bind(this)}/>
          </div>
        </div>

        <Modal
          title = {add}
          visible = {this.state.activeCollectorAddModal}
          onOk = {this.saveActiveCollector.bind(this)}
          onCancel = {this.clearActiveCollector.bind(this)}
          className = "antdFormAdd"
        >
          {antdFormAdd}
        </Modal>
        <div className="row clbody">
        <div className="ant-col-sm-4 p-t-10 p-b-10 pull-right CollectorSelect">
          <div className="ant-search-input-wrapper">
            <div className="selectDiv">
              <Select className="searchSelect" placeholder={name} onChange={this.handleSelect.bind(this)}>
                <Option value="name" selected> {name} </Option>
                <Option value="parameter"> {parameter} </Option>
              </Select>
            </div>
            <InputGroup className={searchClass}>
              <Input  data-name="name" onChange={this.handleFilterChange.bind(this)} onPressEnter={this.handleSearch.bind(this)}/>
              <div className="ant-input-group-wrap">
                <Button icon="anticon anticon-search" data-name="name" className={buttonClass} onClick={this.handleSearch.bind(this)} />
              </div>
            </InputGroup>
          </div>
        </div>

        <div className=" p-b-10 p-t-60">
          <Modal
            title = {edit}
            visible = {this.state.activeCollectorEditModal}
            onOk = {this.onEditOk.bind(this)}
            onCancel = {this.onEditCancel.bind(this)}
            className = "antdFormEdit"
          >
            {antdFormEdit}
          </Modal>
          <table id="demo-custom-toolbar"  data-toggle="table"
                     data-toolbar="#demo-delete-row"
                     data-search="true"
                     data-show-refresh="true"
                     data-show-toggle="true"
                     data-show-columns="true"
                     data-sort-name="id"
                     data-page-list="[5, 10, 20]"
                     data-page-size="5"
                     data-pagination="true" data-show-pagination-switch="true" className="table table-bordered table-hover">
            <thead>
              <tr>
                {/*<th data-field="state" data-checkbox="true"></th>*/}
                <th data-field="name" data-sortable="true"><FormattedMessage id="name"/></th>
                <th data-field="date" data-sortable="true" data-formatter="dateFormatter"><FormattedMessage id="date"/></th>
                <th data-field="amount" data-align="center" data-sortable="true" data-sorter=""><FormattedMessage id="types"/></th>
                <th data-field="status" data-align="center" data-sortable="true" data-formatter=""><FormattedMessage id="trigger"/></th>
                <th data-field="command" data-align="center" data-sortable="true" data-sorter=""><FormattedMessage id="command"/></th>
                <th data-field="parameter" data-align="center" data-sortable="true" data-sorter=""><FormattedMessage id="para"/></th>
                <th data-field="host" data-align="center" data-sortable="true" data-sorter=""><FormattedMessage id="host"/></th>
                <th data-field="encoding" data-align="center" data-sortable="true" data-sorter=""><FormattedMessage id="encod"/></th>
                <th data-field="channel" data-align="center" data-sortable="true" data-sorter=""><FormattedMessage id="channel"/></th>
                <th data-field="channel" data-align="center" ><FormattedMessage id="operation"/></th>
              </tr>
            </thead>
            <tbody>
              { activeCollectorTable }
            </tbody>
          </table>
        </div>
      </div>
      </div>
    )
  }
}

ActiveCollector.propTypes = {

}

ActiveCollector.defaultProps = {

}

export default ActiveCollector
