import Reflux from 'reflux'
import RefluxPromise from 'reflux-promise'
import Promise from 'bluebird'
Reflux.use(RefluxPromise(Promise))

import AppActions from '../actions/AppActions'
import constants from '../const'
import config from '../../config/config.js'
import $ from 'jquery'
// import Crypto from 'crypto'
import Crypto from 'crypto-js'
import sha256 from 'crypto-js/sha256'
import aes from 'crypto-js/aes'
import { message } from 'antd'
import Moment from 'moment'

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
  activeCollectorList: [],
  activeCollectorChecklist: [],
  activeCollectorTime: new Date('2017-01-01 00:00:10'),

  // Passvice Collector
  passiveCollectorUpdated: false,
  passiveCollector: { type: 'LongScript' },
  passiveCollectorList: [],
  passiveCollectorChecklist: [],

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
  certEditModalVisible: false
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
          this.trigger(state)
        },
        dataType: 'json'
      },
    ) // $.ajax
    .fail(err => {
      console.log('onGetActiveCollectorList error:', err)
      message.error('onGetActiveCollectorList Error: ' + JSON.stringify(err), 5)
    })
  },

  onSaveActiveCollector: async function(activeCollector) {
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
    let that = this
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
          state.activeCollector._id = undefined

          // Issue #1 - offset with timezone
          // fixed by xd, 2016.07.06
          let triggerDate
          if (collector.type == 'Interval') {
            let trigger = parseInt(collector.trigger)
            let now = new Date()
            let offset = now.getTimezoneOffset() * 60 * 1000 // convert minute to ms
            trigger += offset
            triggerDate = new Date(trigger)
          }

          state.activeCollectorTime = triggerDate
          this.trigger(state)
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
      data: { list: state.activeCollectorChecklist }
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
    // ajax update
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
          this.trigger(state)
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
          state.passiveCollector._id = undefined
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

          state.activeStatusList = asList
          this.trigger(state)
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
          state.passiveStatusList = statusList
          this.trigger(state)
        })
      })
      .fail(err => {
        message.error('onGetPassiveStatusList Error: ' + JSON.stringify(err), 5)
      })
  },

  onGetCert(host) {
    $.ajax(conalogUrl + '/cert/' + host,
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => {
          xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId)
        },
        method: 'GET',
        success: data => {
          state.cert = data
          this.trigger(state)
        }
      })
      .fail(err => {
        message.error('onGetCert Error: ' + JSON.stringify(err), 5)
      })
  },

  onListCert() {
    $.ajax(conalogUrl + '/cert',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        beforeSend: xhr => {
          xhr.setRequestHeader(constants.ACCESS_TOKEN_NAME, state.sessionId)
        },
        method: 'GET',
        success: data => {
          console.log('AppStore::onListCert', data)
          state.certList = data
          this.trigger(state)
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

    // console.log('onSaveCurrentCert', state.cert)

    let cert = {
      host: state.cert.host,
      port: parseInt(state.cert.port),
      user: state.cert.user,
      pass: state.cert.pass
    }

    let now = new Date()
    cert.ts = now.getTime()
    cert.name = state.loginUser
    cert.pass = encodePass(cert, state.loginPass)

    if (state.cert._id !== undefined) {
      cert._id = state.cert._id
    }

    $.ajax(conalogUrl + '/cert',
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
          console.log('AppStore::onSaveCurrentCert', data)
          AppActions.saveCurrentCert.completed()
        }
      })
      .fail(err => {
        message.error('onListCert Error: ' + JSON.stringify(err), 5)
        return AppActions.saveCurrentCert.failed(err)
      })
  },

  onDeleteCurrentCert() {
    $.ajax(conalogUrl + '/cert/' + state.cert.host,
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

}) // AppStore

export default AppStore
