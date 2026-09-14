#!/bin/sh

set -x

echo "Deploying prisma migrations"

node ./node_modules/prisma/build/index.js migrate deploy --schema ./apps/web/prisma/schema.prisma

echo "Starting web server"

node apps/web/server.js

