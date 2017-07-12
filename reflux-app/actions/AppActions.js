import Reflux from 'reflux'
import RefluxPromise from 'reflux-promise'
import Promise from 'bluebird'
Reflux.use(RefluxPromise(Promise))

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
  'setCertLoadingFlag': {sync: true},
  'setCurrentCert': {sync: true},
  'updateCurrentCert': {sync: true},
  'saveCurrentCert': {asyncResult: true},
  'deleteCurrentCert': {asyncResult: true},
  'clearCurrentCert': {sync: true},
  'setCertAddModalVisible': {sync: true},
  'setCertEditModalVisible': {sync: true},
  'toggleCertPass':{sync: true},

  //Parser
  'getParser':{asyncResult: true},
  'listParser':{asyncResult: true},
  'setParserLoadingFlag': {sync: true},
  'setCurrentParser': {sync: true},
  'updateCurrentParser': {sync: true},
  'saveCurrentParser': {asyncResult: true},
  'deleteCurrentParser': {asyncResult: true},
  'clearCurrentParser': {sync: true},
  'setParserAddModalVisible': {sync: true},
  'setParserEditModalVisible': {sync: true},

  //ParserStatus
  'listInstance':{asyncResult: true},
  'saveInstance':{asyncResult: true},
  'getInstance':{asyncResult: true},
  'startInstance':{asyncResult: true},
  'stopInstance':{asyncResult: true},

  //agentCollector
  'listAgentCollector':{asyncResult: true},
  'getAgentCollector':{asyncResult: true},
  'setAgentCollectorLoadingFlag': {sync: true},
  'setAgentCollector': {sync: true},
  'updateCurrentAgentCollector': {sync: true},
  'saveAgentCollector':{asyncResult: true},
  'deleteAgentCollector':{asyncResult: true},
  'clearCurrentAgentCollector':{sync: true},
  'setAgentCollectorAddModalVisible': {sync: true},
  'setAgentCollectorEditModalVisible': {sync: true},
  'searchAgentCollector':{sync: true},

  //agentStatus
  'getAgentStatusList': {asyncResult: true},
})

export default AppActions
