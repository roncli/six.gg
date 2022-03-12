#!/bin/bash

mongodump --gzip --archive=/data/backup/db-$(date +%Y-%m-%d-%H-%M-%S).gz

find /data/backup -mtime +7 -delete
