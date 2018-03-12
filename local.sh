#!/bin/sh
export HOST=192.168.0.48
export BACKEND_PORT=19527
sed -i -e 's/WhoKilledLedCockRobin/'$HOST'/g' ./public/js/app/entry.js
sed -i -e 's/95279528/'$BACKEND_PORT'/g' ./public/js/app/entry.js
node ./bin/www
