import React from 'react'
let message = require('antd/lib/message')
let Checkbox = require('antd/lib/checkbox')
let Modal = require('antd/lib/modal')
let Form = require('antd/lib/form')
let Tooltip = require('antd/lib/tooltip')
let Input = require('antd/lib/input')
let Button = require('antd/lib/button')
let Select = require('antd/lib/select')
let Icon = require('antd/lib/icon')
import AppActions from '../../actions/AppActions'
import AppStore from '../../stores/AppStore'
import _ from 'lodash'
import { Row, Col } from 'antd';
import classNames from 'classnames';

const confirm = Modal.confirm;
const InputGroup = Input.Group;
const Option = Select.Option;
const FormItem = Form.Item;
const createForm = Form.create;

class PassiveCollector extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      passiveCollectorFlag: false,
      passiveCollector: { type: 'LongScript' },
      passiveCollectorAdd:{
        name:'',
        cmd:'',
        type: 'LongScript',
        param:'',
        encoding:'UTF-8',
        channel:'Redis PubSub',
        desc:''
      },
      passiveCollectorList: [],
      passiveCollectorChecklist: [],
      certList: [],
      selectContent:'name',
      searchContent:'',
      passiveCollectorListAll:[],
      passiveCollectorEditModal: false,
      passiveCollectorAddModal:false,
      passiveCollectorDeleteModal: false,
    }
  }

  componentDidMount() {
    this.unsubscribe = AppStore.listen(function(state) {
      this.setState(state)
    }.bind(this))

    // get passive collector & cert list
    AppActions.getPassiveCollectorList()

    AppActions.listCert.triggerAsync()
      .then(() => {
        const cert = this.state.certList[0]
        console.log('cert:',cert)
        this.setState({
          passiveCollectorAdd: Object.assign(this.state.passiveCollectorAdd, {
            host: cert ? cert.host  : ''
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
      content: 'Are you sure to update ' + that.state.passiveCollector.name + ' passive collector?',
      onOk() {
        // console.log('saveActiveCollector', this.state.activeCollectorTime)
        // there might be some fields not set during update
        // we'd better read parameters from refs now
        that.state.passiveCollector = {
          name: that.refs.nameInput.value.trim(),
          type: that.refs.typeInput.value.trim(),
          cmd: that.refs.cmdInput.value.trim(),
          param: that.refs.paramInput.value.trim(),
          host: that.refs.hostInput.value.trim(),
          encoding: that.refs.encodingInput.value.trim(),
          channel: that.refs.channelInput.value.trim(),
          desc: that.refs.descInput.value.trim()
        }

        // ok, save
        AppActions.updatePassiveCollector(that.state.passiveCollector)
      },
      onCancel() {
        // do nothing
      }
    })
  }

  onItemAdd(){
    this.setState({
      passiveCollectorAddModal:true
    })
  }

  addPassiveCollectorType(e){
    this.setState({
      passiveCollectorAdd: Object.assign(this.state.passiveCollectorAdd, {
        "type":e})
    })
  }

  addPassiveCollectorHost(e){
    this.setState({
      passiveCollectorAdd: Object.assign(this.state.passiveCollectorAdd, {
        "host":e})
    })
  }

  addPassiveCollectorEncoding(e){
    this.setState({
      passiveCollectorAdd: Object.assign(this.state.passiveCollectorAdd, {
        "encoding":e})
    })
  }

  addPassiveCollectorChannel(e){
    this.setState({
      passiveCollectorAdd: Object.assign(this.state.passiveCollectorAdd, {
        "channel":e})
    })
  }

  addPassiveCollector(e) {
    console.log(e.target.dataset.field,e.target.value)

    this.setState({
      passiveCollectorAdd: Object.assign(this.state.passiveCollectorAdd, {
        [e.target.dataset.field]: e.target.value
      })
    })
  }

  savePassiveCollector(e) {
    // AppActions.setPassiveCollectorFlag(true)

    // check name
    let checkResults = this.state.passiveCollectorList.map(collector => {
      if (collector.name == this.state.passiveCollectorAdd.name)
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
      message.error('This name is existed!')
      return
    }

    //check passiveCollectorAdd (name,param,command,desc can not be empty)
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

    if(this.state.passiveCollectorAdd.name !== ''){
      validates.name.status = true
    }
    if(this.state.passiveCollectorAdd.type =="LongScript" && this.state.passiveCollectorAdd.cmd !== ''){
      validates.command.status = true
    }
    if(this.state.passiveCollectorAdd.type =="FileTail"){
      validates.command.status = true
    }
    if(this.state.passiveCollectorAdd.param !== ''){
      validates.param.status = true
    }
    if(this.state.passiveCollectorAdd.desc !== ''){
      validates.desc.status = true
    }

    var result = Object.keys(validates).filter(field => validates[field].status === false)
    let reg= /^[A-Za-z]+$/
    if(reg.test(this.state.passiveCollectorAdd.name.substring(0,1))){
      checkName = true
    }

    if(!result.length && checkName){
      this.setState({
        passiveCollectorAdd: this.state.passiveCollectorAdd
      }, () => {
        // ok, save
        AppActions.savePassiveCollector(this.state.passiveCollectorAdd)
        this.clearPassiveCollector()
      })
    }

    if(this.state.passiveCollectorAdd.name && !checkName){
      message.error('Name of collector should begin with a letter!')
    }
    if(result.length){
      var tip = ''
      result.forEach(field => tip += validates[field].msg + ' \n ')
      message.error(tip)
    }

  }

  clearPassiveCollector() {
    this.setState({
      passiveCollectorAddModal:false
    })
    var that = this
    that.setState({
      passiveCollectorAdd: {
        name:'',
        cmd:'',
        type:'LongScript',
        host:this.state.certList[0].host,
        param:'',
        encoding:'UTF-8',
        channel:'Redis PubSub',
        desc:''
      }},() => {console.log('clear:'+ this.state.passiveCollectorAdd)})
  }

  updatePassiveCollector(e) {
    e.preventDefault()
    AppActions.setPassiveCollector(e.target.dataset.field, e.target.value)
  }

  updatePassiveCollectorType (e){
    AppActions.setPassiveCollector('type',e)
    if(this.state.passiveCollector.type == "FileTail"){
      AppActions.setPassiveCollector('cmd',"")
    }

  }

  updatePassiveCollectorEncoding (e){
    AppActions.setPassiveCollector('encoding',e)
  }

  updatePassiveCollectorHost (e){
    AppActions.setPassiveCollector('host',e)
  }

  updatePassiveCollectorChannel (e){
    AppActions.setPassiveCollector('channel',e)
  }

  updatePassiveCollectorChecklist() {
    let id = this["data-id"]
    let idx = _.indexOf(this.that.state.passiveCollectorChecklist, id)
    // console.log('updateActiveCollectorChecklist', id, idx)

    let checklist = this.that.state.passiveCollectorChecklist
    if (idx == -1)
      checklist.push(id)
    else
      _.remove(checklist, (value, checklistIndex) => {
        if (idx == checklistIndex)
          return true
      })

    AppActions.setPassiveCollectorChecklist(checklist)
  }

  handleSelect (e) {
    this.setState({
      selectContent: e
    })
  }

  handleFilterChange (e) {
    this.state.searchContent = e.target.value
    this.state.passiveCollectorList =  this.state.passiveCollectorListAll
  }

  handleSearch () {
    if(this.state.searchContent == ""){
      AppActions.getPassiveCollectorList(
        function (state) {
          state.passiveCollectorListAll = state.passiveCollectorList
        }
      );
    }else {
      var replaceList = this.state.passiveCollectorListAll;
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
        passiveCollectorList: searchContent
      })
    }
  }

  onItemEdit(e) {
    this.setState({
      passiveCollectorEditModal:true
    })
    console.log("aaaa",this.state.passiveCollectorListAll)
    let id = e.target.getAttribute("data-id")


    let idx = _.indexOf(this.state.passiveCollectorChecklist, id)
    let checklist = this.state.passiveCollectorChecklist
    if (idx == -1) {
      checklist.unshift(id)
    }else{
      checklist = [];
      checklist.unshift(id)
    }
    console.log('checklist',checklist)
    AppActions.setPassiveCollectorChecklist(checklist)
    AppActions.editPassiveCollector()
  }

  onItemDelete(e) {
    let id = e.target.getAttribute("data-id")

    let idx = _.indexOf(this.state.passiveCollectorChecklist, id)
    let checklist = this.state.passiveCollectorChecklist
    if (idx == -1) {
      checklist = [];
      checklist.unshift(id)
    }else{
      checklist = [];
      checklist.unshift(id)
    }

    console.log(checklist)
    // console.log('updateActiveCollectorChecklist', checklist)

    var name = '';
    for(var i =0;i<this.state.passiveCollectorListAll.length;i++){
      if(this.state.passiveCollectorListAll[i]._id == id){
        name = this.state.passiveCollectorListAll[i].name
      }
    }


    confirm({
      title: 'Confirm Delete',
      content: 'Are you sure to delete '+name + ' ?',
      onOk() {
        AppActions.setPassiveCollectorChecklist(checklist)
        AppActions.deletePassiveCollector()
      },
      onCancel() {
        // do nothing
      },
    })
  }

  onEditOk(e) {
    AppActions.updatePassiveCollector(this.state.passiveCollector)

    this.setState({
      passiveCollectorEditModal:false
    })
  }

  onEditCancel() {
    this.setState({
      passiveCollectorEditModal:false
    })
  }


  render() {

    let createHostOptions = () => {
        // console.log('createHostOptions', this.state)
        return this.state.certList.map(cert => {
          return <option key={cert._id.toString()} value={cert.host}>{cert.host + ':' + cert.port}</option>
        })
    }
    let hostOptions = createHostOptions()

    let createPassiveCollector = (line, index) => {
      let date = new Date(line.ts)
      date = date.toLocaleString()
      let idx = _.indexOf(this.state.passiveCollectorChecklist, line._id)
      // console.log('createPassiveCollector', this.state.passiveCollectorChecklist, line._id, idx)
      let passiveCollector

      if (idx == -1)
        passiveCollector = <tr key={ line._id }>
          <td>{ line.name }</td>
          <td>{ date }</td>
          <td>{ line.type }</td>
          <td>{ (line.cmd == '') ? 'N/A' : line.cmd }</td>
          <td>{ line.param }</td>
          <td>{ line.host }</td>
          <td>{ line.encoding }</td>
          <td>{ line.channel }</td>
          <td>
            <span>
              <a href="#" data-id={ line._id } that={ this } onClick={this.onItemEdit.bind(this)} >Edit</a>
              <span className="ant-divider"></span>
              <a href="#" data-id={ line._id } that={ this }  onClick={this.onItemDelete.bind(this)}>Delete</a>
            </span>
          </td>
        </tr>
      else
        passiveCollector = <tr key={ line._id }>
          <td>{ line.name }</td>
          <td>{ date }</td>
          <td>{ line.type }</td>
          <td>{ (line.cmd == '') ? 'N/A' : line.cmd }</td>
          <td>{ line.param }</td>
          <td>{ line.host }</td>
          <td>{ line.encoding }</td>
          <td>{ line.channel }</td>
          <td>
            <span>
              <a href="#"  data-id={ line._id } that={ this } onClick={this.onItemEdit.bind(this)}>Edit</a>
              <span className="ant-divider"></span>
              <a href="#" data-id={ line._id } that={ this }  onClick={this.onItemDelete.bind(this)}>Delete</a>
            </span>
          </td>
        </tr>

      return passiveCollector
    }

    let passiveCollectorTable = this.state.passiveCollectorList.map(createPassiveCollector.bind(this))

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
      // 'ant-search-btn-noempty': !!this.state.historyEventIdFilter.trim()
    })
    const searchClass = classNames({
      'ant-search-input': true,
      // 'ant-search-input-focus': this.state.historyEventIdFilterFocus
    })

    //add passiveCollector
    let antdFormAdd = <Form horizonal >

      <FormItem {...formItemLayout} label = "Name" required>
        <Tooltip title="Output Redis channel defaults to pc_[COLLECTOR_NAME]">
          <Input  type = "text" autoComplete = "off"
                  data-field="name"
                  ref="nameInput"
                  value={this.state.passiveCollectorAdd.name}
                  onChange={this.addPassiveCollector.bind(this)}
          />
        </Tooltip>
      </FormItem>

      <Row>
        <Col span = "11" offset = "2" >
          <FormItem {...formItemLayoutSelect} label = "Type"  required>
            <Select data-field="type"
                    ref="typeInput"
                    value={this.state.passiveCollectorAdd.type}
                    onChange={this.addPassiveCollectorType.bind(this)}>
              <Option value="LongScript">LongScript</Option>
              <Option value="FileTail">FileTail</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span = "11">
          <FormItem {...formItemLayoutSelect} label = "Host" required>
            <Select data-field="host"
                    ref="hostInput"
                    value={this.state.passiveCollectorAdd.host}
                    onChange={this.addPassiveCollectorHost.bind(this)}>
              {hostOptions}
            </Select>
          </FormItem>
        </Col>
      </Row>

      <FormItem {...formItemLayout} label = "Command" required>
        <Input  type = "text" autoComplete = "off"
                data-field="cmd"
                ref="cmdInput"
                disabled={(this.state.passiveCollectorAdd.type == "LongScript") ? false : true}
                value={(this.state.passiveCollectorAdd.type == "LongScript") ? this.state.passiveCollectorAdd.cmd : ""}
                onChange={this.addPassiveCollector.bind(this)}
        />
      </FormItem>

      <FormItem {...formItemLayout} label = "Parameter" required>
        <Input  type = "text" autoComplete = "off"
                data-field="param"
                ref="paramInput"
                value={this.state.passiveCollectorAdd.param}
                onChange={this.addPassiveCollector.bind(this)}
        />
      </FormItem>

      <Row>
        <Col span = "11" offset = "2" >
          <FormItem {...formItemLayoutSelect} label = "Encoding" className = "selectEncoding" required>
            <Select
              data-field="encoding"
              ref="encodingInput"
              value={this.state.passiveCollectorAdd.encoding}
              onChange={this.addPassiveCollectorEncoding.bind(this)}>
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
          <FormItem {...formItemLayoutSelect} label = "Channel" required>
            <Select
              data-field="channel"
              ref="channelInput"
              value={this.state.passiveCollectorAdd.channel}
              onChange={this.addPassiveCollectorChannel.bind(this)}>
              <Option key="Redis PubSub" value = "Redis PubSub" > Redis PubSub </Option>
              <Option key="Nanomsg Queue" value = "Nanomsg Queue" > Nanomsg Queue </Option>
            </Select>
          </FormItem>
        </Col>
      </Row>

      <FormItem {...formItemLayout} label = "Description" required>
        <Input  type = "textarea" rows = "3" autoComplete = "off"
                data-field="desc"
                ref="descInput"
                value={this.state.passiveCollectorAdd.desc}
                onChange={this.addPassiveCollector.bind(this)}/>
      </FormItem>


    </Form>
    //edit passiveCollector
    let antdFormEdit = <Form horizonal className = "editPassiveCollector">

      <FormItem {...formItemLayout} label = "Name" >
        {/*<Input  type = "text" autoComplete = "off"*/}
        {/*data-field="name"*/}
        {/*ref="nameInput"*/}
        {/*value={this.state.activeCollector.name}*/}
        {/*onChange={this.updateActiveCollector.bind(this)}*/}
        {/*/>*/}
        <span>
          {this.state.passiveCollector.name}
        </span>
      </FormItem>

      <Row>
        <Col span = "11" offset = "2" >
          <FormItem {...formItemLayoutSelect} label = "Type" className = "selectEncoding">
            <Select data-field="type"
                    ref="typeInput"
                    value={this.state.passiveCollector.type}
                    onChange={this.updatePassiveCollectorType.bind(this)}>
              <Option value="LongScript">LongScript</Option>
              <Option value="FileTail">FileTail</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span = "11">
          <FormItem {...formItemLayoutSelect} label = "Host" className = "selectEncoding">
            <Select data-field="host"
                    ref="hostInput"
                    value={this.state.passiveCollector.host}
                    onChange={this.updatePassiveCollectorHost.bind(this)}>
              {hostOptions}
            </Select>
          </FormItem>
        </Col>
      </Row>

      <FormItem {...formItemLayout} label = "Command" >
        <Input  type = "text" autoComplete = "off"
                data-field="cmd"
                ref="cmdInput"
                disabled={(this.state.passiveCollector.type == "LongScript") ? false : true}
                value={(this.state.passiveCollector.type == "LongScript") ? this.state.passiveCollector.cmd : ""}
                onChange={this.updatePassiveCollector.bind(this)}
        />
      </FormItem>

      <FormItem {...formItemLayout} label = "Parameter" >
        <Input  type = "text" autoComplete = "off"
                data-field="param"
                ref="paramInput"
                value={this.state.passiveCollector.param}
                onChange={this.updatePassiveCollector.bind(this)}
        />
      </FormItem>

      <Row>
        <Col span = "11" offset = "2" >
          <FormItem {...formItemLayoutSelect} label = "Encoding" className = "selectEncoding">
            <Select
              data-field="encoding"
              ref="encodingInput"
              value={this.state.passiveCollector.encoding}
              onChange={this.updatePassiveCollectorEncoding.bind(this)}>
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
              value={this.state.passiveCollector.channel}
              onChange={this.updatePassiveCollectorChannel.bind(this)}>
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
                value={this.state.passiveCollector.desc}
                onChange={this.updatePassiveCollector.bind(this)}/>
      </FormItem>


    </Form>

    return (
      <div>
        <div className = "row clbody addActiveCollector">
          <div className = "ant-col-sm24 p-t-10 ">
            <Button type = "primary" icon = "plus-circle-o" onClick = {this.onItemAdd.bind(this)}/>
          </div>
        </div>

        <Modal
          title = "Add PassiveCollector"
          visible = {this.state.passiveCollectorAddModal}
          onOk = {this.savePassiveCollector.bind(this)}
          onCancel = {this.clearPassiveCollector.bind(this)}
        >
          {antdFormAdd}
        </Modal>

        <div className="row clbody">
        <div className="ant-col-sm-4 p-t-10 p-b-10 pull-right CollectorSelect">
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
            title = "Edit PassiveCollector"
            visible = {this.state.passiveCollectorEditModal}
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
                <th data-field="cmd" data-align="center" data-sortable="true" data-sorter="">Command</th>
                <th data-field="parameter" data-align="center" data-sortable="true" data-sorter="">Parameter</th>
                <th data-field="host" data-align="center" data-sortable="true" data-sorter="">Host</th>
                <th data-field="encoding" data-align="center" data-sortable="true" data-sorter="">Encoding</th>
                <th data-field="channel" data-align="center" data-sortable="true" data-sorter="">Channel</th>
                <th data-field="channel" data-align="center" className="operation">Operation</th>
              </tr>
            </thead>
            <tbody>
              { passiveCollectorTable }
            </tbody>
          </table>
        </div>
        </div>
      </div>
    )
  }
}

PassiveCollector.propTypes = {

}

PassiveCollector.defaultProps = {

}

export default PassiveCollector
