import Reflux from 'reflux'
import AppActions from '../actions/AppActions'
import constants from '../const'
import $ from 'jquery'

let state = {
  // Collector
  location: 'History',
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
  activeCollectorList: []
}

let AppStore = Reflux.createStore({
  listenables: AppActions,

  onNav: async function(location) {
    state.location = location
    console.log(state)
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
    $.get(constants.CONALOG_URL + '/collector/active/list', (data) => {
      state.activeCollectorList = data.activeCollectorList
      this.trigger(state)
    })
    .fail(err => {
      console.log('onGetActiveCollectorList error:', err)
    })
  },

  onSaveActiveCollector: async function(activeCollector) {
    console.log(activeCollector)
    // TO DO : save collector
    $.post(constants.CONALOG_URL + '/collector/active',
      activeCollector,
      (data) => {
        AppActions.getActiveCollectorList()
      },
      'json'
    )
    .fail((err) => {
      console.log('onSaveActiveCollector error:', err)
    })
  },

  onRemoveActiveCollector: async function(activeCollectorId) {
    // TO DO : remove collector
    $.delete(constants.CONALOG_URL + '/collector/active' + activeCollectorId,
      (data) => {
        AppActions.getActiveCollectorList()
      }
    )
    .fail((err) => {
      console.log('onSaveActiveCollector error:', err)
    })
    this.trigger(state)

    // refresh collector list
    AppActions.getActiveCollectorList()
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
  }

}) // AppStore

export default AppStore
