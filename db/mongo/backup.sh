#!/bin/bash

BACKUP_FILENAME=db-$(date +%Y-%m-%d-%H-%M-%S).gz

mongodump --gzip --archive=$BACKUP_FILENAME

find /data/backup -mtime +7 -delete
