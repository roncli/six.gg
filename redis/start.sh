#!/bin/sh

# Get password
export REDIS_PASSWORD=$(cat $REDIS_PASSWORD_FILE)

# Create config file.
/bin/sh -c $'echo "
port $REDIS_PORT
tcp-backlog 128
timeout 300
supervised no
databases 1
repl-diskless-sync no
requirepass $REDIS_PASSWORD
" > /var/redis/redis.conf'

# Set vm.overcommit_memory.
sysctl vm.overcommit_memory=1

# Disable THP.
echo never > /sys/kernel/mm/transparent_hugepage/enabled

# Start redis.
exec redis-server /var/redis/redis.conf
