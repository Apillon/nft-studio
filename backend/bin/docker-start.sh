#!/bin/sh
set -e
printenv

# migrate DB
echo "Starting migration!"
npm run db-upgrade:ci

pm2 start pm2.config.js --attach
