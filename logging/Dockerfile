# Get Node LTS Alpine.
FROM node:lts-alpine

# Create /var/www directory.
RUN mkdir -p /var/logging

# Copy files into /var/www directory.
WORKDIR /var/logging
COPY . .

# Run NPM install.
RUN npm install --production --silent

# Allow start script to run.
RUN chmod +x /var/logging/*.sh

# Expose port 12201.
EXPOSE 12201/udp
