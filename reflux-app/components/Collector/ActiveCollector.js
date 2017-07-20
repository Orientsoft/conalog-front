import React from 'react'
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
      activeCollectorAdd: {
        name:'',
        type:'Interval',
        cmd:'',
        param:'',
        encoding:'UTF-8',
        channel:'Redis PubSub',
        desc:''
      },
      activeCollectorList: [],
      activeCollectorChecklist: [],
      activeCollectorEditModal: false,
      activeCollectorDeleteModal: false,
      activeCollectorTime: new Date('2017-01-01 00:00:10'),
      activeCollectorAddTime: new Date('2017-01-01 00:00:10'),
      certList: [],
      selectContent:'name',
      searchContent:'',
      activeCollectorListAll:[]
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
      this.setState({
        activeCollectorAdd: Object.assign(this.state.activeCollectorAdd, {
          host: cert ? cert.host  : '',
          trigger:this.state.activeCollectorAddTime.getTime()
        })
      })
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
    console.log(e.target.dataset.field,e.target.value)

    this.setState({
      activeCollectorAdd: Object.assign(this.state.activeCollectorAdd, {
        [e.target.dataset.field]: e.target.value
      })
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

  saveActiveCollector(e) {

    e.preventDefault()

    AppActions.setActiveCollectorFlag(true)

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

    //check activeCollectorAdd (name,param,command,desc can not be empty)
    var checkName = false;
    var validates = {
      name: {
        msg: 'name  can\'t be empty',
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
    var that = this;
    that.setState({
      activeCollectorAdd: {
        name:'',
        type:'Interval',
        cmd:'',
        trigger:new Date('2017-01-01 00:00:10').getTime(),
        host:this.state.certList[0].host,
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
    console.log(e.target.dataset.field)
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
    let id = e.target.getAttribute("data-id")
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
    let id = e.target.getAttribute("data-id")

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
      title: 'Confirm Delete',
      content: 'Are you sure to delete '+name + ' ?',
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
    // console.log('ActiveCollector::activeCollector', this.state.activeCollector)
    let nameInput
    let typeInput
    let triggerInput
    let cmdInput
    let paramInput
    let hostInput
    let encodingInput
    let channelInput
    let descInput

    // name
    nameInput = <div className="ant-col-md-4">
      <Tooltip title="Output Redis channel defaults to ac_[COLLECTOR_NAME]">
        <div className="form-group">
          <label>Name</label>
          <input type="text" placeholder="Name" className="form-control"
            data-field="name"
            ref="nameInput"
            value={this.state.activeCollectorAdd.name}
            onChange={this.addActiveCollector.bind(this)} />
        </div>
      </Tooltip>
    </div>

    // type
    typeInput = <div className="ant-col-md-4">
      <div className="form-group">
        <label>Type</label>
        <select className="form-control"
          data-field="type"
          ref="typeInput"
          value={this.state.activeCollectorAdd.type}
          onChange={this.addActiveCollector.bind(this)}>
          <option value="Interval">Interval</option>
          <option value="Time">Time</option>
          <option value="OneShot">OneShot</option>
        </select>
      </div>
    </div>

    triggerInput = <div className="ant-col-md-4">
      <div className="form-group">
        <label>Trigger</label><br />
        <TimePicker
          className="setTimepicker"
          disabled={(this.state.activeCollectorAdd.type == 'OneShot') ? true : false}
          value={this.state.activeCollectorAddTime}
          onChange={this.addTime.bind(this)}
          format="HH:mm:ss"
          ref="triggerInput"
          size="large" />
      </div>
    </div>

    // cmd
    cmdInput = <div className="ant-col-md-4">
      <div className="form-group">
        <label>Command</label>
        <Tooltip placement="topLeft" title = {this.state.activeCollectorAdd.cmd} overlayStyle={{maxWidth:'300px',wordWrap:'break-word'}}>
          <input type="text" placeholder="Command" className="form-control"
            data-field="cmd"
            ref="cmdInput"
            value={this.state.activeCollectorAdd.cmd}
            onChange={this.addActiveCollector.bind(this)} />
        </Tooltip>
      </div>
    </div>


    // param
    paramInput = <div className="ant-col-md-4">
      <div className="form-group">
        <label>Parameter</label>
        <Tooltip placement="topLeft" title = {this.state.activeCollectorAdd.param} overlayStyle={{maxWidth:'300px',wordWrap:'break-word'}}>
          <input type="text" placeholder="Parameter" className="form-control"
            data-field="param"
            ref="paramInput"
            value={this.state.activeCollectorAdd.param}
            onChange={this.addActiveCollector.bind(this)} />
        </Tooltip>
      </div>
    </div>

    let createHostOptions = () => {
        // console.log('createHostOptions', this.state)
        return this.state.certList.map(cert => {
          return <option key={cert._id.toString()} value={cert.host}>{cert.host + ':' + cert.port}</option>
        })
    }
    let hostOptions = createHostOptions()

    // host
    hostInput = <div className="ant-col-md-4">
      <div className="form-group">
        <label>Host</label>
        <select className="form-control"
          data-field="host"
          ref="hostInput"
          onChange={this.addActiveCollector.bind(this)}>
          {hostOptions}
        </select>
      </div>
    </div>

    // encoding
    encodingInput = <div className="ant-col-md-4">
      <div className="form-group">
        <label>Encoding</label>
        <select className="form-control"
          data-field="encoding"
          ref="encodingInput"
          onChange={this.addActiveCollector.bind(this)}>
          <option key="ASCII">ASCII</option>
          <option key="GB2312">GB2312</option>
          <option key="GBK">GBK</option>
          <option key="GB18030">GB18030</option>
          <option key="Big5">Big5</option>
          <option key="Big5-HKSCS">Big5-HKSCS</option>
          <option key="Shift_JIS">Shift_JIS</option>
          <option key="EUC-JP">EUC-JP</option>
          <option key="UTF-8">UTF-8</option>
          <option key="UTF-16LE">UTF-16LE</option>
          <option key="UTF-16BE">UTF-16BE</option>
          <option key="binary">binary</option>
          <option key="base64">base64</option>
          <option key="hex">hex</option>
        </select>
      </div>
    </div>

    // channel
    channelInput = <div className="ant-col-md-4">
      <div className="form-group">
        <label>Channel</label>
        <select className="form-control"
          data-field="channel"
          ref="channelInput"
          onChange={this.addActiveCollector.bind(this)}>
          <option key="Redis PubSub">Redis PubSub</option>
          <option key="Nanomsg Queue">Nanomsg Queue</option>
        </select>
      </div>
    </div>

    // desc
    descInput = <div className="ant-col-md-24">
      <div className="form-group">
        <label>Description</label>
        <textarea
          placeholder="Collector Usage & Source & Destination"
          className="form-control"
          data-field="desc"
          ref="descInput"
          value={this.state.activeCollectorAdd.desc}
          onChange={this.addActiveCollector.bind(this)}>
        </textarea>
      </div>
    </div>

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
              <a href="#" data-id={ line._id } that={ this } onClick={this.onItemEdit.bind(this)}  >Edit</a>
              <span className="ant-divider"></span>
              <a href="#" data-id={ line._id } that={ this }  onClick={this.onItemDelete.bind(this)}>Delete</a>
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
              <a href="#" data-id={ line._id } that={ this } onClick={this.onItemEdit.bind(this)} >Edit</a>
              <span className="ant-divider"></span>
              <a href="#" data-id={ line._id } that={ this } onClick={this.onItemDelete.bind(this)} >Delete</a>
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
    //edit activeCollector
    let antdFormEdit = <Form horizonal className = "editActiveCollector">

      <FormItem {...formItemLayout} label = "Name" >
        {/*<Input  type = "text" autoComplete = "off"*/}
                {/*data-field="name"*/}
                {/*ref="nameInput"*/}
                {/*value={this.state.activeCollector.name}*/}
                {/*onChange={this.updateActiveCollector.bind(this)}*/}
        {/*/>*/}
        <span>
          {this.state.activeCollector.name}
        </span>
      </FormItem>

      <Row>
        <Col span = "11" offset = "2" >
          <FormItem {...formItemLayoutSelect} label = "Type" className = "selectEncoding">
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
          <FormItem {...formItemLayoutSelect} label = "Trigger" className ='timepicker'>
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

      <Row>
        <Col span = "11" offset = "2" >
          <FormItem {...formItemLayoutSelect} label = "Command" >
            <Input  type = "text" autoComplete = "off"
                    data-field="cmd"
                    ref="cmdInput"
                    value={this.state.activeCollector.cmd}
                    onChange={this.updateActiveCollector.bind(this)}
            />
          </FormItem>
        </Col>
        <Col span = "11">
          <FormItem {...formItemLayoutSelect} label = "Host" className = "selectEncoding">
            <Select data-field="host"
                    ref="hostInput"
                    value={this.state.activeCollector.host}
                    onChange={this.updateActiveCollectorHost.bind(this)}>
              {hostOptions}
            </Select>
          </FormItem>
        </Col>
      </Row>

      <FormItem {...formItemLayout} label = "Parameter" >
        <Input  type = "text" autoComplete = "off"
                data-field="param"
                ref="paramInput"
                value={this.state.activeCollector.param}
                onChange={this.updateActiveCollector.bind(this)}
        />
      </FormItem>

      <Row>
        <Col span = "11" offset = "2" >
          <FormItem {...formItemLayoutSelect} label = "Encoding" className = "selectEncoding">
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
          <FormItem {...formItemLayoutSelect} label = "Channel">
            <Select
              data-field="channel"
              ref="channelInput"
              value={this.state.activeCollector.channel}
              onChange={this.updateActiveCollectorChannel.bind(this)}>
              <Option key="Redis PubSub" value = "Redis PubSub" > Redis PubSub </Option>
              <Option key="Nanomsg Queue" value = "Nanomsg Queue" > Nanomsg Queue </Option>
            </Select>
          </FormItem>
        </Col>
      </Row>

      <FormItem {...formItemLayout} label = "Description" >
        <Input  type = "textarea" rows = "3" autoComplete = "off"
                data-field="desc"
                ref="descInput"
                value={this.state.activeCollector.desc}
                onChange={this.updateActiveCollector.bind(this)}/>
      </FormItem>


    </Form>



    const buttonClass = classNames({
      'ant-search-btn': true,
    })
    const searchClass = classNames({
      'ant-search-input': true,
    })


    return (
      <div>
        <div className="row clhead">
          { nameInput }
          { typeInput }
          { triggerInput }
          { cmdInput }
          { paramInput }
          { hostInput }
          { encodingInput }
          { channelInput }
          { descInput }
          <div className="ant-col-md-24">
            <div className="form-group text-right m-t-20">
              <button className="btn btn-primary waves-effect waves-light" type="submit"
                onClick={this.saveActiveCollector.bind(this)}> Save </button>
              <button type="reset" className="btn btn-default waves-effect waves-light m-l-10"
                onClick={this.clearActiveCollector.bind(this)}> clear </button>
            </div>
          </div>
        </div>

        <div className="ant-col-sm-4 p-t-10 p-b-10 pull-right">
          <div className="ant-search-input-wrapper">
            <div className="selectDiv">
              <Select className="searchSelect" defaultValue="name" onChange={this.handleSelect.bind(this)}>
                <Option value="name" selected> Name </Option>
                <Option value="parameter"> Parameter </Option>
              </Select>
            </div>
            <InputGroup className={searchClass}>
              <Input  data-name="name" onChange={this.handleFilterChange.bind(this)} onPressEnter={this.handleSearch.bind(this)}/>
              <div className="ant-input-group-wrap">
                <Button icon="search" data-name="name" className={buttonClass} onClick={this.handleSearch.bind(this)} />
              </div>
            </InputGroup>
          </div>
        </div>



        <div className=" p-b-10 p-t-60">
          <Modal
            title = "Edit ActiveCollector"
            visible = {this.state.activeCollectorEditModal}
            onOk = {this.onEditOk.bind(this)}
            onCancel = {this.onEditCancel.bind(this)}
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
                <th data-field="name" data-sortable="true">Name</th>
                <th data-field="date" data-sortable="true" data-formatter="dateFormatter">Date</th>
                <th data-field="amount" data-align="center" data-sortable="true" data-sorter="">Type</th>
                <th data-field="status" data-align="center" data-sortable="true" data-formatter="">Trigger</th>
                <th data-field="command" data-align="center" data-sortable="true" data-sorter="">Command</th>
                <th data-field="parameter" data-align="center" data-sortable="true" data-sorter="">Parameter</th>
                <th data-field="host" data-align="center" data-sortable="true" data-sorter="">Host</th>
                <th data-field="encoding" data-align="center" data-sortable="true" data-sorter="">Encoding</th>
                <th data-field="channel" data-align="center" data-sortable="true" data-sorter="">Channel</th>
                <th data-field="channel" data-align="center" >Operation</th>
              </tr>
            </thead>
            <tbody>
              { activeCollectorTable }
            </tbody>
          </table>
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
