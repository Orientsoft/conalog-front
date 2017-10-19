# conalog-front   
# Depoly  
Suppose ./ = /home/voyager/xd/docker/conalog-front/  
Also suppose you have prepared a mongodb docker container named 'mongo' and a redis docker container named 'redis'.  
**You should first setup 'conalog' container before heading to 'conalog-front'.**  
```  
git clone https://github.com/Orientsoft/conalog-front.git  
cd conalog-front  
vim config/config.js
npm i  
gulp go  
sudo docker run --hostname conalog-front --name conalog-front -p 9527:9527 -v /home/voyager/xd/docker/conalog-front/conalog-front:/conalog-front --link conalog --link mongo --link redis -d xiedidan/conalog-front  
```  
# Startup Parameters
```
  Usage: www [options]

  Options:

    -h, --help                                         output usage information
    -V, --version                                      output the version number
    --logLevel [logLevel]                              Log Level [info]
    --redisUrl [redisUrl]                              Redis URL [redis://127.0.0.1:6379]
    --mongoUrl [mongoUrl]                              MongoDB URL [mongodb://127.0.0.1:27017/conalog]
    --conalogHost [conalogHost]                        Conalog Backend Host [WhoKilledLedCockRobin]
    --conalogPort [conalogPort]                        Conalog Backend Port [95279528]
    --activeCollectorPrefix [activeCollectorPrefix]    Active Collector Prefix [ac_]
    --passiveCollectorPrefix [passiveCollectorPrefix]  Passive Collector Prefix [pc_]
    --conalogFrontPort [conalogFrontPort]              Conalog Frontend Port [9527]
```  
# config.js Description
```  
var config = {
  logLevel: 'info', (may be debug, info, warning, error)
  conalogHost: '192.168.0.230', (set to user browser address)
  conalogPort: 19527,
  conalogFrontPort: 9527,
  mongoUrl: 'mongodb://mongo:27017/conalog', (don't touch this if you use docker)
  redisUrl: 'redis://redis:6379', (don't touch this if you use docker)
  activeCollectorPrefix: 'ac_', (the following configs are reserved, don't touch)
  passiveCollectorPrefix: 'pc_',
}

module.exports = config;
```  
