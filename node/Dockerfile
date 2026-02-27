# Get Node LTS Alpine.
FROM node:24.14.0-alpine

# Create /var/www directory.
RUN mkdir -p /var/www

# Copy package.json into /var/www directory.
WORKDIR /var/www
COPY ./package.json .

# Run NPM install.
RUN apk update && apk add git
RUN npm install --production --silent
RUN apk del git

# Copy remaining files.
COPY . .

# Allow start script to run.
RUN chmod +x /var/www/*.sh

# Expose port 3030.
EXPOSE 3030
