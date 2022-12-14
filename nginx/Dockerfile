# Get nginx stable Alpine.
FROM nginx:1.23.3-alpine

# Get packages.
RUN apk update && apk add openssl

# Create /var/nginx directory.
RUN mkdir -p /var/nginx

# Copy scripts.
COPY ./*.sh /var/nginx/

# Allow start script to run.
RUN chmod +x /var/nginx/*.sh

# Expose ports 80 and 443.
EXPOSE 80 443
