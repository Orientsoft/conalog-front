var config = {
  logLevel: 'debug',
  conalogHost: '192.168.0.230',
  conalogPort: 19527,
  mongoUrl: 'mongodb://localhost:27017/conalog',
  redisUrl: 'redis://localhost:6379',
  activeCollectorPrefix: 'ac_',
  passiveCollectorPrefix: 'pc_',
  apiGatewayHost: 'localhost',
  apiGatewayPort: 1234,
  apiGatewayToken: '12345',
  apiGatewayUid: '67890',
  apiGatewayType: 'user'
}

module.exports = config;
