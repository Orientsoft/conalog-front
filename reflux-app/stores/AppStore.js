import Reflux from 'reflux'
import RefluxPromise from 'reflux-promise'
import Promise from 'bluebird'
Reflux.use(RefluxPromise(Promise))

import AppActions from '../actions/AppActions'
import constants from '../const'

import Config from '../../config/config.js'
let config = Config.parseArgs()

import $ from 'jquery'
// import Crypto from 'crypto'
import Crypto from 'crypto-js'
import sha256 from 'crypto-js/sha256'
import aes from 'crypto-js/aes'
import _ from 'lodash'
import { message } from 'antd'

let conalogUrl = 'http://' + config.conalogHost + ':' + config.conalogPort.toString()

// helper
// cert codec
let encodePass = (rawCert, conalogPass) => {
  // 1. create key
  let keySeed = rawCert.host + conalogPass + rawCert.ts
  let key = sha256(keySeed).toString(Crypto.enc.Hex)
  console.log(key)

  // 2. encode pass
  let encodedPass = aes.encrypt(rawCert.pass, Crypto.enc.Hex.parse(key), { iv:'', mode: Crypto.mode.ECB, padding: Crypto.pad.Pkcs7 })

  /*
  // 1. create key
  let keySeed = rawCert.host + conalogPass + rawCert.ts
  let hash = Crypto.createHash('sha256')
  hash.update(keySeed)
  let key = hash.digest('hex')

  // 2. encode pass
  let cipher = Crypto.createCipher('aes256', key)
  let encodedPass = cipher.update(rawCert.pass, 'ascii', 'hex')
  encodedPass += cipher.final('hex')
  */

  console.log('encodePass', rawCert, key, encodedPass.ciphertext.toString())

  return encodedPass.ciphertext.toString()
}

let decodePass = (encodedCert, conalogPass) => {
  // 1. create key
  let keySeed = encodedCert.host + conalogPass + encodedCert.ts
  let hash = Crypto.createHash('sha256')
  hash.update(keySeed)
  let key = hash.digest('hex')

  // 2. decode pass
  let decipher = Crypto.createDecipher('aes256', key)
  let decodedPass = decipher.update(encodedCert.pass, 'hex', 'ascii')
  decodedPass += decipher.final('ascii')

  return decodedPass
}

let state = {
  // Collector
  location: 'Login',
  collectorType: 'Active',

  // History
  history: {},
  historyPageContent: [],
  historyPageNo: 0,
  historyPageCount: 0,
  historySortField: '',
  historySortDir: '',
  historyPager: { showSizeChanger: true, current: 1, pageSize: 10 },
  historySorter: null,
  historyFilters: null,
  historyLoadingFlag: false,
  historyEventIdFilter: '',
  historyEventIdFilterFocus: false,

  // Active Collector
  activeCollectorUpdated: false,
  activeCollector: {},
  activeCollectorAdd:{},
  activeCollectorList: [],
  activeCollectorChecklist: [],
  activeCollectorTime: null,
  activeCollectorListAll:[],

  // Passvice Collector
  passiveCollectorUpdated: false,
  passiveCollector: { type: 'LongScript' },
  passiveCollectorList: [],
  passiveCollectorChecklist: [],
  passiveCollectorListAll:[],

  // Login
  loginUser: '',
  loginPass: '',
  loginTries: 0,
  loginOldPass: '',
  loginNewPass: '',
  loginNewPassRepeat: '',
  sessionId: '',

  // Status
  activeStatusList: [],
  statusType: 'Active',

  // Cert
  cert: {},
  certList: [],
  certLoadingFlag: false,
  certAddModalVisible: false,
  certEditModalVisible: false,

  //Parser
  parser:{},
  parserList:[],
  parserLoadingFlag:false,
  parserAddModalVisible: false,
  parserEditModalVisible: false,
  parserScriptsList:[],
  allCollectorList:[],
  parserscript:'',

  //ParserStatus
  instance:{},
  instanceList:[],
  instanceListAll:[],

  //AgentCollector
  agentCollector:{},
  agentCollectorList:[],
  agentCollectorListAll:[],
  agentCollectorLoadingFlag:false,
  agentCollectorEditModalVisible:false,
  agentCollectorAddModalVisible:false,

  //AgentStatus
  agentStatusList: [],

  // change language
  language:"english",

}

let AppStore = Reflux.createStore({

  listenables: AppActions,

  getInitialState() {
    return state
  },

  onNav: async function(location) {
    state.location = location
    // console.log(state)
    this.trigger(state)
  },

  onChangeCollectorType: async function(collectorType) {
    state.collectorType = collectorType
    this.trigger(state)
  },

  // History
  onGetHistoryPage: async function(pageInfo) {
    // Ajax - GET /history/page?...
    console.log(pageInfo)

    AppActions.setHistoryLoadingFlag(true)

    let url = conalogUrl + '/history/page'
    $.ajax(url, {
      crossDomain: true,
      xhrFields: { withCredentials: true },
      beforeSend: xhr => { xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId); },
      data: pageInfo,
      success: data => {
        AppActions.getHistoryCount(pageInfo)

        // data = { pageContent: [] }
        state.historyPageContent = data.pageContent
        // this.trigger(state)
      },
      dataType: 'json'
    })
    .fail(err => {
      message.error('onGetHistoryPage Error: ' + JSON.stringify(err), 5)
    })
    .always(() => {
      AppActions.setHistoryLoadingFlag(false)
    })
  },

  onGetHistoryCount: async function(pageInfo) {
    let url = conalogUrl + '/history/count'
    $.ajax(url, {
      crossDomain: true,
      xhrFields: { withCredentials: true },
      beforeSend: xhr => { xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId); },
      data: pageInfo,
      success: data => {
        // data = { count: 10000 }
        console.log('onGetHistoryCount', data.count)
        state.historyPager.total = data.count
        this.trigger(state)
      },
      dataType: 'json'
    })
    .fail(err => {
      message.error('onGetHistoryCount Error: ' + JSON.stringify(err), 5)
    })
  },

  onGetHistoryPageCount: async function() {
    // Ajax - GET /history/pagecount
    $.ajax(conalogUrl + '/history/pagecount',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => { xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId); },
        method: 'GET',
        success: (data) => {
          // success - { pageCount: 10 }
          // console.log('onGetHistoryPageCount: ', data.pageCount)
          state.historyPageCount = data.pageCount
        },
        dataType: 'json'
      }
    )
    .fail((err) => {
      console.log('onGetHistoryPageCount error:', err)
      message.error('onGetHistoryPageCount Error:' + JSON.stringify(err), 5)
    })
    .always(() => {
      this.trigger(state)
    })
  },

  onGetHistory: async function(id) {
    $.ajax(conalogUrl + '/history/' + id,
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => { xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId); },
        method: 'GET',
        dataType: 'json',
        success: (data) => {
          state.history = data
          this.trigger(state)
        }
      })
      .fail(err => {
        console.log('onGetHistory', err)
        message.error('onGetHistory Error: ' + JSON.stringify(err), 5)
      })
  },

  onSetHistoryPageNo: async function(pageNo) {
    state.historyPageNo = pageNo
    this.trigger(state)
  },

  onSetHistoryPageSize: async function(pageSize) {
    $.ajax(conalogUrl + '/history/pageinfo',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => { xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId); },
        method: 'POST',
        data: { pageSize: pageSize },
        success: (data) => {
          state.historyPageSize = pageSize
        }
      }
    )
    .fail((err) => {
      console.log('onSetHistoryPageSize error:', err)
      message.error('onSetHistoryPageSize Error: ' + JSON.stringify(err), 5)
    })
    .always(() => {
      this.trigger(state)
    })
  },

  onSetHistorySort: async function(field, dir) {
    $.ajax(conalogUrl + '/history/pageinfo',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => { xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId); },
        method: 'POST',
        data: {sortField: field, sortDir: dir},
        success: (data) => {
          state.historySortField = field
          state.historySortDir = dir
          state.historyPageContent = data.pageContent
          console.log(data.pageContent)
        },
        dataType: 'json'
      }
    )
    .fail((err) => {
      console.log('onSetHistorySort error:', err)
      message.error('onSetHistorySort Error: ' + JSON.stringify(err), 5)
    })
    .always(() => {
      this.trigger(state)
    })
  },

  onSetHistoryLoadingFlag: async function(flag) {
    state.historyLoadingFlag = flag
    this.trigger(state)
  },

  onSetHistoryPager: async function(pager) {
    state.historyPager = pager
    this.trigger(state)
  },

  onSetHistorySorter: async function(sorter) {
    state.historySorter = sorter
    console.log('historySorter',state.historySorter)
    this.trigger(state)
  },

  onSetHistoryFilters: async function(filters) {
    state.historyFilters = filters
    this.trigger(state)
  },

  onSetHistoryEventIdFilterFocus: async function(focus) {
    state.historyEventIdFilterFocus = focus
    this.trigger(state)
  },

  onSetHistoryEventIdFilter: function(filter) {
    state.historyEventIdFilter = filter
    this.trigger(state)
  },

  onGetActiveCollectorList: async function() {
    // refresh collector list
    $.ajax(conalogUrl + '/collectors?category=active',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => { xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId); },
        method: 'GET',
        success: (collectors) => {
          // Issue #1 - offset with timezone
          // fixed by xd, 2016.07.06
          // console.log('showlist',collectors)
          let acList = collectors.map(collector => {
            if (collector.type == 'Interval') {
              let trigger = parseInt(collector.trigger)
              let now = new Date()
              let offset = now.getTimezoneOffset() * 60 * 1000 // convert minute to ms
              trigger += offset
              collector.trigger = trigger.toString()
            }
            return collector
          })
          state.activeCollectorList = acList
          AppActions.listCert.triggerAsync()
            .then( ()=>{
              for(var i=0;i<state.activeCollectorList.length;i++){
                var host = state.activeCollectorList[i].host
                for(var j=0;j<state.certList.length;j++){
                  if(host == state.certList[j]._id){
                    state.activeCollectorList[i].host = state.certList[j].host
                  }
                }
              }
              state.activeCollectorListAll = state.activeCollectorList
              console.log('state.activeCollectorList',state.activeCollectorList)
              this.trigger(state)
            })
        },
        dataType: 'json'
      },
    ) // $.ajax
    .fail(err => {
      console.log('onGetActiveCollectorList error:', err)
      message.error('onGetActiveCollectorList Error: ' + JSON.stringify(err), 5)
    })
  },

  onSaveActiveCollector:async function(activeCollector) {
    // Issue #1 - offset with timezone
    // fixed by xd, 2016.07.06
    if (activeCollector.type == 'Interval') {
      let now = new Date()
      let offset = now.getTimezoneOffset() * 60 * 1000 // convert minute to ms
      activeCollector.trigger -= offset
    }

    activeCollector.category = 'active'

    // save activeCollector
    $.ajax(conalogUrl + '/collectors',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => { xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId); },
        success: (data) => {
          // do nothing
        },
        method: 'POST',
        data: activeCollector
      },
    ) // $.ajax
    .fail(err => {
      console.log('onSaveActiveCollector error:', err)
      message.error('onSaveActiveCollector Error: ' + JSON.stringify(err), 5)
    })
    .always(() => {
      AppActions.getActiveCollectorList()
    })
  },

  onEditActiveCollector: async function() {
    // console.log(state.activeCollectorChecklist)
    // let that = this
    // load the first one in checklist to table
    let id = state.activeCollectorChecklist[0]

    // remove _id from activeCollector
    $.ajax(conalogUrl + '/collectors/' + id,
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => { xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId); },
        success: (collector) => {
          state.activeCollector = collector
          // state.activeCollector._id = undefined

          // Issue #1 - offset with timezone
          // fixed by xd, 2016.07.06
          let triggerDate
          if (collector.type == 'Interval') {
            let trigger = parseInt(collector.trigger)
            let now = new Date()
            let offset = now.getTimezoneOffset() * 60 * 1000 // convert minute to ms
            trigger += offset
            triggerDate = new Date(trigger)
          }else if(collector.type == 'Time'){
            let trigger = parseInt(collector.trigger)
            triggerDate = new Date(trigger)
          }
          state.activeCollectorTime = triggerDate


          // state.activeCollectorTime = new Date(parseInt(collector.trigger))

          this.trigger(state)
          AppActions.editActiveCollector.completed()
        },
        method: 'GET',
        dataType: 'json'
      }
    )
    .fail(err => {
      message.error('onEditActiveCollector Error: ' + JSON.stringify(err), 5)
    })
  },

  onSetActiveCollector: function(field, value) {
    state.activeCollector[field] = value
    console.log('success',state.activeCollector)
    this.trigger(state)
  },

  onSetActiveCollectorFlag: async function(flag) {
    state.activeCollectorFlag = flag
    this.trigger(state)
  },

  onSetActiveCollectorChecklist: async function(checklist) {
    state.activeCollectorChecklist = checklist
    this.trigger(state)
  },

  onDeleteActiveCollector: async function() {
    // ajax delete
    $.ajax(conalogUrl + '/collectors', {
      method: 'DELETE',
      crossDomain: true,
      xhrFields: { withCredentials: true },
      beforeSend: xhr => { xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId); },
      data: { list: state.activeCollectorChecklist}
    })
    .fail(err => {
      message.error('onDeleteActiveCollector Error: ' + JSON.stringify(err), 5)
    })
    .always(() => {
      // refresh collector list
      state.activeCollectorChecklist = []
      AppActions.getActiveCollectorList()
    })
  },

  onSetActiveCollectorDeleteModal: async function(flag) {
    state.activeCollectorDeleteModal = flag
    this.trigger(state)
  },

  onSetActiveCollectorTime: async function(time) {
    state.activeCollectorTime = time
    this.trigger(state)
  },

  onUpdateActiveCollector: async function(activeCollector) {
    // delete activeCollector._id
    // ajax update
    if (activeCollector.type == 'Interval') {
      let now = new Date()
      let offset = now.getTimezoneOffset() * 60 * 1000 // convert minute to ms
      activeCollector.trigger -= offset
    }

    console.log('activecollector:',activeCollector)
    $.ajax(conalogUrl + '/collectors', {
      method: 'PUT',
      crossDomain: true,
      xhrFields: { withCredentials: true },
      beforeSend: xhr => { xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId); },
      data: activeCollector,
      success: (data) => {
        // refresh list
        AppActions.getActiveCollectorList()
      }
    })
    .fail(err => {
      message.error('onUpdateActiveCollector Error: ' + JSON.stringify(err), 5)
    })
  },

  // passive collector
  onGetPassiveCollectorList: async function() {
    // refresh collector list
    $.ajax(conalogUrl + '/collectors?category=passive',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => { xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId); },
        method: 'GET',
        dataType: 'json',
        success: (collectors) => {
          state.passiveCollectorList = collectors
          AppActions.listCert.triggerAsync()
            .then( ()=>{
              for(var i=0;i<state.passiveCollectorList.length;i++){
                var host = state.passiveCollectorList[i].host
                for(var j=0;j<state.certList.length;j++){
                  if(host == state.certList[j]._id){
                    state.passiveCollectorList[i].host = state.certList[j].host
                  }
                }
              }
              state.passiveCollectorListAll = state.passiveCollectorList
              this.trigger(state)
            })

        }
      },
    ) // $.ajax
    .fail(err => {
      console.log('onGetPassiveCollectorList error:', err)
      message.error('onGetPassiveCollectorList Error: ' + JSON.stringify(err), 5)
    })
  },

  onSavePassiveCollector: async function(passiveCollector) {
    // save passiveCollector
    passiveCollector.category = 'passive'

    $.ajax(conalogUrl + '/collectors',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => { xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId); },
        success: (data) => {
          AppActions.getPassiveCollectorList()
        },
        method: 'POST',
        data: passiveCollector
      },
    ) // $.ajax
    .fail(err => {
      console.log('onSavePassiveCollector error:', err)
      message.error('onSavePassiveCollector Error: ' + JSON.stringify(err), 5)
    })
  },

  onEditPassiveCollector: async function() {
    let that = this
    // load the first one in checklist to table
    let id = state.passiveCollectorChecklist[0]

    // remove _id from activeCollector
    $.ajax(conalogUrl + '/collectors/' + id,
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => { xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId); },
        success: (collector) => {
          state.passiveCollector = collector
          // state.passiveCollector._id = undefined
          this.trigger(state)
        },
        method: 'GET',
        dataType: 'json'
      }
    )
    .fail(err => {
      message.error('onEditPassiveCollector Error: ' + JSON.stringify(err), 5)
    })
  },

  onSetPassiveCollector: function(field, value) {
    state.passiveCollector[field] = value
    this.trigger(state)
  },

  onSetPassiveCollectorFlag: async function(flag) {
    state.passiveCollectorFlag = flag
    this.trigger(state)
  },

  onSetPassiveCollectorChecklist: async function(checklist) {
    state.passiveCollectorChecklist = checklist
    this.trigger(state)
  },

  onDeletePassiveCollector: async function() {
    // ajax delete
    $.ajax(conalogUrl + '/collectors', {
      method: 'DELETE',
      crossDomain: true,
      xhrFields: { withCredentials: true },
      beforeSend: xhr => { xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId); },
      data: { list: state.passiveCollectorChecklist },
      success: (data) => {
        AppActions.getPassiveCollectorList()
      }
    })
    .fail(err => {
      message.error('onDeletePassiveCollector Error: ' + JSON.stringify(err), 5)
    })
  },

  onSetPassiveCollectorDeleteModal: async function(flag) {
    state.passiveCollectorDeleteModal = flag
    this.trigger(state)
  },

  onUpdatePassiveCollector: async function(passiveCollector) {
    // ajax delete
    $.ajax(conalogUrl + '/collectors', {
      method: 'PUT',
      crossDomain: true,
      xhrFields: { withCredentials: true },
      beforeSend: xhr => { xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId); },
      data: passiveCollector,
      success: (data) => {
        // refresh list
        AppActions.getPassiveCollectorList()
      }
    })
    .fail(err => {
      message.error('onUpdatePassiveCollector Error: ' + JSON.stringify(err), 5)
    })
  },

  onUpdateLoginUser: async function(user) {
    state.loginUser = user
    this.trigger(state)
  },

  onUpdateLoginPass: async function(pass) {
    state.loginPass = pass
    this.trigger(state)
  },

  onLogin: async function() {
    // digest
    let now = new Date()
    let salt = now.getTime().toString()
    let saltedPass = sha256(state.loginPass + salt).toString()

    let json = {
      user: state.loginUser,
      pass: saltedPass,
      salt: salt
    }

    // ajax get
    $.ajax(conalogUrl + '/users/login',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        method: 'POST',
        data: json,
        success: data => {
          state.sessionId = data
          state.location = "Home"
          this.trigger(state)
        }
      }
    ) // $.ajax
    .fail(err => {
      console.log('onLogin Error', err)
      state.loginTries++
      message.error('Login failed. Please check your username and password.', 5)
      this.trigger(state)
    })
  },

  onLogout: async function() {
    console.log('AppStore::onLogout')
    $.ajax(conalogUrl + '/users/logout',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => { xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId); },
        method: 'GET',
        success: data => {
          // do nothing
        }
      }
    )
    .fail(err => {
      // go to login
      state.location = 'Login'
      this.trigger(state)
    })
    .always(() => {
      state.location = 'Login'
      this.trigger(state)
    })

    state.location = 'Login'
    this.trigger(state)
  },

  onChangeManagementPassword: async function(info) {
    console.log('AppStore::onChangeManagementPassword')

    state.loginNewPass = info.newPass;
    state.loginNewPassRepeat = info.repeatedNewPass;

    if (info.newPass != info.repeatedNewPass) {
      // directly go back
      state.managementErr = {msg: 'Error: The passwords that you entered are not identical to each other'}
      this.trigger(state)
    }

    let now = new Date();
    let salt = now.getTime().toString();
    let saltedPass = sha256(state.loginPass + salt).toString()

    $.ajax(conalogUrl + '/users/update',
      {
        crossDomain: true,
        // xhrFields: { withCredentials: true },
        method: 'POST',
        beforeSend: xhr => { xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId); },
        success: data => {
          // do nothing
        },
        data: {
          oldPass: saltedPass,
          newPass: info.newPass,
          salt: salt.toString()
        }
      }
    )
    .fail(err => {
      // go to login
      console.log(err)
      state.location = 'Login'
      this.trigger(state)
    })
    .always(() => {
      // go back to login
      state.location = 'Login'
      this.trigger(state)
    })
  },

  onChangeStatusType(type) {
    state.statusType = type
    this.trigger(state)
  },

  onSetCollectorSwitch(switcher) {
    let that = this
    // switch = { id: id, switch: switch, category: '' }
    let data = { id: switcher.id }
    let url = conalogUrl + '/collectors/instances'
    url = switcher.switch? url : url + '/' + switcher.id

    $.ajax(url, 
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => { xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId); },
        method: switcher.switch? 'POST' : 'DELETE',
        data: switcher.switch? data : null,
        success: (data => {
          // do nothing
        })
    })
    .fail(error => {
      message.error('onSetCollectorSwitch Error: ' + JSON.stringify(error), 5)
    })
    .always(() => {
      // refresh status list
      if (switcher.category == 'active')
        AppActions.getActiveStatusList()
      else
        // AppActions.getPassiveStatusList()
        AppActions.getPassiveStatusList()
    }) 
  },

  onGetActiveStatusList() {
    $.ajax(conalogUrl + '/collectors/status/active',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => { xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId); },
        method: 'GET',
        success: (statusList => {
          // Issue #1 - offset with timezone
          // fixed by xd, 2016.07.06
          let asList = statusList.map(status => {
            if (status.type == 'Interval') {
              let trigger = parseInt(status.trigger)
              let now = new Date()
              let offset = now.getTimezoneOffset() * 60 * 1000 // convert minute to ms
              trigger += offset
              status.trigger = trigger.toString()
            }

            return status
          })

          state.activeStatusListAll = _.cloneDeep(asList)

          AppActions.listCert.triggerAsync()
            .then( ()=>{
              for(var i=0;i<asList.length;i++){
                var host = asList[i].host
                for(var j=0;j<state.certList.length;j++){
                  if(host == state.certList[j]._id){
                    asList[i].host = state.certList[j].host
                  }
                }
              }

              state.activeStatusList = asList.map((item) => {
                if (item.status.runningFlag ) {
                  if(item.status.lastActivity.stdout){
                    item.status.lastActivity.stdout = item.status.lastActivity.stdout.substr(0, 32) + '...'
                  }
                  if(item.status.lastActivity.stderr){
                    item.status.lastActivity.stderr = item.status.lastActivity.stderr.substr(0, 32) + '...'
                  }
                }
                return item
              })
            })

          this.trigger(state)
          AppActions.getActiveStatusList.completed()
        })
      })
      .fail(err => {
        message.error('onGetActiveStatusList Error: ' + err.toString(), 5)
      })
  },

  onGetPassiveStatusList() {
    $.ajax(conalogUrl + '/collectors/status/passive',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => { xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId); },
        method: 'GET',
        success: (statusList => {
          // state.passiveStatusList = statusList
          state.passiveStatusListAll = _.cloneDeep(statusList)

          AppActions.listCert.triggerAsync()
            .then( ()=>{
              for(var i=0;i<statusList.length;i++){
                var host = statusList[i].host
                for(var j=0;j<state.certList.length;j++){
                  if(host == state.certList[j]._id){
                    statusList[i].host = state.certList[j].host
                  }
                }
              }

              state.passiveStatusList = statusList.map((item) => {
                if (item.status.runningFlag && item.status.lastActivity.data) {
                  item.status.lastActivity.data = item.status.lastActivity.data.substr(0, 32) + '...'
                }
                return item
              })
            })

          this.trigger(state)
          AppActions.getPassiveStatusList.completed()
        })
      })
      .fail(err => {
        message.error('onGetPassiveStatusList Error: ' + JSON.stringify(err), 5)
      })
  },

  onGetCert(host) {
    $.ajax(conalogUrl + '/certificates/' + host + '?name=' + state.loginUser,
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => {
          xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId)
        },
        method: 'GET',
        success: data => {
          // console.log('onGetCert', data)
          state.cert = data
          this.trigger(state)
        }
      })
      .fail(err => {
        message.error('onGetCert Error: ' + JSON.stringify(err), 5)
      })
  },

  onListCert() {
    $.ajax(conalogUrl + '/certificates',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => {
          xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId)
        },
        method: 'GET',
        success: data => {
	        state.certList = data;
          for(var i=0; i<data.length; i++){
            var pass = state.certList[i].pass;
            var temp = "";
            for(var j = 0; j < pass.length; j++){
              temp = temp + "*"
            }
	          state.certList[i].replacePass = temp;
            state.certList[i].originPass = state.certList[i].replacePass;
          }
          this.trigger(state)
          AppActions.listCert.completed()
        }
      })
      .fail(err => {
        message.error('onListCert Error: ' + JSON.stringify(err), 5)
      })
  },

  onSetCertLoadingFlag(flag) {
    state.certLoadingFlag = flag
    this.trigger(state)
  },

  onSetCurrentCert(cert) {
    // TODO : check fields

    state.cert = cert
    this.trigger(state)
  },

  onUpdateCurrentCert(fields) {
    // TODO : check fields

    _.assign(state.cert, fields)
    this.trigger(state)
  },

  onSaveCurrentCert() {
    let method = ''
    if (state.cert._id !== undefined)
      method = 'PUT'
    else
      method = 'POST'

    console.log('onSaveCurrentCert', state.cert)

    let cert = {
      host: state.cert.host,
      port: parseInt(state.cert.port),
      user: state.cert.user,
      pass: state.cert.pass
    }

    let now = new Date()
    cert.ts = now.getTime()
    cert.name = state.loginUser
    // cert.pass = encodePass(cert, state.loginPass)

    if (state.cert._id !== undefined) {
      cert._id = state.cert._id
    }

    $.ajax(conalogUrl + '/certificates',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => {
          xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId)
        },
        method: method,
        data: cert,
        success: data => {
          // do nothing
          // console.log('AppStore::onSaveCurrentCert', data)
          AppActions.saveCurrentCert.completed()
        },
        error: (e) => console.log('xhr error:', e)
      })

      .fail(err => {
        message.error('onListCert Error: ' + JSON.stringify(err), 5)
        return AppActions.saveCurrentCert.failed(err)
      })
  },

  onDeleteCurrentCert() {
    $.ajax(conalogUrl + '/certificates/' + state.cert._id,
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => {
          xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId)
        },
        method: 'DELETE',
        success: data => {
          AppActions.deleteCurrentCert.completed()
        }
      })
      .fail(err => {
        message.error('onListCert Error: ' + JSON.stringify(err), 5)
        return AppActions.deleteCurrentCert.failed(err)
      })
  },

  onClearCurrentCert() {
    console.log('AppStore::onClearCurrentCert')
    state.cert = {}
    this.trigger(state)
  },

  onSetCertAddModalVisible(visible) {
    state.certAddModalVisible = visible
    this.trigger(state)
  },

  onSetCertEditModalVisible(visible) {
    state.certEditModalVisible = visible
    this.trigger(state)
  },

  /*
  onSetCertDeleteModalVisible(visible) {
    state.certDeleteModalVisible = true
    this.trigger(state)
  }
  */
  onToggleCertPass(_id, showPassword) {
    if (showPassword == true) {
      for (var i=0; i<state.certList.length; i++) {
        if (state.certList[i]._id == _id) {
          state.certList[i].originPass=state.certList[i].pass
        }
      }
      this.trigger(state);
    } else {
      for (var i=0; i<state.certList.length; i++) {
        if (state.certList[i].originPass == state.certList[i].pass) {
          state.certList[i].originPass = state.certList[i].replacePass
        }
      }
      this.trigger(state)
    }
  },

  //Parser
  onListParser() {
    $.ajax(conalogUrl + '/parsers',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => {
          xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId)
        },
        method: 'GET',
        success: data => {
          console.log('AppStore::onListParser', data)
          state.parserList = data;
          this.trigger(state)
        }
      })
      .fail(err => {
        message.error('onListParser Error: ' + JSON.stringify(err), 5)
      })
  },

  onGetParser(name) {
    $.ajax(conalogUrl + '/parsers?name=' + name,
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => {
          xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId)
        },
        method: 'GET',
        success: data => {
          state.parser = data[0]
          console.log("get",state.parser)
          state.parser.inputType = state.parser.input.type
          state.parser.inputChannel = state.parser.input.channel
          state.parser.outputType = state.parser.output.type
          state.parser.outputChannel = state.parser.output.channel
          this.trigger(state)
        }
      })
      .fail(err => {
        message.error('onGetParser Error: ' + JSON.stringify(err), 5)
      })
  },

  onSetParserLoadingFlag(flag) {
    state.parserLoadingFlag = flag
    this.trigger(state)
  },

  onUpdateCurrentParser(fields) {
    // TODO : check fields

    _.assign(state.parser, fields)
    this.trigger(state)
  },

  onSaveCurrentParser() {
    let method = ''
    if (state.parser.id !== undefined)
      method = 'PUT'
    else
      method = 'POST'

    let parser = {
      name: state.parser.name,
      path: state.parser.path,
      parameter: state.parser.parameter,
      remark: state.parser.remark,
      input: {type: state.parser.inputType, channel: state.parser.inputChannel},
      output: {type: state.parser.outputType, channel: state.parser.outputChannel},
      host:state.parser.host,
      ts: Date.now()
    }
    if (state.parser.id !== undefined) {
      parser.id = state.parser.id
    }
    $.ajax(conalogUrl + '/parsers',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => {
          xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId)
        },
        method: method,
        data: JSON.stringify(parser),
        contentType: "application/json",
        success: data => {
          console.log('id->:', data)
          AppActions.saveCurrentParser.completed()
        },
        error: (e) => console.log('xhr error:', e)
      })
      .fail(err => {
        message.error('onListParser Error: ' + JSON.stringify(err), 5)
        return AppActions.saveCurrentParser.failed(err)
      })
  },

  onDeleteCurrentParser() {
    console.log("delete ",state.parser)
    $.ajax(conalogUrl + '/parsers/' + state.parser.id,
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => {
          xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId)
        },
        method: 'DELETE',
        success: data => {
          AppActions.deleteCurrentParser.completed()
        },
        error: (e) => console.log('xhr error:', e)
      })
      .fail(err => {
        message.error('onListParser Error: ' + JSON.stringify(err), 5)
        return AppActions.deleteCurrentParser.failed(err)
      })
  },

  onClearCurrentParser() {
    console.log('AppStore::onClearCurrentParser')
    state.parser = {}
    this.trigger(state)
  },

  onSetParserAddModalVisible(visible) {
    state.parserAddModalVisible = visible
    this.trigger(state)
  },

  onSetParserEditModalVisible(visible) {
    state.parserEditModalVisible = visible
    this.trigger(state)
  },

  onListParserScripts(){
    $.ajax(conalogUrl + '/parsers/scripts',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => {
          xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId)
        },
        method: 'GET',
        success: data => {
          console.log('AppStore::onListParserScripts', data)
          state.parserScriptsList = data;
          this.trigger(state)
        }
      })
      .fail(err => {
        message.error('onListParserScripts Error: ' + JSON.stringify(err), 5)
      })
  },

  onGetAllCollector(){
    $.ajax(conalogUrl + '/collectors',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => { xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId); },
        method: 'GET',
        dataType: 'json',
        success: (collectors) => {
          let collectorList  = []
          collectors.map((item) => {
              collectorList.push(item)
          })
          console.log('collectorList:',collectorList)
          state.allCollectorList = collectorList
          this.trigger(state)
        }
      },
    ) // $.ajax
      .fail(err => {
        console.log('onGetAllCollectorList error:', err)
        message.error('onGetAllCollectorList Error: ' + JSON.stringify(err), 5)
      })
  },


  //parserStatus
  onListInstance() {
    $.ajax(conalogUrl + '/parsers/instances',
      {
        crossDomain: true,
        xhrFields: {withCredentials: true},
        beforeSend: xhr => {
          xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId)
        },
        method: 'GET',
        success: data => {
          // state.instanceList = data;
          state.instanceListAll = _.cloneDeep(data);

          state.instanceList = data.map((item) => {
            console.log("item",item)
            if (item.lastActivity.message) {
              item.lastActivity.message = item.lastActivity.message.substr(0, 32) + '...'
            }
            return item
          })
          this.trigger(state)
        },
        error: (e) => console.log('xhr error:', e)
      })
      .fail(err => {
        message.error('onListParserInstance Error: ' + JSON.stringify(err), 5)
      })
  },

  onSaveInstance () {
    let parserInstance = {
      id: state.parser.id,
    }
    $.ajax(conalogUrl + '/parsers/instances',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => {
          xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId)
        },
        method: "POST",
        data: parserInstance,
        success: data => {
          console.log('data->:', data)

          AppActions.saveInstance.completed()
        },
        error: (e) => console.log('xhr error:', e)
      })
      .fail(err => {
        message.error('onListInstance Error: ' + JSON.stringify(err), 5)
        return AppActions.saveInstance.failed(err)
      })
  },

  onGetInstance(id) {
    $.ajax(conalogUrl + '/parsers/instances?id=' + id,
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => {
          xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId)
        },
        method: 'GET',
        success: data => {
          console.log('getinstance->:', data)
          state.instance = data
          this.trigger(state)
        }
      })
      .fail(err => {
        message.error('onGetInstance Error: ' + JSON.stringify(err), 5)
      })
  },

  onStopInstance() {
    console.log('stopinstance-->',state.instance.id)
    $.ajax(conalogUrl + '/parsers/instances/' + state.instance.id,
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => {
          xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId)
        },
        method: 'DELETE',
        success: data => {
          AppActions.stopInstance.completed()
        },
        error: (e) => console.log('xhr error:', e)
      })
      .fail(err => {
        message.error('onListInstance Error: ' + JSON.stringify(err), 5)
        return AppActions.stopInstance.failed(err)
      })
  },

  //agentCollector
  onListAgentCollector() {
    return $.ajax(conalogUrl + '/collectors?category=agent',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => {
          xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId)
        },
        method: 'GET',
        success: data => {
          console.log('AppStore::onListAgentCollector', data)
          state.agentCollectorList = data;
          // cb && cb(state)
          state.agentCollectorListAll = state.agentCollectorList;
          this.trigger(state)
        }
      })
      .fail(err => {
        message.error('onListAgentCollector Error: ' + JSON.stringify(err), 5)
      })
  },

  onSaveAgentCollector() {
    let method = ''
    if (state.agentCollector._id !== undefined)
      method = 'PUT'
    else
      method = 'POST'


    let agentCollector = {
      name: state.agentCollector.name,
      category:"agent",
      param:state.agentCollector.param,
      encoding:state.agentCollector.encoding,
      channel: state.agentCollector.channel,
      desc:state.agentCollector.desc,
      ts: Date.now()
    }

    console.log('onSaveCurrentAgentCollector', agentCollector)

    if (state.agentCollector._id !== undefined) {
      agentCollector._id = state.agentCollector._id
    }
    $.ajax(conalogUrl + '/collectors',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => {
          xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId)
        },
        method: method,
        data:agentCollector,
        success: data => {
          console.log('id->:', data)
          AppActions.saveAgentCollector.completed()
        },
        error: data => {
          console.log('saveCollector:', data)
        }
      })

      .fail(err => {
        message.error('onSaveAgentCollector Error: ' + JSON.stringify(err), 5)
        return AppActions.saveAgentCollector.failed(err)
      })
  },

  onGetAgentCollector(name) {
    console.log("getname",name)

    $.ajax(conalogUrl + '/collectors?name=' + name,
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => {
          xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId)
        },
        method: 'GET',
        success: data => {
          console.log("getagentcollector",data);
          state.agentCollector = data[0];
          this.trigger(state);
        }
      })
      .fail(err => {
        message.error('onGetagentCollector Error: ' + JSON.stringify(err), 5)
      })
  },

  onSearchAgentCollector(name){
    console.log("getname",name)
    $.ajax(conalogUrl + '/collectors?name=' + name,
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => {
          xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId)
        },
        method: 'GET',
        success: data => {
          console.log("getagentcollector",data);
          state.agentCollectorList = data;
          this.trigger(state);
        }
      })
      .fail(err => {
        message.error('onGetagentCollector Error: ' + JSON.stringify(err), 5)
      })
  },


  onDeleteAgentCollector() {
    console.log(state.agentCollector._id)
    $.ajax(conalogUrl + '/collectors/' + state.agentCollector._id,
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => {
          xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId)
        },
        method: 'DELETE',
        success: data => {
          AppActions.deleteAgentCollector.completed()
        }
      })
      .fail(err => {
        message.error('onListParser Error: ' + JSON.stringify(err), 5)
        return AppActions.deleteAgentCollector.failed(err)
      })
  },

  onSetParserLoadingFlag(flag) {
    state.agentCollectorLoadingFlag = flag
    this.trigger(state)
  },

  onUpdateCurrentAgentCollector(fields) {
    // TODO : check fields

    _.assign(state.agentCollector, fields)
    this.trigger(state)
  },

  onClearCurrentAgentCollector() {
    console.log('AppStore::onClearCurrentAgentCollector')
    state.agentCollector = {}
    this.trigger(state)
  },

  onSetAgentCollectorAddModalVisible(visible) {
    state.agentCollectorAddModalVisible = visible
    this.trigger(state)
  },

  onSetAgentCollectorEditModalVisible(visible) {
    state.agentCollectorEditModalVisible = visible
    this.trigger(state)
  },


  //agentStatus
  onGetAgentStatusList() {
    $.ajax(conalogUrl + '/collectors/status/agent',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => { xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId); },
        method: 'GET',
        success: (statusList => {
          // state.agentStatusList = statusList
          state.agentStatusListAll = _.cloneDeep(statusList)
          state.agentStatusList = statusList.map((item) => {
            if (item.status.runningFlag && item.status.lastActivity.stdout ) {
                item.status.lastActivity.stdout = item.status.lastActivity.stdout.substr(0, 32) + '...'
            }
            return item
          })

          this.trigger(state)
        })
      })
      .fail(err => {
        message.error('onGetAgentStatusList Error: ' + err.toString(), 5)
      })
  },

  //change language
  onChangeLanguage(e){
    if(e == "chinese"){
      state.language = "chinese"
    }else{
      state.language = "english"
    }
    console.log(state.language)
    this.trigger(state)
  }



}) // AppStore

export default AppStore
