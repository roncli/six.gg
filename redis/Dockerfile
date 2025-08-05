# Get nginx stable Alpine.
FROM redis:8.2.0-alpine

# Create /var/redis directory.
RUN mkdir -p /var/redis

# Copy scripts.
COPY ./*.sh /var/redis/

# Copy sysctl.conf
COPY ./sysctl.conf /etc/sysctl.conf

# Copy rc.local
COPY ./rc.local /etc/rc.local

# Allow scripts to run.
RUN chmod +x /var/redis/*.sh

# Expose port 6379.
EXPOSE 6379
