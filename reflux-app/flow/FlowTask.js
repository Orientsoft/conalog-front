import MongoProvider from 'MongoProvider'
let mongoProvier = new MongoProvider()

// flow data object
class Flow {
  constructor(json) {
    this._id = json._id,
    this.ts = json.ts,
    this.name = json.name,
    this.content = json.content
  }
} // class Flow

class FlowTask extends Flow {
  constructor(flowJson) {
    super(flowJson)
  }

  work() {
    // TO DO : ajax post  - start flow
  }

  rest() {

  }
} // class FlowTask

export default { Flow, FlowTask }
