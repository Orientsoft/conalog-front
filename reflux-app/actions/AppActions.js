import Reflux from 'reflux'

let AppActions = Reflux.createActions({
  'nav': {asyncResult: true},
  'changeCollectorType': {asyncResult: true},

  // History
  'getHistoryPage': {asyncResult: true},
  'getHistoryPageCount': {asyncResult: true},
  'setHistoryPageNo': {asyncResult: true},
  'setHistoryPageSize': {asyncResult: true},
  'setHistorySort': {asyncResult: true},

  // Collecotr
  'saveActiveCollector': {asyncResult: true},
  'removeActiveCollector': {asyncResult: true},
  'cloneActiveCollector': {asyncResult: true},
  'setActiveCollector': {asyncResult: true},
  'setActiveCollectorFlag': {asyncResult: true}
})

export default AppActions
