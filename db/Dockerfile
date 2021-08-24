# Get mongo latest.
FROM mongo:latest

# Get packages.
RUN apk update && apk add cifs-utils && apk add keyutils

# Create /docker-entrypoint-initdb.d directory.
RUN mkdir -p /docker-entrypoint-initdb.d

# Create /var/mongo directory.
RUN mkdir -p /var/mongo

# Copy files.
COPY ./init/ /docker-entrypoint-initdb.d/
COPY ./mongo/ /var/mongo/

# Allow scripts to run.
RUN chmod +x /docker-entrypoint-initdb.d/*.sh
RUN chmod +x /var/mongo/*.sh

# Import arg.
ARG USE_AZURE_FILE_STORAGE

# Remove directory if we're going to use Azure file storage.
RUN if [ $USE_AZURE_FILE_STORAGE -eq 1 ]; then rm -r /data/db; mkdir -p /mnt/db; ln -s /mnt/db /data/db; fi

# Expose port 27017.
EXPOSE 27017
