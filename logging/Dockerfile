# Get Node LTS Alpine.
FROM node:20.11.0-alpine

# Create /var/www directory.
RUN mkdir -p /var/logging

# Copy package.json into /var/logging directory.
WORKDIR /var/logging
COPY ./package.json .

# Run NPM install.
RUN npm install --production --silent

# Copy remaining files.
COPY . .

# Allow start script to run.
RUN chmod +x /var/logging/*.sh

# Expose port 12201.
EXPOSE 12201/udp
