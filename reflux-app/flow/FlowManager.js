// Flow runtime manager
// ** flow storage should be handled by router directly

import constants from '../../util/constants'
import MongoProvider from '../../lib/MongoProvider'
import Logger from '../../lib/Logger'

import FlowTask from './FlowTask'

let mongoProvider = MongoProvider()
let logger = Logger()

class FlowManager {
  constructor() {
    this.state = {
      taskList = []
    }

    // init local status
    this.flowTaskList = []
  }

  startFlow(name) {
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

  stopFlow(name) {
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

    // setup waiting flow
    this.state.taskList.map((taskName, index) => {
      let runFlag = false

      this.flowTaskList.map((flowTask) => {
        if (flowTask.name == taskName)
          runFlag = true
      })

      if (!runFlag)
      {
        // query json from mongodb
        mongoProvider.query(constants.FLOW_COLL, {name: taskName})
          .then((json) => {
            let taskJson = new FlowTask(json)

            // start to work
            taskJson.work()
            this.flowTaskList.push(taskJson)

            logger.info(6101,
              null,
              'Flow Task Start',
              'Flow task ' +taskName + ' started')
          })
          .catch((err) => {
            logger.info(6302,
              null,
              'Flow Task Start Problem',
              'Flow task ' + taskName + ' not found')
          })
      }
    })

    // kill useless flow
    this.flowTaskList.map((flowTask, index) => {
      let regFlag = false

      this.state.taskList.map((taskName) => {
        if (flowTask.name == taskName)
          regFlag = true
      })

      if (!regFlag)
      {
        // kill this task
        flowTask.rest()
        this.flowTaskList.splice(index)

        logger.info(6103,
          null,
          'Flow Task Stop',
          'Flow task ' +taskName + ' stopped')
      }
    })
  }
} // class FlowManager

export default FlowManager
