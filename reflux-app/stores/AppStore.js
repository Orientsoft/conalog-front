import Reflux from 'reflux'
import AppActions from '../actions/AppActions'
import constants from '../const'
import $ from 'jquery'
import sha256 from 'crypto-js/sha256'

let state = {
  // Collector
  location: 'Login',
  collectorType: 'Active',

  // History
  historyPageContent: [],
  historyPageNo: 0,
  historyPageCount: 0,
  historySortField: '',
  historySortDir: '',

  // Active Collector
  activeCollectorUpdated: false,
  activeCollector: {},
  activeCollectorList: [],
  activeCollectorChecklist: [],

  // Login
  loginUser: '',
  loginPass: '',
  loginTries: 0
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
  onGetHistoryPage: async function() {
    // Ajax - GET /history/page/[pageNo]
    $.getJSON(constants.CONALOG_URL + '/history/page/' + state.historyPageNo, (data) => {
      // { pageContent: [] }
      // console.log('onGetHistoryPage: ', data)
      state.historyPageContent = data.pageContent
    })
    .fail((err) => {
      console.log('onGetHistoryPage error:', err)
    })
    .always(() => {
      this.trigger(state)
    })
  },

  onGetHistoryPageCount: async function() {
    // Ajax - GET /history/pagecount
    $.getJSON(constants.CONALOG_URL + '/history/pagecount', (data) => {
      // success - { pageCount: 10 }
      // console.log('onGetHistoryPageCount: ', data.pageCount)
      state.historyPageCount = data.pageCount
    })
    .fail((err) => {
      console.log('onGetHistoryPageCount error:', err)
    })
    .always(() => {
      this.trigger(state)
    })
  },

  onSetHistoryPageNo: async function(pageNo) {
    state.historyPageNo = pageNo
    this.trigger(state)
  },

  onSetHistoryPageSize: async function(pageSize) {
    $.post(constants.CONALOG_URL + '/history/pageinfo',
      { pageSize: pageSize },
      (data) => {
        state.historyPageSize = pageSize
      },
      'json'
    )
    .fail((err) => {
      console.log('onSetHistoryPageSize error:', err)
    })
    .always(() => {
      this.trigger(state)
    })
  },

  onSetHistorySort: async function(field, dir) {
    $.post(constants.CONALOG_URL + '/history/pageinfo',
      {sortField: field, sortDir: dir},
      (data) => {
        state.historySortField = field
        state.historySortDir = dir
        state.historyPageContent = data.pageContent
        console.log(data.pageContent)
      },
      'json'
    )
    .fail((err) => {
      console.log('onSetHistorySort error:', err)
    })
    .always(() => {
      this.trigger(state)
    })
  },

  onGetActiveCollectorList: async function() {
    // refresh collector list
    $.get(constants.CONALOG_URL + '/collector/list/active', (data) => {
      console.log(data)
      state.activeCollectorList = data.activeCollectorList
      this.trigger(state)
    })
    .fail(err => {
      console.log('onGetActiveCollectorList error:', err)
    })
  },

  onSaveActiveCollector: async function(activeCollector) {
    console.log(activeCollector)
    // save collector
    $.post(constants.CONALOG_URL + '/collector/active',
      activeCollector,
      (data) => {
        // do nothing
      },
      'json'
    )
    .fail((err) => {
      console.log('onSaveActiveCollector error:', err)
    })
    .always(() => {
      AppActions.getActiveCollectorList()
    })
  },

  onCloneActiveCollector: async function(activeCollectorId) {
    // TO DO : clone collector

    this.trigger(state)

    // refresh collector list
    AppActions.getActiveCollectorList()
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
    $.ajax(constants.CONALOG_URL + '/collector/active', {
      method: 'DELETE',
      data: { list: state.activeCollectorChecklist }
    })
    .fail(err => {
      console.log('onDeleteActiveCollector error:', err)
    })
    .always(() => {
      // refresh collector list
      state.activeCollectorChecklist = []
      AppActions.getActiveCollectorList()
    })
  },

  // passive collector
  onGetPassiveCollectorList: async function() {
    // refresh collector list
    $.get(constants.CONALOG_URL + '/collector/list/passive', (data) => {
      console.log(data)
      state.passiveCollectorList = data.passiveCollectorList
      this.trigger(state)
    })
    .fail(err => {
      console.log('onGetPassiveCollectorList error:', err)
    })
  },

  onSavePassiveCollector: async function(passiveCollector) {
    console.log(passiveCollector)
    // save collector
    $.post(constants.CONALOG_URL + '/collector/passive',
      passiveCollector,
      (data) => {
        // do nothing
      },
      'json'
    )
    .fail((err) => {
      console.log('onSavePassiveCollector error:', err)
    })
    .always(() => {
      AppActions.getPassiveCollectorList()
    })
  },

  onClonePassiveCollector: async function(passiveCollectorId) {
    // TO DO : clone collector

    this.trigger(state)

    // refresh collector list
    AppActions.getPassiveCollectorList()
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
    $.ajax(constants.CONALOG_URL + '/collector/passive', {
      method: 'DELETE',
      data: { list: state.passiveCollectorChecklist }
    })
    .fail(err => {
      console.log('onDeletePassiveCollector error:', err)
    })
    .always(() => {
      // refresh collector list
      state.passiveCollectorChecklist = []
      AppActions.getPassiveCollectorList()
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
    $.get(constants.CONALOG_URL + '/users/login',
      json, data => {

      }, 'json')
    .fail(err => {
      console.log('onLogin Error', err)
      if (err.status == 200) {
        // success actually...
        // redirect to main page
        // console.log('onLogin', data)
        state.location = 'Home'
      }
      else {
        state.loginTries++
      }

      this.trigger(state)
    })
  }

}) // AppStore

export default AppStore
