# Get certbot latest.
FROM certbot/certbot:v5.0.0

# Create /var/certbot directory.
RUN mkdir -p /var/certbot

# Copy scripts.
COPY ./*.sh /var/certbot/

# Allow start script to run.
RUN chmod +x /var/certbot/*.sh
