import Reflux from 'reflux'

let PegActions = Reflux.createActions({
  'build': {asyncResult: true},
  'parse': {asyncResult: true},
  'setCache': {asyncResult: true},
  'setOptimize': {asyncResult: true},
  'save': {asyncResult: true}
})

export default PegActions
