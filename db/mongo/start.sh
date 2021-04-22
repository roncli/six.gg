#!/bin/bash

if [ -f /data/db/initialized ];
then
    # Location of temp files to tell us mongod is running.
    pidfile="${TMPDIR:-/tmp}/start-temp-mongod.pid"
    logfile="${TMPDIR:-/tmp}/start-temp-mongod.log"

    # The command line to use for mongo.
    mongo=( mongo --host 127.0.0.1 --port 27017 -u "$(cat $MONGO_INITDB_ROOT_USERNAME_FILE)" -p "$(cat $MONGO_INITDB_ROOT_PASSWORD_FILE)" )

    # Remove any existing temp file.
    rm -f "$pidfile"
    rm -f "$logfile"

    # Start mongod.
    mongod --fork --logpath "$logfile" --pidfilepath "$pidfile" --setParameter diagnosticDataCollectionEnabled=false

    # Ensure mongod is running.
    tries=30
    while true; do
        if ! { [ -s "$pidfile" ] && ps "$(< "$pidfile")" &> /dev/null; }; then
            echo >&2 "error: mongod does not appear to have stayed running -- perhaps it had an error?"
            exit 1
        fi
        if "${mongo[@]}" 'admin' --eval 'quit(0)' &> /dev/null; then
            break
        fi
        (( tries-- ))
        if [ "$tries" -le 0 ]; then
            echo >&2 "error: mongod does not appear to have accepted connections quickly enough -- perhaps it had an error?"
            exit 1
        fi
        sleep 1
    done

    # Run migrations.
    echo "Running migrations."
    "${mongo[@]}" /var/mongo/migrations/index.js
    echo "Migrations complete."

    # Shut down mongod.
    mongod --shutdown

    # Remove pidfile.
    rm -f "$pidfile"
fi

# Start up mongod normally.
/usr/local/bin/docker-entrypoint.sh mongod --setParameter diagnosticDataCollectionEnabled=false
