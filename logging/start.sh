#!/bin/sh

# Validation.
if [ ! $APPINSIGHTS_CONNECTIONSTRING ];
then
    echo "Error: You must include an Application Insights connection string.  Please set the APPINSIGHTS_CONNECTIONSTRING environment variable to the connection string you are trying to connect to." >&2
    exit 1
fi

# Run app.
exec env APPINSIGHTS_CONNECTIONSTRING=$(cat $APPINSIGHTS_CONNECTIONSTRING) node index
