// Passive Collector Runtime

import ChildProcess from 'child_process'
import Promise from 'bluebird'
import { SshClient } from 'ssh2'

import RedisProvider from './RedisProvider.js'

import Logger from 'Logger'
import config from '../config/config.js'

Promise.promisifyAll(ChildProcess)

let redisProvider = new RedisProvider()
let logger = new Logger('collector', 'passive')

class PassiveCollector {
  constructor() {
    this.sshTaskList = []
  }

  addTask(taskInfo) {
    // open ssh
    if (taskInfo.type === 'FILE_TAIL')
    {
      let sshConn = new SshClient()
      Promise.promisifyAll(sshConn)

      sshConn.on('ready', ()=> {
        sshConn.execAsync(taskInfo.file)
          .then(stream => {
            stream.on('close', (code, signal) => {
              // log
              logger.warning(2703,
                  taskInfo.name,
                  'SSH stream closed',
                  'Code: ' + code + ', Signal: ' + signal)

              if (taskInfo.workFlag)
              {
                // reconnect
                sshConn.connect({
                  host: taskInfo.host,
                  port: taskInfo.port,
                  username: taskInfo.username,
                  password: taskInfo.password
                })
              }
            }) // on close
            .on('data', (data) => {
              redisProvider.publish(config.passiveCollectorPrefix + taskInfo.name, data)
                .then(() => {
                  // pub success, do nothing
                }) // redisProvider.publish
                .catch((err) => {
                  logger.error(3701,
                      null,
                      'Passive Collector Publish Problem',
                      'Msg ' + msg + ' publish failed: ' + err)
                })
            }) // on data
          }) // sshConn.execAsync
          .catch(err => {
            // sshConn.execAsync failed
            logger.error(3702,
                null,
                'Passive Collector Exec Problem',
                'Passive collector' + taskInfo + 'exec failed: ' + err)
          })
      }).connect({
        host: taskInfo.host,
        port: taskInfo.port,
        username: taskInfo.username,
        password: taskInfo.password
      })

      // create taskId
      taskInfo.sshConn = sshConn
      taskInfo.workFlag = true
      this.sshTaskList.push(taskInfo)
      let taskId = 'f_' + (this.sshTaskList.length - 1)

      return taskId
    } // FILE_TAIL
    else {
      // NET_CAP

    } // NET_CAP
  }

  removeTask(taskId) {
    let type = taskId.charAt(0)
    let index = parseInt(taskId.substring(2))

    if (type === 'f') {
      let sshTask = sshTaskList[index]
      sshTask.workFlag = false
      sshTask.sshConn.end()

      this.sshTaskList.splice(index)
    } // FILE_TAIL
    else {
      // net cap

    } // NET_CAP
  }
} // PassiveCollector
