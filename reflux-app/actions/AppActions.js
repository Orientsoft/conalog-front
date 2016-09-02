import Reflux from 'reflux'

let AppActions = Reflux.createActions({
  'nav': {asyncResult: true},
  'changeCollectorType': {asyncResult: true},

  // History
  'getHistoryPage': {asyncResult: true},
  'getHistoryCount': {asyncResult: true},
  'getHistoryPageCount': {asyncResult: true},
  'getHistory': {asyncResult: true},
  'setHistoryPageNo': {asyncResult: true},
  'setHistoryPageSize': {asyncResult: true},
  'setHistorySort': {asyncResult: true},
  'setHistoryLoadingFlag': {asyncResult: true},
  'setHistoryPager': {asyncResult: true},
  'setHistorySorter': {asyncResult: true},
  'setHistoryFilters': {asyncResult: true},
  'setHistoryEventIdFilterFocus': {asyncResult: true},
  'setHistoryEventIdFilter': {sync: true},

  // Collecotr
  'getActiveCollectorList': {asyncResult: true},
  'saveActiveCollector': {asyncResult: true},
  'editActiveCollector': {asyncResult: true},
  'setActiveCollector': {sync: true},
  'setActiveCollectorFlag': {asyncResult: true},
  'setActiveCollectorChecklist': {asyncResult: true},
  'deleteActiveCollector': {asyncResult: true},
  'setActiveCollectorDeleteModal': {asyncResult: true},
  'setActiveCollectorTime': {asyncResult: true},
  'updateActiveCollector': {asyncResult: true},

  'getPassiveCollectorList': {asyncResult: true},
  'savePassiveCollector': {asyncResult: true},
  'editPassiveCollector': {asyncResult: true},
  'setPassiveCollector': {sync: true},
  'setPassiveCollectorFlag': {asyncResult: true},
  'setPassiveCollectorChecklist': {asyncResult: true},
  'deletePassiveCollector': {asyncResult: true},
  'setPassiveCollectorDeleteModal': {asyncResult: true},
  'updatePassiveCollector': {asyncResult: true},

  // Login
  'updateLoginUser': {asyncResult: true},
  'updateLoginPass': {asyncResult: true},
  'login': {asyncResult: true},
  'logout': {asyncResult: true},

  // Management
  'changeManagementPassword': {asyncResult: true},

  // status
  'changeStatusType': {asyncResult: true},
  'setCollectorSwitch': {asyncResult: true},
  'getActiveStatusList': {asyncResult: true},
  'getPassiveStatusList': {asyncResult: true},

  // Cert
  'getCert': {asyncResult: true},
  'listCert': {asyncResult: true},
  'setCertLoadingFlag': {asyncResult: true},
  'setCurrentCert': {sync: true},
  'updateCurrentCert': {sync: true},
  'saveCurrentCert': {asyncResult: true},
  'deleteCurrentCert': {asyncResult: true},
  'clearCurrentCert': {asyncResult: true},
  'setCertAddModalVisible': {asyncResult: true},
  'setCertEditModalVisible': {asyncResult: true}
})

export default AppActions
