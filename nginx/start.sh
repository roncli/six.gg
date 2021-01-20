#!/bin/sh

# Validation.
if [ ! $DOMAIN ];
then
    echo "Error: You must include a domain.  Please set the DOMAIN environment variable to the domain you are trying to get a certificate for." >&2
    exit 1
fi

# Make directories if they don't yet exist.
mkdir -p /etc/letsencrypt
mkdir -p /var/certbot/work
mkdir -p /var/nginx/work

# Default proxy port to 3030.
if [ ! $PROXY_PORT ];
then
    PROXY_PORT=3030
fi

# Create the nginx conf.
echo "Creating nginx.conf..."
/bin/sh -c $'echo "
events {
    worker_connections 1024;
}

http {
    map \$time_iso8601 \$time_iso8601_p1 {
        ~([^+]+) \$1;
    }
    map \$time_iso8601 \$time_iso8601_p2 {
        ~\\\+([0-9:]+)\$ \$1;
    }
    map \$msec \$millisec {
        ~\\\.([0-9]+)\$ \$1;
    }

    log_format fullformat \'\$remote_addr - \$remote_user [\$time_iso8601_p1.\$millisec+\$time_iso8601_p2] \$server_name \$server_port \\\"\$request\\\" \$status \$body_bytes_sent \$request_time \\\"\$http_referer\\\" \\\"\$http_user_agent\\\"\';
    access_log /var/log/nginx/access.log fullformat;

    server {
        listen 80;
        server_name $DOMAIN;
        $(if [ $DOMAIN_WWW ]; then echo "server_name $DOMAIN_WWW"; fi)

        location /.well-known/ {
            root /var/certbot/work/.well-known;
        }

        location / {
            return 301 https://$DOMAIN\$request_uri;
        }
    }

    server {
        listen 443 ssl;
        server_name $DOMAIN;

        ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

        include /etc/letsencrypt/options-ssl-nginx.conf;
        ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

        location / {
            proxy_http_version 1.1;
            proxy_pass http://node:$PROXY_PORT/;
            proxy_set_header Host \$http_host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_cache_bypass \$http_upgrade;
            proxy_redirect off;
        }
    }
}
" > /var/nginx/work/nginx.conf'

# Copy the nginx config.
cp /var/nginx/work/nginx.conf /etc/nginx/nginx.conf

# Create the well-known dir.
mkdir -p /var/certbot/work/.well-known

# Create options-ssl-nginx.conf if it doesn't exist.
if [ ! -f /var/nginx/work/options-ssl-nginx.conf ];
then
    echo "Creating options-ssl-nginx.conf..."
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > /var/nginx/work/options-ssl-nginx.conf
    cp /var/nginx/work/options-ssl-nginx.conf /etc/letsencrypt/options-ssl-nginx.conf
fi

# Create ssl-dhparams.pem if it doesn't exist.
if [ ! -f /var/nginx/work/ssl-dhparams.pem ];
then
    echo "Creating ssl-dhparams.pem..."
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > /var/nginx/work/ssl-dhparams.pem
    cp /var/nginx/work/ssl-dhparams.pem /etc/letsencrypt/ssl-dhparams.pem
fi

# Create dummy certifications if they don't exist.
if [ ! -f /var/nginx/work/fullchain.pem ];
then
    echo "Creating dummy certifications..."
    openssl req -x509 -nodes -newkey rsa:4096 -days 1 -keyout /var/nginx/work/privkey.pem -out /var/nginx/work/fullchain.pem -subj /CN=localhost
    mkdir -p "/etc/letsencrypt/live/$DOMAIN"
    cp /var/nginx/work/privkey.pem "/etc/letsencrypt/live/$DOMAIN/privkey.pem"
    cp /var/nginx/work/fullchain.pem "/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
fi

# Check for cert changes and reload if necessary.
$(sleep 60000; while inotifywait -e close_write "/etc/letsencrypt/live/$DOMAIN"; do nginx -s reload; done) &

echo "Starting..."

# Start nginx.
nginx -g "daemon off;"
