var config = {
  logLevel: 'info',
  conalogHost: '127.0.0.1',
  conalogPort: 19527,
  conalogFrontPort: 9527
  mongoUrl: 'mongodb://127.0.0.1:27017/conalog',
  redisUrl: 'redis://127.0.0.1:6379',
  activeCollectorPrefix: 'ac_',
  passiveCollectorPrefix: 'pc_',
  apiGatewayHost: 'apigateway',
  apiGatewayPort: 1234,
  apiGatewayToken: '12345',
  apiGatewayUid: '67890',
  apiGatewayType: 'user'
}

module.exports = config;
