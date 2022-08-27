#!/bin/sh

# Validation.
if [ ! $APPINSIGHTS_INSTRUMENTATIONKEY ];
then
    echo "Error: You must include an Application Insights instrumentation key.  Please set the APPINSIGHTS_INSTRUMENTATIONKEY environment variable to the instrumentation key you are trying to connect to." >&2
    exit 1
fi

# Run app.
exec env APPINSIGHTS_INSTRUMENTATIONKEY=$(cat $APPINSIGHTS_INSTRUMENTATIONKEY) node index
