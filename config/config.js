var program = require('commander')

var config = {
  logLevel: 'info',
  conalogHost: 'WhoKilledLedCockRobin',
  conalogPort: 95279528, // don't config this, use env instead
  conalogFrontPort: 10011,
  mongoUrl: 'mongodb://127.0.0.1:27017/conalog1',
  redisUrl: 'redis://127.0.0.1:6379',
  activeCollectorPrefix: 'ac_',
  passiveCollectorPrefix: 'pc_',
  parseArgs: function() {
      program
      .version('1.0.0')
      .option('--logLevel [logLevel]', 'Log Level [' + this.logLevel + ']', this.logLevel)
      .option('--redisUrl [redisUrl]', 'Redis URL [' + this.redisUrl + ']', this.redisUrl)
      .option('--mongoUrl [mongoUrl]', 'MongoDB URL [' + this.mongoUrl + ']', this.mongoUrl)
      .option('--conalogHost [conalogHost]', 'Conalog Backend Host [' + this.conalogHost + ']', this.conalogHost)
      .option('--conalogPort [conalogPort]', 'Conalog Backend Port [' + this.conalogPort + ']', this.conalogPort)
      .option('--activeCollectorPrefix [activeCollectorPrefix]', 'Active Collector Prefix [' + this.activeCollectorPrefix + ']', this.activeCollectorPrefix)
      .option('--passiveCollectorPrefix [passiveCollectorPrefix]', 'Passive Collector Prefix [' + this.passiveCollectorPrefix + ']', this.passiveCollectorPrefix)
      .option('--conalogFrontPort [conalogFrontPort]', 'Conalog Frontend Port [' + this.conalogFrontPort + ']', this.conalogFrontPort)
      .parse(process.argv)

    return program
  }
}

module.exports = config;
