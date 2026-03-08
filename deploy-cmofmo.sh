#!/bin/bash
# Deploy CMO-FMO app naar Hetzner
# Gebruik: ./deploy-cmofmo.sh
set -e

SERVER=root@46.225.61.78
REMOTE_DIR=/var/www/cmofmo
LOCAL_BUILD=cmofmo/dist

echo "→ Building CMO-FMO (VITE_BRAND=hci)..."
cd cmofmo
npm ci
npm run build
cd ..

echo "→ Syncing to server..."
ssh $SERVER "mkdir -p $REMOTE_DIR"
rsync -avz --delete $LOCAL_BUILD/ $SERVER:$REMOTE_DIR/

echo "→ Setting permissions..."
ssh $SERVER "chown -R www-data:www-data $REMOTE_DIR && chmod -R 755 $REMOTE_DIR"

echo "✓ CMO-FMO deployed naar $REMOTE_DIR"
