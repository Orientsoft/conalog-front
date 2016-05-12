// ActiveCollector Runtime

import ChildProcess from 'child_process'
import Promise from 'bluebird'

import RedisProvider from 'RedisProvider'

import Logger from 'Logger'
import config from '../config/config.js'

Promise.promisifyAll(ChildProcess)

let redisProvider = new RedisProvider()
let logger = new Logger('collector', 'active')

class ActiveCollector {
  constructor() {
    this.timeTaskList = []

    // main loop - wake up every 30 secs
    this.mainLoop = setInterval(() => {
      let now = new Date();
      let ts = now.toTimeString();
      this.timeTaskList.map((item, index) => {
        if (item.ts.toTimeString() === ts)
        {
          // call item.command
          item.work()
            .then((msg, err) => {
              if (err) {
                logger.warning(2602,
                  null,
                  'Active Collector Exec Problem',
                  'Active collector' + item + 'exec stderr: ' + STDERR.toString())
              }
              else {
                // handle msg - pub to redis channel
                redisProvider.publish(config.activeCollectorPrefix + item.name, msg)
                  .then(() => {
                    // pub success, do nothing
                  }) // redisProvider.publish
                  .catch((err) => {
                    logger.error(3603,
                      null,
                      'Active Collector Publish Problem',
                      'Msg ' + msg + ' publish failed: ' + err)
                  })
              }
            }) // command
            .catch((err) => {
              logger.error(3601,
                null,
                'Active Collector Exec Problem',
                'Active collector' + item + 'exec failed: ' + err)
            })
        }
      })
    }, 30000)
  }

  addTask(taskInfo) {
    let taskId

    if (taskInfo.type == 'time') {
      this.timeTaskList.push(taskInfo)
      // create taskId
      taskId = 't_' + (this.timeTaskList.length - 1)
    }
    else { // interval
      // setup task interval
      let id = setTimeout(() => {
        taskInfo.command(taskInfo.parameter)
      }, taskInfo.interval)

      taskId = 'i_' + id
    }

    return taskId
  } // addTask

  removeTask(taskId) {
    let type = taskId.charAt(0)
    let index = parseInt(taskId.substring(2))

    if (type = 't') {
      // remove task from list
      this.timeTaskList.splice(index, 1)
    }
    else {
      // clear interval
      clearInterval(index)
    }
  } // removeTask

} // class ActiveCollector

export default ActiveCollector
