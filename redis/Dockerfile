# Get nginx stable Alpine.
FROM redis:alpine

# Create /var/redis directory.
RUN mkdir -p /var/redis

# Copy scripts.
COPY ./*.sh /var/redis/

# Copy sysctl.conf
COPY ./sysctl.conf /etc/sysctl.conf

# Copy rc.local
COPY ./rc.local /etc/rc.local

# Expose port 6379.
EXPOSE 6379
