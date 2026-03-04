#!/bin/sh

# Import .env file.
if [ -f .env ];
then
    export $(grep -v '^#' .env | xargs)
fi

# Validation.
if [ -z "$APPINSIGHTS_CONNECTIONSTRING" ];
then
    echo "Warning: Application Insights is not setup.  Application will log to console."
fi

# Run app.
exec node index
