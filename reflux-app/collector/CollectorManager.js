// Collector runtime manager
// ** collector storage should be handled by router directly

import constants from '../../util/constants'
import MongoProvider from '../../lib/MongoProvider'
import Logger from '../../lib/Logger'

import CollectorTask from './CollectorTask'

let mongoProvider = MongoProvider()
let logger = Logger()

class CollectorManager {
  constructor() {
    this.state = {
      taskList: []
    }

    // init local status
    this.collectorTaskList = []

    // sync state
    this.loop = setInterval(this.sync, constants.COLLECTOR_SYNC_LOOP)
  }

  startCollector(name) {
    // update state
    let existFlag = false
    this.state.taskList.map((taskName) => {
      if (taskName == name)
        existFlag = true
    })

    if (!existFlag)
      this.state.taskList.push(name)

    // TO DO : write state to etcd
  }

  stopCollector(name) {
    // update state
    let index = -1
    this.state.taskList.map((taskName, taskIndex) => {
      if (taskName == name)
        index = taskIndex
    })

    if (index > -1)
      this.state.taskList.splice(index)

    // TO DO : write state to etcd
  }

  sync() {
    // TO DO : read state from etcd

    // setup waiting collector
    this.state.taskList.map((taskName, index) => {
      let runFlag = false

      this.collectorTaskList.map((collectorTask) => {
        if (collectorTask.name == taskName)
          runFlag = true
      })

      if (!runFlag)
      {
        // query json from mongodb
        mongoProvider.query(constants.COLLECTOR_COLL, {name: taskName})
          .then((json) => {
            let taskJson = new CollectorTask(json)

            // start to work
            taskJson.work()
            this.collectorTaskList.push(taskJson)

            logger.info(6101,
              null,
              'Task Start',
              'Task ' +taskName + ' started')
          })
          .catch((err) => {
            logger.info(6302,
              null,
              'Task Start Problem',
              'Task ' + taskName + ' not found')
          })
      }
    })

    // kill useless collector
    this.collectorTaskList.map((collectorTask, index) => {
      let regFlag = false

      this.state.taskList.map((taskName) => {
        if (collectorTask.name == taskName)
          regFlag = true
      })

      if (!regFlag)
      {
        // kill this task
        collectorTask.rest()
        this.collectorTaskList.splice(index)

        logger.info(6103,
          null,
          'Task Stop',
          'Task ' +taskName + ' stopped')
      }
    })

  } // sync
} // class CollectorManager

export default CollectorManager
