import Reflux from 'reflux'
import AppActions from '../actions/AppActions'
import constants from '../const'
import config from '../../config/config.js'
import $ from 'jquery'
import sha256 from 'crypto-js/sha256'
import { message } from 'antd'

let conalogUrl = 'http://' + config.conalogHost + ':' + config.conalogPort.toString()

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
  historyPager: { showSizeChanger: true },
  historyLoadingFlag: false,

  // Active Collector
  activeCollectorUpdated: false,
  activeCollector: {},
  activeCollectorList: [],
  activeCollectorChecklist: [],
  activeCollectorTime: null,

  // Passvice Collector
  passiveCollectorUpdated: false,
  passiveCollector: {},
  passiveCollectorList: [],
  passiveCollectorChecklist: [],

  // Login
  loginUser: '',
  loginPass: '',
  loginTries: 0,
  loginOldPass: '',
  loginNewPass: '',
  loginNewPassRepeat: '',

  // Status
  activeStatusList: [],
  statusType: 'Active'
}

let AppStore = Reflux.createStore({
  listenables: AppActions,

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
      data: pageInfo,
      success: data => {
        AppActions.getHistoryCount(pageInfo)

        // data = { pageContent: [] }
        state.historyPageContent = data.pageContent
        this.trigger(state)
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

  onGetActiveCollectorList: async function() {
    // refresh collector list
    $.ajax(conalogUrl + '/collector/list/active',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        method: 'GET',
        success: (data) => {
          console.log(data)
          state.activeCollectorList = data.activeCollectorList
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
    console.log(activeCollector)
    // save activeCollector
    $.ajax(conalogUrl + '/collector/active',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
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
    $.ajax(conalogUrl + '/collector/' + id,
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        success: (data) => {
          console.log(data)
          state.activeCollector = data
          state.activeCollector._id = undefined
          let triggerDate = new Date(parseInt(data.trigger))
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

  onSetActiveCollector: async function(activeCollector) {
    console.log(activeCollector)
    state.activeCollector = activeCollector
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
    $.ajax(conalogUrl + '/collector/active', {
      method: 'DELETE',
      crossDomain: true,
      xhrFields: { withCredentials: true },
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
    // ajax delete
    $.ajax(conalogUrl + '/collector/active', {
      method: 'PUT',
      crossDomain: true,
      xhrFields: { withCredentials: true },
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
    $.ajax(conalogUrl + '/collector/list/passive',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        method: 'GET',
        dataType: 'json',
        success: (data) => {
          console.log(data)
          state.passiveCollectorList = data.passiveCollectorList
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
    console.log(passiveCollector)
    // save activeCollector
    $.ajax(conalogUrl + '/collector/passive',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
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
    console.log(state.passiveCollectorChecklist)

    let that = this
    // load the first one in checklist to table
    let id = state.passiveCollectorChecklist[0]
    // remove _id from activeCollector
    $.ajax(conalogUrl + '/collector/' + id,
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        success: (data) => {
          console.log(data)
          state.passiveCollector = data
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

  onSetPassiveCollector: async function(passiveCollector) {
    console.log(passiveCollector)
    state.passiveCollector = passiveCollector
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
    $.ajax(conalogUrl + '/collector/passive', {
      method: 'DELETE',
      crossDomain: true,
      xhrFields: { withCredentials: true },
      data: { list: state.passiveCollectorChecklist },
      success: (data) => {
        state.passiveCollectorChecklist = []
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
    $.ajax(conalogUrl + '/collector/passive', {
      method: 'PUT',
      crossDomain: true,
      xhrFields: { withCredentials: true },
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
        method: 'GET',
        data: json,
        success: data => {
          console.log('onLogin', data)
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

    let hash = Crypto.createHash('sha256')

    let now = new Date();
    let salt = now.getTime();
    hash.update(info.oldPass + salt.toString())
    let saltedPass = hash.digest('hex')

    $.ajax(conalogUrl + '/users/update',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        method: 'POST',
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
    let url
    if (switcher.switch) {
      url = conalogUrl + '/collector/start/' + switcher.id
    }
    else {
      url = conalogUrl + '/collector/stop/' + switcher.id
    }

    console.log('onChangeStatusType', url)

    $.ajax(url,
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        method: 'GET',
        success: (data => {
          // do nothing
        })
      })
      .fail(err => {
        message.error('onSetCollectorSwitch Error: ' + err.toString(), 5)
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
    $.ajax(conalogUrl + '/collector/status/list/active',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        method: 'GET',
        success: (data => {
          state.activeStatusList = data.activeCollectorStatusList
          // console.log(state.activeStatusList)
          this.trigger(state)
        })
      })
      .fail(err => {
        message.error('onGetActiveStatusList Error: ' + err.toString(), 5)
      })
  },

  onGetPassiveStatusList() {
    $.ajax(conalogUrl + '/collector/status/list/passive',
      {
        crossDomain: true,
        xhrFields: { withCredentials: true },
        method: 'GET',
        success: (data => {
          state.passiveStatusList = data.passiveCollectorStatusList
          // console.log(state.activeStatusList)
          this.trigger(state)
        })
      })
      .fail(err => {
        message.error('onGetPassiveStatusList Error: ' + JSON.stringify(err), 5)
      })
  }

}) // AppStore

export default AppStore
