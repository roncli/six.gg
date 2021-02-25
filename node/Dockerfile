# Get Node LTS Alpine.
FROM node:lts-alpine

# Create /var/www directory.
RUN mkdir -p /var/www

# Copy files into /var/www directory.
WORKDIR /var/www
COPY . .

# Run NPM install.
RUN apk update && apk add git
RUN npm install --production --silent
RUN apk del git

# Allow start script to run.
RUN chmod +x /var/www/*.sh

# Expose port 3030.
EXPOSE 3030

# Expose port 8443.
EXPOSE 8443
