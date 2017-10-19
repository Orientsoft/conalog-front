#!/bin/sh
sed -i -e 's/WhoKilledLedCockRobin/'$HOST'/g' /conalog/public/js/app/entry.js
sed -i -e 's/95279528/'$BACKEND_PORT'/g' /conalog/public/js/app/entry.js
node /conalog/bin/www
