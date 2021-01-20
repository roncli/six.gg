#!/bin/sh

# Validation.
if [ ! $DOMAIN ];
then
    echo "Error: You must include a domain.  Please set the DOMAIN environment variable to the domain you are trying to get a certificate for." >&2
    exit 1
fi

if [ ! $EMAIL ];
then
    echo "Error: You must include an email address, this script will not support --register-unsafely-without-email.  Please set the EMAIL environment variable to the email contact associated with this domain." >&2
    exit 2
fi

if [[ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]];
then
    echo "Warning: nginx isn't ready to receive certs yet.  This may be due to the nginx container not yet being setup, if this error continues please check to see if the nginx container is running." >&2
    exit 3
fi

# Make directories if they don't yet exist.
mkdir -p /var/certbot/work

# Run certbot if certificates don't yet exist.
if [[ ! -f /var/certbot/work/.init ]];
then
    echo "Running certbot to initialize certificates."

    # Enable staging mode if needed.
    if [ $STAGING ];
    then
        stagingArg="--staging"
    fi

    # Create required directories.
    mkdir -p "/var/certbot/work/.well-known"

    # Remove directories needed by certbot.
    rm -Rf /etc/letsencrypt/live/$DOMAIN
    rm -Rf /etc/letsencrypt/archive/$DOMAIN
    rm -Rf /etc/letsencrypt/renewal/$DOMAIN.conf    

    # Get the certificate.
    certbot certonly -n --webroot -w /var/certbot/work/.well-known $stagingArg --email $EMAIL -d $DOMAIN --rsa-key-size 4096 --agree-tos --force-renewal

    # Create .init file to indicate the certificates now exist.
    touch /var/certbot/work/.init
fi

# Renew every 12 hours.
while :
do
    echo "Checking for renewal."
    certbot renew -n
    sleep 12h
done
