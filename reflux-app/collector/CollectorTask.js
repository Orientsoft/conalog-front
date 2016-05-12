import MongoProvider from 'MongoProvider'
let mongoProvier = new MongoProvider()

// collector data object
class Collector {
  constructor(json) {
    // common
    this._id = json._id,
    this.ts = json.ts,
    this.name = json.name,
    this.category = json.cat, // active, passive
    this.type = json.type, // active: interval, timer; passive: file_tail, net_cap
    this.parameter = json.param,

    // active
    this.trigger = json.trigger, // timestamp
    this.command = json.cmd,

    // passive
    host = json.host
  }
} // class Collector

// collector runtime object
class CollectorTask extends Collector {
  constructor(collectorJson) {
    super(collectorJson)
  }

  work() {
    if (this.type == 'active') {
      // start interval timer
      this.taskId = CollectorTask.activeCollector.addTask(this)
    }
    else {
      // start child process
      this.taskId = CollectorTask.passiveCollector.addTask(this)
    }
  }

  rest() {
    if (this.type == 'active') {
      // kill interval timer
      CollectorTask.activeCollector.removeTask(this.taskId)
    }
    else {
      // kill child process
      Collector.passiveCollector.removeTask(this.taskId)
    }
  }
} // class CollectorTask

// static member
CollectorTask.activeCollector = new ActiveCollector()
CollectorTask.passiveCollector = new PassiveCollector()

export default { Collector, CollectorTask }
