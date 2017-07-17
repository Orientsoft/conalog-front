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

  savePassiveCollector(e) {
    e.preventDefault()
    AppActions.setPassiveCollectorFlag(true)

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

    // AppActions.savePassiveCollector(this.state.passiveCollector)
    this.setState({
      passiveCollectorAdd: this.state.passiveCollectorAdd
    }, () => {
      // ok, save
      AppActions.savePassiveCollector(this.state.passiveCollectorAdd)
      this.clearPassiveCollector()
    })

  }

  clearPassiveCollector() {
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

  addPassiveCollector(e) {
    console.log(e.target.dataset.field,e.target.value)

    this.setState({
      passiveCollectorAdd: Object.assign(this.state.passiveCollectorAdd, {
        [e.target.dataset.field]: e.target.value
      })
    })
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
    let inputLine
    let nameInput
    let typeInput
    let cmdInput
    let paramInput
    let hostInput
    let encodingInput
    let channelInput
    let descInput

    nameInput = <div className="ant-col-md-5">
      <Tooltip title="Output Redis channel defaults to pc_[COLLECTOR_NAME]">
        <div className="form-group">
          <label>Name</label>
          <input type="text" placeholder="Name" className="form-control"
            data-field="name"
            ref="nameInput"
            value={this.state.passiveCollectorAdd.name}
            onChange={this.addPassiveCollector.bind(this)} />
        </div>
      </Tooltip>
    </div>

    typeInput = <div className="ant-col-md-4">
      <div className="form-group">
        <label>Type</label>
        <select className="form-control"
          data-field="type"
          ref="typeInput"
          value={this.state.passiveCollectorAdd.type}
          onChange={this.addPassiveCollector.bind(this)}>
          <option>LongScript</option>
          <option>FileTail</option>
          { /* <option>NetCap</option> */ }
        </select>
      </div>
    </div>

    paramInput = <div className="ant-col-md-5">
      <Tooltip title="For FILE_TAIL - Absolute file path, for NET_CAP - Listening port">
        <div className="form-group">
          <label>Parameter</label>
          <input type="text" placeholder="Parameter" className="form-control"
            data-field="param"
            ref="paramInput"
            value={this.state.passiveCollectorAdd.param}
            onChange={this.addPassiveCollector.bind(this)} />
        </div>
      </Tooltip>
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
          onChange={this.addPassiveCollector.bind(this)}>
          {hostOptions}
        </select>
      </div>
    </div>

    cmdInput = <div className="ant-col-md-5">
      <div className="form-group">
        <label>Command</label>
        <input type="text" placeholder="Command" className="form-control"
          disabled={(this.state.passiveCollectorAdd.type == "LongScript") ? false : true}
          data-field="cmd"
          ref="cmdInput"
          value={(this.state.passiveCollectorAdd.type == "LongScript") ? this.state.passiveCollectorAdd.cmd : ""}
          onChange={this.addPassiveCollector.bind(this)} />
      </div>
    </div>

    // encoding
    encodingInput = <div className="ant-col-md-4">
      <div className="form-group">
        <label>Encoding</label>
        <select className="form-control"
          data-field="encoding"
          ref="encodingInput"
          onChange={this.addPassiveCollector.bind(this)}>
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
          onChange={this.addPassiveCollector.bind(this)}>
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
          value={this.state.passiveCollectorAdd.desc}
          onChange={this.addPassiveCollector.bind(this)}>
        </textarea>
      </div>
    </div>

    inputLine = <div className="row clhead">
        { nameInput }
        { typeInput }
        { cmdInput }
        { paramInput }
        { hostInput }
        { encodingInput }
        { channelInput }
        { descInput }
      </div>

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

    const buttonClass = classNames({
      'ant-search-btn': true,
      // 'ant-search-btn-noempty': !!this.state.historyEventIdFilter.trim()
    })
    const searchClass = classNames({
      'ant-search-input': true,
      // 'ant-search-input-focus': this.state.historyEventIdFilterFocus
    })

    return (
      <div>
        { inputLine }
        <div className="row">
          <div className="ant-col-md-24">
            <div className="form-group text-right m-t-20">
              <button className="btn btn-primary waves-effect waves-light" type="submit"
                onClick={this.savePassiveCollector.bind(this)}> Save </button>
              <button type="reset" className="btn btn-default waves-effect waves-light m-l-10"
                onClick={this.clearPassiveCollector.bind(this)}> clear </button>
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
    )
  }
}

PassiveCollector.propTypes = {

}

PassiveCollector.defaultProps = {

}

export default PassiveCollector
