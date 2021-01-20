#!/bin/sh

mongo --eval "const WEB_SIXGG_PASSWORD = '$(cat $WEB_SIXGG_PASSWORD_FILE)';" 127.0.0.1:27017 /var/mongo/init.js
mongo 127.0.0.1:27017 /var/mongo/migrations/index.js
touch /data/db/initialized
